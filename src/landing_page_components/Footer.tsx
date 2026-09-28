import { MapPin, Phone, Clock, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#173F3A] text-[#f8fbfa] pt-16 pb-8 px-6 border-t border-border/20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {/* কলাম ১: ক্লিনিকের সংক্ষিপ্ত পরিচয় */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-bold text-white tracking-wide">
            আশরাফ কাপিং এন্ড আকুপ্রেসার থেরাপি সেন্টার
          </h3>
          <p className="text-sm font-serif text-gray-300 leading-relaxed">
            প্রাকৃতিক উপায়ে দীর্ঘস্থায়ী ব্যথা মুক্তি এবং সুস্থ জীবনযাপনের
            বিশ্বস্ত প্রতিষ্ঠান। কোনো পার্শ্বপ্রতিক্রিয়া ছাড়াই আমরা দিচ্ছি
            মানসম্মত কাপিং ও আকুপ্রেসার চিকিৎসা।
          </p>
          <div className="flex items-center gap-2 text-xs text-primary-foreground/80 bg-primary/30 w-fit px-3 py-1.5 rounded-lg border border-primary/40">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>১০০% প্রাকৃতিক ও নিরাপদ চিকিৎসা</span>
          </div>
        </div>

        {/* কলাম ২: দ্রুত লিংকসমূহ */}
        <div className="space-y-4">
          <h4 className="text-lg font-serif font-semibold text-white border-b border-gray-700 pb-2 w-fit">
            দ্রুত লিংক
          </h4>
          <ul className="space-y-2 font-serif text-sm text-gray-300">
            <li>
              <a
                href="/services"
                className="hover:text-primary transition-colors"
              >
                আমাদের সেবাসমূহ
              </a>
            </li>
            <li>
              <a
                href="/therapists"
                className="hover:text-primary transition-colors"
              >
                থেরাপিস্টদের সম্পর্কে
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/8801700000000"
                className="hover:text-primary transition-colors"
              >
                অ্যাপয়েন্টমেন্ট বুকিং
              </a>
            </li>
          </ul>
        </div>

        {/* কলাম ৩: লোকেশন ও যোগাযোগ */}
        <div className="space-y-4">
          <h4 className="text-lg font-serif font-semibold text-white border-b border-gray-700 pb-2 w-fit">
            যোগাযোগ ও লোকেশন
          </h4>

          <div className="space-y-3 font-serif text-sm text-gray-300">
            {/* লোকেশন */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>
                রুম নং-০২, শহীদপার্ক জামে মসজিদ টাউনহল মোহাম্মদপুর, ঢাকা ১২১২,
                বাংলাদেশ
              </span>
            </div>

            {/* ফোন নম্বর */}
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <span dir="ltr">+৮৮০ ০১৭১৬-৩১৭৯৮৬</span>
            </div>

            {/* সময়সূচী */}
            <div className="flex items-start gap-3 pt-1">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>শনি–বৃহস্পতি · সকাল ১০ টা–রাত ১০ টা</span>
            </div>
          </div>
        </div>
      </div>

      {/* ফুটারের নিচের কপিরাইট অংশ */}
      <div className="max-w-6xl mx-auto border-t border-gray-700/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-gray-400 gap-4">
        <p>
          © ২০২৬ আশরাফ কাপিং এন্ড আকুপ্রেসার থেরাপি সেন্টার। সর্বস্বত্ব
          সংরক্ষিত।
        </p>
      </div>
    </footer>
  );
}
