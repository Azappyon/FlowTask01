// Configuração pública do Supabase.
// A URL e a chave "anon" são públicas por design (o acesso é protegido por RLS).
// Usa variáveis de ambiente quando definidas (ex.: na Vercel) e cai para os
// valores padrão do projeto Flowtask caso não existam.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://eziqxqyyzfpxaquzejhg.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6aXF4cXl5emZweGFxdXplamhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODgwMzgsImV4cCI6MjA5NjM2NDAzOH0.O10CIN2L2ZbTojejmd1A1Abi06zDbWJ6p03Mw0MeRA4";
