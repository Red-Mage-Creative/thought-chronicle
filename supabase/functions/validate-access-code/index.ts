import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

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
    // This function doesn't require authentication since it's used during signup
    const { accessCode } = await req.json();

    if (!accessCode) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Access code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key for secure access to config
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Securely fetch the signup access code from config
    const { data: configData, error: configError } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'signup_access_code')
      .maybeSingle();

    if (configError) {
      console.error('Error fetching access code config:', configError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!configData) {
      console.error('No signup access code configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Access code not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Normalize and compare access codes
    const normalizedProvidedCode = accessCode.trim().toLowerCase();
    const normalizedConfigCode = configData.value.trim().toLowerCase();
    const isValid = normalizedProvidedCode === normalizedConfigCode;

    return new Response(
      JSON.stringify({ valid: isValid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in validate-access-code function:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});