import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const emptyExercise = () => ({ name: "", sets: 3, reps: "10", rest_seconds: 60, notes: "" });

export default function WorkoutBuilder({ onBack, onSave }) {
  const [form, setForm] = useState({
    name: "", type: "strength", difficulty: "intermediate",
    estimated_duration_min: 45, estimated_calories: 300,
    exercises: [emptyExercise()]
  });
  const [saving, setSaving] = useState(false);

  const updateEx = (i, field, val) => {
    setForm(f => {
      const exercises = [...f.exercises];
      exercises[i] = { ...exercises[i], [field]: val };
      return { ...f, exercises };
    });
  };

  const save = async () => {
    if (!form.name) { toast.error("Please enter a workout name"); return; }
    setSaving(true);
    await fitnessClient.entities.Workout.create(form);
    toast.success("Workout created!");
    onSave();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold font-heading text-foreground mb-6">Build Workout</h1>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <Input placeholder="Workout Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["strength","cardio","hiit","calisthenics","powerlifting","bodybuilding","endurance","flexibility","custom"].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["beginner","intermediate","advanced","elite"].map(d => (
                      <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duration (min)</label>
                <Input type="number" value={form.estimated_duration_min} onChange={e => setForm(f => ({ ...f, estimated_duration_min: +e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Est. Calories</label>
                <Input type="number" value={form.estimated_calories} onChange={e => setForm(f => ({ ...f, estimated_calories: +e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Exercises</h3>
            <AnimatePresence>
              {form.exercises.map((ex, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-muted-foreground">Exercise {i + 1}</span>
                    <button onClick={() => setForm(f => ({ ...f, exercises: f.exercises.filter((_, j) => j !== i) }))}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Input placeholder="Exercise name" value={ex.name} onChange={e => updateEx(i, "name", e.target.value)} />
                    </div>
                    <Input type="number" placeholder="Sets" value={ex.sets} onChange={e => updateEx(i, "sets", +e.target.value)} />
                    <Input placeholder="Reps (e.g. 8-12)" value={ex.reps} onChange={e => updateEx(i, "reps", e.target.value)} />
                    <Input type="number" placeholder="Rest (sec)" value={ex.rest_seconds} onChange={e => updateEx(i, "rest_seconds", +e.target.value)} />
                    <Input placeholder="Notes" value={ex.notes} onChange={e => updateEx(i, "notes", e.target.value)} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button variant="outline" onClick={() => setForm(f => ({ ...f, exercises: [...f.exercises, emptyExercise()] }))} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Exercise
            </Button>
          </div>

          <Button onClick={save} disabled={saving} className="w-full gap-2 h-12 text-base">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
