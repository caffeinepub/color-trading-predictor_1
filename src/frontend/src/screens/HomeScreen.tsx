import { useEffect, useRef } from "react";

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 18);
    const drops: number[] = Array(cols).fill(1);
    const chars = "0123456789ABCDEFHIJKLMNOPQRSTUVWXYZ⚡★◆▲▼";

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff4130";
      ctx.font = "14px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 18, drops[i] * 18);
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 60);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Top badge */}
        <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-500/50 rounded-full px-4 py-1">
          <span className="text-yellow-400 text-xs font-bold tracking-widest">
            ★ ELITE VIP SYSTEM ★
          </span>
        </div>

        {/* Main Title */}
        <h1
          className="text-4xl md:text-6xl font-black tracking-wider uppercase"
          style={{
            fontFamily: "Orbitron, monospace",
            color: "#ffd700",
            textShadow:
              "0 0 20px #ffd700, 0 0 40px #ffd70088, 0 0 80px #ffd70044",
          }}
        >
          ⚡ ELITE VIP
          <br />
          <span
            style={{
              color: "#00ff88",
              textShadow: "0 0 20px #00ff88, 0 0 40px #00ff8888",
            }}
          >
            HACK TOOL
          </span>
        </h1>

        {/* Confidence badge */}
        <div
          className="text-xl font-black tracking-widest uppercase px-6 py-2 rounded-lg border-2"
          style={{
            color: "#00ff88",
            borderColor: "#00ff88",
            boxShadow: "0 0 15px #00ff8866, inset 0 0 15px #00ff8811",
            textShadow: "0 0 10px #00ff88",
          }}
        >
          ✅ CONFIDENCE 100%
        </div>

        {/* Pulsing START button */}
        <div className="relative mt-4">
          {/* Outer rings */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#00ff8820", animationDuration: "1.5s" }}
          />
          <div
            className="absolute -inset-3 rounded-full animate-ping"
            style={{
              backgroundColor: "#00ff8810",
              animationDuration: "2s",
              animationDelay: "0.5s",
            }}
          />
          <button
            type="button"
            data-ocid="home.primary_button"
            onClick={onStart}
            className="relative w-40 h-40 rounded-full font-black text-xl uppercase tracking-wider transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "radial-gradient(circle, #00ff8833 0%, #001a0d 100%)",
              border: "3px solid #00ff88",
              color: "#00ff88",
              boxShadow:
                "0 0 30px #00ff88, 0 0 60px #00ff8866, 0 0 100px #00ff8833",
              textShadow: "0 0 15px #00ff88",
              fontFamily: "Orbitron, monospace",
            }}
          >
            START
            <br />
            HACK
          </button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {["🟢 BIG 5-9", "🔴 SMALL 0-4", "🎨 COLOR", "💰 PROFIT"].map((f) => (
            <span
              key={f}
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: "#111",
                border: "1px solid #333",
                color: "#aaa",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Version */}
        <div
          className="px-4 py-1 rounded-full text-sm font-bold tracking-widest"
          style={{
            background: "linear-gradient(90deg, #1a0a00, #2a1500)",
            border: "1px solid #f97316",
            color: "#f97316",
            boxShadow: "0 0 10px #f9731644",
          }}
        >
          v25.0 PREMIUM
        </div>

        <p
          className="font-bold tracking-widest uppercase text-sm"
          style={{ color: "#ffd700", textShadow: "0 0 8px #ffd700" }}
        >
          BIG SMALL COLOR PROFIT GUARANTEED
        </p>

        {/* Footer */}
        <p className="text-xs text-gray-600 mt-4 tracking-widest uppercase">
          Powered by ELITE VIP SYSTEM
        </p>
      </div>
    </div>
  );
}
