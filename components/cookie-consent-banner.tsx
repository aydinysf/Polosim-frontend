"use client";

import { useState, useEffect } from "react";
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react";

// ─── Tipler ──────────────────────────────────────────────────────────────────

type ConsentState = "pending" | "accepted" | "rejected" | "partial";

interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

// ─── Çeviriler (9 dil) ───────────────────────────────────────────────────────

const TRANSLATIONS: Record<string, {
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  savePreferences: string;
  analytics: string;
  analyticsDesc: string;
  marketing: string;
  marketingDesc: string;
  preferences: string;
  preferencesDesc: string;
  necessary: string;
  necessaryDesc: string;
  alwaysOn: string;
  privacyPolicy: string;
}> = {
  en: {
    title: "We value your privacy",
    description: "We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking \"Accept All\", you consent to our use of cookies.",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    customize: "Customize",
    savePreferences: "Save Preferences",
    analytics: "Analytics",
    analyticsDesc: "Help us understand how visitors interact with our website by collecting anonymous data.",
    marketing: "Marketing",
    marketingDesc: "Used to track visitors across websites and display relevant advertisements.",
    preferences: "Preferences",
    preferencesDesc: "Allows the website to remember your choices (language, region, etc.).",
    necessary: "Necessary",
    necessaryDesc: "Essential for the website to function properly. Cannot be disabled.",
    alwaysOn: "Always on",
    privacyPolicy: "Privacy Policy",
  },
  tr: {
    title: "Gizliliğinize değer veriyoruz",
    description: "Deneyiminizi geliştirmek, site trafiğini analiz etmek ve içerikleri kişiselleştirmek için çerezler kullanıyoruz. \"Tümünü Kabul Et\" seçeneğine tıklayarak çerez kullanımımızı onaylıyorsunuz.",
    acceptAll: "Tümünü Kabul Et",
    rejectAll: "Tümünü Reddet",
    customize: "Özelleştir",
    savePreferences: "Tercihleri Kaydet",
    analytics: "Analitik",
    analyticsDesc: "Anonim veri toplayarak ziyaretçilerin sitemizle nasıl etkileşim kurduğunu anlamamıza yardımcı olur.",
    marketing: "Pazarlama",
    marketingDesc: "Ziyaretçileri web sitelerinde takip etmek ve ilgili reklamlar göstermek için kullanılır.",
    preferences: "Tercihler",
    preferencesDesc: "Web sitesinin seçimlerinizi (dil, bölge vb.) hatırlamasına olanak tanır.",
    necessary: "Zorunlu",
    necessaryDesc: "Web sitesinin düzgün çalışması için gereklidir. Devre dışı bırakılamaz.",
    alwaysOn: "Her zaman açık",
    privacyPolicy: "Gizlilik Politikası",
  },
  de: {
    title: "Wir schätzen Ihre Privatsphäre",
    description: "Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, den Website-Traffic zu analysieren und Inhalte zu personalisieren. Mit \"Alle akzeptieren\" stimmen Sie unserer Cookie-Nutzung zu.",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Alle ablehnen",
    customize: "Anpassen",
    savePreferences: "Einstellungen speichern",
    analytics: "Analytik",
    analyticsDesc: "Hilft uns zu verstehen, wie Besucher mit unserer Website interagieren, indem anonyme Daten gesammelt werden.",
    marketing: "Marketing",
    marketingDesc: "Wird verwendet, um Besucher über Websites hinweg zu verfolgen und relevante Anzeigen zu schalten.",
    preferences: "Präferenzen",
    preferencesDesc: "Ermöglicht der Website, Ihre Auswahl (Sprache, Region usw.) zu speichern.",
    necessary: "Notwendig",
    necessaryDesc: "Für das ordnungsgemäße Funktionieren der Website unerlässlich. Kann nicht deaktiviert werden.",
    alwaysOn: "Immer aktiv",
    privacyPolicy: "Datenschutzrichtlinie",
  },
  ru: {
    title: "Мы ценим вашу конфиденциальность",
    description: "Мы используем файлы cookie для улучшения работы, анализа трафика и персонализации контента. Нажимая «Принять все», вы соглашаетесь с использованием файлов cookie.",
    acceptAll: "Принять все",
    rejectAll: "Отклонить все",
    customize: "Настроить",
    savePreferences: "Сохранить настройки",
    analytics: "Аналитика",
    analyticsDesc: "Помогает нам понять, как посетители взаимодействуют с сайтом, собирая анонимные данные.",
    marketing: "Маркетинг",
    marketingDesc: "Используется для отслеживания посетителей на разных сайтах и показа релевантной рекламы.",
    preferences: "Предпочтения",
    preferencesDesc: "Позволяет сайту запоминать ваши настройки (язык, регион и т.д.).",
    necessary: "Необходимые",
    necessaryDesc: "Необходимы для правильной работы сайта. Не могут быть отключены.",
    alwaysOn: "Всегда включено",
    privacyPolicy: "Политика конфиденциальности",
  },
  ar: {
    title: "نحن نقدر خصوصيتك",
    description: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة الموقع وتخصيص المحتوى. بالنقر على «قبول الكل»، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
    acceptAll: "قبول الكل",
    rejectAll: "رفض الكل",
    customize: "تخصيص",
    savePreferences: "حفظ التفضيلات",
    analytics: "التحليلات",
    analyticsDesc: "تساعدنا على فهم كيفية تفاعل الزوار مع موقعنا من خلال جمع بيانات مجهولة الهوية.",
    marketing: "التسويق",
    marketingDesc: "يستخدم لتتبع الزوار عبر المواقع وعرض الإعلانات ذات الصلة.",
    preferences: "التفضيلات",
    preferencesDesc: "يتيح للموقع تذكر اختياراتك (اللغة والمنطقة وما إلى ذلك).",
    necessary: "الضرورية",
    necessaryDesc: "ضرورية لعمل الموقع بشكل صحيح. لا يمكن تعطيلها.",
    alwaysOn: "دائماً نشط",
    privacyPolicy: "سياسة الخصوصية",
  },
  zh: {
    title: "我们重视您的隐私",
    description: "我们使用Cookie来改善您的浏览体验、分析网站流量并个性化内容。点击"全部接受"即表示您同意我们使用Cookie。",
    acceptAll: "全部接受",
    rejectAll: "全部拒绝",
    customize: "自定义",
    savePreferences: "保存偏好",
    analytics: "分析",
    analyticsDesc: "通过收集匿名数据帮助我们了解访客如何与网站互动。",
    marketing: "营销",
    marketingDesc: "用于跨网站跟踪访客并显示相关广告。",
    preferences: "偏好设置",
    preferencesDesc: "允许网站记住您的选择（语言、地区等）。",
    necessary: "必要",
    necessaryDesc: "网站正常运行所必需，不能禁用。",
    alwaysOn: "始终开启",
    privacyPolicy: "隐私政策",
  },
  pt: {
    title: "Valorizamos a sua privacidade",
    description: "Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdos. Ao clicar em \"Aceitar Tudo\", você consente com o uso de cookies.",
    acceptAll: "Aceitar Tudo",
    rejectAll: "Rejeitar Tudo",
    customize: "Personalizar",
    savePreferences: "Guardar Preferências",
    analytics: "Análise",
    analyticsDesc: "Ajuda-nos a entender como os visitantes interagem com o nosso site, coletando dados anônimos.",
    marketing: "Marketing",
    marketingDesc: "Usado para rastrear visitantes em sites e exibir anúncios relevantes.",
    preferences: "Preferências",
    preferencesDesc: "Permite que o site lembre as suas escolhas (idioma, região, etc.).",
    necessary: "Necessário",
    necessaryDesc: "Essencial para o funcionamento correto do site. Não pode ser desativado.",
    alwaysOn: "Sempre ativo",
    privacyPolicy: "Política de Privacidade",
  },
  es: {
    title: "Valoramos su privacidad",
    description: "Usamos cookies para mejorar su experiencia, analizar el tráfico del sitio y personalizar el contenido. Al hacer clic en \"Aceptar todo\", acepta el uso de cookies.",
    acceptAll: "Aceptar todo",
    rejectAll: "Rechazar todo",
    customize: "Personalizar",
    savePreferences: "Guardar preferencias",
    analytics: "Analítica",
    analyticsDesc: "Nos ayuda a comprender cómo los visitantes interactúan con nuestro sitio web recopilando datos anónimos.",
    marketing: "Marketing",
    marketingDesc: "Se utiliza para rastrear visitantes en sitios web y mostrar anuncios relevantes.",
    preferences: "Preferencias",
    preferencesDesc: "Permite al sitio web recordar sus elecciones (idioma, región, etc.).",
    necessary: "Necesario",
    necessaryDesc: "Esencial para el correcto funcionamiento del sitio web. No se puede desactivar.",
    alwaysOn: "Siempre activo",
    privacyPolicy: "Política de privacidad",
  },
  fr: {
    title: "Nous respectons votre vie privée",
    description: "Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. En cliquant sur «Tout accepter», vous consentez à l'utilisation des cookies.",
    acceptAll: "Tout accepter",
    rejectAll: "Tout refuser",
    customize: "Personnaliser",
    savePreferences: "Enregistrer les préférences",
    analytics: "Analytique",
    analyticsDesc: "Nous aide à comprendre comment les visiteurs interagissent avec notre site en collectant des données anonymes.",
    marketing: "Marketing",
    marketingDesc: "Utilisé pour suivre les visiteurs sur les sites web et afficher des publicités pertinentes.",
    preferences: "Préférences",
    preferencesDesc: "Permet au site de mémoriser vos choix (langue, région, etc.).",
    necessary: "Nécessaire",
    necessaryDesc: "Essentiel au bon fonctionnement du site web. Ne peut pas être désactivé.",
    alwaysOn: "Toujours actif",
    privacyPolicy: "Politique de confidentialité",
  },
};

