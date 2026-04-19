import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
