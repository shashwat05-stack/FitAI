import { useState, useEffect } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { Heart, Droplets, Footprints, Flame, Activity, Wind } from "lucide-react";
import HealthScoreCard from "@/components/dashboard/HealthScoreCard";
import MetricCard from "@/components/dashboard/MetricCard";
import QuickActions from "@/components/dashboard/QuickActions";
import WorkoutStreakCard from "@/components/dashboard/WorkoutStreakCard";
import SleepCard from "@/components/dashboard/SleepCard";
import NutritionRing from "@/components/dashboard/NutritionRing";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  LineChart, Line, ResponsiveContainer, Tooltip
} from "recharts";

const heartRateData = [
  { t: "6am", v: 58 }, { t: "9am", v: 72 }, { t: "12pm", v: 85 },
  { t: "3pm", v: 68 }, { t: "6pm", v: 110 }, { t: "9pm", v: 64 },
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fitnessClient.entities.UserProfile.list().then(p => p.length && setProfile(p[0]));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {greeting()}, {profile?.display_name?.split(" ")[0] || "Athlete"} 👋
          </h1>
        </div>
        <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white font-bold">
          {profile?.display_name?.[0] || "A"}
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left column */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <HealthScoreCard score={78} />
          <WorkoutStreakCard streak={7} xp={2340} level={12} />
        </div>

        {/* Center column */}
        <div className="md:col-span-6 flex flex-col gap-4">
          {/* Heart rate chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <h3 className="font-heading font-semibold text-foreground">Heart Rate</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold font-heading text-rose-400">72</span>
                <span className="text-xs text-muted-foreground">bpm</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={heartRateData}>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v} bpm`, "HR"]}
                />
                <Line type="monotone" dataKey="v" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard icon={Footprints} label="Steps Today" value="8,420" unit="/ 10k" trend={5} color="purple" delay={0.1} />
            <MetricCard icon={Flame} label="Calories Burned" value="487" unit="kcal" trend={12} color="rose" delay={0.15} />
            <MetricCard icon={Droplets} label="Water Intake" value="1.8" unit="/ 2.5L" trend={-8} color="blue" delay={0.2} />
            <MetricCard icon={Activity} label="Active Minutes" value="42" unit="min" trend={18} color="emerald" delay={0.25} />
            <MetricCard icon={Wind} label="SpO2" value="98" unit="%" color="cyan" delay={0.3} />
            <MetricCard icon={Heart} label="HRV" value="52" unit="ms" trend={3} color="amber" delay={0.35} />
          </div>

          <QuickActions />
        </div>

        {/* Right column */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <SleepCard hours={7.5} score={82} />
          <NutritionRing />

          {/* Today's workout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/30 rounded-2xl p-5"
          >
            <h3 className="font-heading font-semibold text-foreground mb-3">Today's Workout</h3>
            <p className="text-sm text-muted-foreground mb-3">Upper Body Strength</p>
            <div className="space-y-2 mb-4">
              {["Bench Press 4x8", "Pull-Ups 3x10", "Shoulder Press 3x10"].map((ex) => (
                <div key={ex} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {ex}
                </div>
              ))}
            </div>
            <Link
              to="/workouts/new"
              className="block w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl text-center hover:bg-primary/90 transition-colors"
            >
              Start Workout
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
