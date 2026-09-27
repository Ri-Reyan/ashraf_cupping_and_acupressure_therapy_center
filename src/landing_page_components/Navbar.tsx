"use client";
import { useLanding } from "@/context/LandingContext";
import { Bot, Menu } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { setIsMenuOpen } = useLanding();

  const router = useRouter();
  return (
    <header className="w-full bg-background border-b border-border py-4 px-6">
      <div className="flex flex-row justify-center items-center bg-foreground text-white font-semibold py-1 rounded-sm">
        <h1>সম্পূর্ণ বিনামূল্যে পরামর্শ নিন</h1>
        <ArrowUpRight />
      </div>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <h1
          onClick={() => {
            router.push("/");
          }}
          className="text-xl md:text-2xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          আশরাফ কাপিং এন্ড আকুপ্রেসার থেরাপি সেন্টার
        </h1>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md flex items-center gap-2 shadow-sm">
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">AI</span>
          </div>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Menu"
            className="p-1 text-foreground hover:text-primary transition-colors"
          >
            <Menu size={32} />
          </button>
        </div>
      </div>
    </header>
  );
}
