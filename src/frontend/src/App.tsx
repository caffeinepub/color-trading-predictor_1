import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import PredictionScreen from "./screens/PredictionScreen";

export type Screen = "home" | "prediction";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="min-h-screen bg-black font-rajdhani">
      {screen === "home" ? (
        <HomeScreen onStart={() => setScreen("prediction")} />
      ) : (
        <PredictionScreen onBack={() => setScreen("home")} />
      )}
    </div>
  );
}
