import { Toaster } from "@/components/ui/sonner";
import { Loader2, Star, TrendingUp, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ColorSignal, type Prediction } from "./backend.d";
import {
  useGetRecentPredictions,
  useSubmitPrediction,
} from "./hooks/useQueries";

// ─── Color helpers ────────────────────────────────────────────────────────────
const COLOR_META: Record<
  ColorSignal,
  { label: string; hex: string; glowClass: string }
> = {
  [ColorSignal.red]: {
    label: "RED",
    hex: "#E04646",
    glowClass: "text-glow-red",
  },
  [ColorSignal.green]: {
    label: "GREEN",
    hex: "#33E06F",
    glowClass: "text-glow-green",
  },
  [ColorSignal.violet]: {
    label: "VIOLET",
    hex: "#8B5CF6",
    glowClass: "text-glow-violet",
  },
};

const SIGNAL_BARS = [40, 65, 85, 100];

function formatTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MedalIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="medal-icon w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
      {children}
    </div>
  );
}

function SignalBars({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {SIGNAL_BARS.map((pct) => (
        <motion.div
          key={pct}
          className="w-2 rounded-sm"
          style={{ backgroundColor: color, height: `${pct}%` }}
          initial={{ height: 4 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: pct * 0.002, duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction | null }) {
  const isBig = prediction ? prediction.result : null;
  return (
    <div className="card-vip p-6 flex flex-col items-center gap-4 min-h-[260px] justify-between transition-all duration-300">
      <MedalIcon>
        <TrendingUp className="w-6 h-6 text-gold" />
      </MedalIcon>
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
        Next Prediction
      </p>
      <AnimatePresence mode="wait">
        {prediction === null ? (
          <motion.span
            key="empty"
            className="text-5xl font-display font-bold text-muted-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ---
          </motion.span>
        ) : (
          <motion.span
            key={isBig ? "big" : "small"}
            className={`text-5xl font-display font-bold tracking-wider ${
              isBig ? "text-gold-gradient text-glow-gold" : "text-glow-silver"
            }`}
            style={isBig ? {} : { color: "oklch(0.93 0.008 240)" }}
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isBig ? "BIG" : "SMALL"}
          </motion.span>
        )}
      </AnimatePresence>
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.75 0.14 85 / 0.4), transparent)",
        }}
      />
      <p className="text-xs text-muted-foreground">
        {prediction
          ? `Input: ${prediction.inputNumber}`
          : "Enter a number to predict"}
      </p>
    </div>
  );
}

function LuckyNumbersCard({ prediction }: { prediction: Prediction | null }) {
  const nums = prediction ? Array.from(prediction.luckyNumbers) : [];
  return (
    <div className="card-vip p-6 flex flex-col items-center gap-4 min-h-[260px] justify-between transition-all duration-300">
      <MedalIcon>
        <Star className="w-6 h-6 text-gold" />
      </MedalIcon>
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
        Lucky Numbers
      </p>
      <div className="flex gap-5">
        <AnimatePresence mode="wait">
          {nums.length === 0 ? (
            <motion.div
              key="empty"
              className="flex gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {["a", "b"].map((k) => (
                <div
                  key={k}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-muted-foreground/30"
                  style={{ border: "1px solid oklch(0.75 0.14 85 / 0.15)" }}
                >
                  ?
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`nums-${nums.join("-")}`}
              className="flex gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {nums.slice(0, 2).map((n, i) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length 2-item array
                  key={i}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold font-display text-gold-gradient"
                  style={{
                    background:
                      "linear-gradient(145deg, oklch(0.75 0.14 85 / 0.12), oklch(0.75 0.14 85 / 0.06))",
                    border: "1px solid oklch(0.75 0.14 85 / 0.5)",
                    boxShadow: "0 0 20px oklch(0.75 0.14 85 / 0.2)",
                  }}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: i * 0.12,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                >
                  {n}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.75 0.14 85 / 0.4), transparent)",
        }}
      />
      <p className="text-xs text-muted-foreground">
        {prediction ? "AI suggested numbers" : "Waiting for input"}
      </p>
    </div>
  );
}

