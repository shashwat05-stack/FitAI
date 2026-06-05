import { Flame, Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkoutStreakCard({ streak = 7, xp = 2340, level = 12 }) {
  const xpToNextLevel = 3000;
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground">Your Progress</h3>
        <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">{streak} days</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-white font-heading">{level}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">Level {level}</span>
            <span className="text-xs text-muted-foreground">{xp} / {xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Trophy, label: "Badges", value: "14" },
          { icon: Star, label: "PRs", value: "8" },
          { icon: Zap, label: "Workouts", value: "47" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-background/40 rounded-xl p-2.5 text-center">
            <Icon className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-base font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
