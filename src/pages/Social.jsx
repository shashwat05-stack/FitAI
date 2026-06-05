import { useState } from "react";
import { fitnessClient } from "@/api/fitnessClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const postTypeColors = {
  workout: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  transformation: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  achievement: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  challenge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  general: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const LEADERBOARD = [
  { name: "Alex Chen", level: 24, xp: 12400, streak: 45, avatar: "AC" },
  { name: "Sarah Kim", level: 21, xp: 10800, streak: 32, avatar: "SK" },
  { name: "Mike Ross", level: 19, xp: 9600, streak: 28, avatar: "MR" },
  { name: "Emma Liu", level: 17, xp: 8200, streak: 21, avatar: "EL" },
  { name: "You", level: 12, xp: 2340, streak: 7, avatar: "ME", isMe: true },
];

export default function Social() {
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState("feed");
  const [form, setForm] = useState({ content: "", post_type: "workout", author_name: "You" });
  const qc = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fitnessClient.entities.SocialPost.list("-created_date", 20),
  });

  const createMutation = useMutation({
    mutationFn: (data) => fitnessClient.entities.SocialPost.create(data),
    onSuccess: () => { qc.invalidateQueries(["posts"]); setShowCreate(false); setForm({ content: "", post_type: "workout", author_name: "You" }); toast.success("Posted!"); },
  });

  const likeMutation = useMutation({
    mutationFn: (post) => fitnessClient.entities.SocialPost.update(post.id, { likes: (post.likes || 0) + 1 }),
    onSuccess: () => qc.invalidateQueries(["posts"]),
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Community</h1>
            <p className="text-muted-foreground text-sm">Connect, share, compete</p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Post
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {["feed", "leaderboard"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {t === "feed" ? "Feed" : "Leaderboard"}
            </button>
          ))}
        </div>

        {/* Create post */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <Select value={form.post_type} onValueChange={v => setForm(f => ({ ...f, post_type: v }))}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["workout","transformation","achievement","challenge","general"].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Share your fitness journey..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                  <Button onClick={() => createMutation.mutate(form)} disabled={!form.content} className="flex-1">Share</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === "feed" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to share your fitness journey!</p>
                <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Post</Button>
              </div>
            ) : (
              <AnimatePresence>
                {posts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {(post.author_name || "U")[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{post.author_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg border ${postTypeColors[post.post_type] || postTypeColors.general}`}>
                        {post.post_type}
                      </span>
                    </div>
                    <p className="text-foreground text-sm mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 pt-3 border-t border-border">
                      <button onClick={() => likeMutation.mutate(post)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-400 transition-colors">
                        <Heart className="w-4 h-4" /> {post.likes || 0}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-4 h-4" /> {post.comments_count || 0}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-400 transition-colors ml-auto">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Weekly Leaderboard</h3>
              <p className="text-xs text-muted-foreground">Top performers this week</p>
            </div>
            {LEADERBOARD.map((user, i) => (
              <div key={user.name} className={`flex items-center gap-3 p-4 ${user.isMe ? "bg-primary/5 border-l-2 border-primary" : ""} ${i < LEADERBOARD.length - 1 ? "border-b border-border" : ""}`}>
                <div className="w-8 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-muted-foreground text-sm">#{i+1}</span>}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${user.isMe ? "bg-primary" : "bg-gradient-to-br from-purple-500 to-emerald-500"}`}>
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{user.name} {user.isMe && <span className="text-xs text-primary">(you)</span>}</p>
                  <p className="text-xs text-muted-foreground">Level {user.level} · {user.streak}🔥</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-sm">{user.xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
