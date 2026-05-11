"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@sipersum.local",
      password: "admin123",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      router.push("/beranda");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Login gagal",
        text: error instanceof Error ? error.message : "Terjadi kesalahan.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input {...register("email")} placeholder="admin@sipersum.local" />
        {errors.email ? (
          <p className="text-sm text-danger">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Kata sandi</label>
        <Input {...register("password")} type="password" placeholder="********" />
        {errors.password ? (
          <p className="text-sm text-danger">{errors.password.message}</p>
        ) : null}
      </div>
      <Button className="w-full" size="lg" disabled={loading} type="submit">
        {loading ? "Memproses..." : "Masuk ke Beranda"}
      </Button>
      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Demo akun:
        <br />
        admin@sipersum.local / admin123
        <br />
        sekcam@sipersum.local / sekcam123
        <br />
        camat@sipersum.local / camat123
      </div>
    </form>
  );
}
