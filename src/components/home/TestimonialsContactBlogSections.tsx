import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Star,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BLOG_ARTICLES, TESTIMONIALS } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../SafeImage';
import {
  FadeUp,
  LUXURY_EASE,
  RevealSection,
  StaggerContainer,
  StaggerItem,
} from '../MotionPrimitives';

const testimonialVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 36 : -36,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -36 : 36,
  }),
};

export const TestimonialsContactBlogSections: React.FC = () => {
  const { setActiveArticle, notify } = useStore();
  const [[testimonialIdx, testimonialDir], setTestimonialState] = useState<[number, number]>([
    0, 1,
  ]);

  // Contact Form State
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitted, setSubmitted] = useState(false);

  const activeTestimonial = TESTIMONIALS[testimonialIdx];

  const handleNextTestimonial = () =>
    setTestimonialState(([prev]) => [(prev + 1) % TESTIMONIALS.length, 1]);
  const handlePrevTestimonial = () =>
    setTestimonialState(([prev]) => [(prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, -1]);
  const handleJumpTestimonial = (idx: number) =>
    setTestimonialState(([prev]) => [idx, idx >= prev ? 1 : -1]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<typeof form> = {};
    if (form.name.trim().length < 2) newErrors.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      newErrors.email = 'Please enter a valid email address.';
    if (!/^[+\d\s-]{8,15}$/.test(form.phone.trim()))
      newErrors.phone = 'Please enter a valid contact phone number.';
    if (form.message.trim().length < 10)
      newErrors.message = 'Please share a brief message (at least 10 characters).';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    notify('Your message has been received by our Atelier Concierge.');
  };

  return (
    <>
      {/* 10. CUSTOMER TESTIMONIALS SLIDER */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#FAF8F4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <FadeUp className="space-y-3 mb-10 sm:mb-12">
            <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
              Patron Reflections
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614] text-balance">
              Worn & <em className="italic font-normal text-[#9A7742]">Remembered</em>
            </h2>
          </FadeUp>

          <div className="relative bg-white border border-[#E6DDD1] px-5 py-9 sm:px-14 sm:py-16 overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none font-serif text-5xl sm:text-7xl text-[#B8935A]/20 leading-none block mb-1 select-none"
            >
              “
            </span>

            <AnimatePresence mode="wait" custom={testimonialDir}>
              <motion.div
                key={activeTestimonial.id}
                custom={testimonialDir}
                variants={testimonialVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: LUXURY_EASE }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -45) handleNextTestimonial();
                  else if (info.offset.x > 45) handlePrevTestimonial();
                }}
                className="space-y-5 sm:space-y-6 touch-pan-y"
              >
                <div className="flex items-center justify-center gap-1" aria-label="5 out of 5 stars">
                  {Array.from({ length: activeTestimonial.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-[#B8935A] text-[#B8935A]" />
                  ))}
                </div>

                <blockquote className="font-serif text-xl sm:text-[30px] italic text-[#181614] leading-[1.45] max-w-3xl mx-auto">
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </blockquote>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#B8935A]/70 p-0.5 bg-[#F2ECE4]">
                    <SafeImage
                      src={activeTestimonial.avatarImage}
                      alt={activeTestimonial.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#181614]">{activeTestimonial.name}</p>
                    <p className="text-xs text-[#6E655E] mt-0.5">
                      {activeTestimonial.role} · {activeTestimonial.city} ·{' '}
                      {activeTestimonial.fragrance}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 sm:mt-9 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrevTestimonial}
                aria-label="Previous testimonial"
                className="w-11 h-11 flex items-center justify-center border border-[#E6DDD1] text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] hover:border-[#181614] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleJumpTestimonial(idx)}
                    aria-label={`Read testimonial from ${t.name}`}
                    className={`h-2 transition-all duration-300 ${
                      idx === testimonialIdx ? 'w-8 bg-[#181614]' : 'w-2.5 bg-[#D8CEC0] hover:bg-[#9A7742]'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleNextTestimonial}
                aria-label="Next testimonial"
                className="w-11 h-11 flex items-center justify-center border border-[#E6DDD1] text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] hover:border-[#181614] active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 11. CONTACT SECTION: REACH OUT AND CONNECT */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#F2ECE4] border-y border-[#E6DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <FadeUp className="lg:col-span-5 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                  Private Appointments & Inquiries
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614] text-balance">
                Reach Out and <em className="italic font-normal text-[#9A7742]">Connect</em>
              </h2>
              <p className="text-sm sm:text-base text-[#6E655E] leading-[1.7]">
                Whether seeking bespoke wedding favors, private scent profiling, or guidance on
                your next signature bottle, our fragrance specialists respond within one business
                day.
              </p>

              <div className="pt-5 space-y-4 border-t border-[#D8CEC0] text-sm text-[#2B2623]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#9A7742] mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-[#181614]">VELORA Mumbai Flagship Boutique</p>
                    <p className="text-[#6E655E]">14 Kala Ghoda Precinct, Fort, Mumbai 400001</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#9A7742] mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-[#181614]">Concierge Telephone</p>
                    <p className="text-[#6E655E] tabular-nums">+91 22 4890 3172</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#9A7742] mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-[#181614]">Direct Correspondence</p>
                    <p className="text-[#6E655E] break-all">concierge@velorafragrances.in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#9A7742] mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-[#181614]">Atelier Hours</p>
                    <p className="text-[#6E655E]">Monday – Saturday · 10:00 – 20:00 IST</p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.12} className="lg:col-span-7 bg-white border border-[#E6DDD1] p-5 sm:p-10">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-10 h-10 text-[#9A7742] mx-auto" />
                  <h3 className="font-serif text-3xl text-[#181614]">
                    Thank You for Writing to Us
                  </h3>
                  <p className="text-sm text-[#6E655E] max-w-md mx-auto leading-relaxed">
                    Our concierge team has logged your inquiry and will reply shortly with tailored
                    recommendations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 px-6 min-h-[44px] border border-[#181614] text-xs tracking-[0.16em] uppercase text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] transition-colors"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="home-contact-name"
                        className="block text-[11px] tracking-[0.16em] uppercase text-[#6E655E] mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        id="home-contact-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        placeholder="Aarav Mehta"
                        className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm transition-colors"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-[#A94438]">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="home-contact-email"
                        className="block text-[11px] tracking-[0.16em] uppercase text-[#6E655E] mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="home-contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        placeholder="aarav@example.com"
                        className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm transition-colors"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-[#A94438]">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="home-contact-phone"
                      className="block text-[11px] tracking-[0.16em] uppercase text-[#6E655E] mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="home-contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        setForm({ ...form, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="+91 98200 12345"
                      className="w-full px-4 py-3 min-h-[46px] bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm tabular-nums transition-colors"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-[#A94438]">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="home-contact-message"
                      className="block text-[11px] tracking-[0.16em] uppercase text-[#6E655E] mb-2"
                    >
                      Your Message
                    </label>
                    <textarea
                      id="home-contact-message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => {
                        setForm({ ...form, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      placeholder="Tell us about the fragrance notes or occasion you have in mind..."
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-base sm:text-sm resize-none transition-colors"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-[#A94438]">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="group w-full sm:w-auto px-8 min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] active:scale-[0.98] transition-all text-xs font-medium tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2.5"
                  >
                    Send Message
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </FadeUp>
          </div>
        </div>
      </RevealSection>

      {/* 12. BLOG SECTION: LATEST STORIES & FRAGRANCE INSIGHTS */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <FadeUp className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
            <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
              The Olfactory Journal
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614] text-balance">
              Latest Stories & <em className="italic font-normal text-[#9A7742]">Fragrance</em>{' '}
              Insights
            </h2>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {BLOG_ARTICLES.map((article) => (
              <StaggerItem key={article.id}>
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.28, ease: LUXURY_EASE }}
                  className="group bg-white border border-[#E6DDD1] hover:border-[#B8935A]/60 flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-[0_18px_36px_-16px_rgba(24,22,20,0.14)]"
                >
                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="aspect-[4/3] w-full overflow-hidden bg-[#F2ECE4] text-left"
                  >
                    <SafeImage
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                    />
                  </button>

                  <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#6E655E]">
                        <span className="text-[#9A7742]">{article.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveArticle(article)}
                        className="text-left block"
                      >
                        <h3 className="font-serif text-2xl sm:text-[26px] font-medium text-[#181614] group-hover:text-[#9A7742] transition-colors leading-snug">
                          {article.title}
                        </h3>
                      </button>
                      <p className="text-sm text-[#6E655E] leading-relaxed">{article.excerpt}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E6DDD1]/70">
                      <button
                        type="button"
                        onClick={() => setActiveArticle(article)}
                        className="inline-flex items-center gap-2 min-h-[40px] text-[11px] font-medium tracking-[0.18em] uppercase text-[#181614] hover:text-[#9A7742] transition-colors"
                      >
                        Read More
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>
    </>
  );
};
