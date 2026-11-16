import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCT_PRICING } from './src/data/catalogPricing.ts';
import { getSupabaseConfig, getSupabaseServerClient, SUPABASE_PROJECT_ID } from './src/lib/supabaseServer.ts';
import type { BottleVolume, CodPaymentOption, CustomerDetails } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_VOLUMES = new Set<BottleVolume>(['30ml', '50ml', '100ml']);
const VALID_PAYMENT_METHODS = new Set<CodPaymentOption>([
  'Cash on Delivery (Cash)',
  'Cash on Delivery (UPI on Arrival)',
]);

interface OrderRequestBody {
  customer?: Partial<CustomerDetails>;
  paymentMethod?: CodPaymentOption;
  items?: Array<{
    productId?: string;
    volume?: BottleVolume;
    quantity?: number;
  }>;
}

function validateCustomer(customer: Partial<CustomerDetails> | undefined): string | null {
  if (!customer) return 'Customer delivery details are required.';
  if (!customer.fullName || customer.fullName.trim().length < 2) return 'Full name is required.';
  if (!customer.phone || !/^[+\d\s-]{10,15}$/.test(customer.phone.trim()))
    return 'Valid 10-digit mobile number is required.';
  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()))
    return 'Valid email address is required.';
  if (!customer.address || customer.address.trim().length < 6)
    return 'Complete street address is required.';
  if (!customer.city || customer.city.trim().length < 2) return 'City is required.';
  if (!customer.state || customer.state.trim().length < 2) return 'State is required.';
  if (!customer.postalCode || !/^\d{6}$/.test(customer.postalCode.trim()))
    return 'Valid 6-digit Indian PIN code is required.';
  return null;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const { url, key } = getSupabaseConfig();
    res.json({
      ok: true,
      supabaseProjectId: SUPABASE_PROJECT_ID,
      supabaseUrl: url,
      supabaseConfigured: Boolean(key),
    });
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    const body = (req.body || {}) as OrderRequestBody;
    const customerError = validateCustomer(body.customer);
    if (customerError) {
      return res.status(400).json({ error: customerError });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'Your shopping bag is empty.' });
    }

    const paymentMethod: CodPaymentOption =
      body.paymentMethod && VALID_PAYMENT_METHODS.has(body.paymentMethod)
        ? body.paymentMethod
        : 'Cash on Delivery (Cash)';

    const normalizedItems: Array<{
      productId: string;
      name: string;
      volume: BottleVolume;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const rawItem of body.items) {
      const productId = rawItem.productId?.trim();
      const volume = rawItem.volume;
      const quantity = Number(rawItem.quantity);

      if (!productId || !PRODUCT_PRICING[productId]) {
        return res.status(400).json({ error: `Unknown fragrance selection: ${productId ?? 'invalid'}` });
      }
      if (!volume || !VALID_VOLUMES.has(volume)) {
        return res.status(400).json({ error: `Invalid bottle volume for ${productId}` });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: `Invalid quantity for ${productId}` });
      }

      const catalogItem = PRODUCT_PRICING[productId];
      const unitPrice = catalogItem.volumes[volume];
      normalizedItems.push({
        productId: catalogItem.id,
        name: catalogItem.name,
        volume,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      });
    }

    const { client: supabase, error: configError } = getSupabaseServerClient();
    if (!supabase) {
      return res.status(503).json({ error: configError });
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = subtotal >= 2500 || subtotal === 0 ? 0 : 149;
    const total = subtotal + shippingFee;
    const orderNumber = `VL-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const customer: CustomerDetails = {
      fullName: body.customer!.fullName!.trim(),
      email: body.customer!.email!.trim(),
      phone: body.customer!.phone!.trim(),
      address: body.customer!.address!.trim(),
      city: body.customer!.city!.trim(),
      state: body.customer!.state!.trim(),
      postalCode: body.customer!.postalCode!.trim(),
      notes: body.customer!.notes?.trim() || '',
    };

    try {
      const { data: createdOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customer.fullName,
          customer_email: customer.email,
          customer_phone: customer.phone,
          shipping_address: customer.address,
          city: customer.city,
          state: customer.state,
          postal_code: customer.postalCode,
          notes: customer.notes || null,
          payment_method: paymentMethod,
          subtotal,
          shipping_fee: shippingFee,
          total,
          estimated_delivery: estimatedDelivery,
          status: 'pending_confirmation',
        })
        .select('id, order_number, created_at')
        .single();

      if (orderInsertError || !createdOrder) {
        console.error('Supabase orders insert error:', orderInsertError);
        const hint =
          orderInsertError?.code === '42P01'
            ? 'Table "orders" does not exist in Supabase yet. Run supabase/schema.sql in your Supabase SQL Editor.'
            : orderInsertError?.message || 'Unable to save order in Supabase.';
        return res.status(500).json({ error: hint });
      }

      const itemRows = normalizedItems.map((item) => ({
        order_id: createdOrder.id,
        order_number: createdOrder.order_number,
        product_id: item.productId,
        product_name: item.name,
        volume: item.volume,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
      }));

      const { error: itemsInsertError } = await supabase.from('order_items').insert(itemRows);
      if (itemsInsertError) {
        console.error('Supabase order_items insert error:', itemsInsertError);
        await supabase.from('orders').delete().eq('id', createdOrder.id);
        const hint =
          itemsInsertError.code === '42P01'
            ? 'Table "order_items" does not exist in Supabase yet. Run supabase/schema.sql in your Supabase SQL Editor.'
            : itemsInsertError.message || 'Unable to save order line items in Supabase.';
        return res.status(500).json({ error: hint });
      }

      return res.status(201).json({
        order: {
          supabaseOrderId: createdOrder.id,
          orderNumber: createdOrder.order_number,
          createdAt: createdOrder.created_at || new Date().toISOString(),
          customer,
          items: normalizedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            volume: item.volume,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          subtotal,
          shippingFee,
          total,
          paymentMethod,
          estimatedDelivery,
        },
      });
    } catch (err) {
      console.error('Unexpected Supabase order error:', err);
      return res.status(500).json({
        error: 'Unable to reach Supabase backend. Please verify your project credentials and try again.',
      });
    }
  });

  app.get('/api/orders/:orderNumber', async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber?.trim();
    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required.' });
    }

    const { client: supabase, error: configError } = getSupabaseServerClient();
    if (!supabase) {
      return res.status(503).json({ error: configError });
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (orderError) {
        return res.status(500).json({ error: orderError.message });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      return res.json({ order });
    } catch (err) {
      console.error('Supabase order lookup error:', err);
      return res.status(500).json({ error: 'Failed to retrieve order.' });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VELORA server running on http://0.0.0.0:${port}`);
  });
}

startServer();
