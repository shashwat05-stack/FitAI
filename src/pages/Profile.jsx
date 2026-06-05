import { useState, useEffect } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Flame, Trophy, Zap, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const GOALS = ["lose_fat","build_muscle","maintain","endurance","strength","flexibility","general_health"];
const ACTIVITY = ["sedentary","lightly_active","moderately_active","very_active","extremely_active"];
const EXPERIENCE = ["beginner","intermediate","advanced","elite"];
const DIETS = ["none","vegetarian","vegan","keto","paleo","mediterranean","high_protein"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fitnessClient.entities.UserProfile.list().then(p => {
      if (p.length) { setProfile(p[0]); setForm(p[0]); }
    });
  }, []);

  const save = async () => {
    setSaving(true);
    if (profile?.id) {
      await fitnessClient.entities.UserProfile.update(profile.id, form);
    } else {
      const p = await fitnessClient.entities.UserProfile.create(form);
      setProfile(p);
    }
    setSaving(false);
    setEditing(false);
    toast.success("Profile saved!");
  };

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading text-foreground">Profile</h1>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
          ) : (
            <Button size="sm" onClick={save} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </motion.div>

        {/* Avatar & level */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-emerald-500/10 border border-purple-500/30 rounded-2xl p-6 mb-5 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
            {form.display_name?.[0] || "?"}
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground">{form.display_name || "Set your name"}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {form.fitness_goal?.replace(/_/g, " ") || "No goal set"} · {form.activity_level?.replace(/_/g, " ") || "No activity level"}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-foreground">{profile?.xp || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-foreground">{profile?.level || 1}</span>
              </div>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-foreground">{profile?.streak_days || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
                <Input value={form.display_name || ""} onChange={e => f("display_name", e.target.value)} disabled={!editing} placeholder="Your name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                  <Input type="number" value={form.age || ""} onChange={e => f("age", +e.target.value)} disabled={!editing} placeholder="25" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                  <Select value={form.gender || ""} onValueChange={v => f("gender", v)} disabled={!editing}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
                  <Input type="number" value={form.height_cm || ""} onChange={e => f("height_cm", +e.target.value)} disabled={!editing} placeholder="175" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                  <Input type="number" step="0.1" value={form.weight_kg || ""} onChange={e => f("weight_kg", +e.target.value)} disabled={!editing} placeholder="75" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Target Weight (kg)</label>
                  <Input type="number" step="0.1" value={form.target_weight_kg || ""} onChange={e => f("target_weight_kg", +e.target.value)} disabled={!editing} placeholder="70" />
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Profile */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Fitness Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fitness Goal</label>
                <Select value={form.fitness_goal || ""} onValueChange={v => f("fitness_goal", v)} disabled={!editing}>
                  <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                  <SelectContent>
                    {GOALS.map(g => <SelectItem key={g} value={g}>{g.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Activity Level</label>
                <Select value={form.activity_level || ""} onValueChange={v => f("activity_level", v)} disabled={!editing}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Experience Level</label>
                <Select value={form.fitness_experience || ""} onValueChange={v => f("fitness_experience", v)} disabled={!editing}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE.map(e => <SelectItem key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dietary Preference</label>
                <Select value={form.dietary_preference || ""} onValueChange={v => f("dietary_preference", v)} disabled={!editing}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {DIETS.map(d => <SelectItem key={d} value={d}>{d.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Daily Goals</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "daily_calorie_goal", label: "Calories", placeholder: "2200" },
                { key: "daily_water_goal_ml", label: "Water (ml)", placeholder: "2500" },
                { key: "daily_step_goal", label: "Steps", placeholder: "10000" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                  <Input type="number" value={form[key] || ""} onChange={e => f(key, +e.target.value)} disabled={!editing} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => fitnessClient.auth.logout()}
            className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-4 text-rose-400 hover:bg-rose-500/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
