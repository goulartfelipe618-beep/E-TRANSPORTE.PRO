const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Domínio é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitized = domain.trim().toLowerCase().replace(/[^a-z0-9.\-]/g, '');

    console.log('Looking up domain:', sanitized);

    const res = await fetch(`https://brasilapi.com.br/api/registrobr/v1/${encodeURIComponent(sanitized)}`);

    if (res.status === 404) {
      return new Response(
        JSON.stringify({ success: true, available: true, domain: sanitized, status: 'AVAILABLE' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (res.ok) {
      const data = await res.json();
      return new Response(
        JSON.stringify({
          success: true,
          available: false,
          domain: sanitized,
          status: data.status_dns || data.status || 'REGISTERED',
          fqdn: data.fqdn || null,
          hosts: data.hosts || [],
          publicationStatus: data.publication_status || null,
          expiresAt: data.expires_at || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Erro na API: ${res.status}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Domain lookup error:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
