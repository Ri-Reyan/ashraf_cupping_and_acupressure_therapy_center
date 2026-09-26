import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

// ফন্ট কনফিগারেশন
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
});

const notoSerif = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "আশরাফ কাপিং এন্ড আকুপ্রেসার থেরাপি সেন্টার",
  description:
    "ওষুধ ও সার্জারি ছাড়াই দীর্ঘস্থায়ী ব্যথা, মাইগ্রেন, অনিদ্রা ও স্ট্রেসের জন্য প্রমাণিত অ্যাকুপ্রেসার থেরাপি।",
  generator: "RIFAT ISLAM REYAN -- https://www.linkedin.com/in/i-reyannn",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8fbfa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${notoSerif.variable}`}
    >
      <body className="font-sans antialiased bg-[#F8FBFA] text-[#173F3A]">
        {children}
      </body>
    </html>
  );
}
