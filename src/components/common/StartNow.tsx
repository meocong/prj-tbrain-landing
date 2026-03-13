"use client";

import { analytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

const StartNow = () => {
  const handleClick = () => {
    if (analytics) {
      logEvent(analytics, "button_click", {
        button_name: "Star now",
      });
    }
  };

  return (
    <a
      onClick={handleClick}
      href="#start"
      className="transition-all duration-500 px-10 py-3 text-lg rounded-full bg-[#682EC3] text-white hover:bg-[#d25df9]"
    >
      Request a Demo
    </a>
  );
};

export default StartNow;
