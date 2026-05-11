export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SIPERSUM AI",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "surat-masuk",
  sessionSecret: process.env.SESSION_SECRET ?? "development-secret-change-me",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY ?? "",
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
