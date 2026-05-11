import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
