import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Dumbbell, Apple, Heart, Moon, Users,
  Brain, Trophy, User, Menu, X, Zap, Activity, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Dumbbell, label: "Workouts", path: "/workouts" },
  { icon: Apple, label: "Nutrition", path: "/nutrition" },
  { icon: Heart, label: "Health", path: "/health" },
  { icon: Moon, label: "Sleep", path: "/sleep" },
  { icon: Activity, label: "Body", path: "/body" },
  { icon: Brain, label: "AI Coach", path: "/ai-coach" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: Users, label: "Social", path: "/social" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
          "bg-card border-r border-border",
          isMobile
            ? cn("w-64", sidebarOpen ? "translate-x-0" : "-translate-x-full")
            : "w-16 hover:w-56 group"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className={cn(
            "font-heading font-bold text-foreground text-lg whitespace-nowrap overflow-hidden transition-all duration-300",
            isMobile ? "opacity-100 w-auto" : "opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto"
          )}>
            FitAI
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-xl transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                  isMobile ? "opacity-100 w-auto" : "opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-emerald-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              isMobile ? "opacity-100 w-auto" : "opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto"
            )}>
              <p className="text-xs font-semibold text-foreground whitespace-nowrap">Streak Active</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Keep going!</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur border-b border-border flex items-center px-4 h-14">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold text-foreground">FitAI</span>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300",
        isMobile ? "pl-0 pt-14" : "pl-16"
      )}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur border-t border-border flex justify-around py-2 px-1">
          {navItems.slice(0, 5).map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path} className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
