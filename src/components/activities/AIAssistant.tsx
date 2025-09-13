import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface AIAssistantProps {
  context?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ context }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI teaching assistant. I can help you with learning activities, lesson planning, and educational strategies. What would you like to know?",
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          message: input,
          context: context || 'Educational activity assistance'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message,
        sender: 'assistant',
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>AI Teaching Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 w-full pr-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'assistant' && (
                  <Bot className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.sender === 'user' && (
                  <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <Bot className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me about activities, learning outcomes, or lesson planning..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};