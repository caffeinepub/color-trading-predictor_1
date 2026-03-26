import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Gift, Rocket, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MatrixRain from "../components/MatrixRain";

interface HistoryEntry {
  period: string;
  dateTime: string;
  number: number;
  bigSmall: "BIG" | "SMALL";
  color: string;
  profit: number;
  result: "Succeed" | "Loss";
}

const VALID_CODES = new Set([
  "VIP2024",
  "LUCKY6",
  "PROFIT99",
  "HACKPROFIT",
  "BIGWIN",
  "MAXPROFIT",
  "PROFIT5X",
  "HACKWIN",
  "LEVEL5",
  "FUND5",
  "NOLOSS",
  "WIN100",
  "HACK999",
  "PROFITKING",
  "NOLOSSBIG",
]);
const HACK_CODES = new Set([
  "PROFIT5X",
  "HACKWIN",
  "LEVEL5",
  "FUND5",
  "NOLOSS",
  "WIN100",
  "HACKPROFIT",
  "HACK999",
  "PROFITKING",
  "NOLOSSBIG",
  "BIGWIN",
  "MAXPROFIT",
]);

const FUND_LEVELS = [
  { level: 1, amount: "₹100", multiplier: 1.8, rupees: 980 },
  { level: 2, amount: "₹500", multiplier: 2.5, rupees: 1250 },
  { level: 3, amount: "₹1,000", multiplier: 4.0, rupees: 1764 },
  { level: 4, amount: "₹5,000", multiplier: 7.0, rupees: 1960 },
  { level: 5, amount: "₹10,000", multiplier: 9.9, rupees: 2450 },
];

const BIG_NUMBERS = [5, 6, 7, 8, 9];
const SMALL_NUMBERS = [0, 1, 2, 3, 4];
const TIME_OPTIONS = ["30 Sec", "1 Min", "3 Min", "5 Min"];

function getBigSmall(n: number): "BIG" | "SMALL" {
  return n >= 5 ? "BIG" : "SMALL";
}

function getColor(n: number, hackMode: boolean): string {
  if (hackMode) return "green";
  if (n === 0 || n === 5) return "violet";
  if (n % 2 === 0) return "red";
  return "green";
}

function getHackProfit(selectedLevel: number): number {
  const base = FUND_LEVELS[selectedLevel - 1]?.rupees ?? 980;
  return base + Math.floor(Math.random() * 500);
}

function getLossAmount(): number {
  return Math.floor(Math.random() * 171) + 280;
}

function getTwoNumbers(n: number, hackMode: boolean): [number, number] {
  if (hackMode) {
    const idx = Math.abs(n) % BIG_NUMBERS.length;
    return [BIG_NUMBERS[idx], BIG_NUMBERS[(idx + 2) % BIG_NUMBERS.length]];
  }
  const pool = getBigSmall(n) === "BIG" ? BIG_NUMBERS : SMALL_NUMBERS;
  return [pool[n % pool.length], pool[(n + 1) % pool.length]];
}

function formatRupees(amount: number): string {
  if (amount < 0)
    return `-₹${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `+₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function buildLivePeriod(base: number): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const totalSeconds =
    d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  const sequence = Math.floor(totalSeconds / 60) + 1 + (base - 1050);
  return `${y}${m}${day}10001${String(sequence).padStart(4, "0")}`;
}

// BDG WIN auto period: based on real time slots
function buildBdgAutoPeriod(timeOption: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const totalSeconds =
    d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  let slotSeconds = 60;
  let gameId = "10001";
  if (timeOption === "30 Sec") {
    slotSeconds = 30;
    gameId = "10002";
  } else if (timeOption === "1 Min") {
    slotSeconds = 60;
    gameId = "10001";
  } else if (timeOption === "3 Min") {
    slotSeconds = 180;
    gameId = "10003";
  } else if (timeOption === "5 Min") {
    slotSeconds = 300;
    gameId = "10005";
  }
  const sequence = Math.floor(totalSeconds / slotSeconds) + 1; // 1-indexed
  return `${y}${mo}${day}${gameId}${String(sequence).padStart(4, "0")}`;
}

