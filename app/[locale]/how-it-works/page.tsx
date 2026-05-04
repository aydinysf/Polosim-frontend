"use client";

import { Globe, Shield, QrCode, Wifi, Zap, Clock, Headphones, CheckCircle, Apple, Download, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function HowItWorksPage() {
  const t = useTranslations('HowItWorks');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const steps = [
    { number: "01", title: t('steps.step1.title'), description: t('steps.step1.description'), icon: Globe },
    { number: "02", title: t('steps.step2.title'), description: t('steps.step2.description'), icon: Shield },
    { number: "03", title: t('steps.step3.title'), description: t('steps.step3.description'), icon: QrCode },
    { number: "04", title: t('steps.step4.title'), description: t('steps.step4.description'), icon: Wifi },
  ];

  const whyCards = [
    { icon: "⚡", title: t('features.instant.title'), desc: t('features.instant.desc') },
    { icon: "🔐", title: t('features.secure.title'), desc: t('features.secure.desc') },
    { icon: "🎧", title: t('features.support.title'), desc: t('features.support.desc') },
    { icon: "🌐", title: t('features.global.title'), desc: t('features.global.desc') },
  ];

  const compatibleDevices = [
    { brand: `🍎 ${t('compatibility.brands.apple')}`, models: ["iPhone XS ve üzeri", "iPad Pro (2018+)", "iPad Air (2019+)", "iPad (2019+)"] },
    { brand: `🤖 ${t('compatibility.brands.samsung')}`, models: ["Galaxy S20 ve üzeri", "Galaxy Z Fold/Flip serisi", "Galaxy Note 20+"] },
    { brand: `🟢 ${t('compatibility.brands.google')}`, models: ["Pixel 3 ve üzeri", "Pixel Fold"] },
    { brand: `📱 ${t('compatibility.brands.other')}`, models: ["Motorola Razr", "Huawei P40+", "Oppo Find X3+", "Sony Xperia 1 III+"] },
  ];

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
        <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
          {t('badge')}
        </div>
        <h1 className="text-[38px] font-extrabold text-white mb-3 tracking-tight">{t('title')}</h1>
        <p className="text-[15px] text-white/60 max-w-[520px] mx-auto leading-[1.6]">
          {t('subtitle')}
        </p>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-[72px] px-[5%]">
        <div className="max-w-[760px] mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-7 mb-12 relative">
              {index < steps.length - 1 && (
                <div className="absolute left-[23px] top-[52px] w-0.5 h-[calc(100%-20px)] bg-[var(--gray-mid)]" />
              )}
              <div className="w-12 h-12 rounded-full bg-[var(--navy)] flex items-center justify-center font-['Sora'] text-base font-extrabold text-[var(--gold)] shrink-0 relative z-[1]">
                {step.number}
              </div>
              <div className="pt-2.5">
                <h3 className="text-lg font-bold text-[var(--text-dark)] mb-2">{step.title}</h3>
                <p className="text-[15px] text-[var(--gray-text)] leading-[1.7]">{step.description}</p>
              </div>
            </div>
          ))}

          {/* Why Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {whyCards.map((card) => (
              <div key={card.title} className="bg-[var(--gray-bg)] rounded-2xl p-6">
                <span className="text-[28px] block mb-3">{card.icon}</span>
                <h4 className="text-[15px] font-bold text-[var(--text-dark)] mb-2">{card.title}</h4>
                <p className="text-[13px] text-[var(--gray-text)] leading-[1.6]">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatible Devices */}
      <section className="bg-[var(--gray-bg)] py-16 px-[5%]">
        <h2 className="text-[28px] font-extrabold text-center mb-2 text-[var(--text-dark)]">{t('compatibility.title')}</h2>
        <p className="text-center text-[var(--gray-text)] mb-10 text-[15px]">{t('compatibility.subtitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {compatibleDevices.map((device) => (
            <div key={device.brand} className="bg-white rounded-2xl p-6">
              <div className="font-['Sora'] text-[15px] font-bold text-[var(--text-dark)] mb-3.5 flex items-center gap-2">
                {device.brand}
              </div>
              <ul className="flex flex-col gap-2">
                {device.models.map((model) => (
                  <li key={model} className="text-[13px] text-[var(--gray-text)] flex items-center gap-2">
                    <span className="text-[var(--gold)] font-bold text-[12px]">✓</span>
                    {model}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Installation Guide */}
      <section className="bg-white py-16 px-[5%]">
        <h2 className="text-[28px] font-extrabold text-center mb-2 text-[var(--text-dark)]">{t('installation.title')}</h2>
        <p className="text-center text-[var(--gray-text)] mb-10 text-[15px]">{t('installation.subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {/* iOS */}
          <div className="bg-[var(--gray-bg)] rounded-2xl p-7">
            <h3 className="text-base font-bold mb-5 text-[var(--text-dark)] flex items-center gap-2">🍎 {t('installation.ios.title')}</h3>
            <ol className="flex flex-col gap-3">
              {(t.raw('installation.ios.steps') as string[]).map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--gray-text)] leading-[1.5]">
                  <span className="w-[22px] h-[22px] rounded-full bg-[var(--navy)] text-white text-[11px] font-bold flex items-center justify-center shrink-0 font-['Sora']">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          {/* Android */}
          <div className="bg-[var(--gray-bg)] rounded-2xl p-7">
            <h3 className="text-base font-bold mb-5 text-[var(--text-dark)] flex items-center gap-2">🤖 {t('installation.android.title')}</h3>
            <ol className="flex flex-col gap-3">
              {(t.raw('installation.android.steps') as string[]).map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--gray-text)] leading-[1.5]">
                  <span className="w-[22px] h-[22px] rounded-full bg-[var(--navy)] text-white text-[11px] font-bold flex items-center justify-center shrink-0 font-['Sora']">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[var(--gray-bg)] py-16 px-[5%]">
        <h2 className="text-[28px] font-extrabold text-center mb-10 text-[var(--text-dark)]">{t('faq.title')}</h2>
        <div className="max-w-[760px] mx-auto flex flex-col gap-2">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className={`bg-white rounded-xl border overflow-hidden ${isOpen ? "border-[var(--gold)]/30" : "border-[var(--gray-mid)]"}`}>
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full text-left bg-transparent border-none py-[18px] px-5 font-['Sora'] text-[15px] font-semibold text-[var(--text-dark)] cursor-pointer flex justify-between items-center gap-4"
                >
                  {faq.q}
                  <span className={`w-6 h-6 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-[12px] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-[18px] text-sm text-[var(--gray-text)] leading-[1.7]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--navy)] py-16 px-[5%] text-center">
        <h2 className="text-[30px] font-extrabold text-white mb-3">{t('cta.title')}</h2>
        <p className="text-white/60 text-[15px] mb-8">{t('cta.description')}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 bg-[var(--gold)] text-white border-none rounded-3xl px-8 py-3 font-['Sora'] font-bold text-[15px] cursor-pointer hover:bg-[var(--gold-light)] hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all no-underline"
          >
            {t('cta.browse')}
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center px-7 py-3 border-[1.5px] border-white/30 rounded-3xl bg-transparent text-white font-['Sora'] font-semibold text-sm cursor-pointer hover:bg-white/10 hover:border-white/50 transition-all no-underline"
          >
            {t('cta.support')}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
