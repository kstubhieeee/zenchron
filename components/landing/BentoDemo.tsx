"use client";

import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import {
    BellIcon,
    Share2Icon,
    CheckCircle,
    Calendar as CalendarLucide,
    Bot,
    MessageSquare,
    Link,
    FileText,
    Zap,
    Target,
    Users,
    BarChart3,
    Folder,
    Clock,
    PartyPopper,
    Shield
} from "lucide-react";
import { Calendar } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { AnimatedList } from "@/components/magicui/animated-list";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import React, { forwardRef, useRef, useState } from "react";

const files = [
    {
        name: "meeting-notes.pdf",
        body: "AI-generated meeting summaries with action items and key decisions automatically extracted.",
    },
    {
        name: "task-report.xlsx",
        body: "Smart task analytics showing productivity metrics and completion rates across your team.",
    },
    {
        name: "workflow.svg",
        body: "Visual workflow diagrams that adapt and optimize based on your team's working patterns.",
    },
    {
        name: "integrations.json",
        body: "Seamless connections to 100+ tools including Slack, Gmail, Notion, and Google Workspace.",
    },
    {
        name: "insights.txt",
        body: "Daily AI insights that help you identify bottlenecks and optimize your productivity.",
    },
];

interface Item {
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    time: string;
}

let notifications = [
    {
        name: "Task completed",
        description: "Marketing campaign review finished",
        time: "2m ago",
        icon: CheckCircle,
        color: "#10B981",
    },
    {
        name: "Meeting reminder",
        description: "Team standup in 15 minutes",
        time: "5m ago",
        icon: CalendarLucide,
        color: "#3B82F6",
    },
    {
        name: "AI suggestion",
        description: "Optimize your calendar for deep work",
        time: "8m ago",
        icon: Bot,
        color: "#8B5CF6",
    },
    {
        name: "New message",
        description: "Sarah shared a document with you",
        time: "12m ago",
        icon: MessageSquare,
        color: "#EF4444",
    },
    {
        name: "Integration connected",
        description: "Slack workspace successfully linked",
        time: "15m ago",
        icon: Link,
        color: "#F59E0B",
    },
    {
        name: "Document updated",
        description: "Project proposal has been revised",
        time: "18m ago",
        icon: FileText,
        color: "#06B6D4",
    },
    {
        name: "Workflow automated",
        description: "Email notifications now auto-sorted",
        time: "22m ago",
        icon: Zap,
        color: "#84CC16",
    },
    {
        name: "Calendar optimized",
        description: "Found 2 hours for focused work",
        time: "25m ago",
        icon: Target,
        color: "#F97316",
    },
    {
        name: "Team update",
        description: "3 new tasks assigned to your team",
        time: "30m ago",
        icon: Users,
        color: "#EC4899",
    },
    {
        name: "Smart insight",
        description: "Productivity increased by 23% this week",
        time: "35m ago",
        icon: BarChart3,
        color: "#6366F1",
    },
    {
        name: "File organized",
        description: "Meeting notes auto-categorized",
        time: "40m ago",
        icon: Folder,
        color: "#14B8A6",
    },
    {
        name: "Reminder set",
        description: "Follow up with client tomorrow",
        time: "45m ago",
        icon: Clock,
        color: "#A855F7",
    },
    {
        name: "Goal achieved",
        description: "Weekly task completion target met",
        time: "1h ago",
        icon: PartyPopper,
        color: "#F43F5E",
    },
    {
        name: "Security update",
        description: "All integrations verified secure",
        time: "1h ago",
        icon: Shield,
        color: "#64748B",
    },
];

const Notification = ({ name, description, icon: Icon, color, time }: Item) => {
    return (
        <figure
            className={cn(
                "relative mx-auto min-h-fit w-full max-w-[450px] cursor-pointer overflow-hidden rounded-2xl p-5",
                // animation styles
                "transition-all duration-200 ease-in-out hover:scale-[103%]",
                // light styles
                "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                // dark styles
                "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
            )}
        >
            <div className="flex flex-row items-center gap-4">
                <div
                    className="flex size-12 items-center justify-center rounded-2xl flex-shrink-0"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col overflow-hidden flex-1">
                    <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
                        <span className="text-base sm:text-lg font-semibold">{name}</span>
                        <span className="mx-2">·</span>
                        <span className="text-sm text-gray-500">{time}</span>
                    </figcaption>
                    <p className="text-sm font-normal text-gray-600 dark:text-white/60 mt-1 leading-relaxed">{description}</p>
                </div>
            </div>
        </figure>
    );
};

function AnimatedListDemo({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
                className,
            )}
        >
            <AnimatedList delay={1500}>
                {notifications.map((item, idx) => (
                    <Notification {...item} key={idx} />
                ))}
            </AnimatedList>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
        </div>
    );
}

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-12 items-center justify-center rounded-full  bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className,
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

