"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

export interface PricingTier {
    name: string;
    price: string;
    yearlyPrice: string;
    description: string;
    features: string[];
    buttonText: string;
    buttonColor: string;
    isPopular?: boolean;
}

export interface PricingSectionProps {
    title: string;
    description: string;
    pricingItems: PricingTier[];
}

interface TabsProps {
    activeTab: "yearly" | "monthly";
    setActiveTab: (tab: "yearly" | "monthly") => void;
    className?: string;
}

function PricingTabs({ activeTab, setActiveTab, className }: TabsProps) {
    return (
        <div
            className={cn(
                "relative flex w-fit items-center rounded-lg p-1 bg-gray-100",
                className,
            )}
        >
            {["monthly", "yearly"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as "yearly" | "monthly")}
                    className={cn(
                        "relative z-[1] px-4 py-2 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200",
                        activeTab === tab ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                    )}
                >
                    {activeTab === tab && (
                        <motion.div
                            layoutId="active-tab"
                            className="absolute inset-0 rounded-md bg-white "
                            transition={{
                                duration: 0.2,
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                            }}
                        />
                    )}
                    <span className="relative block text-sm font-medium flex items-center gap-2">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === "yearly" && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 py-1 px-2 rounded-full">
                                -20%
                            </span>
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
}

export function PricingSection({ title, description, pricingItems }: PricingSectionProps) {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    // Update price animation
    const PriceDisplay = ({ tier }: { tier: PricingTier }) => {
        const price = billingCycle === "yearly" ? tier.yearlyPrice : tier.price;
        return (
            <motion.span
                key={price}
                className="text-4xl font-bold tracking-tight text-gray-900"
                initial={{ opacity: 0, x: billingCycle === "yearly" ? -10 : 10, filter: "blur(5px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
                {price}
            </motion.span>
        );
    };

    return (
        <section id="pricing" className="flex flex-col items-center justify-center gap-10 pb-10 w-full relative bg-gray-50">
            <div className="text-center mt-32 space-y-3 mb-8">
                <h2 className="font-bodoni text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                    {title}
                </h2>
                <p className="text-gray-600 font-normal max-w-2xl mx-auto">
                    {description}
                </p>
            </div>
            <div className="relative w-full h-full">
                <div className="flex justify-center mb-12">
                    <PricingTabs
                        activeTab={billingCycle}
                        setActiveTab={setBillingCycle}
                        className="mx-auto"
                    />
                </div>
                <div className="grid min-[650px]:grid-cols-2 min-[900px]:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-4">
                    {pricingItems.map((tier, idx) => (
                        <div
                            key={tier.name}
                            className={cn(
                                "rounded-xl bg-white flex flex-col transition-all duration-300 hover:",
                                "p-6 min-h-[480px] relative "
                            )}
                        >
                            {/* Plan name and badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-lg font-semibold text-gray-900">{tier.name}</span>
                                {tier.isPopular && (
                                    <span className="bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">Popular</span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-1 mb-2">
                                <PriceDisplay tier={tier} />
                                <span className="text-gray-500 font-normal">/{billingCycle === "yearly" ? "year" : "month"}</span>
                            </div>

                            {/* Description */}
                            <div className="mb-8 text-gray-600 text-sm leading-relaxed">{tier.description}</div>

                            {/* Button */}
                            <button
                                className={cn(
                                    "w-full h-11 rounded-lg font-medium text-sm transition-all duration-200 mb-8",
                                    tier.isPopular
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : tier.name === "Enterprise"
                                            ? "bg-gray-900 text-white hover:bg-gray-800"
                                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                )}
                            >
                                {tier.buttonText}
                            </button>

                            {/* Features header */}
                            <div className="text-sm text-gray-900 mb-4 font-medium">
                                Everything in {idx === 0 ? "Free" : pricingItems[idx - 1]?.name || "previous plan"} +
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-gray-700 text-sm">
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 mt-0.5 flex-shrink-0">
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 5L4 7L8 3" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        <span className="leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}