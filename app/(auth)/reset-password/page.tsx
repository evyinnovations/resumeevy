"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FE] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-[#1A28C1]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#4D5EDB]/5 rounded-full blur-[100px] pointer-events-none" />
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1A28C1] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#0F1235]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ResumeEvy
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0F1235] mt-6 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Set new password
          </h1>
          <p className="text-slate-500 text-sm">Must be at least 8 characters with an uppercase letter and number.</p>
        </div>

        <div className="bg-white border border-[#C5C5E8] rounded-2xl p-8 shadow-[0_4px_24px_rgba(26,40,193,0.06)]">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-[#0F1235] mb-2">Password updated</h2>
              <p className="text-slate-500 text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              {!token && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Invalid reset link. Please{" "}
                  <Link href="/forgot-password" className="underline font-medium">request a new one</Link>.
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="w-full bg-[#F5F5FE] border border-[#C5C5E8] text-slate-800 placeholder:text-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-[#1A28C1]/20 focus:border-[#1A28C1]/40
                                 rounded-xl px-4 py-3 pr-12 text-sm transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full flex items-center justify-center gap-2 py-3.5 btn-primary rounded-xl shadow-lg shadow-[#1A28C1]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Reset password
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                <Link href="/login" className="text-[#1A28C1] hover:text-[#1520A0] font-semibold transition-colors cursor-pointer">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
