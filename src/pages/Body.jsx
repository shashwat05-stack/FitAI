import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingDown, TrendingUp, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const today = format(new Date(), "yyyy-MM-dd");

export default function Body() {
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ weight_kg: "", body_fat_pct: "", muscle_mass_kg: "", water_pct: "", visceral_fat: "" });
  const qc = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ["body-logs"],
    queryFn: () => fitnessClient.entities.BodyComposition.list("-date", 60),
  });

  const addMutation = useMutation({
    mutationFn: (data) => {
      const weight = parseFloat(data.weight_kg);
      const fat = parseFloat(data.body_fat_pct) || 0;
      const bmi = weight ? (weight / ((1.75 * 1.75))).toFixed(1) : null;
      const bmr = weight ? Math.round(10 * weight + 6.25 * 175 - 5 * 28 + 5) : null;
      return fitnessClient.entities.BodyComposition.create({ ...data, date: today, bmi: +bmi, bmr });
    },
    onSuccess: () => { qc.invalidateQueries(["body-logs"]); setShowLog(false); },
  });

  const latest = logs[0];
  const prev = logs[1];
  const weightDiff = latest && prev ? (latest.weight_kg - prev.weight_kg).toFixed(1) : null;

  const weightData = logs.slice(0, 30).reverse().map(l => ({
    date: format(new Date(l.date), "MMM d"),
    weight: l.weight_kg,
    fat: l.body_fat_pct,
    muscle: l.muscle_mass_kg,
  }));

  const metrics = [
    { key: "weight_kg", label: "Weight", unit: "kg", color: "#6366f1" },
    { key: "body_fat_pct", label: "Body Fat", unit: "%", color: "#f59e0b" },
    { key: "muscle_mass_kg", label: "Muscle Mass", unit: "kg", color: "#10b981" },
    { key: "water_pct", label: "Water %", unit: "%", color: "#3b82f6" },
    { key: "bmi", label: "BMI", unit: "", color: "#a855f7" },
    { key: "visceral_fat", label: "Visceral Fat", unit: "", color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Body Composition</h1>
            <p className="text-muted-foreground text-sm">Track your transformation</p>
          </div>
          <Button onClick={() => setShowLog(!showLog)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Log Today
          </Button>
        </motion.div>

        {/* Log form */}
        <AnimatePresence>
          {showLog && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Log Body Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "weight_kg", label: "Weight (kg) *", placeholder: "75.5" },
                    { key: "body_fat_pct", label: "Body Fat (%)", placeholder: "18.5" },
                    { key: "muscle_mass_kg", label: "Muscle Mass (kg)", placeholder: "35.2" },
                    { key: "water_pct", label: "Water (%)", placeholder: "55.0" },
                    { key: "visceral_fat", label: "Visceral Fat", placeholder: "9" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                      <Input type="number" step="0.1" placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLog(false)} className="flex-1">Cancel</Button>
                  <Button onClick={() => addMutation.mutate(form)} disabled={!form.weight_kg} className="flex-1">Log</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current stats */}
        {latest && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {metrics.map(({ key, label, unit, color }) => {
              const val = latest[key];
              return val ? (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-4">
                  <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: color }} />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-heading text-foreground">{val}</span>
                    {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </motion.div>
              ) : null;
            })}
          </div>
        )}

        {/* Weight trend */}
        {weightData.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Weight Trend</h3>
              {weightDiff !== null && (
                <div className={`flex items-center gap-1 text-sm font-medium ${+weightDiff <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {+weightDiff <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {weightDiff > 0 ? "+" : ""}{weightDiff} kg
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Empty state */}
        {!latest && (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">No measurements yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking your body composition</p>
            <Button onClick={() => setShowLog(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Log First Measurement
            </Button>
          </div>
        )}

        {/* History */}
        {logs.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Measurement History</h3>
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{format(new Date(log.date), "MMM d, yyyy")}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="font-medium text-foreground">{log.weight_kg}kg</span>
                    {log.body_fat_pct && <span className="text-muted-foreground">{log.body_fat_pct}% fat</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
