'use client'

import { motion } from "framer-motion";

// --- PRZYCISK LOGOWANIA (Główny formularz) ---
export const SubmitButton = ({ children, onClick, isLoading }: { children: React.ReactNode, onClick?: () => void, isLoading?: boolean }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={isLoading}
        className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-[#B266FF] to-purple-600 font-bold text-white shadow-lg shadow-[#B266FF]/20 hover:shadow-[#B266FF]/40 transition-shadow disabled:opacity-70 cursor-pointer"
    >
        {isLoading ? "Ładowanie..." : children}
    </motion.button>
);