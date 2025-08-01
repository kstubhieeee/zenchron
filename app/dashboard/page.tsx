"use client";

import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Plus, Send } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [taskInput, setTaskInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTaskInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      alert("Speech recognition is not supported in your browser");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = () => {
    if (taskInput.trim()) {
      // Here you would typically send the task to your API
      console.log("New task:", taskInput);
      alert(`Task added: ${taskInput}`);
      setTaskInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-xl text-gray-600">
            What would you like to accomplish today?
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add New Task
            </CardTitle>
            <CardDescription>
              Type or speak your task, deadline, or todo item. Be as detailed as you'd like.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="e.g., 'Prepare client presentation for Friday meeting', 'Call dentist to schedule appointment by end of week', 'Review project proposal and send feedback by tomorrow 5pm'..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[120px] pr-16 text-base resize-none"
                rows={4}
              />
              
              {/* Voice Input Button */}
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                className="absolute bottom-3 right-3"
                onClick={isListening ? stopListening : startListening}
                disabled={!recognition}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {isListening && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                Listening... Speak your task now
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                💡 Tip: Press Ctrl+Enter to quickly add your task
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={!taskInput.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Tasks</CardTitle>
            <CardDescription>
              Click any example to try it out
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Review quarterly budget report by Friday 3pm",
                "Schedule team meeting for next week",
                "Call client about project timeline tomorrow",
                "Prepare presentation slides for Monday meeting",
                "Send invoice to ABC Company by end of day",
                "Book flight for business trip next month"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setTaskInput(example)}
                  className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Recognition Status */}
        {!recognition && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <Mic className="h-5 w-5" />
                <span className="font-medium">Voice input not available</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Voice recognition is not supported in your current browser. Try using Chrome, Edge, or Safari for voice input functionality.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}