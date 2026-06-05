import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Droplets, Wind, Activity, Thermometer, Plus, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const today = format(new Date(), "yyyy-MM-dd");

const metricConfigs = [
  { key: "heart_rate", icon: Heart, label: "Heart Rate", unit: "bpm", color: "#f43f5e", min: 40, max: 200 },
  { key: "spo2", icon: Wind, label: "SpO2", unit: "%", color: "#06b6d4", min: 85, max: 100 },
  { key: "stress", icon: Brain, label: "Stress Level", unit: "/100", color: "#a855f7", min: 0, max: 100 },
  { key: "steps", icon: Activity, label: "Steps", unit: "steps", color: "#10b981", min: 0, max: 30000 },
  { key: "water_intake", icon: Droplets, label: "Water Intake", unit: "ml", color: "#3b82f6", min: 0, max: 5000 },
  { key: "body_temp", icon: Thermometer, label: "Body Temp", unit: "°C", color: "#f59e0b", min: 35, max: 42 },
];

export default function Health() {
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ metric_type: "heart_rate", value: "", notes: "" });
  const [selectedMetric, setSelectedMetric] = useState("heart_rate");
  const qc = useQueryClient();

  const { data: metrics = [] } = useQuery({
    queryKey: ["health-metrics"],
    queryFn: () => fitnessClient.entities.HealthMetric.list("-created_date", 100),
  });

  const addMutation = useMutation({
    mutationFn: (data) => fitnessClient.entities.HealthMetric.create({ ...data, date: today }),
    onSuccess: () => { qc.invalidateQueries(["health-metrics"]); setShowLog(false); },
  });

  const todayMetrics = metrics.filter(m => m.date === today);
  const getLatest = (type) => metrics.filter(m => m.metric_type === type).sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  const selectedConfig = metricConfigs.find(m => m.key === selectedMetric);
  const chartData = metrics
    .filter(m => m.metric_type === selectedMetric)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .map(m => ({ date: format(new Date(m.date), "MMM d"), value: m.value }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Health Monitoring</h1>
            <p className="text-muted-foreground text-sm">Track your vital signs & metrics</p>
          </div>
          <Button onClick={() => setShowLog(!showLog)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Log Metric
          </Button>
        </motion.div>

        {/* Log form */}
        <AnimatePresence>
          {showLog && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Log Health Metric</h3>
                <Select value={form.metric_type} onValueChange={v => setForm(f => ({ ...f, metric_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {metricConfigs.map(m => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input type="number" placeholder={`Value (${metricConfigs.find(m => m.key === form.metric_type)?.unit})`}
                    value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} className="flex-1" />
                  <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="flex-1" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLog(false)} className="flex-1">Cancel</Button>
                  <Button onClick={() => addMutation.mutate(form)} disabled={!form.value} className="flex-1">Log</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {metricConfigs.map(({ key, icon: Icon, label, unit, color }) => {
            const latest = getLatest(key);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedMetric(key)}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${selectedMetric === key ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/30"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-heading text-foreground">{latest?.value ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">{unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-foreground mb-4">{selectedConfig?.label} Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[selectedConfig?.min, selectedConfig?.max]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke={selectedConfig?.color} strokeWidth={2} dot={{ fill: selectedConfig?.color, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Heart Rate Zones */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Heart Rate Zones</h3>
          <div className="space-y-2">
            {[
              { zone: "Zone 1", label: "Recovery", range: "50-60%", color: "#22c55e", width: 20 },
              { zone: "Zone 2", label: "Fat Burn", range: "60-70%", color: "#84cc16", width: 35 },
              { zone: "Zone 3", label: "Aerobic", range: "70-80%", color: "#f59e0b", width: 55 },
              { zone: "Zone 4", label: "Threshold", range: "80-90%", color: "#f97316", width: 75 },
              { zone: "Zone 5", label: "Max Effort", range: "90-100%", color: "#ef4444", width: 90 },
            ].map(({ zone, label, range, color, width }) => (
              <div key={zone} className="flex items-center gap-3">
                <div className="w-16 text-xs font-medium text-muted-foreground">{zone}</div>
                <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg flex items-center px-2" style={{ width: `${width}%`, backgroundColor: color + "40", borderRight: `3px solid ${color}` }}>
                    <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
                  </div>
                </div>
                <div className="w-16 text-xs text-muted-foreground text-right">{range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
