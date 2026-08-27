(function(){
  const config = window.BarberiaConfig;

  const client = window.supabase?.createClient
    ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { persistSession: false }
      })
    : null;

  window.BarberiaSupabase = { client };
})();
