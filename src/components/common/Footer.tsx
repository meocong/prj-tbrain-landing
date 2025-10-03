import React from "react";
import Logo from "@/assets/images/logo.png";
import Image from "next/image";
import Link from "next/link";
import iconLinkedin from "@/assets/icons/LinkedinLogo.svg";
const Footer = () => {
  return (
    <footer className="mt-20 flex justify-center p-6">
      <div className="mx-auto w-full max-w-screen-lg">
        <div className="mb-20 flex flex-col items-center gap-8">
          <a href="/" className="flex items-center justify-center gap-2">
            <Image src={Logo} width={257} height={66} alt="logo" />
          </a>
          <a href="/" className="text-[14px] font-normal text-[#6C3CF4]">
            Privacy Policy
          </a>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[16px] font-medium text-[#222] uppercase">
              Follow us
            </span>
            <a href="/" className="flex items-center justify-center gap-2">
              <Image src={iconLinkedin} width={32} height={32} alt="linkedin" />
            </a>
          </div>
        </div>
        <div className="w-full border-b"></div>
        <p className="text-[14px] font-normal text-[#29282499] max-w-[400px] mx-auto mt-[24px] mb-[20px] text-center">
          Address: Sheridan, Wyoming, USA and Hanoi, Vietnam{" "}
        </p>
        <div className="mt-4 text-center text-[#29282499]">© Tbrain 2025</div>
      </div>
    </footer>
  );
};

export default Footer;
