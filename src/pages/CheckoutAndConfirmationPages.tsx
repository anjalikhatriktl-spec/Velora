import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { formatINR } from '../data/catalog';
import { getVolumePrice, useStore } from '../context/StoreContext';
import { CodPaymentOption, CustomerDetails } from '../types';
import { SafeImage } from '../components/SafeImage';
import { VeloraLogo } from '../components/VeloraLogo';

export const CheckoutPage: React.FC = () => {
  const { products, publicSettings, cart, cartSubtotal, placeOrder, navigate } = useStore();

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<CodPaymentOption>('Cash on Delivery (Cash)');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const shippingFee =
    cartSubtotal >= publicSettings.freeShippingThreshold || cartSubtotal === 0
      ? 0
      : publicSettings.standardShippingFee;
  const grandTotal = cartSubtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="bg-[#FAF8F4] min-h-[70vh] py-20 px-6 flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-10 h-10 text-[#9A7742] mb-4" />
        <h1 className="font-serif text-4xl text-[#181614] mb-3">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-[#6E655E] max-w-md mb-6">
          Add one or more signature fragrances to your bag before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate('shop')}
          className="px-7 py-3.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
        >
          Browse Fragrances
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (customer.fullName.trim().length < 2) newErrors.fullName = 'Full name is required.';
    if (!/^[+\d\s-]{10,15}$/.test(customer.phone.trim()))
      newErrors.phone = 'Valid 10-digit mobile number is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()))
      newErrors.email = 'Valid email address is required.';
    if (customer.address.trim().length < 6)
      newErrors.address = 'Please enter your complete street address.';
    if (customer.city.trim().length < 2) newErrors.city = 'City is required.';
    if (customer.state.trim().length < 2) newErrors.state = 'State is required.';
    if (!/^\d{6}$/.test(customer.postalCode.trim()))
      newErrors.postalCode = 'Enter a valid 6-digit Indian PIN code.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const fieldIdMap: Partial<Record<keyof CustomerDetails, string>> = {
        fullName: 'checkout-name',
        phone: 'checkout-phone',
        email: 'checkout-email',
        address: 'checkout-address',
        city: 'checkout-city',
        state: 'checkout-state',
        postalCode: 'checkout-pin',
      };
      const firstKey = Object.keys(newErrors)[0] as keyof CustomerDetails;
      const targetId = fieldIdMap[firstKey];
      if (targetId) {
        const el = document.getElementById(targetId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await placeOrder(customer, paymentMethod);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to save your order right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-8 sm:py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-2 min-h-[40px] text-xs tracking-[0.16em] uppercase text-[#6E655E] hover:text-[#181614] mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>

        <div className="mb-8 sm:mb-10 space-y-2">
          <VeloraLogo tone="dark" size="sm" />
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614]">
            VELORA Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Customer Details Form */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="bg-white border border-[#E6DDD1] p-5 sm:p-8 space-y-5">
              <h2 className="font-serif text-2xl text-[#181614] border-b border-[#E6DDD1] pb-3">
                1. Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => {
                      setCustomer({ ...customer, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="Priya Sharma"
                    className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-[#A94438]">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer({ ...customer, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="+91 98200 12345"
                    className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm tabular-nums"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[#A94438]">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                >
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => {
                    setCustomer({ ...customer, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="priya.sharma@example.com"
                  className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-xs text-[#A94438]">{errors.email}</p>}
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                >
                  Street Address & Landmark *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={customer.address}
                  onChange={(e) => {
                    setCustomer({ ...customer, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: undefined });
                  }}
                  placeholder="402 Sea View Residences, Worli"
                  className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-[#A94438]">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                  >
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={customer.city}
                    onChange={(e) => {
                      setCustomer({ ...customer, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: undefined });
                    }}
                    placeholder="Mumbai"
                    className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm"
                  />
                  {errors.city && <p className="mt-1 text-xs text-[#A94438]">{errors.city}</p>}
                </div>

                <div>
                  <label
                    htmlFor="checkout-state"
                    className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                  >
                    State *
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    value={customer.state}
                    onChange={(e) => {
                      setCustomer({ ...customer, state: e.target.value });
                      if (errors.state) setErrors({ ...errors, state: undefined });
                    }}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm"
                  />
                  {errors.state && <p className="mt-1 text-xs text-[#A94438]">{errors.state}</p>}
                </div>

                <div>
                  <label
                    htmlFor="checkout-pin"
                    className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                  >
                    PIN Code *
                  </label>
                  <input
                    id="checkout-pin"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={customer.postalCode}
                    onChange={(e) => {
                      setCustomer({ ...customer, postalCode: e.target.value });
                      if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                    }}
                    placeholder="400018"
                    className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm tabular-nums"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-[#A94438]">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-notes"
                  className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-2"
                >
                  Gift Message / Delivery Instructions (Optional)
                </label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="Complimentary handwritten gift card message..."
                  className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm resize-none"
                />
              </div>
            </div>

            {/* Payment Option: Interactive Cash on Delivery Selection */}
            <div className="bg-white border border-[#E6DDD1] p-5 sm:p-8 space-y-4">
              <h2 className="font-serif text-2xl text-[#181614] border-b border-[#E6DDD1] pb-3">
                2. Payment Method
              </h2>
              <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                <label
                  className={`flex items-start gap-3.5 p-4 sm:p-5 border cursor-pointer transition-colors ${
                    paymentMethod === 'Cash on Delivery (Cash)'
                      ? 'border-[#181614] bg-[#FAF8F4]'
                      : 'border-[#E6DDD1] bg-white hover:border-[#B8935A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery (Cash)"
                    checked={paymentMethod === 'Cash on Delivery (Cash)'}
                    onChange={() => setPaymentMethod('Cash on Delivery (Cash)')}
                    className="mt-1 accent-[#181614] w-4 h-4 shrink-0"
                  />
                  <Banknote className="w-5 h-5 text-[#9A7742] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-sm text-[#181614]">
                        Cash on Delivery (Cash at Doorstep)
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#9A7742]">
                        ₹0 COD Fee
                      </span>
                    </div>
                    <p className="text-xs text-[#6E655E] mt-1 leading-relaxed">
                      Pay {formatINR(grandTotal)} in cash upon sealed courier delivery at your
                      doorstep.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3.5 p-4 sm:p-5 border cursor-pointer transition-colors ${
                    paymentMethod === 'Cash on Delivery (UPI on Arrival)'
                      ? 'border-[#181614] bg-[#FAF8F4]'
                      : 'border-[#E6DDD1] bg-white hover:border-[#B8935A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery (UPI on Arrival)"
                    checked={paymentMethod === 'Cash on Delivery (UPI on Arrival)'}
                    onChange={() => setPaymentMethod('Cash on Delivery (UPI on Arrival)')}
                    className="mt-1 accent-[#181614] w-4 h-4 shrink-0"
                  />
                  <Smartphone className="w-5 h-5 text-[#9A7742] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-sm text-[#181614]">
                        Cash on Delivery (UPI Scan on Arrival)
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[#9A7742]">
                        Instant QR
                      </span>
                    </div>
                    <p className="text-xs text-[#6E655E] mt-1 leading-relaxed">
                      Scan &amp; pay {formatINR(grandTotal)} via any UPI app directly to our
                      courier partner at delivery.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E6DDD1] p-5 sm:p-8 space-y-6 lg:sticky lg:top-24">
              <h2 className="font-serif text-2xl text-[#181614] border-b border-[#E6DDD1] pb-3">
                Order Summary
              </h2>

              <div className="divide-y divide-[#E6DDD1] max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  const price = getVolumePrice(product, item.volume);

                  return (
                    <div
                      key={`${item.productId}-${item.volume}`}
                      className="py-3.5 first:pt-0 flex items-center gap-3.5"
                    >
                      <div className="w-14 h-16 bg-[#F2ECE4] shrink-0 overflow-hidden">
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-lg text-[#181614] truncate">{product.name}</p>
                        <p className="text-xs text-[#6E655E]">
                          {item.volume} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#181614] tabular-nums">
                        {formatINR(price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E6DDD1] space-y-2.5 text-sm">
                <div className="flex justify-between text-[#6E655E]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#181614]">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6E655E]">
                  <span>Insured Courier Delivery</span>
                  <span className="tabular-nums text-[#181614]">
                    {shippingFee === 0 ? 'Complimentary' : formatINR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[#6E655E]">
                  <span>Cash on Delivery Fee</span>
                  <span className="text-[#181614]">₹0</span>
                </div>
                <div className="pt-3 border-t border-[#E6DDD1] flex justify-between text-base font-semibold text-[#181614]">
                  <span>Total Payable</span>
                  <span className="tabular-nums text-lg">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="p-3.5 bg-[#FDF4F3] border border-[#E5B8B2] text-xs text-[#A94438] leading-relaxed"
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] px-6 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <span>Place Order ({formatINR(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#6E655E]">
                <ShieldCheck className="w-4 h-4 text-[#9A7742] shrink-0" />
                <span>Sealed VELORA Signature Packaging · 2ml Discovery Vial Included</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const OrderConfirmationPage: React.FC = () => {
  const { lastOrder, navigate } = useStore();

  if (!lastOrder) {
    return (
      <div className="bg-[#FAF8F4] min-h-[70vh] py-14 sm:py-20 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
        <PackageCheck className="w-10 h-10 text-[#9A7742] mb-4" />
        <h1 className="font-serif text-3xl sm:text-4xl text-[#181614] mb-3">
          No Recent Order Found
        </h1>
        <button
          type="button"
          onClick={() => navigate('shop')}
          className="min-h-[48px] px-7 py-3.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
        >
          Explore Fragrances
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E6DDD1] p-5 sm:p-10 lg:p-12 space-y-6 sm:space-y-8">
          <div className="text-center space-y-3 pb-6 border-b border-[#E6DDD1]">
            <VeloraLogo tone="dark" size="sm" className="mx-auto mb-1" />
            <CheckCircle2 className="w-11 h-11 sm:w-12 sm:h-12 text-[#9A7742] mx-auto" />
            <p className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-[#9A7742] font-medium">
              VELORA Order Confirmed — Preparing Shipment
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#181614] break-words">
              Thank You, {lastOrder.customer.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E655E] leading-relaxed">
              Order Reference:{' '}
              <strong className="text-[#181614] tabular-nums">{lastOrder.orderNumber}</strong> ·
              Estimated Delivery:{' '}
              <strong className="text-[#181614]">{lastOrder.estimatedDelivery}</strong>
            </p>
          </div>

          {/* Customer & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#6E655E] mb-2">
                Shipping Destination
              </p>
              <p className="font-medium text-[#181614]">{lastOrder.customer.fullName}</p>
              <p className="text-[#6E655E]">{lastOrder.customer.address}</p>
              <p className="text-[#6E655E]">
                {lastOrder.customer.city}, {lastOrder.customer.state} –{' '}
                {lastOrder.customer.postalCode}
              </p>
              <p className="text-[#6E655E] tabular-nums mt-1">{lastOrder.customer.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#6E655E] mb-2">
                Payment Terms
              </p>
              <p className="font-medium text-[#181614]">{lastOrder.paymentMethod}</p>
              <p className="text-[#6E655E] mt-1">
                Amount payable at delivery:{' '}
                <strong className="text-[#181614] tabular-nums">
                  {formatINR(lastOrder.total)}
                </strong>
              </p>
            </div>
          </div>

          {/* Itemized Receipt */}
          <div className="pt-6 border-t border-[#E6DDD1] space-y-4">
            <h2 className="font-serif text-2xl text-[#181614]">Receipt Summary</h2>
            <div className="divide-y divide-[#E6DDD1]">
              {lastOrder.items.map((item) => (
                <div
                  key={`${item.productId}-${item.volume}`}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 bg-[#F2ECE4] shrink-0 overflow-hidden">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-base sm:text-lg text-[#181614] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#6E655E]">
                        {item.volume} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-[#181614] tabular-nums shrink-0">
                    {formatINR(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E6DDD1] space-y-2 text-sm">
              <div className="flex justify-between text-[#6E655E]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#181614]">{formatINR(lastOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6E655E]">
                <span>Shipping</span>
                <span className="tabular-nums text-[#181614]">
                  {lastOrder.shippingFee === 0 ? 'Complimentary' : formatINR(lastOrder.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#181614] pt-2 border-t border-[#E6DDD1]">
                <span>Total (Cash on Delivery)</span>
                <span className="tabular-nums">{formatINR(lastOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('shop')}
              className="min-h-[48px] px-7 py-3.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase text-center"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="min-h-[48px] px-7 py-3.5 border border-[#181614] text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] transition-colors text-xs font-medium tracking-[0.18em] uppercase text-center"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
