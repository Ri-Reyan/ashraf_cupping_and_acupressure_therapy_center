import { Button } from "@/components/ui/button";
import { MessageCircle, Star } from "lucide-react";
import Image from "next/image";

const ratingWords = [
  {
    id: 1,
    ch: "র",
  },
  {
    id: 2,
    ch: "ম",
  },
  {
    id: 3,
    ch: "স",
  },
  {
    id: 4,
    ch: "+",
  },
];

const HeroSection = () => {
  return (
    <div className="mt-4 px-2">
      <div id="side1">
        <div className="flex flex-row gap-x-1">
          <span className="text-6xl text-orange-400">.</span>
          <h1 className="mt-8.5 text-sm font-semibold text-secondary-foreground">
            প্রাকৃতিক সুস্থতার নতুন ঠিকানা
          </h1>
        </div>
        <div>
          <h1 className="px-2 py-4 text-4xl">শরীরকে শুনুন,</h1>
          <h1 className="px-2 -my-4 text-4xl text-secondary-foreground">
            সুস্থতাকে বেছে নিন।
          </h1>

          <p className="px-2 py-8 text-gray-500 font-sans text-lg">
            ওষুধ ও সার্জারি ছাড়াই দীর্ঘস্থায়ী ব্যথা থেকে পান প্রাকৃতিক মুক্তি।
            মাইগ্রেন, পিঠের ব্যথা, অনিদ্রা ও স্ট্রেস ম্যানেজমেন্টের জন্য
            প্রমাণিত অ্যাকুপ্রেসার থেরাপি।
          </p>
        </div>
        <Button className="flex bg-[#1C9A6F] w-full mx-6 py-6 place-self-center font-bold">
          <a href="https://wa.me/8801700000000">
            <div className="flex flex-row gap-x-1">
              <MessageCircle size={30} />
              <span className="font-sans">WhatsApp-এ পরামর্শ নিন</span>
            </div>
          </a>
        </Button>
        <div className="mt-10 flex flex-row gap-x-4 px-2">
          <div>
            {ratingWords.map((item) => (
              <span
                className={` -mx-1 text-white ${
                  item.id === 1
                    ? "bg-[#F29191]"
                    : item.id === 2
                      ? "bg-[#972828]"
                      : item.id === 3
                        ? "bg-[#092328]"
                        : "bg-[#450C3F]"
                } px-3 py-1 rounded-full`}
                key={item.id}
              >
                {item.ch}
              </span>
            ))}
          </div>
          <div className="-my-4">
            <div className="stars">
              <Star className="text-yellow-500" size={14} fill="currentColor" />{" "}
              <b>৪.৯/৫</b>
            </div>
            <small className="text-gray-500">২ লাখ+ সন্তুষ্ট রোগী</small>
          </div>
        </div>
      </div>
      <div id="side2" className="mt-20">
        <Image
          src="/natural_satisfing_img.png"
          alt="Natural satisfying therapy image"
          width={800}
          height={700}
          priority
        />
      </div>
    </div>
  );
};

export default HeroSection;
