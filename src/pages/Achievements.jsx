import { useState } from "react";
import { Trophy, Star, Zap, Flame, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const STATIC_ACHIEVEMENTS = [
  { id: "first_workout", name: "First Step", desc: "Complete your first workout", icon: "🏋️", xp: 50, category: "workout", unlocked: true },
  { id: "streak_3", name: "On a Roll", desc: "Maintain a 3-day streak", icon: "🔥", xp: 100, category: "streak", unlocked: true },
  { id: "streak_7", name: "Week Warrior", desc: "Maintain a 7-day streak", icon: "⚡", xp: 250, category: "streak", unlocked: false },
  { id: "streak_30", name: "Iron Discipline", desc: "Maintain a 30-day streak", icon: "💎", xp: 1000, category: "streak", unlocked: false },
  { id: "workouts_10", name: "Getting Serious", desc: "Complete 10 workouts", icon: "💪", xp: 200, category: "workout", unlocked: false },
  { id: "workouts_50", name: "Fitness Junkie", desc: "Complete 50 workouts", icon: "🦾", xp: 500, category: "workout", unlocked: false },
  { id: "nutrition_7", name: "Nutrition Nerd", desc: "Log meals for 7 days", icon: "🥗", xp: 150, category: "nutrition", unlocked: false },
  { id: "sleep_good", name: "Sleep Champion", desc: "Get 8+ hours for 5 nights", icon: "😴", xp: 200, category: "health", unlocked: false },
  { id: "weight_goal", name: "Goal Crusher", desc: "Reach your target weight", icon: "🎯", xp: 500, category: "milestone", unlocked: false },
  { id: "pr_first", name: "Personal Best", desc: "Set your first PR", icon: "🏆", xp: 300, category: "workout", unlocked: false },
  { id: "social_first", name: "Community Star", desc: "Share your first workout", icon: "⭐", xp: 75, category: "social", unlocked: false },
  { id: "ai_coach", name: "Tech Athlete", desc: "Use AI coach 10 times", icon: "🤖", xp: 150, category: "milestone", unlocked: true },
];

const categoryColors = {
  workout: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  streak: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  nutrition: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  health: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  milestone: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  social: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
};

const categories = ["all", "workout", "streak", "nutrition", "health", "milestone", "social"];

export default function Achievements() {
  const [filter, setFilter] = useState("all");

  const filtered = STATIC_ACHIEVEMENTS.filter(a => filter === "all" || a.category === filter);
  const unlocked = STATIC_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalXP = STATIC_ACHIEVEMENTS.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">Achievements</h1>
          <p className="text-muted-foreground text-sm">Level up your fitness journey</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Trophy, label: "Unlocked", value: `${unlocked}/${STATIC_ACHIEVEMENTS.length}`, color: "text-amber-400" },
            { icon: Zap, label: "Total XP", value: totalXP.toLocaleString(), color: "text-purple-400" },
            { icon: Flame, label: "Completion", value: `${Math.round((unlocked/STATIC_ACHIEVEMENTS.length)*100)}%`, color: "text-rose-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <p className="text-lg font-bold font-heading text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* RPG Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-emerald-500/10 border border-purple-500/30 rounded-2xl p-5 mb-6">
          <h3 className="font-heading font-bold text-foreground mb-4">Fitness RPG Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { stat: "STR", label: "Strength", value: 72, color: "#ef4444" },
              { stat: "STA", label: "Stamina", value: 58, color: "#10b981" },
              { stat: "HP", label: "Health", value: 85, color: "#3b82f6" },
              { stat: "MND", label: "Mind", value: 64, color: "#a855f7" },
            ].map(({ stat, label, value, color }) => (
              <div key={stat} className="bg-background/40 rounded-xl p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color }}>{stat}</span>
                  <span className="text-xs text-muted-foreground">{value}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-gradient-to-br ${categoryColors[ach.category]} border rounded-2xl p-4 relative ${!ach.unlocked ? "opacity-50" : ""}`}
            >
              {ach.unlocked && (
                <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-400" />
              )}
              {!ach.unlocked && (
                <Lock className="absolute top-3 right-3 w-4 h-4 text-muted-foreground" />
              )}
              <div className="text-3xl mb-2">{ach.icon}</div>
              <h4 className="font-semibold text-foreground text-sm mb-1">{ach.name}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{ach.desc}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">+{ach.xp} XP</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
