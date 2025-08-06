"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { FloatingIcons } from "@/components/ui/floating-icons"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { EnhancedNavbar } from "@/components/ui/enhanced-navbar"
import { PricingSection, PricingTier } from "@/components/landing/PricingSection";
import { BentoDemo } from "@/components/landing/BentoDemo";
import { HeroVideoDialogDemo } from "@/components/demos/HeroVideoDialogDemo";
import { AvatarCirclesDemo } from "@/components/demos/AvatarCirclesDemo";
import { TestimonialsDemo } from "@/components/demos/TestimonialsDemo";
import {
  Check,
  ArrowRight,
  Play,
  Zap,
  MessageSquare,
  Calendar,
  Shield,
  Globe,
  ChevronDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const companies = [
    { name: "Gmail", logo: "/gmail.svg" },
    { name: "Slack", logo: "/slack.svg" },
    { name: "Notion", logo: "/notion.svg" },
    { name: "Google Calendar", logo: "/calendar.svg" },
    { name: "Google Meet", logo: "/gmeet.svg" },
    { name: "Google Gemini", logo: "/gemini.svg" },
  ]

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "CTO at InnovaTech",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "The AI-driven analytics from #QuantumInsights have revolutionized our product development cycle. Insights are now more accurate and faster than ever. A game-changer for tech companies.",
    },
    {
      name: "Carlos Gomez",
      role: "Head of R&D at ScienceBoost",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "#TrendSetter's market analysis AI has transformed how we approach fashion trends. Our campaigns are now data-driven with higher customer engagement. Revolutionizing fashion marketing.",
    },
    {
      name: "Samantha Lee",
      role: "Marketing Director at NextGen Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "As a startup, we need to move fast and stay ahead. #CodeAI's automated coding assistant helps us do just that. Our development speed has doubled. Essential tool for any startup.",
    },
    {
      name: "Aisha Khan",
      role: "Chief Marketing Officer at Fashion Forward",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "Implementing #MediCareAI in our patient care systems has improved patient outcomes significantly. Technology and healthcare working hand in hand for better health. A milestone in medical technology.",
    },
    {
      name: "Nadia Ali",
      role: "Product Manager at Creative Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "#LearnSmart's AI-driven personalized learning plans have doubled student performance metrics. Education tailored to every learner's needs. Transforming the educational landscape.",
    },
    {
      name: "Sofia Patel",
      role: "CEO at EduTech Innovations",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "With #CyberShield's AI-powered security systems, our data protection levels are unmatched. Ensuring safety and trust in digital spaces. Redefining cybersecurity standards.",
    },
    {
      name: "Jake Morrison",
      role: "Director of IT at HealthTech Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "By integrating #GreenTech's sustainable energy solutions, we've seen a significant reduction in our carbon footprint. Innovation and sustainability go hand in hand.",
    },
  ]

  const faqs = [
    {
      question: "What is an AI Agent?",
      answer:
        "An AI Agent is an intelligent software system that can understand, learn, and act autonomously to help you complete tasks and make decisions. Zenchron specifically focuses on streamlining workflows and automating repetitive tasks.",
    },
    {
      question: "How does Zenchron work?",
      answer:
        "Zenchron integrates with your existing tools and learns from your work patterns. It uses advanced AI to automate tasks, provide insights, and help coordinate team activities in real-time.",
    },
    {
      question: "How secure is my data?",
      answer:
        "We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is never shared with third parties and remains completely private.",
    },
    {
      question: "Can I integrate my existing tools?",
      answer:
        "Yes! Zenchron integrates with over 100+ popular tools including Slack, Google Workspace, Microsoft 365, Notion, Trello, and many more. We're constantly adding new integrations.",
    },
    {
      question: "Is there a free trial available?",
      answer: "We offer a 14-day free trial with full access to all features. No credit card required to get started.",
    },
    {
      question: "How does Zenchron save me time?",
      answer:
        "Zenchron automates repetitive tasks, provides intelligent scheduling, offers real-time insights, and helps coordinate team activities. Most users save 10-15 hours per week.",
    },
  ]

  const pricingData = {
    title: "Pricing that scales with you",
    description: "Whichever plan you pick, it's free until you love your docs. That's our promise.",
    pricingItems: [
      {
        name: "Free",
        price: "$0",
        yearlyPrice: "$0",
        description: "Perfect for individual users",
        features: [
          "Custom domain",
          "SEO optimizations",
          "Auto-generated API docs",
          "Built-in components library"
        ],
        buttonText: "Start Free",
        buttonColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        isPopular: false,
      },
      {
        name: "Startup",
        price: "$12",
        yearlyPrice: "$9",
        description: "Ideal for professionals and small teams",
        features: [
          "Custom domain",
          "SEO optimizations",
          "Auto-generated API docs",
          "Built-in components library",
          "E-commerce integration",
          "User authentication system",
          "Multi-language support",
          "Real-time collaboration tools",
          "Advanced analytics dashboard",
          "Priority email support",
          "Custom branding options",
          "Webhook integrations"
        ],
        buttonText: "Upgrade to Pro",
        buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
        isPopular: true,
      },
      {
        name: "Enterprise",
        price: "$24",
        yearlyPrice: "$19",
        description: "Best for large teams and enterprise-level organizations",
        features: [
          "Custom domain",
          "SEO optimizations",
          "Auto-generated API docs",
          "Built-in components library",
          "Real-time collaboration tools"
        ],
        buttonText: "Contact Sales",
        buttonColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        isPopular: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Blue Navbar */}
      <EnhancedNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 pt-16 pb-20 sm:pt-24 sm:pb-32">

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}

              {/* Hero Headline */}
              <div className="mb-6 mt-32">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Meet your AI Agent
                  <br />
                  <span className="text-gray-800">Streamline your workflow</span>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="mb-8">
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  AI assistant designed to streamline your digital workflows and handle mundane tasks, so you can focus
                  on what truly matters
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="mb-16 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard/tasks">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium h-12">
                    Try for Free
                  </Button>
                </Link>
                <Link href="/dashboard/tasks">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 text-base font-medium h-12">
                    Log in
                  </Button>
                </Link>
              </div>

              {/* Avatar Circles */}
              <div className="mb-8 flex justify-center">
                <AvatarCirclesDemo />
              </div>

              {/* Demo Video Section */}
              <div className="relative max-w-4xl mx-auto">
                <HeroVideoDialogDemo />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <BentoDemo />

        {/* Testimonials Section */}
        <TestimonialsDemo />

        {/* Pricing Section */}
        <PricingSection {...pricingData} />

        {/* Testimonials Section */}


        {/* FAQ Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Answers to common questions about Zenchron and its features. If you have any other questions, please
                don't hesitate to contact us.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? "transform rotate-180" : ""
                        }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to streamline your workflow?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of teams who have transformed their productivity with Zenchron. Start your free trial
                today and see the difference.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard/tasks">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 h-12">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 h-12 bg-transparent"
                >
                  Schedule Demo
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm text-blue-100 mt-8">
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="h-4 w-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg">
                  <img 
                    src="/zenn.png" 
                    alt="Zenchron Logo" 
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <span className="text-xl font-bold">Zenchron</span>
              </div>
              <p className="text-gray-400 text-sm">
                Streamline your workflow, amplify your success. The intelligent project management platform for modern
                teams.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} Zenchron. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 sm:mt-0">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
