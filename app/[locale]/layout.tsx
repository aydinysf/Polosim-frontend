import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import '../globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'POLO SIM - One Sim One World',
  description: 'Your global eSIM marketplace. Get instant mobile data in 200+ countries. No roaming fees, instant activation, global coverage.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png?v=2',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png?v=2',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg?v=2',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png?v=2',
  },
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!['en', 'tr'].includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
