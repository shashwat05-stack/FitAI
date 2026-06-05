import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Star, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const today = format(new Date(), "yyyy-MM-dd");

export default function Sleep() {
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ total_hours: "", deep_sleep_hours: "", rem_sleep_hours: "", light_sleep_hours: "", sleep_score: "", bedtime: "22:30", wake_time: "06:30" });
  const qc = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ["sleep-logs"],
    queryFn: () => fitnessClient.entities.SleepLog.list("-date", 30),
  });

  const addMutation = useMutation({
    mutationFn: (data) => fitnessClient.entities.SleepLog.create({ ...data, date: today }),
    onSuccess: () => { qc.invalidateQueries(["sleep-logs"]); setShowLog(false); },
  });

  const lastLog = logs[0];
  const avgSleep = logs.slice(0, 7).reduce((a, l) => a + (l.total_hours || 0), 0) / Math.min(logs.length, 7) || 0;
  const avgScore = logs.slice(0, 7).reduce((a, l) => a + (l.sleep_score || 0), 0) / Math.min(logs.length, 7) || 0;

  const chartData = logs.slice(0, 7).reverse().map(l => ({
    date: format(new Date(l.date), "EEE"),
    total: l.total_hours || 0,
    deep: l.deep_sleep_hours || 0,
    rem: l.rem_sleep_hours || 0,
    light: l.light_sleep_hours || 0,
  }));

  const scoreColor = (s) => s >= 85 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Sleep Tracker</h1>
            <p className="text-muted-foreground text-sm">Optimize your recovery</p>
          </div>
          <Button onClick={() => setShowLog(!showLog)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Log Sleep
          </Button>
        </motion.div>

        {/* Log form */}
        <AnimatePresence>
          {showLog && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Log Last Night's Sleep</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Bedtime</label>
                    <Input type="time" value={form.bedtime} onChange={e => setForm(f => ({ ...f, bedtime: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Wake Time</label>
                    <Input type="time" value={form.wake_time} onChange={e => setForm(f => ({ ...f, wake_time: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Total Hours</label>
                    <Input type="number" step="0.5" placeholder="7.5" value={form.total_hours} onChange={e => setForm(f => ({ ...f, total_hours: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Sleep Score (/100)</label>
                    <Input type="number" placeholder="80" value={form.sleep_score} onChange={e => setForm(f => ({ ...f, sleep_score: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Deep Sleep (hrs)</label>
                    <Input type="number" step="0.5" placeholder="1.5" value={form.deep_sleep_hours} onChange={e => setForm(f => ({ ...f, deep_sleep_hours: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">REM Sleep (hrs)</label>
                    <Input type="number" step="0.5" placeholder="2.0" value={form.rem_sleep_hours} onChange={e => setForm(f => ({ ...f, rem_sleep_hours: +e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLog(false)} className="flex-1">Cancel</Button>
                  <Button onClick={() => addMutation.mutate(form)} disabled={!form.total_hours} className="flex-1">Log Sleep</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Last Night", value: `${lastLog?.total_hours || 0}h`, sub: "hours slept", color: "from-blue-500/20 to-indigo-600/10 border-blue-500/30" },
            { label: "7-Day Avg", value: `${avgSleep.toFixed(1)}h`, sub: "average sleep", color: "from-purple-500/20 to-violet-600/10 border-purple-500/30" },
            { label: "Sleep Score", value: `${Math.round(lastLog?.sleep_score || 0)}`, sub: "last night", color: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30" },
          ].map(({ label, value, sub, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${color} border rounded-2xl p-4`}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold font-heading text-foreground my-1">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h3 className="font-semibold text-foreground mb-4">7-Day Sleep Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="deep" stackId="a" fill="#8b5cf6" radius={[0,0,0,0]} name="Deep" />
                <Bar dataKey="rem" stackId="a" fill="#10b981" name="REM" />
                <Bar dataKey="light" stackId="a" fill="#6366f1" radius={[4,4,0,0]} name="Light" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* AI Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-500/20 to-blue-600/10 border border-indigo-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-foreground">AI Sleep Coach Tips</h3>
          </div>
          <div className="space-y-2">
            {[
              "Maintain a consistent sleep schedule, even on weekends",
              "Avoid screens 1 hour before bed to improve melatonin production",
              "Keep your bedroom temperature between 16-19°C for optimal sleep",
              "Your deep sleep is below optimal — try magnesium supplementation",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <Star className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
