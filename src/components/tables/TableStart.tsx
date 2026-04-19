"use client";

import Image from "next/image";
import React, { useState } from "react";
import star from "@/assets/images/start3.png";
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";

const TableStart = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          company: form.company,
          message: form.message,
          turnstileToken: "inline-form",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="start" className="container mx-auto px-3 pt-16 mb-16">
      <div className="mx-auto max-w-screen-lg relative">
        {submitted ? (
          <div className="max-w-screen-sm mx-auto border-2 border-gray-300 py-16 px-3 md:px-14 rounded-3xl text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-3xl font-medium">Thank you!</h3>
            <p className="mt-2 text-lg text-[#78818f]">
              We&apos;ll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-screen-sm mx-auto border-2 border-gray-300 pt-8 pb-10 px-3 md:px-14 rounded-3xl"
          >
            <div className="text-center">
              <h3 className="mx-auto max-w-max text-4xl font-medium">
                Start Today
              </h3>
              <p className="text-lg max-w-96 mx-auto mt-4">
                Tell us about your project and we&apos;ll get back to you.
              </p>
            </div>
            <div className="mt-8">
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border-2 border-gray-300 rounded-full px-6 py-3.5 text-lg outline-none focus:border-[#682EC3] caret-[#682EC3]"
              />
            </div>
            <div className="mt-6">
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="yourmail@gmail.com"
                className="w-full border-2 border-gray-300 rounded-full px-6 py-3.5 text-lg outline-none focus:border-[#682EC3] caret-[#682EC3]"
              />
            </div>
            <div className="mt-6">
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Your company"
                className="w-full border-2 border-gray-300 rounded-full px-6 py-3.5 text-lg outline-none focus:border-[#682EC3] caret-[#682EC3]"
              />
            </div>
            <div className="mt-6">
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your project..."
                className="w-full border-2 border-gray-300 rounded-3xl px-6 py-3.5 text-lg outline-none focus:border-[#682EC3] caret-[#682EC3] resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#682EC3] py-3 mt-8 text-white text-base font-medium rounded-3xl transition-all duration-500 hover:bg-[#d25df9] flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Sending..." : "Send"}
            </button>
          </form>
        )}
        <div className="absolute -top-14 left-[5%] hidden md:block">
          <Image src={star} width={38} height={38} alt="" />
        </div>
        <div className="absolute top-[40%] right-[5%] hidden md:block">
          <Image src={star} width={70} height={70} alt="" />
        </div>
        <div className="absolute bottom-0 left-0 hidden md:block">
          <Image src={star} width={55} height={55} alt="" />
        </div>
      </div>
    </section>
  );
};

export default TableStart;
