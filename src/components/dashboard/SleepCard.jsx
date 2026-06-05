import { Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function SleepCard({ hours = 7.5, score = 82, deep = 1.8, rem = 2.1 }) {
  const stages = [
    { label: "Awake", pct: 5, color: "#f59e0b" },
    { label: "Light", pct: 40, color: "#6366f1" },
    { label: "Deep", pct: 24, color: "#8b5cf6" },
    { label: "REM", pct: 28, color: "#10b981" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-blue-400" />
          <h3 className="font-heading font-semibold text-foreground">Last Night's Sleep</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-blue-400">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold font-heading text-foreground">{hours}</span>
        <span className="text-lg text-muted-foreground">hrs</span>
      </div>

      {/* Sleep bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-3 gap-0.5">
        {stages.map(({ label, pct, color }) => (
          <motion.div
            key={label}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ backgroundColor: color }}
            className="h-full rounded-sm"
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {stages.map(({ label, pct, color }) => (
          <div key={label} className="text-center">
            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: color }} />
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-xs font-semibold text-foreground">{pct}%</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
