"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { LogoMark } from "@/components/shared/logo-mark";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  agreeTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
});

type FormData = z.infer<typeof schema>;

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const PLAN_MAP: Record<string, string> = {
  monthly: "MONTHLY",
  yearly: "YEARLY",
  lifetime: "LIFETIME",
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const planKey = planParam ? PLAN_MAP[planParam.toLowerCase()] : null;

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed.");
        return;
      }

      // Sign in, then do a full-page navigation so the session cookie is
      // guaranteed to be set before the checkout-redirect API reads it.
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (planKey) {
        window.location.href = `/api/stripe/checkout-redirect?plan=${planParam}`;
      } else {
        window.location.href = "/billing";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: string) => {
    setSocialLoading(provider);
    const callbackUrl = planParam ? `/api/stripe/checkout-redirect?plan=${planParam}` : "/billing";
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-[#F5F5FE] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-[#1A28C1]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-[#4D5EDB]/5 rounded-full blur-[100px] pointer-events-none" />
      {/* Subtle grid — matches landing hero */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#1A28C1 1px, transparent 1px), linear-gradient(90deg, #1A28C1 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1A28C1] flex items-center justify-center">
              <LogoMark className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#0F1235]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ResumeEvy
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0F1235] mt-6 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Create your account
          </h1>
          <p className="text-slate-500 text-sm">Free to start · 3 resume tailors included</p>
        </div>

        <div className="bg-white border border-[#C5C5E8] rounded-2xl p-8 shadow-[0_4px_24px_rgba(26,40,193,0.06)]">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Social */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleSocial("google")}
              disabled={!!socialLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#F5F5FE] hover:bg-[#EDEDFC] border border-[#C5C5E8] hover:border-[#A8A8D8] rounded-xl text-slate-600 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {socialLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </button>
            <button
              onClick={() => handleSocial("github")}
              disabled={!!socialLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#F5F5FE] hover:bg-[#EDEDFC] border border-[#C5C5E8] hover:border-[#A8A8D8] rounded-xl text-slate-600 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {socialLoading === "github" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 fill-slate-600" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#D8D8F0]" />
            <span className="text-slate-400 text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-[#D8D8F0]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
              <input
                {...register("name")}
                type="text"
                placeholder="Alex Johnson"
                autoComplete="name"
                className="w-full bg-[#F5F5FE] border border-[#C5C5E8] text-slate-800 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-[#1A28C1]/20 focus:border-[#1A28C1]/40
                           rounded-xl px-4 py-3 text-sm transition-all duration-200"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-[#F5F5FE] border border-[#C5C5E8] text-slate-800 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-[#1A28C1]/20 focus:border-[#1A28C1]/40
                           rounded-xl px-4 py-3 text-sm transition-all duration-200"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-[#F5F5FE] border border-[#C5C5E8] text-slate-800 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-[#1A28C1]/20 focus:border-[#1A28C1]/40
                             rounded-xl px-4 py-3 pr-12 text-sm transition-all duration-200"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map(({ label, test }) => (
                    <div key={label} className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-3 h-3 flex-shrink-0 ${test(password) ? "text-[#10B981]" : "text-slate-300"}`}
                      />
                      <span className={`text-xs ${test(password) ? "text-[#10B981]" : "text-slate-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input
                {...register("agreeTerms")}
                type="checkbox"
                id="agreeTerms"
                className="mt-0.5 w-4 h-4 rounded accent-[#1A28C1] cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-slate-500 text-sm leading-relaxed cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-[#1A28C1] hover:text-[#1520A0] transition-colors">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#1A28C1] hover:text-[#1520A0] transition-colors">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-red-500 text-xs">{errors.agreeTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 btn-primary rounded-xl shadow-lg shadow-[#1A28C1]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Account
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1A28C1] hover:text-[#1520A0] font-semibold transition-colors cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { Suspense } from "react";
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
