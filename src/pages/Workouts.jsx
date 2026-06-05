import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Dumbbell, Clock, Flame, ChevronRight, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import WorkoutBuilder from "@/components/workouts/WorkoutBuilder";
import AIWorkoutGenerator from "@/components/workouts/AIWorkoutGenerator";
import ActiveWorkout from "@/components/workouts/ActiveWorkout";

const workoutTypeColors = {
  strength: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  cardio: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
  hiit: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  flexibility: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
  calisthenics: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  powerlifting: "from-red-500/20 to-red-600/10 border-red-500/30",
  bodybuilding: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
  endurance: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  custom: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
};

const typeBadgeColors = {
  strength: "bg-purple-500/20 text-purple-400",
  cardio: "bg-rose-500/20 text-rose-400",
  hiit: "bg-orange-500/20 text-orange-400",
  calisthenics: "bg-blue-500/20 text-blue-400",
  powerlifting: "bg-red-500/20 text-red-400",
  bodybuilding: "bg-violet-500/20 text-violet-400",
  endurance: "bg-emerald-500/20 text-emerald-400",
  flexibility: "bg-teal-500/20 text-teal-400",
  custom: "bg-gray-500/20 text-gray-400",
};

export default function Workouts() {
  const [view, setView] = useState("list"); // list | builder | ai | active
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => fitnessClient.entities.Workout.list("-created_date", 50),
  });

  const filtered = workouts.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "builder") return <WorkoutBuilder onBack={() => setView("list")} onSave={() => { queryClient.invalidateQueries(["workouts"]); setView("list"); }} />;
  if (view === "ai") return <AIWorkoutGenerator onBack={() => setView("list")} onSave={() => { queryClient.invalidateQueries(["workouts"]); setView("list"); }} />;
  if (view === "active") return <ActiveWorkout workout={selectedWorkout} onBack={() => setView("list")} />;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Workouts</h1>
            <p className="text-muted-foreground text-sm">Track, train, and progress</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setView("ai")} variant="outline" size="sm" className="gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
              <Sparkles className="w-4 h-4" /> AI Generate
            </Button>
            <Button onClick={() => setView("builder")} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New
            </Button>
          </div>
        </motion.div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workouts..." className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">No workouts yet</h3>
            <p className="text-muted-foreground mb-6">Create your first workout or let AI generate one for you</p>
            <Button onClick={() => setView("ai")} className="gap-2 bg-gradient-to-r from-purple-500 to-emerald-500 text-white">
              <Sparkles className="w-4 h-4" /> Generate with AI
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-gradient-to-br ${workoutTypeColors[w.type] || workoutTypeColors.custom} border rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-transform`}
                  onClick={() => { setSelectedWorkout(w); setView("active"); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadgeColors[w.type] || typeBadgeColors.custom}`}>
                        {w.type}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mt-2">{w.name}</h3>
                      {w.target_muscles?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">{w.target_muscles.slice(0, 3).join(", ")}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Dumbbell className="w-3.5 h-3.5" />
                      {w.exercises?.length || 0} exercises
                    </div>
                    {w.estimated_duration_min && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {w.estimated_duration_min} min
                      </div>
                    )}
                    {w.estimated_calories && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="w-3.5 h-3.5" />
                        {w.estimated_calories} kcal
                      </div>
                    )}
                  </div>
                  {w.is_ai_generated && (
                    <div className="mt-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-400">AI Generated</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