// ─── Google Consent Mode v2 yardımcıları ─────────────────────────────────────

function updateGoogleConsent(prefs: ConsentPreferences) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_storage: prefs.marketing ? "granted" : "denied",
    ad_user_data: prefs.marketing ? "granted" : "denied",
    ad_personalization: prefs.marketing ? "granted" : "denied",
    functionality_storage: prefs.preferences ? "granted" : "denied",
    personalization_storage: prefs.preferences ? "granted" : "denied",
  });
}

// ─── Ana Component ────────────────────────────────────────────────────────────

export function CookieConsentBanner({ locale }: { locale: string }) {
  const [state, setState] = useState<ConsentState>("pending");
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>({
    analytics: false,
    marketing: false,
    preferences: true,
  });

  const t = TRANSLATIONS[locale] ?? TRANSLATIONS["en"];

  // Sayfa yüklenince kayıtlı tercihi kontrol et
  useEffect(() => {
    try {
      const saved = localStorage.getItem("polosim_cookie_consent");
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed.state);
        setPrefs(parsed.prefs);
        updateGoogleConsent(parsed.prefs);
      }
    } catch {
      // localStorage erişilemiyorsa banner göster
    }
  }, []);

  const saveConsent = (newPrefs: ConsentPreferences, newState: ConsentState) => {
    localStorage.setItem(
      "polosim_cookie_consent",
      JSON.stringify({ state: newState, prefs: newPrefs, timestamp: Date.now() })
    );
    updateGoogleConsent(newPrefs);
    setState(newState);
  };

  const handleAcceptAll = () => {
    const allAccepted = { analytics: true, marketing: true, preferences: true };
    saveConsent(allAccepted, "accepted");
  };

  const handleRejectAll = () => {
    const allRejected = { analytics: false, marketing: false, preferences: false };
    saveConsent(allRejected, "rejected");
  };

  const handleSavePrefs = () => {
    saveConsent(prefs, "partial");
  };

  // Banner zaten kapatıldıysa gösterme
  if (state !== "pending") return null;

  const isRtl = locale === "ar";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Ana Banner */}
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base mb-1">{t.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{t.description}</p>
            </div>
          </div>

          {/* Detaylı ayarlar */}
          {showDetails && (
            <div className="mb-4 space-y-3 border-t border-gray-100 pt-4">
              {/* Zorunlu */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.necessary}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.necessaryDesc}</p>
                </div>
                <span className="text-xs text-green-600 font-medium flex-shrink-0 mt-1">{t.alwaysOn}</span>
              </div>

              {/* Analitik */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.analytics}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.analyticsDesc}</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                  className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 mt-1 ${
                    prefs.analytics ? "bg-yellow-400" : "bg-gray-200"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    prefs.analytics ? (isRtl ? "right-1" : "translate-x-5 left-0") : "left-1"
                  }`} />
                </button>
              </div>

              {/* Pazarlama */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.marketing}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.marketingDesc}</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                  className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 mt-1 ${
                    prefs.marketing ? "bg-yellow-400" : "bg-gray-200"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    prefs.marketing ? (isRtl ? "right-1" : "translate-x-5 left-0") : "left-1"
                  }`} />
                </button>
              </div>

              {/* Tercihler */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.preferences}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.preferencesDesc}</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, preferences: !p.preferences }))}
                  className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 mt-1 ${
                    prefs.preferences ? "bg-yellow-400" : "bg-gray-200"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    prefs.preferences ? (isRtl ? "right-1" : "translate-x-5 left-0") : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 min-w-[120px] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
            >
              {t.acceptAll}
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 min-w-[120px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2.5 px-4 rounded-xl transition-colors"
            >
              {t.rejectAll}
            </button>
            {showDetails ? (
              <button
                onClick={handleSavePrefs}
                className="flex-1 min-w-[120px] border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 px-4 rounded-xl transition-colors"
              >
                {t.savePreferences}
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2.5 px-3 rounded-xl transition-colors"
              >
                {t.customize}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TypeScript: window.gtag tanımı ─────────────────────────────────────────

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
