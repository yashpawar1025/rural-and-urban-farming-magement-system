import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image_url } = await req.json();

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: 'image_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const diseases = [
      { name: 'Leaf Blight', confidence: 0.85, treatment: 'Apply copper-based fungicide. Remove affected leaves. Ensure proper air circulation.' },
      { name: 'Powdery Mildew', confidence: 0.78, treatment: 'Spray with neem oil or sulfur-based fungicide. Improve air circulation and reduce humidity.' },
      { name: 'Bacterial Spot', confidence: 0.92, treatment: 'Remove infected plants. Apply copper spray. Practice crop rotation.' },
      { name: 'Healthy Plant', confidence: 0.95, treatment: 'No treatment needed. Continue regular care and monitoring.' },
    ];

    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];

    return new Response(
      JSON.stringify({
        disease: randomDisease.name,
        confidence: randomDisease.confidence,
        treatment: randomDisease.treatment,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});