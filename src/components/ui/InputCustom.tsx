import React from "react";
interface InputCustomProps {
    label: string;
    type: string;
    placeholder: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const InputCustom = ({ label, type, placeholder, name, value, onChange }: InputCustomProps) => {
    return (
        <div className="border-2 rounded-full px-6 flex py-4 items-center border-gray-300 relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="outline-none border-none w-full text-lg leading-[1.5rem] caret-[#682EC3]"
                placeholder={placeholder}
            />
            <div className="absolute -top-3.5 px-2 text-black font-medium text-base left-[3%] z-1 max-w-max h-8 bg-white">
                {label} <span className=" text-red-600">*</span>
            </div>
        </div>
    );
};

export default InputCustom;
