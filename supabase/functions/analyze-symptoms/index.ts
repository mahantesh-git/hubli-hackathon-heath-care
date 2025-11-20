import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, severity, duration, bodyArea, additionalNotes, checkId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    const systemPrompt = `You are a medical AI assistant. Analyze symptoms and provide preliminary health insights. Always include:
1. A clear urgency level (emergency, consult_doctor, monitor, or self_care)
2. Possible conditions (be cautious and list several possibilities)
3. Home care recommendations when appropriate
4. When to seek immediate medical attention

Be empathetic, clear, and always emphasize that this is not a replacement for professional medical advice.`;

    const userPrompt = `Symptoms: ${symptoms.join(", ")}
Severity: ${severity}
Duration: ${duration}
${bodyArea ? `Body Area: ${bodyArea}` : ''}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Please provide a comprehensive health analysis.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    // Determine urgency based on severity and symptoms
    let urgencyLevel = 'self_care';
    const emergencySymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding'];
    const hasEmergency = symptoms.some((s: string) => 
      emergencySymptoms.some(e => s.toLowerCase().includes(e))
    );
    
    if (hasEmergency || severity === 'severe') {
      urgencyLevel = 'emergency';
    } else if (severity === 'moderate') {
      urgencyLevel = 'consult_doctor';
    }

    // Store suggestion
    await supabase.from('suggestions').insert({
      check_id: checkId,
      suggestions_text: aiText,
      urgency_level: urgencyLevel,
      possible_conditions: null,
      home_remedies: null,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});