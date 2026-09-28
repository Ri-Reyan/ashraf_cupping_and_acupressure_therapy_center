import { Button } from "@/components/ui/button";
import { MessageCircle, Star } from "lucide-react";
import Image from "next/image";

const ratingWords = [
  { id: 1, ch: "র" },
  { id: 2, ch: "ম" },
  { id: 3, ch: "স" },
  { id: 4, ch: "+" },
];

const HeroSection = () => {
  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* বাম পাশ: টেক্সট এবং কল-টু-অ্যাকশন */}
        <div id="side1" className="space-y-6">
          {/* ছোট ট্যাগলাইন */}
          <div className="inline-flex items-center gap-2 bg-secondary/60 border border-border/60 px-3.5 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs md:text-sm font-semibold text-secondary-foreground font-serif">
              প্রাকৃতিক সুস্থতার নতুন ঠিকানা
            </span>
          </div>

          {/* মূল শিরোনাম */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
              শরীরকে শুনুন,
            </h1>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-primary leading-tight">
              সুস্থতাকে বেছে নিন।
            </h1>

            <p className="pt-4 text-muted-foreground font-serif text-base md:text-lg leading-relaxed max-w-xl">
              ওষুধ ও সার্জারি ছাড়াই দীর্ঘস্থায়ী ব্যথা থেকে পান প্রাকৃতিক
              মুক্তি। মাইগ্রেন, পিঠের ব্যথা, অনিদ্রা ও স্ট্রেস ম্যানেজমেন্টের
              জন্য প্রমাণিত আকুপ্রেসার থেরাপি।
            </p>
          </div>

          {/* হোয়াটসঅ্যাপ বাটন */}
          <div className="pt-2">
            <Button
              asChild
              className="bg-primary hover:bg-primary/95 text-primary-foreground w-full sm:w-auto px-8 py-6 rounded-xl font-serif text-base shadow-md transition-all"
            >
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5"
              >
                <MessageCircle size={24} />
                <span>WhatsApp-এ পরামর্শ নিন</span>
              </a>
            </Button>
          </div>

          {/* রেটিং ও রিভিউ সেকশন */}
          <div className="pt-4 flex items-center gap-4">
            <div className="flex -space-x-1.5">
              {ratingWords.map((item) => (
                <span
                  key={item.id}
                  className={`text-white text-xs md:text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full shadow-sm ${
                    item.id === 1
                      ? "bg-[#F29191]"
                      : item.id === 2
                        ? "bg-[#972828]"
                        : item.id === 3
                          ? "bg-[#092328]"
                          : "bg-[#450C3F]"
                  }`}
                >
                  {item.ch}
                </span>
              ))}
            </div>

            <div className="border-l border-border pl-4 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Star className="text-yellow-500 fill-yellow-500" size={16} />
                <b className="font-serif text-foreground text-sm md:text-base">
                  ৪.৯/৫
                </b>
              </div>
              <small className="text-muted-foreground font-serif text-xs md:text-sm">
                ২ লাখ+ সন্তুষ্ট রোগী
              </small>
            </div>
          </div>
        </div>

        {/* ডান পাশ: ইমেজ সেকশন */}
        <div id="side2" className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg lg:max-w-xl rounded-2xl overflow-hidden bg-secondary/20">
            <Image
              src="/natural_satisfing_img.png"
              alt="Natural satisfying therapy image"
              width={700}
              height={600}
              className="w-auto h-auto object-cover transform hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
