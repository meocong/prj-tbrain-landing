"use client";

import Link from "next/link";

const StartNow = () => {
  return (
    <Link
      href="/contact"
      className="transition-all duration-500 px-10 py-3 text-lg rounded-full bg-[#682EC3] text-white hover:bg-[#d25df9]"
    >
      Request a Demo
    </Link>
  );
};

export default StartNow;
