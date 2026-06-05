import { motion } from "framer-motion";

function Ring({ value, max, color, size = 60, strokeWidth = 8, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.min((value / max), 1) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export default function NutritionRing({ calories = 1820, calGoal = 2200, protein = 142, carbs = 189, fat = 62 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-5"
    >
      <h3 className="font-heading font-semibold text-foreground mb-4">Today's Nutrition</h3>
      <div className="flex items-center gap-4">
        <Ring value={calories} max={calGoal} color="#10b981" size={90} strokeWidth={10}>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground leading-none">{calories}</p>
            <p className="text-[9px] text-muted-foreground">kcal</p>
          </div>
        </Ring>
        <div className="flex-1 space-y-2">
          {[
            { label: "Protein", value: protein, max: 160, unit: "g", color: "#6366f1" },
            { label: "Carbs", value: carbs, max: 250, unit: "g", color: "#f59e0b" },
            { label: "Fat", value: fat, max: 80, unit: "g", color: "#ef4444" },
          ].map(({ label, value, max, unit, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value}{unit}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((value/max)*100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
