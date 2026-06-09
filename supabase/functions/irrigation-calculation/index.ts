const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plant_name, available_space, soil_moisture, temperature } = await req.json();

    const baseWaterNeed = 5;
    const spaceMultiplier = available_space || 1;
    const moistureAdjustment = soil_moisture === 'dry' ? 1.5 : soil_moisture === 'wet' ? 0.5 : 1;
    const tempAdjustment = temperature > 30 ? 1.3 : temperature < 15 ? 0.8 : 1;

    const dailyWaterNeed = baseWaterNeed * spaceMultiplier * moistureAdjustment * tempAdjustment;

    const schedule = {
      daily_water_need: Math.round(dailyWaterNeed * 10) / 10,
      watering_frequency: dailyWaterNeed > 10 ? 'twice daily' : 'once daily',
      best_time: temperature > 25 ? 'early morning or evening' : 'morning',
      notes: 'Adjust based on weather conditions and plant response',
    };

    return new Response(
      JSON.stringify(schedule),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
