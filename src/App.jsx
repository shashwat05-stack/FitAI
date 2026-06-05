import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';

// Page imports
import Dashboard from '@/pages/Dashboard';
import Workouts from '@/pages/Workouts';
import WorkoutNew from '@/pages/WorkoutNew';
import Nutrition from '@/pages/Nutrition';
import Health from '@/pages/Health';
import Sleep from '@/pages/Sleep';
import Body from '@/pages/Body';
import AICoach from '@/pages/AICoach';
import Achievements from '@/pages/Achievements';
import Social from '@/pages/Social';
import Profile from '@/pages/Profile';

// Auth Page imports
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If loading and we are on a protected route, show the splash screen
  if ((isLoadingPublicSettings || isLoadingAuth) && !isPublicRoute) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading FitAI...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if auth fails and we are on a protected route
  if (authError && !isPublicRoute) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/new" element={<WorkoutNew />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/nutrition/log" element={<Nutrition />} />
        <Route path="/health" element={<Health />} />
        <Route path="/health/log" element={<Health />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/sleep/log" element={<Sleep />} />
        <Route path="/body" element={<Body />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/social" element={<Social />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