function getBdgCountdown(timeOption: string): number {
  const d = new Date();
  const _totalSeconds =
    d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  let slotSeconds = 60;
  if (timeOption === "30 Sec") slotSeconds = 30;
  else if (timeOption === "1 Min") slotSeconds = 60;
  else if (timeOption === "3 Min") slotSeconds = 180;
  else if (timeOption === "5 Min") slotSeconds = 300;
  return slotSeconds - (_totalSeconds % slotSeconds);
}

function getTrend(history: { bigSmall: string }[]): {
  trend: "BIG" | "SMALL" | "NEUTRAL";
  streak: number;
  suggestion: string;
} {
  if (history.length < 2)
    return { trend: "NEUTRAL", streak: 0, suggestion: "Analyzing..." };
  const last5 = history.slice(0, 5);
  const bigCount = last5.filter((h) => h.bigSmall === "BIG").length;
  const smallCount = last5.filter((h) => h.bigSmall === "SMALL").length;
  // streak
  let streak = 1;
  for (let i = 1; i < Math.min(history.length, 8); i++) {
    if (history[i].bigSmall === history[0].bigSmall) streak++;
    else break;
  }
  if (bigCount > smallCount) {
    return {
      trend: "BIG",
      streak,
      suggestion: streak >= 3 ? "SMALL aa sakta hai" : "BIG trend strong",
    };
  }
  if (smallCount > bigCount) {
    return {
      trend: "SMALL",
      streak,
      suggestion: streak >= 3 ? "BIG aa sakta hai" : "SMALL trend strong",
    };
  }
  return {
    trend: "NEUTRAL",
    streak: 0,
    suggestion: "Mixed trend -- wait karo",
  };
}

interface Props {
  onBack: () => void;
}

