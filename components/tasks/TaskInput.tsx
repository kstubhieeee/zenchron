"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface TaskInputProps {
  onTasksCreated: (tasks: any[]) => void;
  externalInput?: string;
  onInputChange?: (value: string) => void;
}

export function TaskInput({ onTasksCreated, externalInput, onInputChange }: TaskInputProps) {
  const [input, setInput] = useState(externalInput || '');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Update input when externalInput changes
  useEffect(() => {
    if (externalInput !== undefined) {
      setInput(externalInput);
    }
  }, [externalInput]);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setInput(prev => prev + finalTranscript + ' ');
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      console.log('Submitting input:', input.trim());
      
      // Step 1: Categorize tasks with Gemini AI
      const response = await fetch('/api/tasks/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: input.trim(),
          source: isListening ? 'voice' : 'manual'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Categorize API error:', errorData);
        throw new Error(`Failed to categorize tasks: ${response.status}`);
      }

      const data = await response.json();
      console.log('Categorized tasks:', data);
      
      if (!data.tasks || data.tasks.length === 0) {
        throw new Error('No tasks were generated from the input');
      }
      
      // Step 2: Create tasks in database
      const createdTasks = [];
      for (const task of data.tasks) {
        console.log('Creating task:', task);
        
        const createResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        
        if (createResponse.ok) {
          const createdTask = await createResponse.json();
          console.log('Task created successfully:', createdTask);
          createdTasks.push(createdTask.task);
        } else {
          const errorData = await createResponse.text();
          console.error('Create task API error:', errorData);
        }
      }

      console.log('All created tasks:', createdTasks);
      onTasksCreated(createdTasks);
      setInput('');
      
      // Provide feedback
      if (createdTasks.length > 0) {
        const message = `Created ${createdTasks.length} task${createdTasks.length > 1 ? 's' : ''}`;
        console.log('Success message:', message);
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error('No tasks were successfully created');
      }

    } catch (error) {
      console.error('Failed to process tasks:', error);
      alert(`Failed to process tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          
          
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                onInputChange?.(e.target.value);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Describe your tasks... (e.g., 'Call John about the project tomorrow, review quarterly reports by Friday, quick email to Sarah')"
              className="min-h-[100px] pr-12 resize-none"
              disabled={isProcessing}
            />
            
            {isSpeechSupported && (
              <Button
                type="button"
                variant={isListening ? "default" : "ghost"}
                size="sm"
                className={`absolute bottom-2 right-2 h-8 w-8 p-0 ${
                  isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : ''
                }`}
                onClick={toggleListening}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSpeechSupported && (
                <div className="flex items-center gap-1">
                  {isListening ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>{isListening ? 'Listening...' : 'Voice input available'}</span>
                </div>
              )}
              {!isSpeechSupported && (
                <span>Type your tasks or use Ctrl+Enter to submit</span>
              )}
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Create Tasks'}
            </Button>
          </div>

         
        </div>
      </CardContent>
    </Card>
  );
}