function ColorSignalCard({ prediction }: { prediction: Prediction | null }) {
  const meta = prediction ? COLOR_META[prediction.colorSignal] : null;
  return (
    <div className="card-vip p-6 flex flex-col items-center gap-4 min-h-[260px] justify-between transition-all duration-300">
      <MedalIcon>
        <Zap className="w-6 h-6 text-gold" />
      </MedalIcon>
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
        Color Signal
      </p>
      <AnimatePresence mode="wait">
        {meta === null ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-12 h-12 rounded-full bg-muted/20 border border-border" />
            <span className="text-3xl font-display font-bold text-muted-foreground/30">
              ---
            </span>
          </motion.div>
        ) : (
          <motion.div
            key={meta.label}
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                backgroundColor: meta.hex,
                boxShadow: `0 0 25px ${meta.hex}80, 0 0 50px ${meta.hex}40`,
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
              }}
            />
            <SignalBars color={meta.hex} />
            <span
              className={`text-3xl font-display font-bold tracking-widest ${meta.glowClass}`}
              style={{ color: meta.hex }}
            >
              {meta.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.75 0.14 85 / 0.4), transparent)",
        }}
      />
      <p className="text-xs text-muted-foreground">
        {prediction ? "Live signal active" : "Awaiting prediction"}
      </p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(
    null,
  );
  const [animKey, setAnimKey] = useState(0);
  const prevPredictionRef = useRef<Prediction | null>(null);

  const { data: recentPredictions = [], isLoading: isLoadingHistory } =
    useGetRecentPredictions();
  const submitMutation = useSubmitPrediction();

  // Update current prediction from the latest record after submit
  useEffect(() => {
    if (recentPredictions.length > 0) {
      const latest = recentPredictions[0];
      if (prevPredictionRef.current?.timestamp !== latest.timestamp) {
        prevPredictionRef.current = latest;
        setCurrentPrediction(latest);
        setAnimKey((k) => k + 1);
      }
    }
  }, [recentPredictions]);

  const handlePredict = async () => {
    if (selectedNum === null) {
      toast.error("Please select a number first");
      return;
    }
    try {
      await submitMutation.mutateAsync(selectedNum);
      toast.success(`Prediction submitted for number ${selectedNum}`);
    } catch {
      // Fallback: compute locally if backend fails
      const result = selectedNum <= 4;
      const isBig = result;
      const range = isBig ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9];
      const lucky = new Uint8Array([
        range[Math.floor(Math.random() * range.length)],
        range[Math.floor(Math.random() * range.length)],
      ]);
      const signals = [ColorSignal.red, ColorSignal.green, ColorSignal.violet];
      const colorSignal = signals[Math.floor(Math.random() * signals.length)];
      const localPrediction: Prediction = {
        result,
        colorSignal,
        inputNumber: selectedNum,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
        luckyNumbers: lucky,
      };
      setCurrentPrediction(localPrediction);
      setAnimKey((k) => k + 1);
      toast.success(
        `Prediction: ${isBig ? "BIG" : "SMALL"} for number ${selectedNum}`,
      );
    }
  };

  const displayPredictions =
    recentPredictions.length > 0
      ? recentPredictions
      : currentPrediction
        ? [currentPrediction]
        : [];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Toaster position="top-right" theme="dark" />

      {/* Ambient gold edge glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 right-0 h-48 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, oklch(0.75 0.14 85 / 0.15), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-48 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, oklch(0.75 0.14 85 / 0.10), transparent 70%)",
          }}
        />
      </div>

      {/* Header / Nav */}
      <header
        className="relative z-10 border-b"
        style={{ borderColor: "oklch(0.75 0.14 85 / 0.15)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.62 0.13 82), oklch(0.85 0.12 88))",
                color: "oklch(0.12 0.006 240)",
                boxShadow: "0 0 20px oklch(0.75 0.14 85 / 0.4)",
              }}
            >
              A
            </div>
            <span className="font-display font-bold text-xl tracking-[0.15em] text-gold-gradient">
              AURA VIP
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Dashboard", "History", "Analytics"].map((link) => (
              <a
                key={link}
                href="/"
                className="text-sm font-medium tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="nav.dashboard.link"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest"
            style={{
              background: "oklch(0.75 0.14 85 / 0.10)",
              border: "1px solid oklch(0.75 0.14 85 / 0.35)",
              color: "oklch(0.85 0.12 88)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full bg-neon-green"
              style={{ boxShadow: "0 0 8px #33E06F" }}
            />
            LIVE
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 hero-streaks py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold tracking-[0.4em] text-muted-foreground mb-3 uppercase">
              AI-Powered Signals
            </p>
            <h1 className="font-display font-bold uppercase leading-tight">
              <span
                className="text-gold-gradient text-glow-gold block"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                MAXIMIZE YOUR WINNINGS
              </span>
              <span
                className="text-foreground block"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  opacity: 0.85,
                }}
              >
                WITH AI PREDICTIONS
              </span>
            </h1>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-lg mx-auto">
              Enter any number from 0–9 to receive an instant AI-generated
              prediction, lucky numbers, and live color signal — all in real
              time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Number Input */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 mb-12">
        <motion.div
          className="card-vip p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-center text-xs font-semibold tracking-[0.3em] text-muted-foreground mb-6 uppercase">
            Select a Number (0–9)
          </p>

          {/* Number buttons */}
          <div className="flex gap-2 justify-center flex-wrap mb-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                type="button"
                key={n}
                className={`num-btn w-12 h-12 ${
                  selectedNum === n ? "num-btn-active" : ""
                }`}
                onClick={() => setSelectedNum(n)}
                data-ocid="predict.number.button"
              >
                {n}
              </button>
            ))}
          </div>

          {/* Range hint */}
          <div className="flex justify-center gap-6 mb-6 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-5 rounded flex items-center justify-center text-gold font-bold"
                style={{
                  fontSize: "10px",
                  background: "oklch(0.75 0.14 85 / 0.1)",
                  border: "1px solid oklch(0.75 0.14 85 / 0.3)",
                }}
              >
                0–4
              </span>
              <span className="text-muted-foreground">
                → <span className="text-gold font-semibold">BIG</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-5 rounded flex items-center justify-center text-foreground font-bold"
                style={{
                  fontSize: "10px",
                  background: "oklch(0.93 0.008 240 / 0.08)",
                  border: "1px solid oklch(0.93 0.008 240 / 0.2)",
                }}
              >
                5–9
              </span>
              <span className="text-muted-foreground">
                → <span className="text-foreground font-semibold">SMALL</span>
              </span>
            </div>
          </div>

          {/* Predict button */}
          <div className="flex justify-center">
            <button
              type="button"
              className="relative px-12 py-4 rounded-xl font-display font-bold text-lg tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  selectedNum !== null
                    ? "linear-gradient(135deg, oklch(0.62 0.13 82), oklch(0.85 0.12 88), oklch(0.75 0.14 85))"
                    : "oklch(0.20 0.012 230)",
                color:
                  selectedNum !== null
                    ? "oklch(0.12 0.006 240)"
                    : "oklch(0.45 0.008 240)",
                boxShadow:
                  selectedNum !== null
                    ? "0 0 30px oklch(0.75 0.14 85 / 0.4), 0 4px 20px oklch(0 0 0 / 0.4)"
                    : "none",
                border: "1px solid oklch(0.75 0.14 85 / 0.3)",
              }}
              onClick={handlePredict}
              disabled={selectedNum === null || submitMutation.isPending}
              data-ocid="predict.submit_button"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Predicting...
                </span>
              ) : (
                "✦ PREDICT NOW"
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* 3 Prediction Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-16">
        <motion.p
          className="text-center text-xs font-semibold tracking-[0.3em] text-muted-foreground mb-8 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Prediction Results
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            key={`pred-${animKey}`}
            data-ocid="prediction.card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <PredictionCard prediction={currentPrediction} />
          </motion.div>
          <motion.div
            key={`lucky-${animKey}`}
            data-ocid="lucky.card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <LuckyNumbersCard prediction={currentPrediction} />
          </motion.div>
          <motion.div
            key={`color-${animKey}`}
            data-ocid="color.card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ColorSignalCard prediction={currentPrediction} />
          </motion.div>
        </div>
      </section>

      {/* Recent Predictions Table */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-center font-display font-bold text-lg tracking-[0.2em] uppercase mb-8">
            <span className="text-gold-gradient">RECENT WINNING</span>{" "}
            <span className="text-foreground/80">TRENDS</span>
          </h2>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.15 0.010 230), oklch(0.13 0.008 235))",
              border: "1px solid oklch(0.75 0.14 85 / 0.20)",
              boxShadow: "0 0 40px oklch(0 0 0 / 0.4)",
            }}
            data-ocid="history.table"
          >
            {isLoadingHistory ? (
              <div
                className="flex items-center justify-center py-16 gap-3"
                data-ocid="history.loading_state"
              >
                <Loader2 className="w-5 h-5 animate-spin text-gold" />
                <span className="text-muted-foreground text-sm">
                  Loading history...
                </span>
              </div>
            ) : displayPredictions.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-3"
                data-ocid="history.empty_state"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center medal-icon">
                  <TrendingUp className="w-5 h-5 text-gold/50" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No predictions yet. Start predicting!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid oklch(0.75 0.14 85 / 0.15)",
                      }}
                    >
                      {[
                        "#",
                        "Number",
                        "Prediction",
                        "Lucky Numbers",
                        "Color Signal",
                        "Time",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-left text-xs font-semibold tracking-[0.2em] uppercase"
                          style={{ color: "oklch(0.75 0.14 85)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayPredictions.slice(0, 20).map((p, idx) => {
                      const colorMeta = COLOR_META[p.colorSignal];
                      const isBig = p.result;
                      return (
                        <tr
                          // biome-ignore lint/suspicious/noArrayIndexKey: chronological list, stable order
                          key={idx}
                          className="table-row-vip transition-colors"
                          style={{
                            borderBottom:
                              "1px solid oklch(0.75 0.14 85 / 0.06)",
                          }}
                          data-ocid={`history.row.item.${idx + 1}`}
                        >
                          <td className="px-5 py-3.5 text-muted-foreground font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono"
                              style={{
                                background: "oklch(0.75 0.14 85 / 0.10)",
                                border: "1px solid oklch(0.75 0.14 85 / 0.25)",
                                color: "oklch(0.85 0.12 88)",
                                display: "inline-flex",
                              }}
                            >
                              {p.inputNumber}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`font-display font-bold tracking-wider text-base ${
                                isBig ? "text-gold-gradient" : ""
                              }`}
                              style={
                                isBig ? {} : { color: "oklch(0.88 0.008 240)" }
                              }
                            >
                              {isBig ? "BIG" : "SMALL"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              {Array.from(p.luckyNumbers)
                                .slice(0, 2)
                                .map((n, i) => (
                                  <span
                                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed 2-item array
                                    key={i}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                    style={{
                                      background: "oklch(0.75 0.14 85 / 0.10)",
                                      border:
                                        "1px solid oklch(0.75 0.14 85 / 0.30)",
                                      color: "oklch(0.85 0.12 88)",
                                    }}
                                  >
                                    {n}
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-2 font-semibold text-xs tracking-widest">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{
                                  backgroundColor: colorMeta.hex,
                                  boxShadow: `0 0 8px ${colorMeta.hex}80`,
                                }}
                              />
                              <span style={{ color: colorMeta.hex }}>
                                {colorMeta.label}
                              </span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                            {formatTime(p.timestamp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t py-8"
        style={{ borderColor: "oklch(0.75 0.14 85 / 0.12)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.62 0.13 82), oklch(0.85 0.12 88))",
                color: "oklch(0.12 0.006 240)",
              }}
            >
              A
            </div>
            <span className="font-display font-bold text-sm tracking-[0.15em] text-gold-gradient">
              AURA VIP
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>AI Powered Predictions</span>
            <span style={{ color: "oklch(0.75 0.14 85 / 0.4)" }}>•</span>
            <span>Real-time Signals</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
