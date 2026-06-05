import { useNavigate } from "react-router-dom";
import WorkoutBuilder from "@/components/workouts/WorkoutBuilder";

export default function WorkoutNew() {
  const navigate = useNavigate();
  return <WorkoutBuilder onBack={() => navigate("/workouts")} onSave={() => navigate("/workouts")} />;
}
