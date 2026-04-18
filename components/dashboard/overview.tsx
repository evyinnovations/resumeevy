"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Wand2, Download, TrendingUp, PlusCircle,
  ArrowRight, Sparkles, Clock, Target, Zap
} from "lucide-react";
import { formatDate, getAtsScoreColor, cn } from "@/lib/utils";

interface OverviewProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  resumes: Array<{
    id: string;
    title: string;
    profileName: string | null;
    templateId: string;
    status: string;
    atsScore: number | null;
    atsScoreAfter: number | null;
    updatedAt: Date;
    isOriginal: boolean;
  }>;
  usage: {
    resumesCreated: number;
    tailorJobsUsed: number;
    downloadsCount: number;
  } | null;
  subscription: {
    plan: string;
    status: string;
  } | null;
  tailorJobsCount: number;
}

export function DashboardOverview({
  user,
  resumes,
  usage,
  subscription,
  tailorJobsCount,
}: OverviewProps) {
  const firstName = user.name?.split(" ")[0] || "there";
  const isFreePlan = !subscription || subscription.plan === "FREE";

  const stats = [
    {
      label: "Resumes Created",
      value: usage?.resumesCreated ?? 0,
      icon: FileText,
      color: "brand",
      limit: isFreePlan ? "/ 1" : null,
    },
    {
      label: "Resume Tailors",
      value: tailorJobsCount,
      icon: Wand2,
      color: "purple",
      limit: isFreePlan ? "/ 3 this month" : "unlimited",
    },
    {
      label: "Downloads",
      value: usage?.downloadsCount ?? 0,
      icon: Download,
      color: "emerald",
      limit: null,
    },
    {
      label: "Best ATS Score",
      value: resumes.reduce((max, r) => Math.max(max, r.atsScoreAfter ?? r.atsScore ?? 0), 0),
      icon: Target,
      color: "yellow",
      limit: "/ 100",
    },
  ];

  const colorMap: Record<string, string> = {
    brand: "text-brand-700 bg-brand-100",
    purple: "text-purple-600 bg-purple-100",
    emerald: "text-emerald-600 bg-emerald-100",
    yellow: "text-yellow-600 bg-yellow-100",
  };

  const quickActions = [
    {
      label: "Tailor My Resume",
      desc: "AI-match to a job description",
      icon: Wand2,
      href: "/tailor",
      color: "from-brand-700 to-brand-500",
      primary: true,
    },
    {
      label: "Build New Resume",
      desc: "Start from scratch",
      icon: PlusCircle,
      href: "/builder/new",
      color: "from-purple-600 to-purple-400",
      primary: false,
    },
    {
      label: "Browse Templates",
      desc: "20+ ATS-friendly designs",
      icon: Sparkles,
      href: "/templates",
      color: "from-pink-500 to-pink-400",
      primary: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {subscription?.plan === "FREE"
              ? "Free plan — upgrade to unlock unlimited tailors"
              : `${subscription?.plan} plan — all features unlocked`}
          </p>
        </div>
        <Link
          href="/tailor"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer text-sm"
        >
          <Zap className="w-4 h-4" />
          Tailor Resume
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorMap[stat.color])}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.limit && (
                  <span className="text-xs text-slate-400">{stat.limit}</span>
                )}
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map(({ label, desc, icon: Icon, href, color, primary }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "group glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer border",
                primary ? "border-brand-300" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-glow-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-slate-800 mb-1">{label}</div>
              <div className="text-slate-500 text-sm mb-4">{desc}</div>
              <div className="flex items-center gap-1 text-slate-400 text-xs group-hover:text-brand-700 transition-colors">
                Get started
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent resumes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Resumes</h2>
          <Link
            href="/resumes"
            className="text-sm text-brand-700 hover:text-brand-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-brand-700" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-2">No resumes yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first resume or upload an existing one.</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/builder/new"
                className="px-5 py-2.5 bg-gradient-to-r from-brand-700 to-brand-500 text-white text-sm font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer"
              >
                Build New Resume
              </Link>
              <Link
                href="/tailor"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all cursor-pointer"
              >
                Upload & Tailor
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume, i) => {
              const score = resume.atsScoreAfter ?? resume.atsScore;
              return (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-slate-300 transition-all duration-200"
                >
                  {/* Icon */}
                  <div className="w-10 h-12 bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-brand-700" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm truncate">{resume.title}</span>
                      {resume.profileName && (
                        <span className="badge-brand text-[10px] hidden sm:inline-flex">
                          {resume.profileName}
                        </span>
                      )}
                      {!resume.isOriginal && (
                        <span className="badge-success text-[10px] hidden sm:inline-flex">
                          Tailored
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(resume.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* ATS Score */}
                  {score !== null && (
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <div className={`text-lg font-black ${getAtsScoreColor(score)}`}>{score}</div>
                      <div className="text-[10px] text-slate-400">ATS Score</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/builder/${resume.id}`}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                      title="Edit"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Upgrade CTA for free plan */}
      {isFreePlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative glass-card rounded-2xl p-6 border border-brand-200 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-purple-50" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-brand-700" />
                <span className="font-bold text-slate-900">Unlock unlimited tailors</span>
              </div>
              <p className="text-slate-500 text-sm">
                Upgrade to Pro for unlimited AI tailoring, all templates, and Word export.
              </p>
            </div>
            <Link
              href="/billing"
              className="flex-shrink-0 px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer text-sm whitespace-nowrap"
            >
              Upgrade Now
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
