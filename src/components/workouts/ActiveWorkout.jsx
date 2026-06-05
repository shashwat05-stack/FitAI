import { useState, useEffect } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Circle, Clock, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ActiveWorkout({ workout, onBack }) {
  const [sets, setSets] = useState({});
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let interval;
    if (running && !finished) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running, finished]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleSet = (exName, setIdx) => {
    const key = `${exName}-${setIdx}`;
    setSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalSets = workout?.exercises?.reduce((acc, ex) => acc + (ex.sets || 3), 0) || 0;
  const completedSets = Object.values(sets).filter(Boolean).length;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const finishWorkout = async () => {
    setFinished(true);
    const exercisesCompleted = workout?.exercises?.map(ex => ({
      name: ex.name,
      sets_completed: Array.from({ length: ex.sets || 3 }, (_, i) => ({
        reps: parseInt(ex.reps) || 10,
        weight_kg: 0,
        completed: sets[`${ex.name}-${i}`] || false,
      }))
    }));

    await fitnessClient.entities.WorkoutLog.create({
      workout_id: workout?.id,
      workout_name: workout?.name,
      workout_type: workout?.type,
      date: format(new Date(), "yyyy-MM-dd"),
      duration_min: Math.floor(timer / 60),
      calories_burned: workout?.estimated_calories || 0,
      exercises_completed: exercisesCompleted,
      xp_earned: 150,
    });
    toast.success("Workout completed! +150 XP 🎉");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {finished ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Workout Complete!</h2>
            <p className="text-muted-foreground mb-2">{workout?.name}</p>
            <div className="flex justify-center gap-6 my-6">
              <div className="text-center"><p className="text-2xl font-bold text-foreground">{formatTime(timer)}</p><p className="text-xs text-muted-foreground">Duration</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-foreground">{completedSets}</p><p className="text-xs text-muted-foreground">Sets Done</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-primary">+150</p><p className="text-xs text-muted-foreground">XP Earned</p></div>
            </div>
            <Button onClick={onBack} className="gap-2">Back to Workouts</Button>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/30 rounded-2xl p-5 mb-5">
              <h1 className="text-xl font-bold font-heading text-foreground mb-3">{workout?.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-mono font-bold text-foreground">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">{completedSets}/{totalSets} sets</span>
                </div>
                <button onClick={() => setRunning(r => !r)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                  {running ? "Pause" : "Resume"}
                </button>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all"
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              {workout?.exercises?.map((ex, exIdx) => (
                <div key={exIdx} className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-3">{ex.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>{ex.sets} sets × {ex.reps} reps</span>
                    {ex.rest_seconds && <span>• {ex.rest_seconds}s rest</span>}
                    {ex.notes && <span>• {ex.notes}</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: ex.sets || 3 }, (_, si) => {
                      const done = sets[`${ex.name}-${si}`];
                      return (
                        <button
                          key={si}
                          onClick={() => toggleSet(ex.name, si)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            done ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-secondary text-secondary-foreground border border-border hover:bg-muted"
                          }`}
                        >
                          {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                          Set {si + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                onClick={finishWorkout}
                className="w-full gap-2 h-12 text-base bg-gradient-to-r from-purple-500 to-emerald-500 text-white"
              >
                <CheckCircle className="w-5 h-5" /> Finish Workout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
