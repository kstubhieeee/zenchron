"use client";

import React from "react";
import { Zap, Globe, MessageSquare, Calendar } from "lucide-react";
import Image from "next/image";

export default function Bento() {
    return (
        <section id="features" className="bg-gray-50 py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <h2 className="text-center text-base font-semibold text-blue-600">Powerful Features</h2>
                <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                    Everything you need to streamline your workflow
                </p>
                <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
                    {/* AI-Powered Task Management */}
                    <div className="relative lg:row-span-2">
                        <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-3xl"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-lg lg:rounded-l-3xl">
                            <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-lg font-medium tracking-tight text-gray-950">AI-Powered Task Management</p>
                                </div>
                                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                    Intelligent task prioritization, automated scheduling, and smart categorization powered by advanced AI algorithms.
                                </p>
                            </div>
                            <div className="relative min-h-96 w-full grow max-lg:mx-auto max-lg:max-w-sm">
                                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12px] border-x-[3px] border-t-[3px] border-gray-300 bg-white shadow-2xl">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
                                            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">AI Optimized</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                <span className="text-sm text-gray-700">Review client proposal</span>
                                                <span className="text-xs text-blue-600 ml-auto">High Priority</span>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span className="text-sm text-gray-700">Team standup meeting</span>
                                                <span className="text-xs text-gray-500 ml-auto">Medium</span>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span className="text-sm text-gray-700">Update documentation</span>
                                                <span className="text-xs text-gray-500 ml-auto">Low</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 lg:rounded-l-3xl"></div>
                    </div>

                    {/* Real-time Collaboration */}
                    <div className="relative max-lg:row-start-1">
                        <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-3xl"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-lg max-lg:rounded-t-3xl">
                            <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-lg font-medium tracking-tight text-gray-950">Real-time Collaboration</p>
                                </div>
                                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                    Seamless team communication with instant updates and synchronized workflows.
                                </p>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                                <div className="w-full max-lg:max-w-xs bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-xs text-white font-medium">A</span>
                                            </div>
                                            <span className="text-sm text-gray-700">Alice updated task status</span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                <span className="text-xs text-white font-medium">B</span>
                                            </div>
                                            <span className="text-sm text-gray-700">Bob added a comment</span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-t-3xl"></div>
                    </div>

                    {/* Smart Integrations */}
                    <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
                        <div className="absolute inset-px rounded-lg bg-white"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
                            <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-lg font-medium tracking-tight text-gray-950">Smart Integrations</p>
                                </div>
                                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                    Connect with 100+ tools including Slack, Gmail, Notion, and Google Calendar.
                                </p>
                            </div>
                            <div className="flex flex-1 items-center max-lg:py-6 lg:pb-2">
                                <div className="grid grid-cols-3 gap-4 w-full px-8 sm:px-10">
                                    <div className="bg-white rounded-lg h-16 w-16 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-200">
                                        <Image src="/slack.svg" alt="Slack" width={32} height={32} />
                                    </div>
                                    <div className="bg-white rounded-lg h-16 w-16 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-200">
                                        <Image src="/gmail.svg" alt="Gmail" width={32} height={32} />
                                    </div>
                                    <div className="bg-white rounded-lg h-16 w-16 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-200">
                                        <Image src="/notion.svg" alt="Notion" width={32} height={32} />
                                    </div>
                                    <div className="bg-white rounded-lg h-16 w-16 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-200">
                                        <Image src="/calendar.svg" alt="Google Calendar" width={32} height={32} />
                                    </div>
                                    <div className="bg-white rounded-lg h-16 w-16 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-200">
                                        <Image src="/gmeet.svg" alt="Google Meet" width={32} height={32} />
                                    </div>
                                    <div className="bg-white rounded-lg h-16 w-16 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-200">
                                        <Image src="/gemini.svg" alt="Google Gemini" width={32} height={32} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5"></div>
                    </div>

                    {/* Advanced Analytics */}
                    <div className="relative lg:row-span-2">
                        <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-3xl lg:rounded-r-3xl"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-lg max-lg:rounded-b-3xl lg:rounded-r-3xl">
                            <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-lg font-medium tracking-tight text-gray-950">Advanced Analytics</p>
                                </div>
                                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                                    Comprehensive insights into your productivity patterns and team performance metrics.
                                </p>
                            </div>
                            <div className="relative min-h-96 w-full grow">
                                <div className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl ring-1 ring-white/10">
                                    <div className="flex bg-gray-900 ring-1 ring-white/5">
                                        <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                                            <div className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                                                Analytics.tsx
                                            </div>
                                            <div className="border-r border-gray-600/10 px-4 py-2">Dashboard.tsx</div>
                                        </div>
                                    </div>
                                    <div className="px-6 pt-6 pb-14">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-white">
                                                <span className="text-sm">Weekly Performance</span>
                                                <span className="text-green-400 text-sm">+12%</span>
                                            </div>
                                            <div className="h-32 bg-gray-800 rounded-lg p-4 relative overflow-hidden">
                                                <svg className="w-full h-full" viewBox="0 0 300 100">
                                                    <path
                                                        d="M 0 80 Q 75 60 150 50 T 300 40"
                                                        stroke="#3B82F6"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        className="drop-shadow-sm"
                                                    />
                                                    <circle cx="150" cy="50" r="3" fill="#3B82F6" />
                                                </svg>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="text-gray-400">
                                                    <div>Tasks Completed</div>
                                                    <div className="text-white font-semibold">247</div>
                                                </div>
                                                <div className="text-gray-400">
                                                    <div>Time Saved</div>
                                                    <div className="text-white font-semibold">15.2h</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-b-3xl lg:rounded-r-3xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}