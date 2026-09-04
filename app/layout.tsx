import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getLocale, isRtl } from "@/lib/i18n/locale";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

// Self-hosted fonts (see /fonts/README.md for exact download instructions).
// This avoids next/font/google's build-time network fetch to
// fonts.gstatic.com entirely, which is unreliable on some connections
// and can fail the production build with ETIMEDOUT errors.
const amiri = localFont({
  src: [
    { path: "../fonts/amiri/Amiri-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/amiri/Amiri-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
});

const ibmPlexArabic = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-ibm-arabic",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces/Fraunces_72pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/fraunces/Fraunces_72pt-Italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/fraunces/Fraunces_72pt-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = localFont({
  src: [
    { path: "../fonts/work-sans/WorkSans-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/work-sans/WorkSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/work-sans/WorkSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/work-sans/WorkSans-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-worksans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Your Brand — Modern Essentials",
    template: "%s | Your Brand",
  },
  description:
    "Considered clothing, made to last. Shop new arrivals and best sellers.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    type: "website",
    siteName: "Your Brand",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const rtl = isRtl(locale);

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      data-locale={locale}
      className={`${amiri.variable} ${ibmPlexArabic.variable} ${fraunces.variable} ${workSans.variable}`}
    >
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
