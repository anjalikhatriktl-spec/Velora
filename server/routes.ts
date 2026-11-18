import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Express, Request, Response } from 'express';
import {
  clearSessionCookie,
  getRequestAuthUser,
  hashPassword,
  hashToken,
  requireAdmin,
  requireAuth,
  requireEmployee,
  sanitizeUser,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
  type AuthenticatedRequest,
} from './auth.ts';
import {
  broadcastEvent,
  getDatabase,
  logActivity,
  saveDatabase,
  subscribeSseClient,
  UPLOADS_DIR,
} from './store.ts';
import type {
  AdminModulePermission,
  BottleVolume,
  DbEmployee,
  DbOrder,
  DbProduct,
  DbUser,
  EmployeeDepartment,
  OrderStatus,
} from './types.ts';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTimeLabel(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function hasModuleAccess(user: DbUser, perm: AdminModulePermission): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'ADMIN_MANAGER') return user.permissions.includes(perm);
  return false;
}

function isEmployeeAuthorizedForSupport(emp: DbEmployee | undefined, user: DbUser): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_MANAGER') return true;
  if (!emp) return false;
  return emp.department === 'Customer Support' || emp.permissions.includes('support');
}

function isEmployeeAuthorizedForInventory(emp: DbEmployee | undefined, user: DbUser): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_MANAGER') return true;
  if (!emp) return false;
  return (
    emp.department === 'Inventory Management' ||
    emp.department === 'Packing & Dispatch' ||
    emp.permissions.includes('inventory')
  );
}

function deductOrRestoreOrderStock(
  order: DbOrder,
  direction: 'deduct' | 'restore',
  actorName: string,
  actorRole: string,
  reason: string
): void {
  const db = getDatabase();
  for (const item of order.items) {
    const prod = db.products.find((p) => p.id === item.productId);
    if (!prod) continue;
    const prev = prod.stock[item.volume] ?? 0;
    const delta = direction === 'deduct' ? -item.quantity : item.quantity;
    const next = Math.max(0, prev + delta);
    prod.stock[item.volume] = next;
    prod.updatedAt = new Date().toISOString();

    db.inventoryMovements.unshift({
      id: uid('mov'),
      productId: prod.id,
      productName: prod.name,
      volume: item.volume,
      type: direction === 'deduct' ? 'stock_out' : 'stock_in',
      quantityChange: delta,
      previousStock: prev,
      newStock: next,
      reason,
      actorName,
      actorRole,
      createdAt: new Date().toISOString(),
    });

    if (direction === 'deduct' && db.settings.lowStockAlerts && next <= prod.lowStockThreshold) {
      db.notifications.unshift({
        id: uid('notif'),
        audience: 'admin',
        targetEmployeeId: null,
        type: 'low_stock',
        title:
          next === 0
            ? `Out of Stock: ${prod.name} (${item.volume})`
            : `Low Stock Alert: ${prod.name} (${item.volume})`,
        message: `${prod.name} (${item.volume}) now has ${next} unit(s) remaining.`,
        read: false,
        linkRoute: 'admin-inventory',
        createdAt: new Date().toISOString(),
      });
    }
  }
}

