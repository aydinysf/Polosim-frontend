"use client";

import { Globe, Shield, QrCode, Wifi, Zap, Clock, Headphones, CheckCircle, Apple, Download, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useState } from "react";

const steps = [
  { number: "01", title: "Planınızı Seçin", description: "200'den fazla destinasyonumuza göz atın ve seyahat ihtiyaçlarınıza uyan veri planını seçin. Veri miktarınızı, geçerlilik sürenizi ve kapsama alanınızı belirleyin.", icon: Globe },
  { number: "02", title: "Satın Alma İşlemini Tamamlayın", description: "Tercih ettiğiniz ödeme yöntemiyle güvenli şekilde ödeme yapın. Tüm büyük kredi kartlarını, PayPal, Apple Pay ve Google Pay'i kabul ediyoruz. eSIM'iniz anında hazır olacak.", icon: Shield },
  { number: "03", title: "QR Kodu Tarayın", description: "Satın alma işleminin ardından e-posta ile bir QR kodu alacaksınız. eSIM profilini yüklemek için telefonunuzun kamerasıyla taramanız yeterli. Fiziksel SIM kart gerekmez.", icon: QrCode },
  { number: "04", title: "Bağlantıda Kalın", description: "Destinasyonunuza vardığınızda eSIM'inizi etkinleştirin. Roaming ücreti olmadan hızlı ve güvenilir verinin tadını çıkarın. Daha fazla veriye ihtiyacınız olursa dilediğiniz zaman yükleyin.", icon: Wifi },
];

const whyCards = [
  { icon: "⚡", title: "Anında Teslimat", desc: "Satın alma işleminden saniyeler sonra eSIM QR kodunuzu alın. Bekleme yok, kargo yok." },
  { icon: "🔐", title: "Güvenli Bağlantı", desc: "Verileriniz tüm ağlarda kurumsal düzeyde şifrelemeyle korunur." },
  { icon: "🎧", title: "7/24 Destek", desc: "Destek ekibimiz herhangi bir sorun için gece gündüz yardıma hazır." },
  { icon: "🌐", title: "Küresel Kapsama", desc: "Dünya genelinde 200'den fazla ülke ve bölgede yüksek hızlı veriye erişin." },
];

const compatibleDevices = [
  { brand: "🍎 Apple", models: ["iPhone XS ve üzeri", "iPad Pro (2018+)", "iPad Air (2019+)", "iPad (2019+)"] },
  { brand: "🤖 Samsung", models: ["Galaxy S20 ve üzeri", "Galaxy Z Fold/Flip serisi", "Galaxy Note 20+"] },
  { brand: "🟢 Google", models: ["Pixel 3 ve üzeri", "Pixel Fold"] },
  { brand: "📱 Diğer", models: ["Motorola Razr", "Huawei P40+", "Oppo Find X3+", "Sony Xperia 1 III+"] },
];

const faqs = [
  { q: "eSIM nedir?", a: "eSIM (gömülü SIM), fiziksel SIM kart kullanmadan bir operatör planını etkinleştirmenizi sağlayan dijital bir SIM'dir. Cihazınıza yerleşik olup farklı operatör profilleriyle programlanabilir." },
  { q: "Cihazımın eSIM destekleyip desteklemediğini nasıl anlarım?", a: "2018 sonrası çıkan modern akıllı telefon ve tabletlerin büyük çoğunluğu eSIM destekler. Cihaz ayarlarınızda Hücresel/Mobil Veri bölümünü kontrol edebilir ya da uyumluluk kontrolörümüzde modelinizi arayabilirsiniz." },
  { q: "Satın alma işleminin hemen ardından eSIM'imi kullanabilir miyim?", a: "Evet! eSIM QR kodunuz satın almadan hemen sonra teslim edilir. Anında yükleyebilir ve destinasyonunuza vardığınızda etkinleştirebilirsiniz." },
  { q: "Normal SIM kartım eSIM ile birlikte çalışır mı?", a: "Kesinlikle. Çoğu cihaz Çift SIM özelliğini destekler; böylece hem normal SIM'inizi hem de eSIM'inizi aynı anda kullanabilirsiniz." },
  { q: "Tüm veri kotamı kullanırsam ne olur?", a: "Uygulamamız veya web sitemiz üzerinden eSIM'inize kolayca ek veri yükleyebilirsiniz. Bu işlem yalnızca birkaç dakika sürer." },
];

