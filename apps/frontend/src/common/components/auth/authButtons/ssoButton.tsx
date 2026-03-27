"use client"

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FaMicrosoft, FaGithub, FaGoogle } from "react-icons/fa";

// --- PRZYCISKI SSO ---
type SSOProvider = "microsoft-entra-id" | "github" | "google";

export const SSOButton = ({ provider, label }: { provider: SSOProvider, label: string }) => {
    const icons = {
        "microsoft-entra-id": <FaMicrosoft className="text-[#00a4ef] text-xl" />,
        "github": <FaGithub className="text-white text-xl" />,
        "google": <FaGoogle className="text-[#ea4335] text-xl" />
    };

    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.02, backgroundColor: "#252525" }} // hover: bg-zinc-700
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn(provider, { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-medium text-zinc-100 transition-colors cursor-pointer"
        >
            {icons[provider]}
            <span>{label}</span>
        </motion.button>
    );
};