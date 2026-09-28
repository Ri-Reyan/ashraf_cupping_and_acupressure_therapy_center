"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl shadow-sm">
        {/* লোগো বা হেডার */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 bg-secondary rounded-xl text-primary mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            অ্যাডমিন পোর্টাল
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-serif">
            আশরাফ কাপিং এন্ড আকুপ্রেসার থেরাপি সেন্টার
          </p>
        </div>

        {/* এরর মেসেজ */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-serif text-center">
            {error}
          </div>
        )}

        {/* লগইন ফর্ম */}
        <form className="space-y-5 font-serif">
          {/* ইমেইল ফিল্ড */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              অ্যাডমিন ইমেইল
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ashraftherapy.com"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              />
            </div>
          </div>

          {/* পাসওয়ার্ড ফিল্ড */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              />
            </div>
          </div>

          {/* সাবমিট বাটন */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold shadow-sm transition-all"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </Button>
        </form>

        {/* ফুটার নোট */}
        <div className="mt-8 text-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-serif">
            নিরাপদ অ্যাডমিন অ্যাক্সেস। অনুমোদিত ব্যক্তি ছাড়া প্রবেশ নিষেধ।
          </p>
        </div>
      </div>
    </div>
  );
}
