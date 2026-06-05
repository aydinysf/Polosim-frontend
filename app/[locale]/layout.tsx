import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import React from "react"
import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'
import '../globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'POLO SIM - One Sim One World',
  description: 'Your global eSIM marketplace. Get instant mobile data in 200+ countries. No roaming fees, instant activation, global coverage.',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const awaitedParams = await params;
  const { locale } = awaitedParams;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  setRequestLocale(locale);
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Google Consent Mode v2 — varsayılan olarak tümü reddedilmiş başlar */}
        <Script id="google-consent-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage:       'denied',
              ad_storage:              'denied',
              ad_user_data:            'denied',
              ad_personalization:      'denied',
              functionality_storage:   'denied',
              personalization_storage: 'denied',
              wait_for_update:         500
            });
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0X4LE3ZSWD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0X4LE3ZSWD', { send_page_view: false });

            // Daha önce onay verilmişse localStorage'dan oku ve uygula
            try {
              var saved = localStorage.getItem('polosim_cookie_consent');
              if (saved) {
                var p = JSON.parse(saved).prefs;
                gtag('consent', 'update', {
                  analytics_storage:       p.analytics  ? 'granted' : 'denied',
                  ad_storage:              p.marketing  ? 'granted' : 'denied',
                  ad_user_data:            p.marketing  ? 'granted' : 'denied',
                  ad_personalization:      p.marketing  ? 'granted' : 'denied',
                  functionality_storage:   p.preferences ? 'granted' : 'denied',
                  personalization_storage: p.preferences ? 'granted' : 'denied',
                });
                if (p.analytics) gtag('event', 'page_view');
              }
            } catch(e) {}
          `}
        </Script>
      </head>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              {children}
              <CookieConsentBanner locale={locale} />
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
