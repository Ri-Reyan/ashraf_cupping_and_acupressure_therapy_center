"use client";

import Link from "next/link";
import { useLanding } from "@/context/LandingContext";
import { usePathname } from "next/navigation";

const menulist = [
  { id: 1, title: "আমাদের সম্পর্কে", route: "/therapists" },
  { id: 2, title: "চিকিৎসা", route: "/services" },
  { id: 3, title: "লগইন", route: "/login" },
];

const Menubar = () => {
  const { isMenuOpen, setIsMenuOpen } = useLanding();
  const url = usePathname();

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-background border-b border-border px-4 py-3 space-y-2 shadow-sm transition-all duration-300">
      {menulist.map((item) => {
        const isActive = url.startsWith(item.route);
        return (
          <Link
            onClick={() => setIsMenuOpen((prev) => !prev)}
            key={item.id}
            href={item.route}
            className={`block px-4 py-2.5 rounded-lg text-sm font-serif transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
};

export default Menubar;
