"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/lib/hooks/useAuth";
import { isAxiosError } from "axios";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const errorMessage = (() => {
    if (!error) return null;
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) return "Invalid credentials";
      if (status === 429) return "Too many login attempts. Please wait before trying again.";
      return error.response?.data?.detail ?? "Login failed";
    }
    if (error instanceof Error) return error.message;
    return "Login failed";
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {/* Brand hero strip */}
          <div className="flex flex-col items-center gap-2 bg-brand-gradient px-8 pt-12 pb-10 text-white">
            <Image
              src="/homy-logo-white.png"
              alt="homy"
              width={180}
              height={60}
              priority
              className="h-12 w-auto"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
              Admin
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Sign in</h2>
              <p className="mt-1 text-sm text-neutral-500">Homy platform administration</p>
            </div>

            <form onSubmit={handleSubmit((v) => login(v))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
