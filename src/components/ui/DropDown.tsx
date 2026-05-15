"use client";
import Link from "next/link";
import { ReactNode, useState } from "react";

interface DropdownProps {
  title: ReactNode;
  items: string[];
}
const Dropdown = ({ title, items }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const closeDropdown = () => {
    setIsOpen(false);
  };
  return (
    <div className="relative inline-block text-left">
      <button onClick={toggleDropdown}>{title}</button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-2xl bg-white text-center shadow-lg">
          {items.map((item, i) => {
            let path = "";
            switch (item) {
              case "Home":
                path = "home";
                break;
              case "About Us":
                path = "about";
                break;
              case "Technical Expertise":
                path = "skills";
                break;
              case "Contact":
                path = "contact";
                break;
              case "News":
              case "Blog":
                path = "/blog";
                break;
              case "Privacy Policy":
                path = "/policy";
                break;
                case "Case Studies":
                path = "/casestudy";
                break;
              default:
                path = "";
                break;
            }

            return (
              <Link
                href={path.startsWith("/") ? path : `/#${path}`}
                key={i}
                className="block px-4 py-2 text-[#682EC3] hover:bg-gray-100"
                onClick={closeDropdown}
              >
                {item}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