export default function HowItWorksPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
        <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
          Simple Setup Process
        </div>
        <h1 className="text-[38px] font-extrabold text-white mb-3 tracking-tight">Nasıl Çalışır?</h1>
        <p className="text-[15px] text-white/60 max-w-[520px] mx-auto leading-[1.6]">
          Dakikalar içinde bağlanın. Fiziksel SIM kartı yok, mağaza ziyareti yok, zorluk yok. Seyahat ettiğiniz her yerde anında mobil veri.
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
        <h2 className="text-[28px] font-extrabold text-center mb-2 text-[var(--text-dark)]">Uyumlu Cihazlar</h2>
        <p className="text-center text-[var(--gray-text)] mb-10 text-[15px]">eSIM'imiz modern akıllı telefon ve tabletlerin büyük çoğunluğuyla çalışır</p>
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
        <h2 className="text-[28px] font-extrabold text-center mb-2 text-[var(--text-dark)]">Kurulum Rehberi</h2>
        <p className="text-center text-[var(--gray-text)] mb-10 text-[15px]">iOS ve Android cihazlar için hızlı kurulum</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {/* iOS */}
          <div className="bg-[var(--gray-bg)] rounded-2xl p-7">
            <h3 className="text-base font-bold mb-5 text-[var(--text-dark)] flex items-center gap-2">🍎 iOS Kurulumu</h3>
            <ol className="flex flex-col gap-3">
              {["Kamera uygulamasını açın ve QR kodu tarayın", "'eSIM Ekle' bildirimini görüntüleyin", "Ekrandaki talimatları takip edin", "Planınızı etiketleyin (örn. 'Seyahat Verisi')", "Yurt dışında veri dolaşımını etkinleştirin"].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--gray-text)] leading-[1.5]">
                  <span className="w-[22px] h-[22px] rounded-full bg-[var(--navy)] text-white text-[11px] font-bold flex items-center justify-center shrink-0 font-['Sora']">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          {/* Android */}
          <div className="bg-[var(--gray-bg)] rounded-2xl p-7">
            <h3 className="text-base font-bold mb-5 text-[var(--text-dark)] flex items-center gap-2">🤖 Android Kurulumu</h3>
            <ol className="flex flex-col gap-3">
              {["Ayarlar > Ağ ve İnternet'e gidin", "'SIM'ler' veya 'Mobil Ağ'a dokunun", "'eSIM Ekle' veya '+' düğmesini seçin", "QR kodu kamerayla tarayın", "Planınızı onaylayın ve etkinleştirin"].map((step, i) => (
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
        <h2 className="text-[28px] font-extrabold text-center mb-10 text-[var(--text-dark)]">Sıkça Sorulan Sorular</h2>
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
        <h2 className="text-[30px] font-extrabold text-white mb-3">Başlamaya Hazır mısınız?</h2>
        <p className="text-white/60 text-[15px] mb-8">POLO SIM ile bağlantıda kalan milyonlarca gezgine katılın. Planları inceleyin ve anında bağlantı kazanın.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 bg-[var(--gold)] text-white border-none rounded-3xl px-8 py-3 font-['Sora'] font-bold text-[15px] cursor-pointer hover:bg-[var(--gold-light)] hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all no-underline"
          >
            Planlara Gözat
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center px-7 py-3 border-[1.5px] border-white/30 rounded-3xl bg-transparent text-white font-['Sora'] font-semibold text-sm cursor-pointer hover:bg-white/10 hover:border-white/50 transition-all no-underline"
          >
            Desteğe Başvur
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
