import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://maquqwrakaevtsxclnzz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcXVxd3Jha2FldnRzeGNsbnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NzIzMTgsImV4cCI6MjA3OTU0ODMxOH0.Sgo18e2RMm2_FN_wkKXpwWGP9oEug83K2Rbedxe_CK0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
