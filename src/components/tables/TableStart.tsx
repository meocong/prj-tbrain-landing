"use client";
import Image from "next/image";
import React, { ChangeEvent, FormEvent, useState } from "react";
import star from "@/assets/images/start3.png";
import InputCustom from "../ui/InputCustom";

interface FormData {
    name: string;
    email: string;
    message: string;
    company: string;
}

const TableStart = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        message: "",
        company: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            message: "",
            company: "",
        });
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await res.json();
            if (result.status === "success") {
                resetForm();
            } else {
                resetForm();
            }
        } catch (error) {
            resetForm();
        }
    };
    return (
        <section id="start" className="container mx-auto px-3 pt-16 mb-16">
            <div className="mx-auto max-w-screen-lg relative">
                <form onSubmit={handleSubmit} className="max-w-screen-sm mx-auto border-2 border-gray-300 pt-8 pb-10 px-3 md:px-14 rounded-3xl">
                    <div className="text-center">
                        <h3 className="mx-auto max-w-max text-4xl font-medium">Start Today </h3>
                        <p className="text-lg max-w-96 mx-auto mt-4">Thank you and we will get back to you as soon as possible.</p>
                    </div>
                    <div className="mt-8">
                        <InputCustom type="text" name="name" value={formData.name} onChange={handleChange} label={"Name"} placeholder="Your name" />
                    </div>
                    <div className="mt-8">
                        <InputCustom
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            label={"E-mail"}
                            placeholder="yourmail@gmail.com"
                        />
                    </div>
                    <div className="mt-8">
                        <InputCustom
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            label={"Company"}
                            placeholder="Your company"
                        />
                    </div>
                    <div className="mt-8">
                        <div className="border-2 rounded-3xl px-6 py-3.5 border-gray-300 relative">
                            <textarea
                                className="outline-none border-none w-full text-lg caret-[#682EC3]"
                                name="message"
                                defaultValue={formData.message}
                                onChange={handleChange}
                                rows={4}
                                placeholder={"Your message"}
                            />
                            <div className="absolute -top-3.5 px-2 text-black font-medium text-base left-[3%] z-1 max-w-max h-8 bg-white">
                                Message <span className=" text-red-600">*</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-[#682EC3] py-3 mt-8 text-white text-base font-normal rounded-3xl transition-all duration-500 hover:bg-[#d25df9]">
                        Send
                    </button>
                </form>
                <div className="absolute -top-14 left-[5%]" data-aos="fade-up">
                    <Image src={star} width={38} height={500} alt="Floating Icon" />
                </div>
                <div className="absolute top-[40%] right-[5%]" data-aos="fade-up" data-aos-delay="100">
                    <Image src={star} width={70} height={500} alt="Floating Icon" />
                </div>
                <div className="absolute bottom-0 left-0" data-aos="fade-up" data-aos-delay="200">
                    <Image src={star} width={55} height={500} alt="Floating Icon" />
                </div>
            </div>
        </section>
    );
};

export default TableStart;
