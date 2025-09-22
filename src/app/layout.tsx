import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guerras Civis - Jogo de Estratégia",
  description:
    "O jogo de estratégia e dedução mais emocionante. Civis contra Máfia em uma batalha épica pela sobrevivência.",
  keywords: [
    "jogo",
    "estratégia",
    "mafia",
    "civis",
    "dedução",
    "tabuleiro",
    "online",
  ],
  authors: [{ name: "Guerras Civis Team" }],
  creator: "Guerras Civis",
  publisher: "Guerras Civis",
  icons: {
    icon: [
      { url: "/guerras-civis.png", sizes: "32x32", type: "image/png" },
      { url: "/guerras-civis.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/guerras-civis.png",
    apple: [{ url: "/guerras-civis.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Guerras Civis - Jogo de Estratégia",
    description:
      "O jogo de estratégia e dedução mais emocionante. Civis contra Máfia em uma batalha épica pela sobrevivência.",
    url: "https://guerras-civis.vercel.app",
    siteName: "Guerras Civis",
    images: [
      {
        url: "https://guerras-civis.vercel.app/guerras-civis.png",
        width: 512,
        height: 512,
        alt: "Guerras Civis - Jogo de Estratégia",
        type: "image/png",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guerras Civis - Jogo de Estratégia",
    description:
      "O jogo de estratégia e dedução mais emocionante. Civis contra Máfia em uma batalha épica pela sobrevivência.",
    images: ["https://guerras-civis.vercel.app/guerras-civis.png"],
    creator: "@guerrascivis",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/guerras-civis.png" type="image/png" />
        <link rel="shortcut icon" href="/guerras-civis.png" type="image/png" />
        <link rel="apple-touch-icon" href="/guerras-civis.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta
          property="og:image"
          content="https://guerras-civis.vercel.app/guerras-civis.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://guerras-civis.vercel.app/guerras-civis.png"
        />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:type" content="image/png" />
        <meta
          name="twitter:image"
          content="https://guerras-civis.vercel.app/guerras-civis.png"
        />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="msapplication-TileImage" content="/guerras-civis.png" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
