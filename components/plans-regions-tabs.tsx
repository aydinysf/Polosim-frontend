"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function PlansRegionsTabs() {
  const router = useRouter();
  const t = useTranslations('AccountBenefits');

  const benefits = [
    {
      icon: "📦",
      title: "Siparişlerinizi Takip Edin",
      description: "Tüm satın alımlarınızı ve dijital ürünlerinizi basit panel aracılığı ile takip edebilirsiniz.",
      iconBg: "bg-[#FFF4E5]",
    },
    {
      icon: "📊",
      title: "Kullanımı İzleyin",
      description: "Veri kullanımınızı ve kalan paketenizi gerçek zamanlı olarak izleyin ve süreniz dolmadan önce kolayca yenilik edin.",
      iconBg: "bg-[#E8F5E9]",
    },
    {
      icon: "🤝",
      title: "Ortaklık Programı",
      description: "Arkadaşlarınıza referans ver, kazançlar ve özel indirimler kazanın ve ortak programımıza katılarak kazanmaya başlayın.",
      iconBg: "bg-[#EDE7F6]",
    },
    {
      icon: "🎁",
      title: "Özel Kampanyalar",
      description: "VIP kampanya listeli müşterilerimiz, promosyonlara ve özel fırsatlara erişim edin.",
      iconBg: "bg-[#FCE4EC]",
    },
  ];

  return (
    <section className="py-16 px-[5%] bg-[#D4AF37]/10 text-center">
      <div className="max-w-[1100px] mx-auto">
        {/* Section header */}
        <h2 className="text-[28px] md:text-[32px] font-bold mb-3 text-[var(--navy)]">
          Neden Hesap Oluşturmalısınız?
        </h2>
        <p className="text-[var(--gray-text)] text-[14px] md:text-[15px] max-w-[500px] mx-auto mb-10 leading-[1.6]">
          Ücretsiz bir hesapla özel avantajların kilidini açın<br />ve eSIM&apos;lerinizi kolayca yönetin.
        </p>

        {/* Benefits Grid - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-left border border-transparent hover:border-[var(--gold)]/30 hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${benefit.iconBg} flex items-center justify-center text-xl mb-4`}>
                {benefit.icon}
              </div>
              <h4 className="text-[15px] font-bold text-[var(--text-dark)] mb-2">{benefit.title}</h4>
              <p className="text-[13px] text-[var(--gray-text)] leading-[1.6]">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-white border-none rounded-full px-8 py-3 font-semibold text-[14px] cursor-pointer hover:bg-[var(--gold-light)] transition-all shadow-md"
          onClick={() => router.push("/get-started")}
        >
          Ücretsiz Hesap Oluştur
        </button>
      </div>
    </section>
  );
}
