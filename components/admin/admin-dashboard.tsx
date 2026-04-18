"use client";

import { motion } from "framer-motion";
import { Users, FileText, Wand2, DollarSign, TrendingUp, UserPlus, CreditCard, Repeat } from "lucide-react";
import { formatDate, getAtsScoreColor } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalResumes: number;
    totalTailor: number;
    paidSubs: number;
    newUsersThisMonth: number;
    newSubsThisMonth: number;
    mrr: number;
    lifetimeRevenue: number;
    revenueThisMonth: number;
    planBreakdown: Record<string, number>;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    role: string;
    subscription: { plan: string; status: string } | null;
  }>;
  recentResumes: Array<{
    id: string;
    title: string;
    userId: string;
    atsScore: number | null;
    createdAt: string;
    user: { name: string | null; email: string | null } | null;
  }>;
  chartData: Array<{ month: string; users: number }>;
}

const PLAN_COLORS: Record<string, string> = {
  MONTHLY: "#1A28C1",
  SIX_MONTH: "#4D5EDB",
  YEARLY: "#10B981",
  LIFETIME: "#F59E0B",
};

const PLAN_LABELS: Record<string, string> = {
  MONTHLY: "Monthly ($19)",
  SIX_MONTH: "6-Month ($14/mo)",
  YEARLY: "Yearly ($9/mo)",
  LIFETIME: "Lifetime ($199)",
};

export function AdminDashboard({ stats, recentUsers, recentResumes, chartData }: AdminDashboardProps) {
  const topCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), sub: `+${stats.newUsersThisMonth} this month`, icon: Users, color: "text-[#1A28C1] bg-[#1A28C1]/10" },
    { label: "MRR", value: `$${stats.mrr.toLocaleString()}`, sub: "Monthly recurring revenue", icon: Repeat, color: "text-emerald-600 bg-emerald-100" },
    { label: "Revenue This Month", value: `$${stats.revenueThisMonth.toLocaleString()}`, sub: `${stats.newSubsThisMonth} new subs`, icon: DollarSign, color: "text-yellow-600 bg-yellow-100" },
    { label: "Lifetime Revenue", value: `$${stats.lifetimeRevenue.toLocaleString()}`, sub: `${stats.planBreakdown?.LIFETIME || 0} lifetime subs`, icon: CreditCard, color: "text-purple-600 bg-purple-100" },
    { label: "Paid Subscribers", value: stats.paidSubs.toLocaleString(), sub: "Active + trialing", icon: UserPlus, color: "text-pink-600 bg-pink-100" },
    { label: "AI Tailors Run", value: stats.totalTailor.toLocaleString(), sub: "All time", icon: Wand2, color: "text-sky-600 bg-sky-100" },
    { label: "Resumes Created", value: stats.totalResumes.toLocaleString(), sub: "All time", icon: FileText, color: "text-indigo-600 bg-indigo-100" },
  ];

  const pieData = Object.entries(stats.planBreakdown).map(([plan, count]) => ({
    name: PLAN_LABELS[plan] || plan,
    value: count,
    color: PLAN_COLORS[plan] || "#94a3b8",
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time platform overview</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.slice(0, 4).map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-[#C5C5E8] rounded-2xl p-5 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{card.label}</div>
              <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {topCards.slice(4).map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 4) * 0.07 }}
              className="bg-white border border-[#C5C5E8] rounded-2xl p-5 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{card.label}</div>
              <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border border-[#C5C5E8] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
        >
          <h3 className="text-sm font-semibold text-slate-800 mb-6">New Signups (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                  labelStyle={{ color: "#0f172a" }}
                />
                <Bar dataKey="users" fill="#1A28C1" radius={[4, 4, 0, 0]} name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No signup data yet</div>
          )}
        </motion.div>

        {/* Plan breakdown pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="bg-white border border-[#C5C5E8] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
        >
          <h3 className="text-sm font-semibold text-slate-800 mb-6">Revenue by Plan</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                  formatter={(value: number, name: string) => [`${value} subs`, name]}
                />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No paid subscribers yet</div>
          )}
        </motion.div>
      </div>

      {/* Plan breakdown table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48 }}
        className="bg-white border border-[#C5C5E8] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
      >
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Plan Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-3 font-medium">Plan</th>
                <th className="text-left pb-3 font-medium">Subscribers</th>
                <th className="text-left pb-3 font-medium">Price</th>
                <th className="text-left pb-3 font-medium">Est. Monthly Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.entries(stats.planBreakdown).length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400">No paid subscribers yet</td></tr>
              ) : (
                Object.entries(stats.planBreakdown).map(([plan, count]) => {
                  const prices: Record<string, { display: string; monthly: number }> = {
                    MONTHLY:    { display: "$19/mo",   monthly: 19 },
                    SIX_MONTH:  { display: "$84/6mo",  monthly: 14 },
                    YEARLY:     { display: "$108/yr",  monthly: 9  },
                    LIFETIME:   { display: "$199 once", monthly: 0  },
                  };
                  const p = prices[plan] || { display: "—", monthly: 0 };
                  return (
                    <tr key={plan} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: PLAN_COLORS[plan] || "#94a3b8" }}
                          />
                          <span className="font-medium text-slate-800">{plan}</span>
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 font-semibold">{count}</td>
                      <td className="py-3 text-slate-500">{p.display}</td>
                      <td className="py-3 font-semibold text-emerald-600">
                        ${(count * p.monthly).toLocaleString()}
                        {plan === "LIFETIME" && <span className="text-slate-400 font-normal text-xs ml-1">(one-time)</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {Object.keys(stats.planBreakdown).length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="pt-3 font-bold text-slate-900" colSpan={3}>Total MRR</td>
                  <td className="pt-3 font-black text-[#1A28C1] text-base">${stats.mrr.toLocaleString()}/mo</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white border border-[#C5C5E8] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
      >
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Signups</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-3 font-medium">User</th>
                <th className="text-left pb-3 font-medium">Plan</th>
                <th className="text-left pb-3 font-medium">Role</th>
                <th className="text-left pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-slate-900">{user.name || "—"}</div>
                    <div className="text-slate-400 text-xs">{user.email}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.subscription?.plan && user.subscription.plan !== "FREE"
                        ? "bg-[#1A28C1]/10 text-[#1A28C1]"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {user.subscription?.plan || "FREE"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-medium ${user.role === "ADMIN" ? "text-red-500" : "text-slate-400"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Resumes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62 }}
        className="bg-white border border-[#C5C5E8] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,40,193,0.05)]"
      >
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Resumes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-3 font-medium">Resume</th>
                <th className="text-left pb-3 font-medium">User</th>
                <th className="text-left pb-3 font-medium">ATS Score</th>
                <th className="text-left pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentResumes.map((resume) => (
                <tr key={resume.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-900">{resume.title}</td>
                  <td className="py-3 text-slate-500 text-xs">{resume.user?.email}</td>
                  <td className="py-3">
                    {resume.atsScore ? (
                      <span className={`font-bold ${getAtsScoreColor(resume.atsScore)}`}>
                        {resume.atsScore}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-400 text-xs">{formatDate(resume.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
