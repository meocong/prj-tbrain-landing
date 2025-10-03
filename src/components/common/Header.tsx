"use client";
import { useState } from "react";
import DropDown from "@/components/ui/DropDown";
import Logo from "@/assets/images/logo.png";
import Menu from "@/assets/icons/menu-11.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const [path, setPath] = useState("#home");
  const pathname = usePathname();
  const router = useRouter();

  const handleScrollToSection = (sectionId: string) => {
    if (pathname === "/") {
      // Nếu đang ở trang chủ thì scroll đến section ngay lập tức
      const section = document.querySelector(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setPath(sectionId);
      }
    } else {
      // Nếu không ở trang chủ, chuyển về trang chủ rồi scroll đến section
      router.push(`/${sectionId}`);
    }
  };

  return (
    <header className="fixed right-0 top-0 z-10 w-full bg-[#FFFFFF59] p-3 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="#home" className="flex items-center justify-center gap-2">
            <Image src={Logo} width={123} height={500} alt="logo" />
          </Link>
          <div className="hidden md:block">
            <ul className="flex items-center gap-16">
              <li>
                <Link
                  href="/"
                  className={`text-base font-medium hover:text-[#6C3CF4] ${
                    pathname === "/" && (path === "#home" || path === "")
                      ? "text-[#6C3CF4]"
                      : null
                  }`}
                  onClick={() => handleScrollToSection("#home")}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className={`text-base font-medium hover:text-[#6C3CF4] ${pathname === "/" && path === "#about" ? "text-[#6C3CF4]" : null}`}
                  onClick={() => handleScrollToSection("#about")}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/#skills"
                  className={`text-base font-medium hover:text-[#6C3CF4] ${pathname === "/" && path === "#skills" ? "text-[#6C3CF4]" : null}`}
                  onClick={() => handleScrollToSection("#skills")}
                >
                  Technical Expertise
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className={`text-base font-medium hover:text-[#6C3CF4] ${pathname === "/" && path === "#contact" ? "text-[#6C3CF4]" : null}`}
                  onClick={() => handleScrollToSection("#contact")}
                >
                  Contact
                </Link>
              </li>
              <li
                className={`text-base font-medium hover:text-[#6C3CF4] ${pathname.startsWith("/news") ? "text-[#6C3CF4]" : null}`}
              >
                <Link href="/news">News</Link>
              </li>
              <li
                className={`text-base font-medium hover:text-[#6C3CF4] ${pathname.startsWith("/policy") ? "text-[#6C3CF4]" : null}`}
              >
                <Link href="/policy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-6">
            <DropDown
              items={["Home", "About Us", "Technical Expertise", "Contact", "News", "Privacy Policy"]}
              title={
                <div className="md:hidden">
                  <Image src={Menu} width={30} height={500} alt="svg" />
                </div>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
