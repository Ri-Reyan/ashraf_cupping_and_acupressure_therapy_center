import { CalendarCheck, Stethoscope, Sparkles, Smile } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      step: "০১",
      icon: <CalendarCheck className="w-6 h-6 text-primary" />,
      title: "অ্যাপয়েন্টমেন্ট বুকিং",
      description:
        "অনলাইন বা ফোনের মাধ্যমে আপনার সুবিধাজনক সময়ে সহজে একটি ফ্রি কনসালটেশন বা অ্যাপয়েন্টমেন্ট বুক করুন।",
    },
    {
      step: "০২",
      icon: <Stethoscope className="w-6 h-6 text-primary" />,
      title: "শারীরিক পরীক্ষা ও পরামর্শ",
      description:
        "আমাদের অভিজ্ঞ থেরাপিস্ট আপনার শারীরিক সমস্যা, ব্যথা ও জীবনধারা বিস্তারিত শুনে মূল কারণ চিহ্নিত করবেন।",
    },
    {
      step: "০৩",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "থেরাপি সেশন গ্রহণ",
      description:
        "আপনার সমস্যা অনুযায়ী সুনির্দিষ্ট কাপিং (হিজামা), আকুপ্রেসার বা ন্যাচারাল থেরাপি সেশন সফলভাবে সম্পন্ন করা হয়।",
    },
    {
      step: "০৪",
      icon: <Smile className="w-6 h-6 text-primary" />,
      title: "স্থায়ী মুক্তি ও সুস্থ জীবন",
      description:
        "সেশন শেষে নিয়মিত ফলোআপ ও প্রাকৃতিক জীবনযাপনের পরামর্শের মাধ্যমে আপনি পান ব্যথা-মুক্ত ও সতেজ জীবন।",
    },
  ];

  return (
    <section className="w-full py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-medium tracking-wide uppercase bg-secondary px-3 py-1.5 rounded-full">
            সহজ ও গোছানো প্রক্রিয়া
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-4">
            যেভাবে আপনি আমাদের সেবা গ্রহণ করবেন
          </h2>
          <p className="text-muted-foreground mt-3 font-serif leading-relaxed">
            মাত্র কয়েকটি সহজ ধাপে আমাদের বিশেষজ্ঞ থেরাপিস্টদের কাছ থেকে নিন
            আপনার কাঙ্ক্ষিত প্রাকৃতিক চিকিৎসা।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="absolute -top-4 right-6 bg-primary text-primary-foreground text-xs font-serif font-bold px-3 py-1 rounded-full shadow-sm">
                ধাপ {item.step}
              </div>

              <div>
                <div className="p-3.5 bg-secondary rounded-xl w-fit mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <div className="text-primary group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-serif text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="https://wa.me/8801700000000"
            className="bg-primary text-primary-foreground font-serif px-6 py-3.5 rounded-xl font-semibold shadow-sm hover:bg-[#06655c] transition-colors"
          >
            আজই আপনার প্রথম অ্যাপয়েন্টমেন্ট বুক করুন
          </Link>
        </div>
      </div>
    </section>
  );
}
