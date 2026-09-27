"use client";

import Link from "next/link";
import { useLanding } from "@/context/LandingContext";
import { usePathname } from "next/navigation";

const menulist = [
  {
    id: 1,
    title: "আমাদের সম্পর্কে",
    route: "/therapists",
  },
  {
    id: 2,
    title: "চিকিৎসা",
    route: "/services",
  },
  {
    id: 3,
    title: "লগইন",
    route: "/login",
  },
];

const Menubar = () => {
  const { isMenuOpen } = useLanding();

  const url = usePathname();

  return (
    <div className={`${isMenuOpen ? "block" : "hidden"}`}>
      {menulist.map((item) => {
        const isActive = url.startsWith(item.route);
        return (
          <div
            className={`hover:bg-secondary ${isActive ? "bg-secondary" : ""} text-md text px-2`}
            key={item.id}
          >
            <Link href={item.route}>{item.title}</Link>
          </div>
        );
      })}
    </div>
  );
};

export default Menubar;
