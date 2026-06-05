import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, CheckCircle, Dumbbell, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AIWorkoutGenerator({ onBack, onSave }) {
  const [params, setParams] = useState({
    goal: "muscle_gain", type: "strength", experience: "intermediate",
    duration: "45", equipment: "full_gym", focus: "upper_body"
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const generate = async () => {
    setLoading(true);
    const result = await fitnessClient.integrations.Core.InvokeLLM({
      prompt: `Generate a detailed workout plan with the following parameters:
Goal: ${params.goal}
Workout Type: ${params.type}
Experience Level: ${params.experience}
Duration: ${params.duration} minutes
Equipment: ${params.equipment}
Focus Area: ${params.focus}

Provide a complete workout with 4-8 exercises including sets, reps, rest times, and coaching notes. Make it challenging but appropriate for the experience level.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          difficulty: { type: "string" },
          estimated_duration_min: { type: "number" },
          estimated_calories: { type: "number" },
          target_muscles: { type: "array", items: { type: "string" } },
          description: { type: "string" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                sets: { type: "number" },
                reps: { type: "string" },
                rest_seconds: { type: "number" },
                notes: { type: "string" }
              }
            }
          }
        }
      }
    });
    setGenerated(result);
    setLoading(false);
  };

  const save = async () => {
    await fitnessClient.entities.Workout.create({ ...generated, is_ai_generated: true });
    toast.success("Workout saved!");
    onSave();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">AI Workout Generator</h1>
            <p className="text-sm text-muted-foreground">Let AI create your perfect workout</p>
          </div>
        </div>

        {!generated ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            {[
              { key: "goal", label: "Fitness Goal", options: [["muscle_gain","Muscle Gain"],["fat_loss","Fat Loss"],["strength","Strength"],["endurance","Endurance"],["general","General Fitness"]] },
              { key: "type", label: "Workout Type", options: [["strength","Strength Training"],["cardio","Cardio"],["hiit","HIIT"],["calisthenics","Calisthenics"],["bodybuilding","Bodybuilding"]] },
              { key: "experience", label: "Experience Level", options: [["beginner","Beginner"],["intermediate","Intermediate"],["advanced","Advanced"]] },
              { key: "duration", label: "Duration", options: [["30","30 minutes"],["45","45 minutes"],["60","60 minutes"],["90","90 minutes"]] },
              { key: "equipment", label: "Equipment", options: [["full_gym","Full Gym"],["dumbbells","Dumbbells Only"],["barbell","Barbell & Rack"],["bodyweight","No Equipment"],["resistance_bands","Resistance Bands"]] },
              { key: "focus", label: "Focus Area", options: [["upper_body","Upper Body"],["lower_body","Lower Body"],["full_body","Full Body"],["push","Push (Chest/Shoulders/Tris)"],["pull","Pull (Back/Biceps)"],["legs","Legs"]] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
                <Select value={params[key]} onValueChange={v => setParams(p => ({ ...p, [key]: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button onClick={generate} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-purple-500 to-emerald-500 text-white h-12 text-base">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Workout</>}
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-gradient-to-br from-purple-500/20 to-emerald-500/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">AI Generated</span>
                  </div>
                  <h2 className="text-xl font-bold font-heading text-foreground">{generated.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{generated.description}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> {generated.estimated_duration_min} min
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="w-4 h-4" /> {generated.estimated_calories} kcal
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Dumbbell className="w-4 h-4" /> {generated.exercises?.length} exercises
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {generated.exercises?.map((ex, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{ex.name}</h4>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {ex.sets}×{ex.reps}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Rest: {ex.rest_seconds}s</span>
                    {ex.notes && <span className="text-muted-foreground/70">• {ex.notes}</span>}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setGenerated(null)} className="flex-1">Regenerate</Button>
              <Button onClick={save} className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-emerald-500 text-white">
                <CheckCircle className="w-4 h-4" /> Save Workout
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
