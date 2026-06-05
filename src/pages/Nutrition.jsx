import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Sparkles, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
const mealColors = { breakfast: "text-amber-400", lunch: "text-emerald-400", dinner: "text-blue-400", snack: "text-purple-400" };

export default function Nutrition() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [showAdd, setShowAdd] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [newMeal, setNewMeal] = useState({ meal_type: "breakfast", food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "" });
  const qc = useQueryClient();

  const { data: meals = [] } = useQuery({
    queryKey: ["meals", today],
    queryFn: () => fitnessClient.entities.MealLog.filter({ date: today }),
  });

  const addMutation = useMutation({
    mutationFn: (data) => fitnessClient.entities.MealLog.create({ ...data, date: today }),
    onSuccess: () => { qc.invalidateQueries(["meals"]); setShowAdd(false); setNewMeal({ meal_type: "breakfast", food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "" }); toast.success("Meal logged!"); },
  });

  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein_g || 0),
    carbs: acc.carbs + (m.carbs_g || 0),
    fat: acc.fat + (m.fat_g || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const aiScan = async () => {
    if (!aiQuery) return;
    setAiLoading(true);
    const result = await fitnessClient.integrations.Core.InvokeLLM({
      prompt: `Estimate the nutritional information for: "${aiQuery}". Provide calories, protein, carbs, and fat in grams. Be accurate and concise.`,
      response_json_schema: {
        type: "object",
        properties: {
          food_name: { type: "string" },
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          fiber_g: { type: "number" },
        }
      }
    });
    setNewMeal(n => ({ ...n, ...result, food_name: result.food_name || aiQuery }));
    setAiLoading(false);
    setShowAdd(true);
    toast.success("Nutrition data retrieved!");
  };

  const byMeal = mealTypes.reduce((acc, type) => {
    acc[type] = meals.filter(m => m.meal_type === type);
    return acc;
  }, {});

  const calGoal = 2200;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Nutrition</h1>
            <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Log Meal
          </Button>
        </motion.div>

        {/* Calories overview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground">Daily Summary</h3>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">{calGoal} kcal goal</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold font-heading text-foreground">{totals.calories}</span>
            <span className="text-muted-foreground">/ {calGoal} kcal</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div
              animate={{ width: `${Math.min((totals.calories / calGoal) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Protein", val: totals.protein, unit: "g", goal: 160, color: "#6366f1" },
              { label: "Carbs", val: totals.carbs, unit: "g", goal: 250, color: "#f59e0b" },
              { label: "Fat", val: totals.fat, unit: "g", goal: 80, color: "#ef4444" },
            ].map(({ label, val, unit, goal, color }) => (
              <div key={label} className="bg-background/40 rounded-xl p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{Math.round(val)}{unit}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((val/goal)*100,100)}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI food scanner */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-foreground text-sm">AI Food Scanner</h3>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Describe food (e.g. 2 scrambled eggs with toast)"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && aiScan()}
              className="flex-1"
            />
            <Button onClick={aiScan} disabled={aiLoading} size="sm" className="gap-2 bg-purple-500 hover:bg-purple-600 text-white">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Add meal form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Log Meal</h3>
                <Select value={newMeal.meal_type} onValueChange={v => setNewMeal(m => ({ ...m, meal_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {mealTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Food name *" value={newMeal.food_name} onChange={e => setNewMeal(m => ({ ...m, food_name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Calories" value={newMeal.calories} onChange={e => setNewMeal(m => ({ ...m, calories: +e.target.value }))} />
                  <Input type="number" placeholder="Protein (g)" value={newMeal.protein_g} onChange={e => setNewMeal(m => ({ ...m, protein_g: +e.target.value }))} />
                  <Input type="number" placeholder="Carbs (g)" value={newMeal.carbs_g} onChange={e => setNewMeal(m => ({ ...m, carbs_g: +e.target.value }))} />
                  <Input type="number" placeholder="Fat (g)" value={newMeal.fat_g} onChange={e => setNewMeal(m => ({ ...m, fat_g: +e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
                  <Button onClick={() => addMutation.mutate(newMeal)} disabled={!newMeal.food_name} className="flex-1">Log Meal</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meals by type */}
        {mealTypes.map(type => (
          <div key={type} className="mb-5">
            <h3 className={`font-semibold text-sm mb-2 ${mealColors[type]}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            {byMeal[type].length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">No {type} logged</p>
              </div>
            ) : (
              <div className="space-y-2">
                {byMeal[type].map(meal => (
                  <div key={meal.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{meal.food_name}</p>
                      <p className="text-xs text-muted-foreground">P: {meal.protein_g}g  C: {meal.carbs_g}g  F: {meal.fat_g}g</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">{meal.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