function CalendarDemo({ className }: { className?: string }) {
    return (
        <Calendar
            isReadOnly
            aria-label="Smart Scheduling Calendar"
            value={today(getLocalTimeZone())}
            className={cn("rounded-md ", className)}
        />
    );
}

function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);
    const div3Ref = useRef<HTMLDivElement>(null);
    const div4Ref = useRef<HTMLDivElement>(null);
    const div5Ref = useRef<HTMLDivElement>(null);
    const div6Ref = useRef<HTMLDivElement>(null);
    const div7Ref = useRef<HTMLDivElement>(null);

    return (
        <div
            className={cn("relative flex h-[300px] w-full items-center justify-center overflow-hidden p-10", className)}
            ref={containerRef}
        >
            <div className="flex size-full max-h-[200px] max-w-lg flex-col items-stretch justify-between gap-10">
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div1Ref}>
                        <Icons.gmeet />
                    </Circle>
                    <Circle ref={div5Ref}>
                        <Icons.gmail />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div2Ref}>
                        <Icons.slack />
                    </Circle>
                    <Circle ref={div4Ref} className="size-16">
                        <Icons.notion />
                    </Circle>
                    <Circle ref={div6Ref}>
                        <Icons.calendar />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div3Ref}>
                        <Icons.gmeet />
                    </Circle>
                    <Circle ref={div7Ref}>
                        <Icons.notion />
                    </Circle>
                </div>
            </div>

            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div4Ref}
                curvature={-75}
                endYOffset={-10}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div4Ref}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div4Ref}
                curvature={75}
                endYOffset={10}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={div4Ref}
                curvature={-75}
                endYOffset={-10}
                reverse
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div4Ref}
                reverse
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div7Ref}
                toRef={div4Ref}
                curvature={75}
                endYOffset={10}
                reverse
            />
        </div>
    );
}

const Icons = {
    gmail: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66" className="w-6 h-6">
            <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
            <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
            <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
            <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
            <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
        </svg>
    ),
    slack: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 127 127">
            <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A" />
            <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z" fill="#36C5F0" />
            <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="#2EB67D" />
            <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E" />
        </svg>
    ),
    notion: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100" fill="none">
            <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" fill="#fff" />
            <path fillRule="evenodd" clipRule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="#000" />
        </svg>
    ),
    gmeet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 87.5 72" className="w-6 h-6">
            <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z" />
            <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z" />
            <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z" />
            <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z" />
            <path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z" />
            <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z" />
        </svg>
    ),
    calendar: () => (
        <img src="/calendar.svg" />
    ),

    gemini: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 65 65" className="w-8 h-8">
            <mask id="maskme" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="65" height="65">
                <path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="#000" />
                <path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="url(#prefix__paint0_linear_2001_67)" />
            </mask>
            <g mask="url(#maskme)">
                <linearGradient id="prefix__paint0_linear_2001_67" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4893FC" />
                    <stop offset=".27" stopColor="#4893FC" />
                    <stop offset=".777" stopColor="#969DFF" />
                    <stop offset="1" stopColor="#BD99FE" />
                </linearGradient>
            </g>
        </svg>
    ),
};

const features = [
    {
        Icon: FileTextIcon,
        name: "Smart Document Management",
        description: "AI automatically organizes and categorizes your files with intelligent tagging.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <Marquee
                pauseOnHover
                className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
            >
                {files.map((f, idx) => (
                    <figure
                        key={idx}
                        className={cn(
                            "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                            "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                            "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                            "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
                        )}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex flex-col">
                                <figcaption className="text-sm font-medium dark:text-white">
                                    {f.name}
                                </figcaption>
                            </div>
                        </div>
                        <blockquote className="mt-2 text-xs">{f.body}</blockquote>
                    </figure>
                ))}
            </Marquee>
        ),
    },
    {
        Icon: BellIcon,
        name: "Intelligent Notifications",
        description: "Get contextual alerts that help you stay focused on what matters most.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
        ),
    },
    {
        Icon: Share2Icon,
        name: "Seamless Integrations",
        description: "Connect with 100+ tools and platforms to streamline your entire workflow.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
        ),
    },
    {
        Icon: CalendarIcon,
        name: "Smart Scheduling",
        description: "AI-powered calendar optimization that finds the perfect time for deep work.",
        className: "col-span-3 lg:col-span-1",
        href: "#",
        cta: "Learn more",
        background: (
            <CalendarDemo className="absolute left-1/2 top-4 origin-top scale-100 rounded-md  transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_20%,#000_100%)] group-hover:scale-115 transform -translate-x-1/2" />
        ),
    },
];

export function BentoDemo() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Everything you need to streamline your workflow
                    </h2>
                    <p className="text-lg text-gray-600">
                        Powerful features designed to help you work smarter, not harder. From AI-powered automation to seamless integrations.
                    </p>
                </div>
                <div className="max-w-6xl mx-auto">
                    <BentoGrid>
                        {features.map((feature, idx) => (
                            <BentoCard key={idx} {...feature} />
                        ))}
                    </BentoGrid>
                </div>
            </div>
        </section>
    );
}