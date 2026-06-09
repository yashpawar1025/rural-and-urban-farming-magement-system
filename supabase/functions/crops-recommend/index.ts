const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { location, season, soil_type, available_space } = await req.json();

    if (!location || !season || !soil_type || !available_space) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recommendations = [
      { name: 'Lettuce', expected_yield_per_sqm: 2.5, care_difficulty: 'Easy', description: 'Fast-growing leafy green, ideal for small spaces' },
      { name: 'Spinach', expected_yield_per_sqm: 2.0, care_difficulty: 'Easy', description: 'Nutrient-rich, grows well in cool weather' },
      { name: 'Cherry Tomatoes', expected_yield_per_sqm: 4.0, care_difficulty: 'Medium', description: 'High yield, requires support structure' },
      { name: 'Herbs (Basil, Mint)', expected_yield_per_sqm: 1.5, care_difficulty: 'Easy', description: 'Low maintenance, continuous harvest' },
      { name: 'Radish', expected_yield_per_sqm: 3.0, care_difficulty: 'Easy', description: 'Quick harvest, perfect for beginners' },
    ];

    const selectedRecommendations = recommendations.slice(0, 3 + Math.floor(Math.random() * 2));

    return new Response(
      JSON.stringify({ recommended_crops: selectedRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});