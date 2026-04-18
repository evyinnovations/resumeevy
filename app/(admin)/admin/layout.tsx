import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F5F5FE]">
      <header className="border-b border-[#D8D8F0] bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">A</span>
          </div>
          <span className="font-bold text-slate-900">ResumeEvy Admin</span>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 ml-1">
            Admin Access
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-[#1A28C1] transition-colors font-medium"
        >
          ← Back to App
        </Link>
      </header>
      <main className="p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
