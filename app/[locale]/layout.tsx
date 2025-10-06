import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mecatos Inventory",
  description: "Inventory System",
  icons: {
    icon: "/favico.ico"
  }
};

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});
export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale:string}>
}) {

  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({locale});

   return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className={`${openSans.className} antialiased`}>
        <NextIntlClientProvider locale={locale}  messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster  richColors position="bottom-right"/> 
            </ThemeProvider>          
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
