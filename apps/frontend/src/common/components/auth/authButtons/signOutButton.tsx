"use client"

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

// --- PRZYCISK WYLOGOWANIA (Do użycia m.in. w Dashboardzie) ---
export const SignOutButton = () => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-6 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/30 rounded-lg font-medium transition-colors cursor-pointer"
        >
            Wyloguj się
        </motion.button>
    );
};