'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
// Importujemy główny komponent z biblioteki
import PhoneInput, { type Value } from 'react-phone-number-input';
// Importujemy niezbędne style CSS biblioteki
import 'react-phone-number-input/style.css';

interface FloatingPhoneInputProps {
    label: string;
    value: Value | undefined;
    onChange: (value: Value | undefined) => void;
}

export const FloatingPhoneInput = ({ label, value, onChange }: FloatingPhoneInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    // Etykieta jest "aktywna", jeśli pole jest skupione LUB ma wpisaną wartość
    const isActive = isFocused || (value && value.toString().length > 0);

    return (
        <div className="relative w-full mb-5">
            <PhoneInput
                international
                withCountryCallingCode // To wyświetla "+48" w polu!
                defaultCountry="PL"
                value={value}
                onChange={onChange}
                // Magia Tailwinda: stylowanie tła flagi, ramki i uwidocznienie strzałki
                className="w-full h-[44px] 2xl:h-[52px] bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus-within:border-[#B266FF] transition-colors peer flex items-stretch
                [&_.PhoneInputCountry]:bg-zinc-700 [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:rounded-l-xl [&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-zinc-600 [&_.PhoneInputCountrySelectArrow]:text-zinc-400 [&_.PhoneInputCountrySelectArrow]:opacity-100 [&_.PhoneInputCountrySelectArrow]:ml-2"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                numberInputProps={{
                    className: "w-full h-full focus:outline-none bg-transparent pr-4"
                }}
            />
            {/* Animacja omijająca flagę, gdy pole jest puste */}
            <motion.label
                initial={false}
                animate={{
                    y: isActive ? -60 : -37,
                    x: isActive ? 15 : 100, // Omija tło flagi (80px), gdy jest na dole
                    scale: isActive ? 0.8 : 1,
                    color: isActive ? "#B266FF" : "#a1a1aa",
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`absolute pointer-events-none origin-top-left left-0 ${isActive ? 'bg-zinc-900 px-1 z-10' : ''}`}
            >
                {label}
            </motion.label>
        </div>
    );
};