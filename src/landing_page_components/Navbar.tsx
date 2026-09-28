"use client";

import { useLanding } from "@/context/LandingContext";
import { Bot, Menu, ArrowUpRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const menulist = [
  { id: 1, title: "আমাদের সম্পর্কে", route: "/therapists" },
  { id: 2, title: "চিকিৎসা", route: "/services" },
  { id: 3, title: "লগইন", route: "/login" },
];

export default function Navbar() {
  const { setIsMenuOpen } = useLanding();
  const router = useRouter();
  const url = usePathname();

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50 shadow-xs">
      {/* টপ অ্যানাউন্সমেন্ট বার */}
      <div className="flex flex-row justify-center items-center gap-1 bg-foreground text-white text-xs md:text-sm font-semibold py-1.5 px-4 cursor-pointer hover:opacity-95 transition-opacity">
        <h1>সম্পূর্ণ বিনামূল্যে পরামর্শ নিন</h1>
        <ArrowUpRight className="w-4 h-4" />
      </div>

      {/* মেইন নেভবার কন্টেইনার */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* ক্লিনিকের নাম বা লোগো */}
        <h1
          onClick={() => router.push("/")}
          className="text-base sm:text-xl md:text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
        >
          আশরাফ কাপিং এন্ড আকুপ্রেসার থেরাপি সেন্টার
        </h1>

        {/* ডেস্কটপ মেনু লিস্ট */}
        <nav className="hidden md:flex items-center gap-6 font-serif text-sm">
          {menulist.map((item) => {
            const isActive = url.startsWith(item.route);
            return (
              <Link
                key={item.id}
                href={item.route}
                className={`transition-colors py-1 ${
                  isActive
                    ? "text-primary font-semibold border-b-2 border-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AI বাটন - এখন মোবাইলসহ সব ডিভাইসে দেখা যাবে */}
          <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md flex items-center gap-1.5 sm:gap-2 shadow-xs cursor-pointer hover:bg-primary/90 transition-colors">
            <Bot className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">AI</span>
          </div>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            className="md:hidden p-1.5 text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
    </header>
  );
}
