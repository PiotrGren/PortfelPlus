'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const FloatingInput = ({ label, type = "text", ...props }: FloatingInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const isActive = isFocused || hasValue;

    return (
        <div className="relative w-full mb-5">
            <input
                value={props.value !== undefined ? props.value : ''} 
                
                type={type}
                className="w-full h-[44px] 2xl:h-[52px] bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 text-zinc-100 focus:outline-none ..."
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasValue(e.target.value.length > 0);
                }}
                onChange={(e) => setHasValue(e.target.value.length > 0)}
                {...props}
            />
            {/* Animacja labela uciekającego w LEWY górny róg i przecinającego obramowanie */}
            <motion.label
                initial={false}
                animate={{
                    y: isActive ? -8 : 12,
                    scale: isActive ? 0.7 : 1,
                    color: isActive ? "#B266FF" : "#a1a1aa",
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`absolute pointer-events-none origin-top-left ${isActive ? 'left-2.5 bg-zinc-900 px-1' : 'left-4'}`}
            >
                {label}
            </motion.label>
        </div>
    );
};