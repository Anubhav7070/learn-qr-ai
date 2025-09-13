import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { message, context } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI teaching assistant helping with educational activities and learning outcomes. You can help with:
- Suggesting learning activities based on outcomes
- Creating lesson plans
- Answering questions about educational content
- Providing feedback on activities
- Helping with assessment strategies

Context: ${context || 'General educational assistance'}`
          },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});