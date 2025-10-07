import { createClient } from '@supabase/supabase-js';

// The Supabase URL and keys are taken from the user's provided HTML script.
// In a production environment, these should be stored securely as environment variables.
const supabaseUrl = 'https://rmroajwsqhgkfpecpeon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcm9handzcWhna2ZwZWNwZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDAzMTYsImV4cCI6MjA3NDExNjMxNn0.lAj4acQN8zFCKZV6UG_xddluT3CzNdvWanlt7n9zFeM';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcm9handzcWhna2ZwZWNwZW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU0MDMxNiwiZXhwIjoyMDc0MTE2MzE2fQ.ZQcRtd7FTsvhFmEsbWHUd4w60PSb3A5flYIO78Kkv_A'; 

// This client uses the anon key and is for public read/write operations (like fetching bookings)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This client uses the service_role key and is for admin-only functions (like listing users)
// It is configured to explicitly use the service key for authorization and to not persist any session,
// ensuring it always bypasses RLS policies correctly.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    global: {
        headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
        },
    },
});
