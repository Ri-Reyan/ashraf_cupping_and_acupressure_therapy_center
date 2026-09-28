import { Activity, AlertCircle, HeartCrack, Frown } from "lucide-react";

export default function ProblemStatement() {
  const problems = [
    {
      icon: <HeartCrack className="w-6 h-6 text-primary" />,
      title: "দীর্ঘস্থায়ী পিঠ ও কোমর ব্যথা",
      description:
        "অফিসের দীর্ঘ সময় বসে কাজ করা বা ভারী কাজ করার ফলে মেরুদণ্ড ও কোমরের অসহ্য ব্যথা যা দৈনন্দিন জীবনকে থামিয়ে দেয়।",
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "মাইগ্রেন ও তীব্র মাথা ব্যথা",
      description:
        "অত্যাধিক মানসিক চাপ ও অনিদ্রার কারণে ঘন ঘন মাইগ্রেনের আক্রমণ, যা কাজের মনোযোগ নষ্ট করে।",
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-primary" />,
      title: "বাত ও জয়েন্টের স্থায়ী সমস্যা",
      description:
        "হাঁটু, ঘাড় ও হাত-পায়ের জয়েন্টে শক্ত হয়ে যাওয়া এবং সামান্য নড়াচড়াতেই তীব্র অস্বস্তি বোধ হওয়া।",
    },
    {
      icon: <Frown className="w-6 h-6 text-primary" />,
      title: "অনিদ্রা ও মানসিক ক্লান্তি",
      description:
        "প্রচণ্ড অবসাদ এবং রাতে ঠিকমতো ঘুম না হওয়ার কারণে সবসময় শরীর ম্যাজম্যাজ করা ও শক্তিহীনতা অনুভব করা।",
    },
  ];

  return (
    <section className="w-full py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-medium tracking-wide uppercase bg-secondary px-3 py-1.5 rounded-full">
            আপনার শারীরিক কষ্টগুলো কি মিলে যাচ্ছে?
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mt-4">
            প্রতিদিনের এই ব্যথাগুলো কি আপনার স্বাভাবিক জীবনকে ব্যাহত করছে?
          </h2>
          <p className="text-muted-foreground mt-3 font-serif leading-relaxed">
            অ্যান্টিবায়োটিক বা সাময়িক ব্যথানাশক ওষুধের ওপর নির্ভর না করে মূল
            সমস্যা থেকে মুক্তি পান প্রাকৃতিক উপায়ে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((item, index) => (
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

        {/* <div className="mt-12 bg-secondary/60 border border-border p-6 rounded-2xl text-center max-w-3xl mx-auto">
          কেমিক্যালের পার্শ্বপ্রতিক্রিয়া ছাড়াই কাপিং থেরাপি এবং আকুপ্রেসারের
          মাধ্যমে এসব জটিলতা থেকে স্থায়ীভাবে সুস্থ থাকা সম্ভব।
        </div> */}
      </div>
    </section>
  );
}
