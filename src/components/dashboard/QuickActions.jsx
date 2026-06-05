import { Link } from "react-router-dom";
import { Dumbbell, Apple, Moon, Brain, Activity } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { icon: Dumbbell, label: "Log Workout", path: "/workouts/new", color: "bg-purple-500" },
  { icon: Apple, label: "Log Meal", path: "/nutrition/log", color: "bg-emerald-500" },
  { icon: Moon, label: "Log Sleep", path: "/sleep/log", color: "bg-blue-500" },
  { icon: Activity, label: "Log Metrics", path: "/health/log", color: "bg-rose-500" },
  { icon: Brain, label: "AI Coach", path: "/ai-coach", color: "bg-amber-500" },
];

export default function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-5 gap-3">
        {actions.map(({ icon: Icon, label, path, color }, i) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={path} className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground text-center font-medium group-hover:text-foreground transition-colors">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
