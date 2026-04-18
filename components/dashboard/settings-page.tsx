"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Lock, Bell, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface SettingsPageProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  } | null;
}

export function SettingsPage({ user }: SettingsPageProps) {
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    setChangingPassword(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated. Please sign in again.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          Settings
        </h1>
      </div>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-brand-700" />
          <h2 className="font-bold text-slate-800">Profile Information</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {getInitials(user?.name || user?.email || "U")}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{user?.name || "User"}</div>
            <div className="text-slate-500 text-sm">{user?.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark w-full"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
            <input
              value={user?.email || ""}
              disabled
              className="input-dark w-full opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-brand-700" />
          <h2 className="font-bold text-slate-800">Security</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-dark w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                className="input-dark w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={changingPassword || !currentPassword || !newPassword}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-brand-700" />
          <h2 className="font-bold text-slate-800">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "Resume tailor complete", desc: "Get notified when AI finishes tailoring", enabled: true },
            { label: "Weekly job tips", desc: "Tips to improve your resume and search", enabled: false },
            { label: "New template releases", desc: "When new templates are added", enabled: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="font-medium text-slate-800 text-sm">{item.label}</div>
                <div className="text-slate-400 text-xs mt-0.5">{item.desc}</div>
              </div>
              <div className={`w-10 h-6 rounded-full ${item.enabled ? "bg-brand-700" : "bg-slate-200"} relative cursor-pointer transition-colors`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${item.enabled ? "left-5" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 border border-red-200"
      >
        <h2 className="font-bold text-red-500 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
          <div>
            <div className="font-medium text-slate-800 text-sm">Delete Account</div>
            <div className="text-slate-400 text-xs mt-0.5">Permanently delete your account and all data</div>
          </div>
          <button className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 text-sm font-medium rounded-xl transition-all cursor-pointer">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
