import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { OrderRecord } from '../types';

function generateOrderUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface SaveOrderResult {
  persisted: boolean;
  orderId?: string;
}

export async function saveOrderToSupabase(order: OrderRecord): Promise<SaveOrderResult> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn(
      'Supabase anon key (VITE_SUPABASE_ANON_KEY) is not set. Order saved locally only.'
    );
    return { persisted: false };
  }

  const orderId = generateOrderUuid();

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    order_number: order.orderNumber,
    full_name: order.customer.fullName.trim(),
    email: order.customer.email.trim(),
    phone: order.customer.phone.trim(),
    address: order.customer.address.trim(),
    city: order.customer.city.trim(),
    state: order.customer.state.trim(),
    postal_code: order.customer.postalCode.trim(),
    notes: order.customer.notes?.trim() || null,
    payment_method: order.paymentMethod,
    subtotal: order.subtotal,
    shipping_fee: order.shippingFee,
    total: order.total,
    estimated_delivery: order.estimatedDelivery,
    status: 'confirmed',
    created_at: order.createdAt,
  });

  if (orderError) {
    console.error('Failed to insert order into Supabase:', orderError);
    throw new Error('Unable to save your order right now. Please verify your details and try again.');
  }

  if (order.items.length > 0) {
    const itemRows = order.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      volume: item.volume,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);

    if (itemsError) {
      console.error('Failed to insert order items into Supabase:', itemsError);
      throw new Error('Unable to save order line items right now. Please try again.');
    }
  }

  return { persisted: true, orderId };
}