export default function PredictionScreen({ onBack }: Props) {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [hackMode, setHackMode] = useState(false);
  const [periodInput, setPeriodInput] = useState("");
  const [activeTime, setActiveTime] = useState("1 Min");
  const [autoPeriod, setAutoPeriod] = useState(() =>
    buildBdgAutoPeriod("1 Min"),
  );
  const [bdgCountdown, setBdgCountdown] = useState(() =>
    getBdgCountdown("1 Min"),
  );
  const [livePeriodBase, setLivePeriodBase] = useState(1050);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [sureshortNum, setSureshortNum] = useState<number | null>(null);
  const [sureshortColor, setSureshortColor] = useState("");
  const [sureshortBigSmall, setSureshortBigSmall] = useState<
    "BIG" | "SMALL" | null
  >(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpot1, setJackpot1] = useState<number>(7);
  const [jackpot2, setJackpot2] = useState<number>(8);
  const [_finalNums, setFinalNums] = useState<[number, number]>([7, 8]);
  const [showInjectPanel, setShowInjectPanel] = useState(false);
  const [injectNum, setInjectNum] = useState(7);
  const [injectBigSmall, setInjectBigSmall] = useState<"BIG" | "SMALL">("BIG");
  const [giftCode, setGiftCode] = useState("");
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [badgeActive, setBadgeActive] = useState(false);
  const [selectedFundLevel, setSelectedFundLevel] = useState(4);
  const [bypassGds1, setBypassGds1] = useState(false);
  const [bypassGds2, setBypassGds2] = useState(true);
  const [bypassMainId, setBypassMainId] = useState(false);
  const [wingoMod, setWingoMod] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      period: "20260227100010335",
      dateTime: "2026-02-27 11:04:15",
      number: 7,
      bigSmall: "BIG",
      color: "green",
      profit: 1960,
      result: "Succeed",
    },
    {
      period: "20260227100010334",
      dateTime: "2026-02-27 11:04:14",
      number: 2,
      bigSmall: "SMALL",
      color: "red",
      profit: 1764,
      result: "Succeed",
    },
    {
      period: "20260227100010333",
      dateTime: "2026-02-27 11:04:12",
      number: 8,
      bigSmall: "BIG",
      color: "green",
      profit: 1960,
      result: "Succeed",
    },
  ]);

  const spinInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const injectCount = useRef(0);

  const wins = history.filter((h) => h.result === "Succeed").length;
  const losses = history.filter((h) => h.result === "Loss").length;
  const cyclePos = injectCount.current % 5;

  useEffect(() => {
    const t = setInterval(() => setLivePeriodBase((p) => p + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // Auto BDG period number -- updates every second
  useEffect(() => {
    const tick = () => {
      setAutoPeriod(buildBdgAutoPeriod(activeTime));
      setBdgCountdown(getBdgCountdown(activeTime));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activeTime]);

  const triggerSpin = useCallback((n: number, hack: boolean) => {
    if (spinInterval.current) clearInterval(spinInterval.current);
    const [fn1, fn2] = getTwoNumbers(n, hack);
    const color = getColor(hack ? fn1 : n, hack);
    const bs = hack ? "BIG" : getBigSmall(n);
    setIsSpinning(true);
    setShowInjectPanel(false);
    const startTime = Date.now();
    spinInterval.current = setInterval(() => {
      if (Date.now() - startTime >= 900) {
        clearInterval(spinInterval.current!);
        setFinalNums([fn1, fn2]);
        setJackpot1(fn1);
        setJackpot2(fn2);
        setSureshortNum(fn1);
        setSureshortColor(color);
        setSureshortBigSmall(bs);
        setInjectNum(fn1);
        setInjectBigSmall(bs);
        setIsSpinning(false);
        setShowInjectPanel(true);
      } else {
        const pool = hack
          ? BIG_NUMBERS
          : getBigSmall(n) === "BIG"
            ? BIG_NUMBERS
            : SMALL_NUMBERS;
        setJackpot1(pool[Math.floor(Math.random() * pool.length)]);
        setJackpot2(pool[Math.floor(Math.random() * pool.length)]);
      }
    }, 70);
  }, []);

  const handleGetResult = useCallback(() => {
    const raw = periodInput.trim();
    if (!raw) {
      toast.error("Period number enter karo!");
      return;
    }
    const lastDigit = Number.parseInt(raw[raw.length - 1], 10);
    const n = hackMode
      ? BIG_NUMBERS[lastDigit % BIG_NUMBERS.length]
      : lastDigit;
    setCurrentPeriod(raw);
    triggerSpin(n, hackMode);
  }, [periodInput, hackMode, triggerSpin]);

  const handleNumberClick = useCallback(
    (n: number) => {
      setSelectedNum(n);
      const period = buildLivePeriod(livePeriodBase);
      setCurrentPeriod(period);
      triggerSpin(n, hackMode);
    },
    [hackMode, livePeriodBase, triggerSpin],
  );

  const handleInject = useCallback(() => {
    const currentCount = injectCount.current;
    injectCount.current = currentCount + 1;
    const isLoss = !hackMode && currentCount % 5 === 4;
    const result: "Succeed" | "Loss" = isLoss ? "Loss" : "Succeed";
    const profitRupees = isLoss
      ? -getLossAmount()
      : getHackProfit(selectedFundLevel);
    const period =
      currentPeriod || periodInput || buildLivePeriod(livePeriodBase);
    const color = getColor(injectNum, hackMode);
    const entry: HistoryEntry = {
      period,
      dateTime: formatDateTime(),
      number: injectNum,
      bigSmall: injectBigSmall,
      color,
      profit: profitRupees,
      result,
    };
    setHistory((prev) => [entry, ...prev.slice(0, 19)]);
    setShowInjectPanel(false);
    setLivePeriodBase((p) => p + 1);
    if (isLoss) toast.error(`❌ LOSS: -₹${Math.abs(profitRupees).toFixed(2)}`);
    else
      toast.success(
        `✅ INJECTED! +₹${profitRupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })} PROFIT!`,
      );
  }, [
    hackMode,
    selectedFundLevel,
    injectNum,
    injectBigSmall,
    currentPeriod,
    periodInput,
    livePeriodBase,
  ]);

  const handleRedeem = useCallback(() => {
    const code = giftCode.trim().toUpperCase();
    if (!code) return;
    if (redeemed.has(code)) {
      toast.error("Code already redeemed!");
      return;
    }
    if (VALID_CODES.has(code)) {
      setRedeemed((prev) => new Set([...prev, code]));
      setBadgeActive(true);
      if (HACK_CODES.has(code)) {
        setHackMode(true);
        toast.success("🔓 HACK MODE ACTIVATED! NO LOSS GUARANTEED!");
      } else toast.success("✅ Code redeemed! VIP badge activated!");
      setGiftCode("");
    } else toast.error("Invalid code!");
  }, [giftCode, redeemed]);

  const colorBg: Record<string, string> = {
    green: "bg-green-600",
    red: "bg-red-600",
    violet: "bg-purple-600",
  };
  const isBig = sureshortBigSmall === "BIG";

  return (
    <div
      className={`min-h-screen bg-black relative overflow-x-hidden ${hackMode ? "hack-bg" : ""}`}
    >
      {hackMode && <MatrixRain />}
      <Toaster theme="dark" />

      {/* Header */}
      <div
        className={`sticky top-0 z-20 bg-black border-b ${hackMode ? "border-green-500" : "border-cyan-800"} px-4 py-3 flex items-center justify-between`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1 text-sm font-bold ${hackMode ? "text-green-400" : "text-cyan-400"}`}
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <h1
          className={`font-orbitron font-black text-sm tracking-widest ${hackMode ? "hack-text-glow" : "text-yellow-400"}`}
          style={{ textShadow: hackMode ? undefined : "0 0 8px #facc15" }}
        >
          BDG WIN
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${hackMode ? "text-green-400" : "text-gray-400"}`}
          >
            {hackMode ? "HACK" : "SAFE"}
          </span>
          <Switch
            checked={hackMode}
            onCheckedChange={setHackMode}
            className={hackMode ? "data-[state=checked]:bg-green-500" : ""}
          />
        </div>
      </div>

      {hackMode && (
        <div className="bg-green-950 border-y border-green-500 px-4 py-2 text-center">
          <p className="font-orbitron font-black text-green-400 text-sm tracking-widest hack-text-glow">
            ⚡ NO LOSS HACK ACTIVE ⚡
          </p>
          <p className="text-green-600 text-xs mt-0.5">
            BIG (5-9) + HIGH PROFIT — 100% GUARANTEED
          </p>
        </div>
      )}

      <div className="px-4 pb-10 space-y-4 relative z-10 mt-4">
        {/* Win/Loss stats */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-orbitron font-bold text-sm">
              WIN: {wins}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-red-400 font-orbitron font-bold text-sm">
            LOSS: {losses}
          </span>
          {badgeActive && (
            <Badge className="bg-yellow-600 text-black font-bold text-xs">
              ⭐ VIP
            </Badge>
          )}
        </div>

        {/* ===== BDG WIN MAIN CARD ===== */}
        <div
          className="rounded-2xl p-4 border-2"
          style={{
            background: "linear-gradient(145deg, #0d1a1a, #0a2020)",
            borderColor: hackMode ? "#00ff88" : "#00cccc",
            boxShadow: hackMode
              ? "0 0 24px rgba(0,255,136,0.35)"
              : "0 0 24px rgba(0,200,200,0.25)",
          }}
        >
          <h2
            className="font-orbitron font-black text-3xl text-center mb-4 tracking-widest"
            style={{
              color: "#facc15",
              textShadow: "0 0 12px #facc15, 0 0 24px #f59e0b",
            }}
          >
            BDG WIN
          </h2>

          {/* Period input */}
          <div className="bg-black/60 rounded-xl p-4 mb-4 border border-gray-700">
            {/* Auto Period Display */}
            <div className="flex items-center justify-between mb-3 bg-black/80 rounded-lg px-3 py-2 border border-cyan-900">
              <div>
                <p className="text-gray-500 text-xs font-orbitron tracking-widest">
                  🤖 AUTO PERIOD
                </p>
                <p
                  className="font-orbitron font-black text-sm"
                  style={{ color: "#00e5ff", textShadow: "0 0 6px #00e5ff" }}
                >
                  {autoPeriod}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs font-orbitron">NEXT IN</p>
                <p
                  className="font-orbitron font-black text-lg"
                  style={{
                    color: bdgCountdown <= 5 ? "#ff4444" : "#facc15",
                    textShadow: "0 0 8px currentColor",
                  }}
                >
                  {bdgCountdown}s
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPeriodInput(autoPeriod);
                }}
                className="px-3 py-1.5 rounded-lg font-orbitron font-bold text-xs text-black transition-all active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #00e5ff, #00b4d8)",
                  boxShadow: "0 0 8px rgba(0,220,255,0.5)",
                }}
              >
                USE
              </button>
            </div>
            {/* Trend Analysis */}
            {(() => {
              const t = getTrend(history);
              return (
                <div className="flex items-center gap-2 mb-3 bg-black/60 rounded-lg px-3 py-2 border border-gray-800">
                  <span className="text-gray-500 text-xs font-orbitron">
                    📈 TREND:
                  </span>
                  <span
                    className="font-orbitron font-black text-sm px-2 py-0.5 rounded"
                    style={{
                      color:
                        t.trend === "BIG"
                          ? "#f97316"
                          : t.trend === "SMALL"
                            ? "#ef4444"
                            : "#9ca3af",
                      background:
                        t.trend === "BIG"
                          ? "rgba(249,115,22,0.15)"
                          : t.trend === "SMALL"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(156,163,175,0.1)",
                    }}
                  >
                    {t.trend} ×{t.streak}
                  </span>
                  <span className="text-yellow-400 text-xs font-orbitron ml-auto">
                    {t.suggestion}
                  </span>
                </div>
              );
            })()}
            <p className="text-gray-400 text-center text-sm mb-2">
              Enter / Auto Period Number:
            </p>
            <input
              type="text"
              value={periodInput}
              onChange={(e) => setPeriodInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGetResult()}
              placeholder={autoPeriod}
              className="w-full bg-gray-900 border border-gray-600 text-white font-orbitron text-base rounded-lg px-4 py-3 mb-3 outline-none focus:border-cyan-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPeriodInput(autoPeriod);
                  setTimeout(() => handleGetResult(), 50);
                }}
                className="flex-1 py-3 rounded-xl font-orbitron font-black text-sm text-black tracking-widest transition-all active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #00ff88, #00cc66)",
                  boxShadow: "0 0 12px rgba(0,255,136,0.4)",
                }}
              >
                AUTO
              </button>
              <button
                type="button"
                onClick={handleGetResult}
                className="flex-1 py-3 rounded-xl font-orbitron font-black text-sm text-black tracking-widest transition-all active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #00e5ff, #00b4d8)",
                  boxShadow: "0 0 12px rgba(0,220,255,0.5)",
                }}
              >
                GET RESULT
              </button>
            </div>
          </div>

          {/* Time selector */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTime(t)}
                className={`flex-1 py-2.5 rounded-full font-orbitron font-bold text-xs transition-all ${
                  activeTime === t
                    ? "text-black"
                    : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
                style={
                  activeTime === t
                    ? {
                        background: "linear-gradient(135deg, #f59e0b, #84cc16)",
                        boxShadow: "0 0 8px rgba(250,204,21,0.5)",
                      }
                    : {}
                }
              >
                {t}
              </button>
            ))}
          </div>

          {/* Current Period */}
          {currentPeriod && (
            <div className="bg-black/60 rounded-xl p-4 mb-4 border border-gray-800 text-center">
              <p className="text-gray-500 font-orbitron text-xs tracking-widest mb-1">
                📡 CURRENT PERIOD
              </p>
              <p
                className="font-orbitron font-black text-xl"
                style={{ color: "#00ff88", textShadow: "0 0 8px #00ff88" }}
              >
                {currentPeriod}
              </p>
            </div>
          )}

          {/* NEXT SURESHORT */}
          {sureshortNum !== null && (
            <div className="bg-black/60 rounded-xl p-4 border border-gray-800 text-center">
              <p className="text-gray-500 font-orbitron text-xs tracking-widest mb-3">
                🎯 NEXT SURESHORT
              </p>

              {/* Two Jackpot Numbers */}
              <div className="flex justify-center gap-6 mb-4">
                {[jackpot1, jackpot2].map((jn, idx) => (
                  <div
                    key={idx === 0 ? "j1" : "j2"}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 ${isSpinning ? "animate-pulse" : ""}`}
                      style={{
                        background: isBig ? "#7c2d12" : "#7f1d1d",
                        borderColor: isBig ? "#f97316" : "#ef4444",
                        boxShadow: isBig
                          ? "0 0 14px rgba(249,115,22,0.6)"
                          : "0 0 14px rgba(239,68,68,0.6)",
                      }}
                    >
                      <span
                        className="font-orbitron font-black text-5xl text-white"
                        style={{
                          textShadow: isBig
                            ? "0 0 8px #f97316"
                            : "0 0 8px #ef4444",
                        }}
                      >
                        {jn}
                      </span>
                    </div>
                    <span
                      className={`font-orbitron font-bold text-xs ${isBig ? "text-orange-300" : "text-red-300"}`}
                    >
                      {sureshortBigSmall}
                    </span>
                  </div>
                ))}
              </div>

              {/* Color badge */}
              <div
                className={`inline-flex items-center justify-center px-8 py-2 rounded-full font-orbitron font-black text-lg mb-3 ${colorBg[sureshortColor] || "bg-green-600"}`}
                style={{
                  boxShadow: "0 0 12px rgba(0,200,100,0.5)",
                  minWidth: "180px",
                }}
              >
                {sureshortColor}
              </div>

              {/* BIG/SMALL range banner */}
              <div
                className={`py-2 rounded-lg border text-center ${
                  isBig
                    ? "border-orange-700 bg-orange-950"
                    : "border-red-700 bg-red-950"
                }`}
              >
                <p
                  className={`font-orbitron font-bold text-sm ${
                    isBig ? "text-orange-300" : "text-red-300"
                  }`}
                  style={{
                    textShadow: isBig ? "0 0 6px #f97316" : "0 0 6px #ef4444",
                  }}
                >
                  {isBig
                    ? "BIG ▶ 5 · 6 · 7 · 8 · 9"
                    : "SMALL ▶ 0 · 1 · 2 · 3 · 4"}
                </p>
              </div>

              {/* Profit indicator */}
              <div className="mt-3 py-2 bg-green-950 border border-green-800 rounded-lg">
                <p
                  className="font-orbitron font-black text-green-400 text-sm"
                  style={{ textShadow: "0 0 6px #00ff88" }}
                >
                  💰 PROFIT: {FUND_LEVELS[selectedFundLevel - 1].multiplier}x
                  {hackMode && " ⚡ HACK ACTIVE"}
                </p>
              </div>
            </div>
          )}

          {/* Placeholder when no result yet */}
          {sureshortNum === null && (
            <div className="text-center py-6 bg-black/40 rounded-xl border border-gray-800">
              <p className="text-gray-600 font-orbitron text-sm">
                Period number enter karo ya neeche number click karo
              </p>
            </div>
          )}
        </div>

        {/* INJECT button */}
        {showInjectPanel && (
          <button
            type="button"
            onClick={handleInject}
            className="w-full py-4 font-orbitron font-black text-xl tracking-widest rounded-xl transition-all active:scale-95"
            style={{
              background: "linear-gradient(90deg, #dc2626, #b91c1c)",
              boxShadow: "0 0 16px rgba(220,38,38,0.6)",
            }}
          >
            INJECT
          </button>
        )}

        {/* Number selector */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-cyan-800"} rounded-xl p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-3 tracking-widest ${
              hackMode ? "text-green-400" : "text-cyan-400"
            }`}
          >
            🎯 SELECT NUMBER{" "}
            {hackMode ? "(HACK: ALWAYS BIG 5-9)" : "(0-4=SMALL | 5-9=BIG)"}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const isSelected = selectedNum === n;
              const nIsBig = n >= 5;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumberClick(n)}
                  className={`font-orbitron font-black text-xl py-3 rounded border-2 transition-all active:scale-90 ${
                    isSelected
                      ? hackMode
                        ? "bg-green-500 border-green-400 text-black scale-110"
                        : nIsBig
                          ? "bg-orange-600 border-orange-400 text-white scale-110"
                          : "bg-red-600 border-red-400 text-white scale-110"
                      : nIsBig
                        ? "bg-orange-950 border-orange-700 text-orange-400 hover:bg-orange-900"
                        : "bg-red-950 border-red-700 text-red-400 hover:bg-red-900"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-red-400 text-xs font-orbitron font-bold">
              0-4 = SMALL 🔴
            </span>
            <span className="text-orange-400 text-xs font-orbitron font-bold">
              5-9 = BIG 🟠
            </span>
          </div>
        </div>

        {/* BYPASS PANEL */}
        <div
          className="border-2 border-yellow-600 rounded-xl p-4 bg-black"
          style={{ boxShadow: "0 0 12px rgba(250,204,21,0.2)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg border-2 border-yellow-500 bg-gray-900 flex items-center justify-center text-xl flex-shrink-0">
              👾
            </div>
            <div>
              <p className="font-orbitron font-black text-yellow-400 text-xs tracking-widest">
                🛡️ BYPASS CONTROL PANEL
              </p>
              <p className="text-yellow-600 text-xs">TG - @iamelitee</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "BYPASS GDS (1)",
                desc: "Route override channel 1",
                val: bypassGds1,
                set: setBypassGds1,
                color: "data-[state=checked]:bg-yellow-500",
              },
              {
                label: "BYPASS GDS (2)",
                desc: "Route override channel 2",
                val: bypassGds2,
                set: setBypassGds2,
                color: "data-[state=checked]:bg-red-500",
              },
              {
                label: "BYPASS MAIN ID",
                desc: "Identity masking active",
                val: bypassMainId,
                set: setBypassMainId,
                color: "data-[state=checked]:bg-yellow-500",
              },
            ].map(({ label, desc, val, set, color }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-950 rounded-lg px-3 py-2.5 border border-gray-800"
              >
                <div>
                  <p className="font-orbitron font-bold text-xs text-white">
                    {label}
                  </p>
                  <p className="text-gray-600 text-xs">{desc}</p>
                </div>
                <Switch
                  checked={val}
                  onCheckedChange={set}
                  className={val ? color : ""}
                />
              </div>
            ))}
            <div
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 border-2 transition-all ${
                wingoMod
                  ? "border-green-400 bg-green-950"
                  : "border-gray-700 bg-gray-950"
              }`}
            >
              <div>
                <p
                  className={`font-orbitron font-bold text-xs ${wingoMod ? "text-green-400" : "text-white"}`}
                >
                  ⚡ WINGO MOD ON
                </p>
                <p className="text-gray-500 text-xs">
                  {wingoMod
                    ? "Hack mode auto-activated!"
                    : "Auto-activates hack mode"}
                </p>
              </div>
              <Switch
                checked={wingoMod}
                onCheckedChange={(val) => {
                  setWingoMod(val);
                  if (val) {
                    setHackMode(true);
                    toast.success(
                      "⚡ WINGO MOD ON — HACK MODE AUTO-ACTIVATED!",
                    );
                  }
                }}
                className={wingoMod ? "data-[state=checked]:bg-green-500" : ""}
              />
            </div>
          </div>
        </div>

        {/* Maintenance Fund */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-cyan-900"} rounded-xl p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-2 tracking-widest ${
              hackMode ? "text-green-400" : "text-cyan-400"
            }`}
          >
            💰 MAINTENANCE FUND
          </p>
          <div
            className={`mb-3 px-3 py-2 rounded-lg border ${
              hackMode
                ? "border-green-800 bg-green-950"
                : "border-yellow-800 bg-yellow-950"
            }`}
          >
            {hackMode ? (
              <p className="font-orbitron text-xs text-green-400 text-center">
                ✅ HACK MODE: 100% PROFIT — NO LOSS
              </p>
            ) : (
              <>
                <p className="font-orbitron text-xs text-yellow-400 text-center font-bold">
                  Pattern: 4 WIN + 1 LOSS per cycle
                </p>
                <div className="flex justify-center gap-1.5 mt-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs font-orbitron font-black border ${
                        i === cyclePos
                          ? i === 4
                            ? "bg-red-600 border-red-400 text-white"
                            : "bg-green-600 border-green-400 text-black"
                          : i === 4
                            ? "bg-red-950 border-red-800 text-red-600"
                            : "bg-green-950 border-green-800 text-green-700"
                      }`}
                    >
                      {i === 4 ? "L" : "W"}
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-xs text-center mt-1">
                  Step {cyclePos + 1}/5 in current cycle
                </p>
              </>
            )}
          </div>
          <div className="space-y-2">
            {FUND_LEVELS.map((fl) => (
              <div
                key={fl.level}
                className={`flex items-center justify-between rounded-lg p-2.5 border transition-all ${
                  selectedFundLevel === fl.level
                    ? "border-green-400 bg-green-950"
                    : "border-gray-800 bg-gray-950"
                }`}
              >
                <div>
                  <span className="font-orbitron font-bold text-xs text-white">
                    LEVEL {fl.level}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">
                    {fl.amount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-orbitron font-black text-sm">
                    {fl.multiplier}x
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFundLevel(fl.level);
                      if (fl.level >= 4) setHackMode(true);
                      toast.success(
                        `Level ${fl.level} activated! ${fl.multiplier}x profit`,
                      );
                    }}
                    className={`text-xs font-bold px-3 py-1 rounded ${
                      selectedFundLevel === fl.level
                        ? "bg-green-600 text-black"
                        : "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {selectedFundLevel === fl.level ? "✓ ACTIVE" : "SELECT"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gift Code */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-cyan-900"} rounded-xl p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-3 tracking-widest flex items-center gap-2 ${
              hackMode ? "text-green-400" : "text-cyan-400"
            }`}
          >
            <Gift className="w-3 h-3" /> GIFT CODE
          </p>
          <div className="flex gap-2">
            <Input
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
              placeholder="Enter code..."
              className={`bg-gray-950 flex-1 ${
                hackMode
                  ? "border-green-700 text-green-300 placeholder:text-green-900"
                  : "border-cyan-900 text-white"
              } font-orbitron text-sm uppercase`}
            />
            <button
              type="button"
              onClick={handleRedeem}
              className={`px-4 py-2 font-orbitron font-bold text-xs rounded ${
                hackMode
                  ? "bg-green-600 text-black hover:bg-green-500"
                  : "bg-cyan-700 text-white hover:bg-cyan-600"
              } transition-colors`}
            >
              REDEEM
            </button>
          </div>
          {redeemed.size > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {[...redeemed].map((code) => (
                <Badge
                  key={code}
                  className="bg-green-900 text-green-400 border border-green-700 text-xs"
                >
                  ✓ {code}
                </Badge>
              ))}
            </div>
          )}
          <p
            className={`mt-2 text-xs ${hackMode ? "text-green-800" : "text-gray-700"}`}
          >
            Try: NOLOSS, WIN100, PROFIT5X, HACK999, PROFITKING
          </p>
        </div>

        {/* History */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-cyan-900"} rounded-xl overflow-hidden bg-black`}
        >
          <div
            className={`px-4 py-3 border-b ${hackMode ? "border-green-900" : "border-cyan-950"}`}
          >
            <p
              className={`font-orbitron text-xs font-bold tracking-widest flex items-center gap-2 ${
                hackMode ? "text-green-400" : "text-cyan-400"
              }`}
            >
              <Rocket className="w-3 h-3" /> PREDICTION HISTORY
            </p>
          </div>
          {history.length === 0 ? (
            <div className="text-center text-gray-700 py-6 font-orbitron text-xs">
              No history yet. Click a number and INJECT!
            </div>
          ) : (
            <div className="divide-y divide-gray-900">
              {history.map((entry, idx) => (
                <div
                  key={`${entry.period}-${idx}`}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-orbitron font-black flex-shrink-0 border-2 ${
                      entry.bigSmall === "BIG"
                        ? "bg-orange-800 border-orange-500 text-orange-100"
                        : "bg-red-700 border-red-400 text-red-100"
                    }`}
                    style={{
                      boxShadow:
                        entry.bigSmall === "BIG"
                          ? "0 0 8px rgba(255,140,0,0.4)"
                          : "0 0 8px rgba(255,50,50,0.4)",
                    }}
                  >
                    <span className="text-xl leading-none">{entry.number}</span>
                    <span
                      className={`text-xs mt-0.5 ${entry.bigSmall === "BIG" ? "text-orange-300" : "text-red-300"}`}
                    >
                      {entry.bigSmall}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron text-xs text-white truncate">
                      {entry.period}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {entry.dateTime}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-bold ${
                        entry.color === "green"
                          ? "bg-green-900 text-green-400"
                          : entry.color === "red"
                            ? "bg-red-900 text-red-400"
                            : "bg-purple-900 text-purple-400"
                      }`}
                    >
                      {entry.color}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setHistory((prev) =>
                          prev.map((h, i) =>
                            i === idx
                              ? {
                                  ...h,
                                  result:
                                    h.result === "Succeed" ? "Loss" : "Succeed",
                                }
                              : h,
                          ),
                        )
                      }
                      className={`text-xs font-orbitron font-bold px-2 py-0.5 rounded border ${
                        entry.result === "Succeed"
                          ? "border-green-600 text-green-400 bg-green-950"
                          : "border-red-600 text-red-400 bg-red-950"
                      }`}
                    >
                      {entry.result}
                    </button>
                    <p
                      className={`font-orbitron font-black text-sm mt-1 ${entry.profit < 0 ? "text-red-400" : "text-green-400"}`}
                    >
                      {formatRupees(entry.profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pb-2">
          <p className="text-gray-800 text-xs">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-900 hover:text-cyan-700"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
