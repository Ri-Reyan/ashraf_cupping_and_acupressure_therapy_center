import { Star, ShieldCheck, HeartHandshake, Award } from "lucide-react";

export default function SocialProof() {
  const testimonials = [
    {
      name: "মোহাম্মদ রফিকুল ইসলাম",
      location: "গাজীপুর",
      comment:
        "দীর্ঘদিনের পিঠের ব্যথায় ঠিকমতো হাঁটতে পারতাম না। এখানকার কাপিং থেরাপি এবং আকুপ্রেসার সেশন নেওয়ার পর আলহামদুলিল্লাহ এখন অনেক সুস্থ বোধ করছি। পরিবেশটাও বেশ শান্ত ও পরিচ্ছন্ন।",
      rating: 5,
    },
    {
      name: "ফারহানা আক্তার",
      location: "উত্তরা, ঢাকা",
      comment:
        "প্রাকৃতিক উপায়ে মাইগ্রেনের সমস্যার সমাধান পেতে এখানে এসেছিলাম। থেরাপিস্টের আন্তরিক ব্যবহার এবং নিখুঁত চিকিৎসা পদ্ধতি সত্যিই প্রশংসনীয়। অত্যন্ত আস্থার একটি জায়গা।",
      rating: 5,
    },
  ];

  const stats = [
    {
      icon: <HeartHandshake className="w-6 h-6 text-primary" />,
      title: "2 লাখ+",
      subtitle: "সন্তুষ্ট রোগী",
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "৮+ বছর",
      subtitle: "অভিজ্ঞতা ও সেবা",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "১০০%",
      subtitle: "নিরাপদ ও প্রাকৃতিক পদ্ধতি",
    },
  ];

  return (
    <section className="w-full py-16 px-6 bg-secondary/30 border-y border-border mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary text-sm font-medium tracking-wide uppercase bg-secondary px-3 py-1 rounded-full">
            রোগীদের আস্থার প্রতিকৃতি
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-3">
            যাঁরা সুস্থ হয়ে ফিরেছেন, তাঁদের অভিজ্ঞতা
          </h2>
          <p className="text-muted-foreground mt-2 font-serif text-sm">
            প্রাকৃতিক উপায়ে চিকিৎসা নিয়ে আমাদের রোগীরা কেমন অনুভব করছেন তা জেনে
            নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-secondary rounded-lg">{stat.icon}</div>
              <div>
                <h3 className="text-xl font-bold font-serif text-foreground">
                  {stat.title}
                </h3>
                <p className="text-sm text-muted-foreground font-serif">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />

              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>

                <p className="text-foreground font-serif leading-relaxed italic mb-6">
                  {item.comment}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-auto">
                <div>
                  <h4 className="font-serif font-semibold text-foreground">
                    {item.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {item.location}
                  </span>
                </div>
                <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-md font-medium">
                  ভেরিফাইড রোগী
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