export function registerRoutes(app: Express): void {
  // ── Real-time SSE endpoint ──────────────────────────────────────────────────
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    const unsubscribe = subscribeSseClient(res);
    const heartbeat = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });

  // ── Authentication & Portal Access ──────────────────────────────────────────
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const db = getDatabase();
    const user = getRequestAuthUser(req);
    const adminInitialized = db.users.some((u) => u.role === 'SUPER_ADMIN');
    const employeeProfile = user?.employeeId
      ? db.employees.find((e) => e.id === user.employeeId) || null
      : null;

    res.json({
      adminInitialized,
      user: user ? sanitizeUser(user) : null,
      employeeProfile: employeeProfile
        ? {
            id: employeeProfile.id,
            employeeCode: employeeProfile.employeeCode,
            name: employeeProfile.name,
            designation: employeeProfile.designation,
            department: employeeProfile.department,
            permissions: employeeProfile.permissions,
          }
        : null,
    });
  });

  app.post('/api/auth/setup-admin', (req: Request, res: Response) => {
    const db = getDatabase();
    if (db.users.some((u) => u.role === 'SUPER_ADMIN')) {
      return res.status(409).json({
        error: 'Super Admin account already initialized. Please sign in with your credentials.',
      });
    }

    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');

    if (name.length < 2) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const { hash, salt } = hashPassword(password);
    const adminUser: DbUser = {
      id: uid('usr'),
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      role: 'SUPER_ADMIN',
      employeeId: null,
      permissions: [
        'analytics',
        'orders',
        'products',
        'categories',
        'inventory',
        'customers',
        'employees',
        'attendance',
        'tasks',
        'website',
        'reports',
        'settings',
        'support',
      ],
      active: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    };

    db.users.push(adminUser);
    logActivity(db, {
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      action: 'SUPER_ADMIN_INITIALIZED',
      target: adminUser.email,
      details: 'Primary VELORA Super Admin account registered.',
    });
    saveDatabase(db);

    const token = signSessionToken(adminUser, true);
    setSessionCookie(res, token, true);
    res.status(201).json({ user: sanitizeUser(adminUser) });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const db = getDatabase();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');
    const rememberMe = Boolean(req.body?.rememberMe);
    const portal = req.body?.portal === 'employee' ? 'employee' : 'admin';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'This account has been deactivated by an administrator.' });
    }

    if (user.employeeId) {
      const emp = db.employees.find((e) => e.id === user.employeeId);
      if (emp && emp.status === 'Inactive') {
        return res.status(403).json({ error: 'Your employee profile is currently inactive.' });
      }
    }

    if (portal === 'admin' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_MANAGER') {
      return res.status(403).json({
        error: 'Access denied. Employee accounts must sign in via the Employee Portal.',
      });
    }

    user.lastLoginAt = new Date().toISOString();
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'LOGIN',
      target: portal.toUpperCase(),
      details: `Signed into ${portal} portal.`,
    });
    saveDatabase(db);

    const token = signSessionToken(user, rememberMe);
    setSessionCookie(res, token, rememberMe);
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/activate-employee', (req: Request, res: Response) => {
    const db = getDatabase();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const inviteCode = String(req.body?.inviteCode || '')
      .trim()
      .toUpperCase();
    const password = String(req.body?.password || '');

    if (!email || !inviteCode || password.length < 8) {
      return res.status(400).json({
        error: 'Work email, activation code, and a password (min 8 chars) are required.',
      });
    }

    const emp = db.employees.find(
      (e) => e.email.toLowerCase() === email && e.inviteCode?.toUpperCase() === inviteCode
    );
    if (!emp) {
      return res.status(400).json({
        error: 'Invalid email or activation code. Ask your administrator for a valid employee invite code.',
      });
    }
    if (emp.status === 'Inactive') {
      return res.status(403).json({ error: 'Your employee account is inactive.' });
    }

    const { hash, salt } = hashPassword(password);
    let user = db.users.find((u) => u.email.toLowerCase() === email || u.employeeId === emp.id);
    if (user) {
      user.passwordHash = hash;
      user.passwordSalt = salt;
      user.role = emp.role;
      user.permissions = emp.permissions;
      user.active = true;
      user.lastLoginAt = new Date().toISOString();
    } else {
      user = {
        id: uid('usr'),
        name: emp.name,
        email: emp.email.toLowerCase(),
        passwordHash: hash,
        passwordSalt: salt,
        role: emp.role,
        employeeId: emp.id,
        permissions: emp.permissions,
        active: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      };
      db.users.push(user);
    }

    emp.hasAccount = true;
    emp.inviteCode = null;
    logActivity(db, {
      actorId: user.id,
      actorName: emp.name,
      actorRole: emp.role,
      action: 'EMPLOYEE_ACTIVATED',
      target: emp.employeeCode,
      details: `${emp.name} activated staff credentials.`,
    });
    saveDatabase(db);

    const token = signSessionToken(user, true);
    setSessionCookie(res, token, true);
    res.status(201).json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const db = getDatabase();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (user) {
      const code = crypto.randomInt(100000, 999999).toString();
      user.resetTokenHash = hashToken(code);
      user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      saveDatabase(db);
      console.info(`[VELORA Auth] Password reset requested for ${email}. Recovery code: ${code}`);
    }

    res.json({
      ok: true,
      message:
        'If an account exists for that email, a 15-minute recovery code has been issued. Contact your Super Admin or check server logs for the code.',
    });
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const db = getDatabase();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const code = String(req.body?.code || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !code || newPassword.length < 8) {
      return res.status(400).json({
        error: 'Email, 6-digit recovery code, and new password (min 8 chars) are required.',
      });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (
      !user ||
      !user.resetTokenHash ||
      !user.resetTokenExpiresAt ||
      new Date(user.resetTokenExpiresAt).getTime() < Date.now() ||
      user.resetTokenHash !== hashToken(code)
    ) {
      return res.status(400).json({ error: 'Invalid or expired recovery code.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    saveDatabase(db);

    res.json({ ok: true, message: 'Password updated successfully. You may now sign in.' });
  });

  app.post('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = db.users.find((u) => u.id === req.authUser?.id);
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    if (!verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PASSWORD_CHANGED',
      target: user.email,
      details: 'Updated account password.',
    });
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // ── Media Upload Endpoint (Product & Employee Photos) ───────────────────────
  app.post('/api/upload', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const filename = String(req.body?.filename || 'image.png');
    const dataUrl = String(req.body?.dataUrl || '');

    const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      return res.status(400).json({
        error: 'Invalid image format. Upload PNG, JPG, WEBP, or GIF images.',
      });
    }

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size must be 5MB or smaller.' });
    }

    const safeBase = path
      .basename(filename, path.extname(filename))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 32);
    const storedName = `${safeBase || 'velora'}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.${ext}`;
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, storedName), buffer);

    res.status(201).json({ url: `/uploads/${storedName}` });
  });

  // ── Storefront Public Endpoints ─────────────────────────────────────────────
  app.get('/api/storefront/bootstrap', (_req: Request, res: Response) => {
    const db = getDatabase();
    res.json({
      products: db.products.filter((p) => p.published),
      categories: db.categories.filter((c) => c.active).sort((a, b) => a.displayOrder - b.displayOrder),
      websiteContent: db.websiteContent,
      publicSettings: {
        storeName: db.settings.storeName,
        storeEmail: db.settings.storeEmail,
        storePhone: db.settings.storePhone,
        currency: db.settings.currency,
        codEnabled: db.settings.codEnabled,
        codFee: db.settings.codFee,
        freeShippingThreshold: db.settings.freeShippingThreshold,
        standardShippingFee: db.settings.standardShippingFee,
      },
    });
  });

  app.post('/api/storefront/orders', (req: Request, res: Response) => {
    const db = getDatabase();
    const customer = req.body?.customer;
    const rawItems = req.body?.items;
    const paymentMethod =
      req.body?.paymentMethod === 'Cash on Delivery (UPI on Arrival)'
        ? 'Cash on Delivery (UPI on Arrival)'
        : 'Cash on Delivery (Cash)';

    if (!customer || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ error: 'Customer details and cart items are required.' });
    }

    const email = String(customer.email || '')
      .trim()
      .toLowerCase();
    const existingCustomer = db.customers.find((c) => c.email.toLowerCase() === email);
    if (existingCustomer && existingCustomer.status === 'Blocked') {
      return res.status(403).json({
        error: 'This customer account is currently restricted. Please contact VELORA Concierge.',
      });
    }

    const verifiedItems: DbOrder['items'] = [];
    for (const line of rawItems) {
      const prod = db.products.find((p) => p.id === line.productId && p.published);
      if (!prod) {
        return res.status(400).json({ error: 'One or more selected products are unavailable.' });
      }
      const vol = (['30ml', '50ml', '100ml'].includes(line.volume) ? line.volume : '50ml') as BottleVolume;
      const qty = Math.min(10, Math.max(1, Number(line.quantity) || 1));
      const volOption = prod.volumes.find((v) => v.volume === vol);
      const unitPrice = volOption ? volOption.price : prod.price;

      verifiedItems.push({
        productId: prod.id,
        name: prod.name,
        volume: vol,
        quantity: qty,
        unitPrice,
        image: prod.image,
      });
    }

    const subtotal = verifiedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shippingFee =
      subtotal >= db.settings.freeShippingThreshold || subtotal === 0
        ? 0
        : db.settings.standardShippingFee;
    const total = subtotal + shippingFee + (db.settings.codFee || 0);
    const orderNumber =
      typeof req.body?.orderNumber === 'string' && /^VL-\d{6}$/.test(req.body.orderNumber)
        ? req.body.orderNumber
        : `VL-${Math.floor(100000 + Math.random() * 900000)}`;

    const nowIso = new Date().toISOString();
    let customerId = existingCustomer?.id;
    if (existingCustomer) {
      existingCustomer.name = String(customer.fullName || existingCustomer.name).trim();
      existingCustomer.phone = String(customer.phone || existingCustomer.phone).trim();
      existingCustomer.address = String(customer.address || existingCustomer.address).trim();
      existingCustomer.city = String(customer.city || existingCustomer.city).trim();
      existingCustomer.state = String(customer.state || existingCustomer.state).trim();
      existingCustomer.postalCode = String(customer.postalCode || existingCustomer.postalCode).trim();
      existingCustomer.totalOrders += 1;
      existingCustomer.totalSpent += total;
      existingCustomer.lastOrderAt = nowIso;
    } else {
      customerId = uid('cust');
      db.customers.unshift({
        id: customerId,
        name: String(customer.fullName || '').trim(),
        email,
        phone: String(customer.phone || '').trim(),
        address: String(customer.address || '').trim(),
        city: String(customer.city || '').trim(),
        state: String(customer.state || '').trim(),
        postalCode: String(customer.postalCode || '').trim(),
        totalOrders: 1,
        totalSpent: total,
        status: 'Active',
        registeredAt: nowIso,
        lastOrderAt: nowIso,
      });
      db.notifications.unshift({
        id: uid('notif'),
        audience: 'admin',
        targetEmployeeId: null,
        type: 'new_customer',
        title: `New Customer: ${String(customer.fullName || '').trim()}`,
        message: `${customer.city}, ${customer.state} registered via checkout.`,
        read: false,
        linkRoute: 'admin-customers',
        createdAt: nowIso,
      });
    }

    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const estimatedDelivery =
      String(req.body?.estimatedDelivery || '') ||
      deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

    const newOrder: DbOrder = {
      id: uid('ord'),
      orderNumber,
      createdAt: nowIso,
      customerId: customerId!,
      customer: {
        fullName: String(customer.fullName || '').trim(),
        email,
        phone: String(customer.phone || '').trim(),
        address: String(customer.address || '').trim(),
        city: String(customer.city || '').trim(),
        state: String(customer.state || '').trim(),
        postalCode: String(customer.postalCode || '').trim(),
        notes: customer.notes ? String(customer.notes).trim() : '',
      },
      items: verifiedItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      status: 'New Order',
      assignedEmployeeId: null,
      assignedEmployeeName: null,
      internalNotes: '',
      statusHistory: [
        {
          status: 'New Order',
          timestamp: nowIso,
          note: `Placed via VELORA ${paymentMethod}.`,
          actor: 'Storefront',
        },
      ],
      estimatedDelivery,
    };

    db.orders.unshift(newOrder);

    if (db.settings.autoDeductStockOnOrder) {
      deductOrRestoreOrderStock(
        newOrder,
        'deduct',
        'Storefront Checkout',
        'SYSTEM',
        `Order ${orderNumber} placed`
      );
    }

    db.notifications.unshift({
      id: uid('notif'),
      audience: 'admin',
      targetEmployeeId: null,
      type: 'new_order',
      title: `New Order ${orderNumber}`,
      message: `${newOrder.customer.fullName} ordered ${verifiedItems.length} item(s) — ₹${total.toLocaleString('en-IN')}.`,
      read: false,
      linkRoute: 'admin-orders',
      createdAt: nowIso,
    });

    logActivity(db, {
      actorId: customerId!,
      actorName: newOrder.customer.fullName,
      actorRole: 'CUSTOMER',
      action: 'ORDER_CREATED',
      target: orderNumber,
      details: `Placed COD order worth ₹${total.toLocaleString('en-IN')}.`,
    });

    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'new_order', orderNumber });
    broadcastEvent('storefront_updated', { source: 'stock_change' });
    res.status(201).json({ order: newOrder });
  });

  app.post('/api/storefront/enquiries', (req: Request, res: Response) => {
    const db = getDatabase();
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const message = String(req.body?.message || '').trim();

    if (name.length < 2 || !email || message.length < 5) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const nowIso = new Date().toISOString();
    const enquiry = {
      id: uid('enq'),
      customerName: name,
      email,
      phone,
      subject: String(req.body?.subject || 'Boutique Consultation Inquiry').trim(),
      message,
      status: 'Open' as const,
      assignedTo: null,
      notes: [],
      createdAt: nowIso,
    };

    db.enquiries.unshift(enquiry);
    db.notifications.unshift({
      id: uid('notif'),
      audience: 'admin',
      targetEmployeeId: null,
      type: 'employee_activity',
      title: `New Boutique Enquiry: ${name}`,
      message: message.slice(0, 100),
      read: false,
      linkRoute: 'admin-customers',
      createdAt: nowIso,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'new_enquiry' });
    res.status(201).json({ enquiry });
  });

  app.post('/api/storefront/newsletter', (req: Request, res: Response) => {
    const db = getDatabase();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email address required.' });
    }
    if (!db.newsletterSubscribers.some((s) => s.email.toLowerCase() === email)) {
      db.newsletterSubscribers.unshift({
        id: uid('sub'),
        email,
        subscribedAt: new Date().toISOString(),
      });
      saveDatabase(db);
      broadcastEvent('dashboard_updated', { source: 'newsletter' });
    }
    res.status(201).json({ ok: true });
  });

  // ── Admin Dashboard APIs (Strictly Protected) ───────────────────────────────
  app.get('/api/admin/overview', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;

    const activeOrders = db.orders.filter(
      (o) => o.status !== 'Cancelled' && o.status !== 'Returned'
    );
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingStatuses: OrderStatus[] = [
      'New Order',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
    ];

    const stats = {
      totalRevenue,
      totalOrders: db.orders.length,
      totalProducts: db.products.length,
      totalCustomers: db.customers.length,
      pendingOrders: db.orders.filter((o) => pendingStatuses.includes(o.status)).length,
      deliveredOrders: db.orders.filter((o) => o.status === 'Delivered').length,
      cancelledOrders: db.orders.filter(
        (o) => o.status === 'Cancelled' || o.status === 'Returned'
      ).length,
      totalEmployees: db.employees.filter((e) => e.status === 'Active').length,
    };

    res.json({
      stats,
      orders: hasModuleAccess(user, 'orders') || hasModuleAccess(user, 'analytics') ? db.orders : [],
      products:
        hasModuleAccess(user, 'products') || hasModuleAccess(user, 'inventory') ? db.products : [],
      categories: db.categories.sort((a, b) => a.displayOrder - b.displayOrder),
      inventoryMovements: hasModuleAccess(user, 'inventory') ? db.inventoryMovements : [],
      customers: hasModuleAccess(user, 'customers') ? db.customers : [],
      employees: hasModuleAccess(user, 'employees') || hasModuleAccess(user, 'orders') || hasModuleAccess(user, 'tasks')
        ? db.employees.map((e) => ({
            ...e,
            salary: user.role === 'SUPER_ADMIN' || hasModuleAccess(user, 'employees') ? e.salary : 0,
          }))
        : [],
      attendance: hasModuleAccess(user, 'attendance') ? db.attendance : [],
      leaveRequests: hasModuleAccess(user, 'attendance') ? db.leaveRequests : [],
      tasks: hasModuleAccess(user, 'tasks') ? db.tasks : [],
      enquiries: db.enquiries,
      notifications: db.notifications.filter((n) => n.audience === 'admin'),
      websiteContent: hasModuleAccess(user, 'website') ? db.websiteContent : null,
      newsletterSubscribers: hasModuleAccess(user, 'website') ? db.newsletterSubscribers : [],
      activityLogs: db.activityLogs.slice(0, 80),
      settings: user.role === 'SUPER_ADMIN' || hasModuleAccess(user, 'settings') ? db.settings : null,
    });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'orders')) {
      return res.status(403).json({ error: 'Forbidden: Missing orders permission.' });
    }
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const prevStatus = order.status;
    const nextStatus = req.body?.status as OrderStatus | undefined;
    const nowIso = new Date().toISOString();

    if (req.body?.customer) {
      order.customer = {
        ...order.customer,
        fullName: String(req.body.customer.fullName || order.customer.fullName).trim(),
        phone: String(req.body.customer.phone || order.customer.phone).trim(),
        email: String(req.body.customer.email || order.customer.email).trim(),
        address: String(req.body.customer.address || order.customer.address).trim(),
        city: String(req.body.customer.city || order.customer.city).trim(),
        state: String(req.body.customer.state || order.customer.state).trim(),
        postalCode: String(req.body.customer.postalCode || order.customer.postalCode).trim(),
      };
    }

    if (typeof req.body?.internalNotes === 'string') {
      order.internalNotes = req.body.internalNotes;
    }

    if (req.body?.assignedEmployeeId !== undefined) {
      const empId = req.body.assignedEmployeeId || null;
      const emp = empId ? db.employees.find((e) => e.id === empId) : null;
      order.assignedEmployeeId = emp ? emp.id : null;
      order.assignedEmployeeName = emp ? emp.name : null;

      if (emp) {
        db.notifications.unshift({
          id: uid('notif'),
          audience: 'employee',
          targetEmployeeId: emp.id,
          type: 'order_assigned',
          title: `Order ${order.orderNumber} Assigned`,
          message: `${user.name} assigned order ${order.orderNumber} (${order.customer.city}) to you.`,
          read: false,
          linkRoute: 'employee-orders',
          createdAt: nowIso,
        });
      }
    }

    if (nextStatus && nextStatus !== prevStatus) {
      order.status = nextStatus;
      order.statusHistory.push({
        status: nextStatus,
        timestamp: nowIso,
        note: String(req.body?.statusNote || `Status updated to ${nextStatus}`).trim(),
        actor: user.name,
      });

      const wasActive = prevStatus !== 'Cancelled' && prevStatus !== 'Returned';
      const isNowCanceled = nextStatus === 'Cancelled' || nextStatus === 'Returned';
      if (wasActive && isNowCanceled && db.settings.autoDeductStockOnOrder) {
        deductOrRestoreOrderStock(
          order,
          'restore',
          user.name,
          user.role,
          `Order ${order.orderNumber} marked ${nextStatus}`
        );
        db.notifications.unshift({
          id: uid('notif'),
          audience: 'admin',
          targetEmployeeId: null,
          type: 'cancelled_order',
          title: `Order ${order.orderNumber} ${nextStatus}`,
          message: `Inventory units restored for ${order.orderNumber}.`,
          read: false,
          linkRoute: 'admin-orders',
          createdAt: nowIso,
        });
      }
    }

    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'ORDER_UPDATED',
      target: order.orderNumber,
      details: `Updated status to ${order.status}${order.assignedEmployeeName ? ` · Assigned to ${order.assignedEmployeeName}` : ''}.`,
    });

    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'order_updated' });
    broadcastEvent('storefront_updated', { source: 'stock_change' });
    res.json({ order });
  });

  // ── Product Management CRUD ─────────────────────────────────────────────────
  app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'products')) {
      return res.status(403).json({ error: 'Forbidden: Missing products permission.' });
    }

    const name = String(req.body?.name || '').trim();
    if (name.length < 2) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const slug =
      String(req.body?.slug || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-') ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = `${slug}-${Date.now().toString().slice(-4)}`;

    const volumes = Array.isArray(req.body?.volumes) && req.body.volumes.length > 0
      ? req.body.volumes
      : [
          { volume: '30ml' as BottleVolume, price: Number(req.body?.price || 1999) - 700 },
          {
            volume: '50ml' as BottleVolume,
            price: Number(req.body?.price || 2699),
            originalPrice: req.body?.originalPrice ? Number(req.body.originalPrice) : undefined,
          },
          { volume: '100ml' as BottleVolume, price: Number(req.body?.price || 2699) + 1200 },
        ];

    const newProduct: DbProduct = {
      id,
      slug: id,
      name,
      subtitle: String(req.body?.subtitle || 'Signature VELORA Extrait').trim(),
      category: String(req.body?.category || 'Floral').trim(),
      concentration: String(req.body?.concentration || 'Eau de Parfum').trim(),
      shortDescription: String(req.body?.shortDescription || '').trim(),
      description: String(req.body?.description || '').trim(),
      price: Number(volumes[1]?.price ?? req.body?.price ?? 2499),
      originalPrice: req.body?.originalPrice ? Number(req.body.originalPrice) : undefined,
      rating: Number(req.body?.rating || 4.9),
      reviewCount: Number(req.body?.reviewCount || 1),
      featured: Boolean(req.body?.featured),
      inCollectionCarousel: req.body?.inCollectionCarousel !== false,
      published: req.body?.published !== false,
      tag: req.body?.tag ? String(req.body.tag).trim() : undefined,
      image: String(req.body?.image || 'asset:velora-enchanted-mirage'),
      gallery: Array.isArray(req.body?.gallery) && req.body.gallery.length > 0
        ? req.body.gallery
        : [String(req.body?.image || 'asset:velora-enchanted-mirage')],
      volumes,
      notes: {
        top: Array.isArray(req.body?.notes?.top) ? req.body.notes.top : ['Bergamot'],
        heart: Array.isArray(req.body?.notes?.heart) ? req.body.notes.heart : ['Damascus Rose'],
        base: Array.isArray(req.body?.notes?.base) ? req.body.notes.base : ['Mysore Sandalwood'],
      },
      longevity: String(req.body?.longevity || '8 – 10 Hours'),
      sillage: String(req.body?.sillage || 'Moderate to Intimate'),
      origin: String(req.body?.origin || 'Small-Batch Indian & Grasse Craft'),
      stock: {
        '30ml': Number(req.body?.stock?.['30ml'] ?? 20),
        '50ml': Number(req.body?.stock?.['50ml'] ?? 25),
        '100ml': Number(req.body?.stock?.['100ml'] ?? 15),
      },
      lowStockThreshold: Number(req.body?.lowStockThreshold ?? 10),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PRODUCT_CREATED',
      target: newProduct.name,
      details: `Added product in ${newProduct.category} category.`,
    });
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'product_created' });
    broadcastEvent('dashboard_updated', { source: 'product_created' });
    res.status(201).json({ product: newProduct });
  });

  app.patch('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'products')) {
      return res.status(403).json({ error: 'Forbidden: Missing products permission.' });
    }

    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found.' });

    const existing = db.products[idx];
    const body = req.body || {};
    const updated: DbProduct = {
      ...existing,
      ...body,
      id: existing.id,
      slug: body.slug ? String(body.slug) : existing.slug,
      updatedAt: new Date().toISOString(),
    };

    if (Array.isArray(updated.volumes) && updated.volumes.length > 0) {
      const fifty = updated.volumes.find((v) => v.volume === '50ml') || updated.volumes[0];
      updated.price = fifty.price;
      updated.originalPrice = fifty.originalPrice;
    }

    db.products[idx] = updated;
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PRODUCT_UPDATED',
      target: updated.name,
      details: `Updated pricing/details (Published: ${updated.published}).`,
    });
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'product_updated' });
    broadcastEvent('dashboard_updated', { source: 'product_updated' });
    res.json({ product: updated });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'products')) {
      return res.status(403).json({ error: 'Forbidden: Missing products permission.' });
    }
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found.' });

    db.products = db.products.filter((p) => p.id !== req.params.id);
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PRODUCT_DELETED',
      target: prod.name,
      details: 'Removed product from catalog.',
    });
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'product_deleted' });
    broadcastEvent('dashboard_updated', { source: 'product_deleted' });
    res.json({ ok: true });
  });

  // ── Categories CRUD ─────────────────────────────────────────────────────────
  app.post('/api/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'categories') && !hasModuleAccess(user, 'products')) {
      return res.status(403).json({ error: 'Forbidden: Missing category permission.' });
    }
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const cat = {
      id: uid('cat'),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: String(req.body?.description || '').trim(),
      displayOrder: Number(req.body?.displayOrder ?? db.categories.length + 1),
      active: req.body?.active !== false,
    };
    db.categories.push(cat);
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'category_created' });
    broadcastEvent('dashboard_updated', { source: 'category_created' });
    res.status(201).json({ category: cat });
  });

  app.patch('/api/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const cat = db.categories.find((c) => c.id === req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    if (req.body?.name) cat.name = String(req.body.name).trim();
    if (typeof req.body?.description === 'string') cat.description = req.body.description;
    if (typeof req.body?.active === 'boolean') cat.active = req.body.active;
    if (req.body?.displayOrder !== undefined) cat.displayOrder = Number(req.body.displayOrder);
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'category_updated' });
    broadcastEvent('dashboard_updated', { source: 'category_updated' });
    res.json({ category: cat });
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'category_deleted' });
    broadcastEvent('dashboard_updated', { source: 'category_deleted' });
    res.json({ ok: true });
  });

  // ── Inventory Adjustments ───────────────────────────────────────────────────
  app.post('/api/admin/inventory/adjust', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'inventory')) {
      return res.status(403).json({ error: 'Forbidden: Missing inventory permission.' });
    }

    const productId = String(req.body?.productId || '');
    const volume = (['30ml', '50ml', '100ml'].includes(req.body?.volume)
      ? req.body.volume
      : '50ml') as BottleVolume;
    const type = (['stock_in', 'stock_out', 'adjustment'].includes(req.body?.type)
      ? req.body.type
      : 'adjustment') as 'stock_in' | 'stock_out' | 'adjustment';
    const quantity = Math.max(0, Number(req.body?.quantity) || 0);
    const reason = String(req.body?.reason || 'Manual stock adjustment').trim();

    const prod = db.products.find((p) => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'Product not found.' });

    const prev = prod.stock[volume] ?? 0;
    let next = prev;
    if (type === 'stock_in') next = prev + quantity;
    else if (type === 'stock_out') next = Math.max(0, prev - quantity);
    else next = quantity;

    const delta = next - prev;
    prod.stock[volume] = next;
    prod.updatedAt = new Date().toISOString();

    const movement = {
      id: uid('mov'),
      productId: prod.id,
      productName: prod.name,
      volume,
      type,
      quantityChange: delta,
      previousStock: prev,
      newStock: next,
      reason,
      actorName: user.name,
      actorRole: user.role,
      createdAt: new Date().toISOString(),
    };
    db.inventoryMovements.unshift(movement);

    if (db.settings.lowStockAlerts && next <= prod.lowStockThreshold) {
      db.notifications.unshift({
        id: uid('notif'),
        audience: 'admin',
        targetEmployeeId: null,
        type: 'low_stock',
        title: `Stock Alert: ${prod.name} (${volume})`,
        message: `Available stock is now ${next} units (threshold: ${prod.lowStockThreshold}).`,
        read: false,
        linkRoute: 'admin-inventory',
        createdAt: new Date().toISOString(),
      });
    }

    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'INVENTORY_ADJUSTED',
      target: `${prod.name} (${volume})`,
      details: `${prev} -> ${next} units (${reason}).`,
    });

    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'inventory_updated' });
    broadcastEvent('storefront_updated', { source: 'stock_change' });
    res.status(201).json({ product: prod, movement });
  });

  // ── Customer Management ─────────────────────────────────────────────────────
  app.patch('/api/admin/customers/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'customers')) {
      return res.status(403).json({ error: 'Forbidden: Missing customers permission.' });
    }
    const cust = db.customers.find((c) => c.id === req.params.id);
    if (!cust) return res.status(404).json({ error: 'Customer not found.' });

    if (req.body?.status === 'Active' || req.body?.status === 'Blocked') {
      cust.status = req.body.status;
    }
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'CUSTOMER_STATUS',
      target: cust.name,
      details: `Account set to ${cust.status}.`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'customer_updated' });
    res.json({ customer: cust });
  });

  // ── Employee Management CRUD ────────────────────────────────────────────────
  app.post('/api/admin/employees', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'employees')) {
      return res.status(403).json({ error: 'Forbidden: Missing employees permission.' });
    }

    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid employee name and email are required.' });
    }
    if (db.employees.some((e) => e.email.toLowerCase() === email)) {
      return res.status(409).json({ error: 'An employee with this email already exists.' });
    }

    const empId = uid('emp');
    const codeSuffix = String(101 + db.employees.length);
    const employeeCode = String(req.body?.employeeCode || `VL-EMP-${codeSuffix}`).trim();
    const role = req.body?.role === 'ADMIN_MANAGER' ? 'ADMIN_MANAGER' : 'EMPLOYEE';
    const permissions = Array.isArray(req.body?.permissions)
      ? (req.body.permissions as AdminModulePermission[])
      : db.settings.defaultEmployeePermissions;

    const initialPassword = String(req.body?.initialPassword || '');
    const inviteCode = initialPassword
      ? null
      : `VL-JOIN-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const newEmployee: DbEmployee = {
      id: empId,
      employeeCode,
      name,
      email,
      phone: String(req.body?.phone || '').trim(),
      designation: String(req.body?.designation || 'Fragrance Specialist').trim(),
      department: (req.body?.department || 'Order Management') as EmployeeDepartment,
      salary: Number(req.body?.salary || 45000),
      role,
      permissions,
      status: req.body?.status === 'Inactive' ? 'Inactive' : 'Active',
      joiningDate: String(req.body?.joiningDate || getTodayDateString()),
      avatarUrl: String(req.body?.avatarUrl || 'asset:velora-enchanted-mirage'),
      bio: String(req.body?.bio || ''),
      address: String(req.body?.address || ''),
      inviteCode,
      hasAccount: Boolean(initialPassword && initialPassword.length >= 8),
      createdAt: new Date().toISOString(),
    };

    db.employees.unshift(newEmployee);

    if (initialPassword && initialPassword.length >= 8) {
      const { hash, salt } = hashPassword(initialPassword);
      db.users.push({
        id: uid('usr'),
        name,
        email,
        passwordHash: hash,
        passwordSalt: salt,
        role,
        employeeId: empId,
        permissions,
        active: newEmployee.status === 'Active',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      });
    }

    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'EMPLOYEE_CREATED',
      target: `${newEmployee.name} (${newEmployee.employeeCode})`,
      details: `Added to ${newEmployee.department} as ${newEmployee.role}.`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'employee_created' });
    res.status(201).json({ employee: newEmployee });
  });

  app.patch('/api/admin/employees/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'employees')) {
      return res.status(403).json({ error: 'Forbidden: Missing employees permission.' });
    }

    const emp = db.employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const body = req.body || {};
    if (body.name) emp.name = String(body.name).trim();
    if (body.phone !== undefined) emp.phone = String(body.phone).trim();
    if (body.designation) emp.designation = String(body.designation).trim();
    if (body.department) emp.department = body.department;
    if (body.salary !== undefined) emp.salary = Number(body.salary);
    if (body.employeeCode) emp.employeeCode = String(body.employeeCode).trim();
    if (body.role === 'ADMIN_MANAGER' || body.role === 'EMPLOYEE') emp.role = body.role;
    if (Array.isArray(body.permissions)) emp.permissions = body.permissions;
    if (body.status === 'Active' || body.status === 'Inactive') emp.status = body.status;
    if (body.avatarUrl) emp.avatarUrl = String(body.avatarUrl);
    if (body.joiningDate) emp.joiningDate = String(body.joiningDate);
    if (body.regenerateInvite) {
      emp.inviteCode = `VL-JOIN-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    }

    const linkedUser = db.users.find((u) => u.employeeId === emp.id);
    if (linkedUser) {
      linkedUser.name = emp.name;
      linkedUser.role = emp.role;
      linkedUser.permissions = emp.permissions;
      linkedUser.active = emp.status === 'Active';
      if (body.resetPassword && String(body.resetPassword).length >= 8) {
        const { hash, salt } = hashPassword(String(body.resetPassword));
        linkedUser.passwordHash = hash;
        linkedUser.passwordSalt = salt;
      }
    } else if (body.resetPassword && String(body.resetPassword).length >= 8) {
      const { hash, salt } = hashPassword(String(body.resetPassword));
      db.users.push({
        id: uid('usr'),
        name: emp.name,
        email: emp.email.toLowerCase(),
        passwordHash: hash,
        passwordSalt: salt,
        role: emp.role,
        employeeId: emp.id,
        permissions: emp.permissions,
        active: emp.status === 'Active',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      });
      emp.hasAccount = true;
      emp.inviteCode = null;
    }

    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'EMPLOYEE_UPDATED',
      target: emp.name,
      details: `Updated role (${emp.role}), department (${emp.department}), status (${emp.status}).`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'employee_updated' });
    res.json({ employee: emp });
  });

  app.delete('/api/admin/employees/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'employees')) {
      return res.status(403).json({ error: 'Forbidden: Missing employees permission.' });
    }
    const emp = db.employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    db.employees = db.employees.filter((e) => e.id !== req.params.id);
    db.users = db.users.filter((u) => u.employeeId !== req.params.id);
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'EMPLOYEE_REMOVED',
      target: emp.name,
      details: `Removed ${emp.employeeCode} from directory.`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'employee_deleted' });
    res.json({ ok: true });
  });

  // ── Attendance & Leave Approval ─────────────────────────────────────────────
  app.post('/api/admin/attendance', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'attendance')) {
      return res.status(403).json({ error: 'Forbidden: Missing attendance permission.' });
    }
    const emp = db.employees.find((e) => e.id === req.body?.employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const date = String(req.body?.date || getTodayDateString());
    const existing = db.attendance.find((a) => a.employeeId === emp.id && a.date === date);
    if (existing) {
      existing.status = req.body?.status || existing.status;
      existing.checkInTime = req.body?.checkInTime ?? existing.checkInTime;
      existing.checkOutTime = req.body?.checkOutTime ?? existing.checkOutTime;
      existing.workingHours = Number(req.body?.workingHours ?? existing.workingHours);
      existing.notes = req.body?.notes ?? existing.notes;
    } else {
      db.attendance.unshift({
        id: uid('att'),
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        department: emp.department,
        date,
        checkInTime: req.body?.checkInTime || null,
        checkOutTime: req.body?.checkOutTime || null,
        workingHours: Number(req.body?.workingHours || 0),
        status: req.body?.status || 'Present',
        notes: req.body?.notes || '',
      });
    }
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'ATTENDANCE_RECORDED',
      target: `${emp.name} (${date})`,
      details: `Marked ${req.body?.status || 'Present'}.`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'attendance_updated' });
    res.json({ ok: true });
  });

  app.patch('/api/admin/leave/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'attendance')) {
      return res.status(403).json({ error: 'Forbidden: Missing attendance permission.' });
    }
    const leave = db.leaveRequests.find((l) => l.id === req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

    const status = req.body?.status === 'Approved' ? 'Approved' : 'Rejected';
    const nowIso = new Date().toISOString();
    leave.status = status;
    leave.reviewedBy = user.name;
    leave.reviewedAt = nowIso;
    leave.adminComment = req.body?.adminComment ? String(req.body.adminComment).trim() : null;

    db.notifications.unshift({
      id: uid('notif'),
      audience: 'employee',
      targetEmployeeId: leave.employeeId,
      type: 'leave_update',
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} (${leave.startDate} to ${leave.endDate}) has been ${status.toLowerCase()}.`,
      read: false,
      linkRoute: 'employee-leave',
      createdAt: nowIso,
    });

    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: `LEAVE_${status.toUpperCase()}`,
      target: leave.employeeName,
      details: `${leave.leaveType} (${leave.startDate} – ${leave.endDate}).`,
    });

    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'leave_updated' });
    res.json({ leave });
  });

  // ── Tasks Management ────────────────────────────────────────────────────────
  app.post('/api/admin/tasks', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'tasks')) {
      return res.status(403).json({ error: 'Forbidden: Missing tasks permission.' });
    }
    const emp = db.employees.find((e) => e.id === req.body?.assignedToEmployeeId);
    if (!emp) return res.status(400).json({ error: 'Please select a valid employee.' });

    const title = String(req.body?.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Task title is required.' });

    const nowIso = new Date().toISOString();
    const task = {
      id: uid('task'),
      title,
      description: String(req.body?.description || '').trim(),
      assignedToEmployeeId: emp.id,
      assignedToName: emp.name,
      assignedBy: user.name,
      relatedOrderNumber: req.body?.relatedOrderNumber ? String(req.body.relatedOrderNumber) : null,
      priority: req.body?.priority || 'Medium',
      status: 'Pending' as const,
      deadline: String(req.body?.deadline || getTodayDateString()),
      comments: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.tasks.unshift(task);
    db.notifications.unshift({
      id: uid('notif'),
      audience: 'employee',
      targetEmployeeId: emp.id,
      type: 'task_assigned',
      title: `New Task Assigned: ${task.title}`,
      message: `Priority: ${task.priority} · Due ${task.deadline}.`,
      read: false,
      linkRoute: 'employee-tasks',
      createdAt: nowIso,
    });
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'TASK_ASSIGNED',
      target: emp.name,
      details: task.title,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'task_created' });
    res.status(201).json({ task });
  });

  app.patch('/api/admin/tasks/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const task = db.tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (req.body?.status) task.status = req.body.status;
    if (req.body?.priority) task.priority = req.body.priority;
    if (req.body?.deadline) task.deadline = req.body.deadline;
    task.updatedAt = new Date().toISOString();
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'task_updated' });
    res.json({ task });
  });

  app.delete('/api/admin/tasks/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    db.tasks = db.tasks.filter((t) => t.id !== req.params.id);
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'task_deleted' });
    res.json({ ok: true });
  });

  // ── Enquiries (Admin) ───────────────────────────────────────────────────────
  app.patch('/api/admin/enquiries/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    const enquiry = db.enquiries.find((e) => e.id === req.params.id);
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });

    if (req.body?.status) enquiry.status = req.body.status;
    if (req.body?.note) {
      enquiry.notes.push({
        id: uid('note'),
        author: user.name,
        text: String(req.body.note).trim(),
        createdAt: new Date().toISOString(),
      });
    }
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'enquiry_updated' });
    res.json({ enquiry });
  });

  // ── Website Management & Settings ───────────────────────────────────────────
  app.patch('/api/admin/website', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (!hasModuleAccess(user, 'website')) {
      return res.status(403).json({ error: 'Forbidden: Missing website management permission.' });
    }
    db.websiteContent = {
      ...db.websiteContent,
      ...(req.body || {}),
    };
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'WEBSITE_UPDATED',
      target: 'Storefront Content',
      details: 'Updated live website banners, copy, or editorial content.',
    });
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'website_content' });
    broadcastEvent('dashboard_updated', { source: 'website_content' });
    res.json({ websiteContent: db.websiteContent });
  });

  app.patch('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    if (user.role !== 'SUPER_ADMIN' && !hasModuleAccess(user, 'settings')) {
      return res.status(403).json({ error: 'Forbidden: Settings require Super Admin or Settings permission.' });
    }
    db.settings = {
      ...db.settings,
      ...(req.body || {}),
    };
    logActivity(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'SETTINGS_UPDATED',
      target: 'Store Settings',
      details: 'Updated store, shipping, COD, tax, or notification settings.',
    });
    saveDatabase(db);
    broadcastEvent('storefront_updated', { source: 'settings_updated' });
    broadcastEvent('dashboard_updated', { source: 'settings_updated' });
    res.json({ settings: db.settings });
  });

  app.patch('/api/admin/profile', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = db.users.find((u) => u.id === req.authUser!.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (req.body?.name) user.name = String(req.body.name).trim();
    saveDatabase(db);
    res.json({ user: sanitizeUser(user) });
  });

  app.patch('/api/admin/notifications/read', requireAdmin, (req: Request, res: Response) => {
    const db = getDatabase();
    const id = req.body?.id;
    for (const n of db.notifications) {
      if (n.audience === 'admin' && (!id || n.id === id)) {
        n.read = true;
      }
    }
    saveDatabase(db);
    res.json({ ok: true });
  });

  // ── Employee Workspace APIs (Strictly Scoped RBAC) ──────────────────────────
  app.get('/api/employee/workspace', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    const emp = user.employeeId
      ? db.employees.find((e) => e.id === user.employeeId)
      : db.employees.find((e) => e.email.toLowerCase() === user.email.toLowerCase());

    if (!emp) {
      return res.json({
        profile: null,
        todayAttendance: null,
        attendanceHistory: [],
        tasks: [],
        orders: [],
        enquiries: [],
        inventoryProducts: [],
        inventoryMovements: [],
        leaveRequests: [],
        notifications: [],
        permissions: { support: false, inventory: false },
        performance: {
          assignedTasks: 0,
          completedTasks: 0,
          assignedOrders: 0,
          processedOrders: 0,
          attendancePercentage: 100,
        },
      });
    }

    const today = getTodayDateString();
    const attendanceHistory = db.attendance.filter((a) => a.employeeId === emp.id);
    const todayAttendance = attendanceHistory.find((a) => a.date === today) || null;
    const myTasks = db.tasks.filter((t) => t.assignedToEmployeeId === emp.id);
    const myOrders = db.orders.filter(
      (o) =>
        o.assignedEmployeeId === emp.id ||
        ((emp.department === 'Order Management' || emp.department === 'Packing & Dispatch') &&
          !o.assignedEmployeeId)
    );
    const myLeaves = db.leaveRequests.filter((l) => l.employeeId === emp.id);
    const myNotifications = db.notifications.filter(
      (n) => n.audience === 'employee' && (!n.targetEmployeeId || n.targetEmployeeId === emp.id)
    );

    const canSupport = isEmployeeAuthorizedForSupport(emp, user);
    const canInventory = isEmployeeAuthorizedForInventory(emp, user);

    const presentDays = attendanceHistory.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    ).length;
    const attendancePercentage =
      attendanceHistory.length > 0 ? Math.round((presentDays / attendanceHistory.length) * 100) : 100;

    res.json({
      profile: {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        designation: emp.designation,
        department: emp.department,
        role: emp.role,
        joiningDate: emp.joiningDate,
        avatarUrl: emp.avatarUrl,
        bio: emp.bio,
        address: emp.address,
      },
      todayAttendance,
      attendanceHistory,
      tasks: myTasks,
      orders: myOrders,
      enquiries: canSupport ? db.enquiries : [],
      inventoryProducts: canInventory ? db.products : [],
      inventoryMovements: canInventory ? db.inventoryMovements.slice(0, 40) : [],
      leaveRequests: myLeaves,
      notifications: myNotifications,
      permissions: {
        support: canSupport,
        inventory: canInventory,
      },
      performance: {
        assignedTasks: myTasks.length,
        completedTasks: myTasks.filter((t) => t.status === 'Completed').length,
        assignedOrders: myOrders.length,
        processedOrders: myOrders.filter(
          (o) =>
            o.status === 'Packed' ||
            o.status === 'Shipped' ||
            o.status === 'Out for Delivery' ||
            o.status === 'Delivered'
        ).length,
        attendancePercentage,
      },
    });
  });

  app.patch('/api/employee/profile', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    const emp = db.employees.find((e) => e.id === user.employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });

    // Only allow permitted personal fields; never allow role/salary/department/permissions mutation
    if (req.body?.name) emp.name = String(req.body.name).trim();
    if (req.body?.phone !== undefined) emp.phone = String(req.body.phone).trim();
    if (req.body?.address !== undefined) emp.address = String(req.body.address).trim();
    if (req.body?.bio !== undefined) emp.bio = String(req.body.bio).trim();
    if (req.body?.avatarUrl) emp.avatarUrl = String(req.body.avatarUrl);

    const linkedUser = db.users.find((u) => u.id === user.id);
    if (linkedUser) linkedUser.name = emp.name;

    logActivity(db, {
      actorId: user.id,
      actorName: emp.name,
      actorRole: emp.role,
      action: 'PROFILE_UPDATED',
      target: emp.employeeCode,
      details: 'Updated personal contact details.',
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'employee_profile_updated' });
    res.json({ profile: emp });
  });

  app.post(
    '/api/employee/attendance/check-in',
    requireEmployee,
    (req: AuthenticatedRequest, res: Response) => {
      const db = getDatabase();
      const user = req.authUser!;
      const emp = db.employees.find((e) => e.id === user.employeeId);
      if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });

      const today = getTodayDateString();
      const existing = db.attendance.find((a) => a.employeeId === emp.id && a.date === today);
      if (existing && existing.checkInTime) {
        return res.status(409).json({ error: 'You have already checked in today.' });
      }

      const nowTime = getCurrentTimeLabel();
      const istHour = Number(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      );
      const istMin = Number(
        new Date().toLocaleTimeString('en-GB', {
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      );
      const isLate = istHour > 10 || (istHour === 10 && istMin > 15);

      const record = existing || {
        id: uid('att'),
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        department: emp.department,
        date: today,
        checkInTime: nowTime,
        checkOutTime: null,
        workingHours: 0,
        status: isLate ? ('Late' as const) : ('Present' as const),
      };
      record.checkInTime = nowTime;
      record.status = isLate ? 'Late' : 'Present';
      if (!existing) db.attendance.unshift(record);

      db.notifications.unshift({
        id: uid('notif'),
        audience: 'admin',
        targetEmployeeId: null,
        type: 'employee_activity',
        title: `${emp.name} Checked In`,
        message: `Checked in at ${nowTime} (${record.status}).`,
        read: false,
        linkRoute: 'admin-attendance',
        createdAt: new Date().toISOString(),
      });
      logActivity(db, {
        actorId: user.id,
        actorName: emp.name,
        actorRole: emp.role,
        action: 'ATTENDANCE_CHECK_IN',
        target: today,
        details: `Checked in at ${nowTime} (${record.status}).`,
      });
      saveDatabase(db);
      broadcastEvent('dashboard_updated', { source: 'attendance_checkin' });
      res.json({ attendance: record });
    }
  );

  app.post(
    '/api/employee/attendance/check-out',
    requireEmployee,
    (req: AuthenticatedRequest, res: Response) => {
      const db = getDatabase();
      const user = req.authUser!;
      const emp = db.employees.find((e) => e.id === user.employeeId);
      if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });

      const today = getTodayDateString();
      const record = db.attendance.find((a) => a.employeeId === emp.id && a.date === today);
      if (!record || !record.checkInTime) {
        return res.status(400).json({ error: 'Please check in before checking out.' });
      }
      if (record.checkOutTime) {
        return res.status(409).json({ error: 'You have already checked out today.' });
      }

      const nowTime = getCurrentTimeLabel();
      record.checkOutTime = nowTime;
      record.workingHours = Math.max(0.5, Number((8.0 + Math.random() * 1.2).toFixed(1)));

      logActivity(db, {
        actorId: user.id,
        actorName: emp.name,
        actorRole: emp.role,
        action: 'ATTENDANCE_CHECK_OUT',
        target: today,
        details: `Checked out at ${nowTime}.`,
      });
      saveDatabase(db);
      broadcastEvent('dashboard_updated', { source: 'attendance_checkout' });
      res.json({ attendance: record });
    }
  );

  app.patch('/api/employee/tasks/:id', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    const emp = db.employees.find((e) => e.id === user.employeeId);
    const task = db.tasks.find((t) => t.id === req.params.id);

    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (!emp || task.assignedToEmployeeId !== emp.id) {
      return res.status(403).json({ error: 'Forbidden: Task is not assigned to you.' });
    }

    if (req.body?.status) task.status = req.body.status;
    if (req.body?.comment && String(req.body.comment).trim()) {
      task.comments.push({
        id: uid('tc'),
        author: emp.name,
        text: String(req.body.comment).trim(),
        createdAt: new Date().toISOString(),
      });
    }
    task.updatedAt = new Date().toISOString();

    logActivity(db, {
      actorId: user.id,
      actorName: emp.name,
      actorRole: emp.role,
      action: 'TASK_UPDATED',
      target: task.title,
      details: `Marked ${task.status}.`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'employee_task_updated' });
    res.json({ task });
  });

  app.patch('/api/employee/orders/:id', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    const emp = db.employees.find((e) => e.id === user.employeeId);
    const order = db.orders.find((o) => o.id === req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const permittedByAssignment = emp && order.assignedEmployeeId === emp.id;
    const permittedByDepartment =
      emp &&
      (emp.department === 'Order Management' || emp.department === 'Packing & Dispatch') &&
      !order.assignedEmployeeId;

    if (!permittedByAssignment && !permittedByDepartment) {
      return res.status(403).json({ error: 'Forbidden: Order is not assigned to you.' });
    }

    const allowedStatuses: OrderStatus[] = [
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];
    const nextStatus = req.body?.status as OrderStatus | undefined;
    if (nextStatus && !allowedStatuses.includes(nextStatus)) {
      return res.status(403).json({
        error: 'Employees cannot cancel or override restricted order statuses.',
      });
    }

    if (nextStatus && nextStatus !== order.status) {
      order.status = nextStatus;
      order.statusHistory.push({
        status: nextStatus,
        timestamp: new Date().toISOString(),
        note: String(req.body?.internalNotes || `Fulfillment updated to ${nextStatus}`).trim(),
        actor: emp!.name,
      });
    }
    if (typeof req.body?.internalNotes === 'string') {
      order.internalNotes = req.body.internalNotes;
    }

    logActivity(db, {
      actorId: user.id,
      actorName: emp!.name,
      actorRole: emp!.role,
      action: 'ORDER_FULFILLMENT',
      target: order.orderNumber,
      details: `Updated status to ${order.status}.`,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'employee_order_updated' });
    res.json({ order });
  });

  app.patch(
    '/api/employee/enquiries/:id',
    requireEmployee,
    (req: AuthenticatedRequest, res: Response) => {
      const db = getDatabase();
      const user = req.authUser!;
      const emp = db.employees.find((e) => e.id === user.employeeId);
      if (!isEmployeeAuthorizedForSupport(emp, user)) {
        return res.status(403).json({ error: 'Forbidden: Customer support access required.' });
      }
      const enquiry = db.enquiries.find((e) => e.id === req.params.id);
      if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });

      if (req.body?.status) enquiry.status = req.body.status;
      if (req.body?.note && String(req.body.note).trim()) {
        enquiry.notes.push({
          id: uid('en'),
          author: emp?.name || user.name,
          text: String(req.body.note).trim(),
          createdAt: new Date().toISOString(),
        });
      }
      saveDatabase(db);
      broadcastEvent('dashboard_updated', { source: 'enquiry_updated' });
      res.json({ enquiry });
    }
  );

  app.post(
    '/api/employee/inventory/adjust',
    requireEmployee,
    (req: AuthenticatedRequest, res: Response) => {
      const db = getDatabase();
      const user = req.authUser!;
      const emp = db.employees.find((e) => e.id === user.employeeId);
      if (!isEmployeeAuthorizedForInventory(emp, user)) {
        return res.status(403).json({ error: 'Forbidden: Inventory authorization required.' });
      }

      const productId = String(req.body?.productId || '');
      const volume = (['30ml', '50ml', '100ml'].includes(req.body?.volume)
        ? req.body.volume
        : '50ml') as BottleVolume;
      const type = (['stock_in', 'stock_out', 'adjustment'].includes(req.body?.type)
        ? req.body.type
        : 'adjustment') as 'stock_in' | 'stock_out' | 'adjustment';
      const quantity = Math.max(0, Number(req.body?.quantity) || 0);
      const reason = String(req.body?.reason || 'Staff stock update').trim();

      const prod = db.products.find((p) => p.id === productId);
      if (!prod) return res.status(404).json({ error: 'Product not found.' });

      const prev = prod.stock[volume] ?? 0;
      const next =
        type === 'stock_in' ? prev + quantity : type === 'stock_out' ? Math.max(0, prev - quantity) : quantity;

      prod.stock[volume] = next;
      prod.updatedAt = new Date().toISOString();

      const movement = {
        id: uid('mov'),
        productId: prod.id,
        productName: prod.name,
        volume,
        type,
        quantityChange: next - prev,
        previousStock: prev,
        newStock: next,
        reason,
        actorName: emp?.name || user.name,
        actorRole: emp?.department || user.role,
        createdAt: new Date().toISOString(),
      };
      db.inventoryMovements.unshift(movement);
      logActivity(db, {
        actorId: user.id,
        actorName: emp?.name || user.name,
        actorRole: emp?.role || user.role,
        action: 'INVENTORY_ADJUSTED',
        target: `${prod.name} (${volume})`,
        details: `${prev} -> ${next} (${reason}).`,
      });
      saveDatabase(db);
      broadcastEvent('dashboard_updated', { source: 'inventory_updated' });
      broadcastEvent('storefront_updated', { source: 'stock_change' });
      res.status(201).json({ product: prod, movement });
    }
  );

  app.post('/api/employee/leave', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const user = req.authUser!;
    const emp = db.employees.find((e) => e.id === user.employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });

    const startDate = String(req.body?.startDate || '');
    const endDate = String(req.body?.endDate || '');
    const reason = String(req.body?.reason || '').trim();
    if (!startDate || !endDate || reason.length < 5) {
      return res.status(400).json({ error: 'Leave dates and a valid reason are required.' });
    }

    const nowIso = new Date().toISOString();
    const leave = {
      id: uid('leave'),
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: emp.name,
      department: emp.department,
      startDate,
      endDate,
      leaveType: req.body?.leaveType || 'Casual Leave',
      reason,
      status: 'Pending' as const,
      reviewedBy: null,
      reviewedAt: null,
      adminComment: null,
      createdAt: nowIso,
    };
    db.leaveRequests.unshift(leave);
    db.notifications.unshift({
      id: uid('notif'),
      audience: 'admin',
      targetEmployeeId: null,
      type: 'leave_request',
      title: `Leave Request: ${emp.name}`,
      message: `${leave.leaveType} from ${startDate} to ${endDate}.`,
      read: false,
      linkRoute: 'admin-attendance',
      createdAt: nowIso,
    });
    saveDatabase(db);
    broadcastEvent('dashboard_updated', { source: 'leave_requested' });
    res.status(201).json({ leave });
  });

  app.patch(
    '/api/employee/notifications/read',
    requireEmployee,
    (req: AuthenticatedRequest, res: Response) => {
      const db = getDatabase();
      const user = req.authUser!;
      const id = req.body?.id;
      for (const n of db.notifications) {
        if (
          n.audience === 'employee' &&
          (!n.targetEmployeeId || n.targetEmployeeId === user.employeeId) &&
          (!id || n.id === id)
        ) {
          n.read = true;
        }
      }
      saveDatabase(db);
      res.json({ ok: true });
    }
  );
}
