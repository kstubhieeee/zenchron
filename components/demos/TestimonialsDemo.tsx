/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
    {
        name: "Sarah Chen",
        username: "@sarahc_design",
        body: "Zenchron has completely transformed how I manage my design projects. The AI suggestions are spot-on and save me hours every week.",
        img: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
        name: "Marcus Johnson",
        username: "@mjohnson_dev",
        body: "As a developer, I was skeptical about AI workflow tools. Zenchron proved me wrong - it's incredibly intuitive and powerful.",
        img: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
        name: "Emily Rodriguez",
        username: "@emily_startup",
        body: "Running a startup means juggling everything. Zenchron helps me stay organized and focused on what matters most.",
        img: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
        name: "David Kim",
        username: "@davidk_pm",
        body: "The calendar optimization feature alone is worth the subscription. Found 10+ hours of focused work time this month!",
        img: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
        name: "Lisa Thompson",
        username: "@lisa_marketing",
        body: "Zenchron's integrations are seamless. It connects all my tools and makes my workflow so much smoother.",
        img: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    {
        name: "Alex Rivera",
        username: "@alex_freelance",
        body: "I've tried dozens of productivity tools. Zenchron is the first one that actually understands how I work.",
        img: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    {
        name: "Jessica Park",
        username: "@jess_creative",
        body: "The AI insights help me identify patterns in my work I never noticed. My productivity has increased by 40%!",
        img: "https://randomuser.me/api/portraits/women/7.jpg",
    },
    {
        name: "Michael Brown",
        username: "@mike_consultant",
        body: "Client work is unpredictable, but Zenchron helps me adapt quickly. The smart scheduling is a game-changer.",
        img: "https://randomuser.me/api/portraits/men/8.jpg",
    },
    {
        name: "Amanda Foster",
        username: "@amanda_ceo",
        body: "Leading a remote team requires excellent coordination. Zenchron keeps everyone aligned and productive.",
        img: "https://randomuser.me/api/portraits/women/9.jpg",
    },
    {
        name: "Ryan Walsh",
        username: "@ryan_analyst",
        body: "The data insights Zenchron provides about my work patterns are incredible. I've optimized my entire schedule.",
        img: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
        name: "Sophie Martinez",
        username: "@sophie_writer",
        body: "As a content creator, I need to manage multiple projects. Zenchron's AI helps me prioritize and stay creative.",
        img: "https://randomuser.me/api/portraits/women/11.jpg",
    },
    {
        name: "James Wilson",
        username: "@james_coach",
        body: "I recommend Zenchron to all my coaching clients. It's the best tool for building sustainable productivity habits.",
        img: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
        name: "Rachel Green",
        username: "@rachel_ops",
        body: "Operations can be chaotic, but Zenchron brings order to the madness. Our team efficiency has doubled.",
        img: "https://randomuser.me/api/portraits/women/13.jpg",
    },
    {
        name: "Kevin Lee",
        username: "@kevin_founder",
        body: "Building a company requires focus. Zenchron eliminates distractions and helps me work on what truly matters.",
        img: "https://randomuser.me/api/portraits/men/14.jpg",
    },
    {
        name: "Natalie Davis",
        username: "@nat_designer",
        body: "The workflow automation features are brilliant. Zenchron handles the boring stuff so I can focus on creativity.",
        img: "https://randomuser.me/api/portraits/women/15.jpg",
    },
    {
        name: "Chris Taylor",
        username: "@chris_tech",
        body: "I've been in tech for 15 years. Zenchron is the most impressive productivity tool I've ever used.",
        img: "https://randomuser.me/api/portraits/men/16.jpg",
    },
];

const firstRow = reviews.slice(0, 4);
const secondRow = reviews.slice(4, 8);
const thirdRow = reviews.slice(8, 12);
const fourthRow = reviews.slice(12, 16);

const ReviewCard = ({
    img,
    name,
    username,
    body,
}: {
    img: string;
    name: string;
    username: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative h-full w-fit sm:w-80 cursor-pointer overflow-hidden rounded-xl p-4",
                // light styles
                "bg-white  hover:",
                // dark styles
                "dark:bg-gray-800/50 dark:hover:bg-gray-800/70",
                "transition-all duration-200"
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <img className="rounded-full" width="40" height="40" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-semibold dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium text-gray-500 dark:text-white/60">
                        {username}
                    </p>
                </div>
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {body}
            </blockquote>
        </figure>
    );
};

export function TestimonialsDemo() {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="font-bodoni text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Loved by thousands of professionals
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        See what our users are saying about how Zenchron has transformed their productivity.
                    </p>
                </div>
                
                <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
                    <div
                        className="flex flex-row items-center gap-4"
                        style={{
                            transform: "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
                        }}
                    >
                        <Marquee pauseOnHover vertical className="[--duration:20s]">
                            {firstRow.map((review) => (
                                <ReviewCard key={review.username} {...review} />
                            ))}
                        </Marquee>
                        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                            {secondRow.map((review) => (
                                <ReviewCard key={review.username} {...review} />
                            ))}
                        </Marquee>
                        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                            {thirdRow.map((review) => (
                                <ReviewCard key={review.username} {...review} />
                            ))}
                        </Marquee>
                        <Marquee pauseOnHover className="[--duration:20s]" vertical>
                            {fourthRow.map((review) => (
                                <ReviewCard key={review.username} {...review} />
                            ))}
                        </Marquee>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-gray-50 dark:from-gray-900/50"></div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gray-50 dark:from-gray-900/50"></div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-gray-50 dark:from-gray-900/50"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-gray-50 dark:from-gray-900/50"></div>
                </div>
            </div>
        </section>
    );
}