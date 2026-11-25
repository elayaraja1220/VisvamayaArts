import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "./context/cartContext";
import { Header } from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { ToastProvider } from "./components/overlays/toast/toast";
import ScrollToTop from "./components/scrollToTop/scrolltoTop";
import ScrollToTopButton from "./components/scrollToTop/scropptoTopButton/scrolltopTopButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vismayam Arts",
  description: "Shop collections from Vismayam Arts.",
  keywords: [
    "VismayaTrail",
    "விஸ்மயஉலா",
    "Aralaguppe",
    "KalleswaraTemple",
    "WesternGanga",
    "TempleArchitecture",
    "IndianSculpture",
    "KarnatakaHeritage",
    "Vismayam",
    "VismayamArts",
    "VismayamSculptures",
    "IndianHeritage",
    "SouthIndianHeritage",
    "TempleArt",
    "IndianTempleSculpture",
    "SacredArt",
    "IndianCulture",
    "HeritageKeepsakes",
    "Gangaikondacholapuram",
    "CholaLegacy",
    "CholaBronze",
    "CholaArt",
    "PallavaArt",
    "PandyaArt",
    "HoysalaSculpture",
    "Swamimalai",
    "SwamimalaiBronze",
    "TraditionalSculpture",
    "IndianIconography",
    "Nataraja",
    "Dakshinamurthi",
    "Ardhanareeshwara",
    "Gajasamharamurti",
    "NrityaGanapathi",
    "Sapthamatrika",
    "Somaskandha",
    "Veenadharar",
    "MuthuswamiDikshitar",
    "HinduIdols",
    "HeritageHomeDecor",
    "SpiritualDecor",
    "PoojaRoomDecor",
    "IndianArtCollectors",
    "LuxuryIndianGifts",
    "TraditionalGiftsIndia",
    "HandcraftedIdols",
    "DivineSculptures",
    "TempleReplicas",
    "MadeInTamilNadu",
    "Tanjore",
    "Thanjavur",
    "GangaikondaCholapuram",
    "Dharasuram",
    "Mamallapuram",
    "Madurai",
    "Meenakshi",
    "MaduraiMeenakshi",
    "Saraswati",
    "Rishabakunjaram",
    "Brahmi",
    "Maheswari",
    "Vaishnavi",
    "Varahi",
    "Kaumari",
    "Indrani",
    "Chamundi",
    "AshtaMangalam",
    "Veenadarar",
    "SimhaDurga",
    "KunchitaKaranar",
    "Harihara",
    "RamaSet",
    "Murugan",
    "AnanthaShayanaVishnu",
    "Resin",
    "StonePowder",
    "PremiumPlastic",
    "Thirunedun",
    "Thirunedungalam",
    "Rajarieeswaram",
    "CholaArtistry",
    "NageswaranTemple",
    "Kumbakonam",
    "Pullamangai",
    "KailasanathaTemple",
    "Kanchipuram",
    "AdambarBronzeSet",
    "PanchaRamaKshetram",
    "GangaArt",
    "VettuvanKoil",
    "HoysalaArt",
    "UNESCOTreasures",
    "UNESCO",
    "Lalitharam",
    "SwamimalaiSaravanan",
    "Saravanan",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-base-path={process.env.NEXT_PUBLIC_BASE_PATH ?? ""}
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=GTM-MD2FVSLJ"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider
          position="top-right"
          defaultDuration={4000}
          maxToasts={5}
        >
          <CartProvider>
            <ScrollToTop />
            <Header />
            {children}
            <Footer />
            <ScrollToTopButton />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}