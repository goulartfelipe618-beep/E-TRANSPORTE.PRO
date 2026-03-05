import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT - only authenticated users can use this
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query, type } = await req.json();
    if (!query || typeof query !== "string" || query.length < 3 || query.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get map config from system_settings using service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await adminClient
      .from("system_settings")
      .select("key, value")
      .in("key", ["map_provider", "map_api_key"]);

    let mapProvider = "";
    let mapApiKey = "";
    if (settings) {
      for (const s of settings) {
        if (s.key === "map_provider") mapProvider = s.value || "";
        if (s.key === "map_api_key") mapApiKey = s.value || "";
      }
    }

    if (!mapApiKey || !mapProvider) {
      return new Response(JSON.stringify({ error: "Map not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle different request types
    if (type === "autocomplete") {
      let results: Array<{ id: string; place_name: string }> = [];

      if (mapProvider === "mapbox") {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapApiKey}&language=pt-BR&country=BR&limit=5`
        );
        const data = await res.json();
        results = (data.features || []).map((f: any) => ({ id: f.id, place_name: f.place_name }));
      } else if (mapProvider === "google") {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${mapApiKey}&language=pt-BR&region=br`
        );
        const data = await res.json();
        results = (data.results || []).slice(0, 5).map((r: any) => ({ id: r.place_id, place_name: r.formatted_address }));
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "static_map") {
      const { lat, lng, width, height } = await req.json().catch(() => ({ lat: 0, lng: 0, width: 600, height: 350 }));
      // Return the URL - the edge function acts as a proxy for the key
      let url = "";
      if (mapProvider === "mapbox") {
        url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},13,0/${width || 600}x${height || 350}@2x?access_token=${mapApiKey}`;
      } else if (mapProvider === "google") {
        url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=13&size=${width || 600}x${height || 350}&scale=2&markers=color:red|${lat},${lng}&key=${mapApiKey}`;
      }

      if (!url) {
        return new Response(JSON.stringify({ error: "No URL generated" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch the image and return it
      const imgRes = await fetch(url);
      const imgBlob = await imgRes.blob();
      return new Response(imgBlob, {
        headers: {
          ...corsHeaders,
          "Content-Type": imgRes.headers.get("Content-Type") || "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
