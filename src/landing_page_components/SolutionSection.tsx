import { Sparkles, CheckCircle2, Leaf, Zap } from "lucide-react";
import Link from "next/link";

export default function SolutionSection() {
  // সমাধানের মূল বৈশিষ্ট্য বা সুবিধাগুলো
  const solutions = [
    {
      icon: <Leaf className="w-6 h-6 text-primary" />,
      title: "১০০% প্রাকৃতিক ও পার্শ্বপ্রতিক্রিয়ামুক্ত",
      description:
        "কোনো রকম ক্ষতিকর কেমিক্যাল বা ওষুধ ছাড়াই সম্পূর্ণ প্রাকৃতিকভাবে শরীরের নিজস্ব রোগ প্রতিরোধ ক্ষমতাকে জাগিয়ে তোলা হয়।",
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "মূল কারণ থেকে দীর্ঘস্থায়ী মুক্তি",
      description:
        "শুধু সাময়িক ব্যথানাশক নয়; কাপিং ও আকুপ্রেসারের মাধ্যমে ব্যথার শেকড় বা মূল কারণ চিহ্নিত করে স্থায়ী সমাধান দেওয়া হয়.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "আধুনিক ও প্রাচীন পদ্ধতির সুসমাহার",
      description:
        "হিজামা বা কাপিং থেরাপি এবং আকুপ্রেসারের বৈজ্ঞানিক কৌশল প্রয়োগ করে স্নায়ুতন্ত্রকে শিথিল ও সতেজ করা হয়।",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
      title: "অভিজ্ঞ থেরাপিস্ট দ্বারা যত্ন",
      description:
        "প্রতিটি সেশন পরিচালনা করেন দক্ষ ও প্রশিক্ষিত থেরাপিস্ট, যিনি আপনার শারীরিক গঠন ও সমস্যা অনুযায়ী চিকিৎসা দেন।",
    },
  ];

  return (
    <section className="w-full py-20 px-6 bg-secondary/20 border-y border-border">
      <div className="max-w-6xl mx-auto">
        {/* সেকশন হেডিং */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-medium tracking-wide uppercase bg-secondary px-3 py-1.5 rounded-full">
            আমাদের প্রাকৃতিক সমাধান
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-4">
            প্রাকৃতিক উপায়ে সুস্থ জীবনের নিশ্চয়তা
          </h2>
          <p className="text-muted-foreground mt-3 font-serif leading-relaxed">
            ওষুধের ওপর নির্ভরতা কমিয়ে আমাদের বিশেষায়িত কাপিং ও আকুপ্রেসার
            থেরাপির মাধ্যমে ফিরিয়ে আনুন আপনার হারানো প্রাণশক্তি।
          </p>
        </div>

        {/* সমাধানের কার্ডগুলোর গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((item, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-5 group"
            >
              <div className="p-3.5 bg-secondary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                <div className="text-primary group-hover:text-white transition-colors">
                  {item.icon}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-serif text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* কল টু অ্যাকশন হাইলাইট */}
        <div className="mt-14 bg-primary text-primary-foreground p-8 rounded-2xl text-center max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-serif font-bold">
              আজই আপনার সুস্থতার যাত্রা শুরু করুন
            </h4>
            <p className="text-primary-foreground/90 font-serif text-sm mt-1">
              বিশেষজ্ঞ থেরাপিস্টের সাথে পরামর্শ করে আপনার জন্য সঠিক থেরাপিটি
              বেছে নিন।
            </p>
          </div>
          <Link
            href="https://wa.me/8801700000000"
            className="bg-white text-primary px-6 py-3 rounded-lg font-serif font-semibold hover:bg-secondary transition-colors shadow-sm whitespace-nowrap"
          >
            অ্যাপয়েন্টমেন্ট নিন
          </Link>
        </div>
      </div>
    </section>
  );
}
