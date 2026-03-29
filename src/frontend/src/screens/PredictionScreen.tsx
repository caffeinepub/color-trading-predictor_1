import { useCallback, useEffect, useState } from "react";

interface PredictionResult {
  num1: number;
  num2: number;
  type: "BIG" | "SMALL";
  color: string;
  profit: number;
  isWin: boolean;
}

interface HistoryEntry {
  id: number;
  period: string;
  num1: number;
  num2: number;
  type: "BIG" | "SMALL";
  color: string;
  profit: number;
  isWin: boolean;
  status: "Succeed" | "Loss";
  datetime: string;
}

function getPrediction(
  selectedNum: number | null,
  tradeCount: number,
  hackMode: boolean,
): PredictionResult {
  if (hackMode) {
    const num1 = 5 + Math.floor(Math.random() * 5);
    const num2 = 5 + Math.floor(Math.random() * 5);
    const profit = Number.parseFloat((5 + Math.random() * 4.9).toFixed(1));
    return { num1, num2, type: "BIG", color: "GREEN", profit, isWin: true };
  }

  const positionInCycle = tradeCount % 5;
  const isLoss = positionInCycle === 4;

  if (selectedNum !== null) {
    const isBig = selectedNum >= 5;
    if (isLoss) {
      const lossNum1 = isBig
        ? Math.floor(Math.random() * 5)
        : 5 + Math.floor(Math.random() * 5);
      const lossNum2 = isBig
        ? Math.floor(Math.random() * 5)
        : 5 + Math.floor(Math.random() * 5);
      return {
        num1: lossNum1,
        num2: lossNum2,
        type: isBig ? "SMALL" : "BIG",
        color: isBig ? "RED" : "GREEN",
        profit: 0,
        isWin: false,
      };
    }
    const num1 = isBig
      ? 5 + Math.floor(Math.random() * 5)
      : Math.floor(Math.random() * 5);
    const num2 = isBig
      ? 5 + Math.floor(Math.random() * 5)
      : Math.floor(Math.random() * 5);
    const profit = Number.parseFloat((1.8 + Math.random() * 1.2).toFixed(2));
    return {
      num1,
      num2,
      type: isBig ? "BIG" : "SMALL",
      color: isBig ? "GREEN" : "RED",
      profit,
      isWin: true,
    };
  }

  const num1 = 5 + Math.floor(Math.random() * 5);
  const num2 = 5 + Math.floor(Math.random() * 5);
  return {
    num1,
    num2,
    type: "BIG",
    color: "GREEN",
    profit: Number.parseFloat((1.8 + Math.random() * 1.2).toFixed(2)),
    isWin: true,
  };
}

function generatePeriodNumber(mode: "30s" | "1m" | "3m" | "5m"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const secondsFromMidnight =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  let gameId: string;
  let intervalSeconds: number;

  switch (mode) {
    case "30s":
      gameId = "10002";
      intervalSeconds = 30;
      break;
    case "3m":
      gameId = "10003";
      intervalSeconds = 180;
      break;
    case "5m":
      gameId = "10005";
      intervalSeconds = 300;
      break;
    default:
      gameId = "10001";
      intervalSeconds = 60;
      break;
  }

  const periodNum = Math.floor(secondsFromMidnight / intervalSeconds) + 1;
  const periodStr = String(periodNum).padStart(3, "0");
  return `${year}${month}${day}${gameId}${periodStr}`;
}

const FUND_LEVELS = [
  { level: 1, amount: 100, multiplier: 1.8 },
  { level: 2, amount: 500, multiplier: 2.5 },
  { level: 3, amount: 1000, multiplier: 4.0 },
  { level: 4, amount: 5000, multiplier: 7.0 },
  { level: 5, amount: 10000, multiplier: 9.9 },
];

const HACK_CODES = new Set([
  "NOLOSS",
  "WIN100",
  "HACK999",
  "PROFITKING",
  "NOLOSSBIG",
  "ELITE999",
  "VIPWIN",
  "MASTER7",
  "GODMODE",
  "PROFIT777",
  "PROFIT5X",
  "HACKWIN",
]);
const VIP_CODES = new Set([
  "VIP2024",
  "LUCKY6",
  "PROFIT99",
  "HACKPROFIT",
  "BIGWIN",
  "MAXPROFIT",
]);
const FUND_CODES = new Set(["LEVEL5", "FUND5"]);

export default function PredictionScreen({ onBack }: { onBack: () => void }) {
  const [hackMode, setHackMode] = useState(false);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState<[number, number]>([7, 8]);
  const [tradeCount, setTradeCount] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [giftCode, setGiftCode] = useState("");
  const [giftMsg, setGiftMsg] = useState("");
  const [fundLevel, setFundLevel] = useState(1);
  const [periodInput, setPeriodInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "main" | "bdg" | "fund" | "bypass"
  >("main");

  // BDG WIN
  const [bdgPeriod, setBdgPeriod] = useState("");
  const [bdgResult, setBdgResult] = useState<PredictionResult | null>(null);
  const [bdgTimeMode, setBdgTimeMode] = useState<"30s" | "1m" | "3m" | "5m">(
    "1m",
  );
  const [autoPeriod, setAutoPeriod] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [bdgSpinning, setBdgSpinning] = useState(false);
  const [bdgSpinDisplay, setBdgSpinDisplay] = useState<[number, number]>([
    5, 7,
  ]);

  // BYPASS
  const [bypassGds1, setBypassGds1] = useState(false);
  const [bypassGds2, setBypassGds2] = useState(false);
  const [bypassMain, setBypassMain] = useState(false);
  const [wingoMod, setWingoMod] = useState(false);

  // Trend history for BDG
  const [bdgHistory, setBdgHistory] = useState<("BIG" | "SMALL")[]>([]);

  useEffect(() => {
    if (wingoMod) setHackMode(true);
  }, [wingoMod]);

  useEffect(() => {
    setAutoPeriod(generatePeriodNumber(bdgTimeMode));
    const intervalSeconds =
      bdgTimeMode === "30s"
        ? 30
        : bdgTimeMode === "1m"
          ? 60
          : bdgTimeMode === "3m"
            ? 180
            : 300;
    const now = new Date();
    const secondsFromMidnight =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const remaining = intervalSeconds - (secondsFromMidnight % intervalSeconds);
    setCountdown(remaining);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setAutoPeriod(generatePeriodNumber(bdgTimeMode));
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bdgTimeMode]);

  const triggerPrediction = useCallback(
    (num: number | null) => {
      if (spinning) return;
      setSpinning(true);
      const result = getPrediction(num, tradeCount, hackMode);

      const spinInterval = setInterval(() => {
        setSpinDisplay([
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
        ]);
      }, 80);

      setTimeout(() => {
        clearInterval(spinInterval);
        setSpinning(false);
        setSpinDisplay([result.num1, result.num2]);
        setPrediction(result);
        setTradeCount((prev) => prev + 1);
      }, 800);
    },
    [spinning, tradeCount, hackMode],
  );

  const handleNumberClick = (n: number) => {
    setSelectedNum(n);
    triggerPrediction(n);
  };

  const handlePeriodPredict = () => {
    triggerPrediction(selectedNum);
  };

  const handleInject = () => {
    const p = prediction;
    const fundMultiplier = FUND_LEVELS[fundLevel - 1].multiplier;
    const profitAmt = Math.round(fundMultiplier * 100);
    const now = new Date();
    const entry: HistoryEntry = {
      id: Date.now(),
      period:
        periodInput ||
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`,
      num1: p ? p.num1 : 5 + Math.floor(Math.random() * 5),
      num2: p ? p.num2 : 5 + Math.floor(Math.random() * 5),
      type: p ? p.type : "BIG",
      color: p ? p.color : "GREEN",
      profit: profitAmt,
      isWin: true,
      status: "Succeed",
      datetime: now.toLocaleString(),
    };
    setHistory((prev) => [entry, ...prev]);
  };

  const handleRedeemCode = () => {
    const code = giftCode.trim().toUpperCase();
    if (HACK_CODES.has(code)) {
      setHackMode(true);
      if (code === "PROFIT5X" || code === "HACKWIN") setFundLevel(4);
      setGiftMsg("✅ HACK ACTIVATED! 100% PROFIT MODE ON");
    } else if (VIP_CODES.has(code)) {
      setFundLevel(3);
      setGiftMsg("✅ VIP BONUS ACTIVATED");
    } else if (FUND_CODES.has(code)) {
      setFundLevel(5);
      setGiftMsg("✅ FUND LEVEL 5 UNLOCKED! 9.9x PROFIT");
    } else {
      setGiftMsg("❌ Invalid code. Try: NOLOSS, WIN100, HACK999, ELITE999");
    }
    setGiftCode("");
    setTimeout(() => setGiftMsg(""), 4000);
  };

  const triggerBdgResult = (period: string) => {
    if (bdgSpinning) return;
    setBdgSpinning(true);
    const result = getPrediction(null, bdgHistory.length, hackMode);

    const spinInterval = setInterval(() => {
      setBdgSpinDisplay([
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);
      setBdgSpinning(false);
      setBdgSpinDisplay([result.num1, result.num2]);
      setBdgResult(result);
      setBdgHistory((prev) => [result.type, ...prev].slice(0, 5));
      if (period) setBdgPeriod(period);
    }, 800);
  };

  const toggleWL = (id: number) => {
    setHistory((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, isWin: !e.isWin, status: e.isWin ? "Loss" : "Succeed" }
          : e,
      ),
    );
  };

  const wins = history.filter((e) => e.isWin).length;
  const losses = history.filter((e) => !e.isWin).length;

  const colorBadgeStyle = (color: string) => {
    if (color === "GREEN")
      return {
        background: "#00ff8822",
        border: "1px solid #00ff88",
        color: "#00ff88",
      };
    if (color === "RED")
      return {
        background: "#ff000022",
        border: "1px solid #ff4444",
        color: "#ff4444",
      };
    if (color === "CYAN")
      return {
        background: "#00ffff22",
        border: "1px solid #00ffff",
        color: "#00ffff",
      };
    return {
      background: "#a855f722",
      border: "1px solid #a855f7",
      color: "#a855f7",
    };
  };

  const isBig = prediction?.type === "BIG";

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: "Rajdhani, Orbitron, sans-serif" }}
    >
      {/* Matrix rain overlay in hack mode */}
      {hackMode && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
          }}
        />
      )}

      <div className="relative z-10 max-w-lg mx-auto pb-20">
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{ background: "#000", borderBottom: "1px solid #222" }}
        >
          <button
            type="button"
            data-ocid="nav.link"
            onClick={onBack}
            className="text-gray-400 hover:text-white text-sm font-bold px-3 py-1 rounded-lg"
            style={{ border: "1px solid #333" }}
          >
            ← BACK
          </button>
          <span
            className="text-lg font-black tracking-widest"
            style={{
              fontFamily: "Orbitron, monospace",
              color: hackMode ? "#00ff88" : "#ffd700",
              textShadow: hackMode ? "0 0 10px #00ff88" : "0 0 10px #ffd700",
            }}
          >
            ⚡ ELITE VIP
          </span>
          <button
            type="button"
            data-ocid="main.toggle"
            onClick={() => setHackMode((h) => !h)}
            className="text-xs font-black px-3 py-2 rounded-xl transition-all"
            style={{
              background: hackMode ? "#00ff8822" : "#1a1a1a",
              border: hackMode ? "2px solid #00ff88" : "2px solid #444",
              color: hackMode ? "#00ff88" : "#888",
              boxShadow: hackMode ? "0 0 12px #00ff8866" : "none",
            }}
          >
            {hackMode ? "HACK ON 🔥" : "HACK OFF"}
          </button>
        </div>

        {/* HACK MODE BANNER */}
        {hackMode && (
          <div
            className="mx-3 mt-2 py-2 px-4 rounded-xl text-center font-black text-sm tracking-widest animate-pulse"
            style={{
              background: "#00ff8811",
              border: "2px solid #00ff88",
              color: "#00ff88",
              boxShadow: "0 0 20px #00ff8855",
              textShadow: "0 0 8px #00ff88",
            }}
            data-ocid="main.success_state"
          >
            ⚡ NO LOSS HACK ACTIVE — 100% PROFIT GUARANTEED
          </div>
        )}

        {/* TAB BAR */}
        <div
          className="flex mx-3 mt-3 rounded-xl overflow-hidden"
          style={{ background: "#111" }}
        >
          {(["main", "bdg", "fund", "bypass"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              data-ocid={`nav.${tab}.tab`}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all"
              style={{
                background: activeTab === tab ? "#1a1a1a" : "transparent",
                color: activeTab === tab ? "#ffd700" : "#666",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #ffd700"
                    : "2px solid transparent",
              }}
            >
              {tab === "main"
                ? "🎯 MAIN"
                : tab === "bdg"
                  ? "🏆 BDG"
                  : tab === "fund"
                    ? "💰 FUND"
                    : "🔧 BYPASS"}
            </button>
          ))}
        </div>

        {/* ====== MAIN TAB ====== */}
        {activeTab === "main" && (
          <div className="px-3 pt-3 space-y-3">
            {/* NUMBER SELECTOR */}
            <div
              className="p-3 rounded-xl"
              style={{ background: "#111", border: "1px solid #222" }}
            >
              <p className="text-xs font-bold text-gray-500 mb-2 tracking-widest">
                SELECT NUMBER
              </p>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <button
                    type="button"
                    key={`number-${i}`}
                    data-ocid={`num.button.${i + 1}` as `num.button.${number}`}
                    onClick={() => handleNumberClick(i)}
                    className="w-9 h-9 rounded-full font-black text-sm transition-all hover:scale-110 active:scale-95"
                    style={{
                      background:
                        selectedNum === i
                          ? i >= 5
                            ? "#f9731633"
                            : "#ef444433"
                          : "#1a1a1a",
                      border:
                        selectedNum === i
                          ? i >= 5
                            ? "2px solid #f97316"
                            : "2px solid #ef4444"
                          : "2px solid #333",
                      color: i >= 5 ? "#f97316" : "#ef4444",
                      boxShadow:
                        selectedNum === i
                          ? i >= 5
                            ? "0 0 10px #f9731666"
                            : "0 0 10px #ef444466"
                          : "none",
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* JACKPOT DISPLAY */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "#0a0a0a",
                border: isBig
                  ? "2px solid #f97316"
                  : prediction?.type === "SMALL"
                    ? "2px solid #ef4444"
                    : "2px solid #333",
                boxShadow: isBig
                  ? "0 0 25px #f9731644"
                  : prediction?.type === "SMALL"
                    ? "0 0 25px #ef444444"
                    : "none",
              }}
            >
              <p
                className="text-xs font-black text-center tracking-widest mb-3"
                style={{
                  color: isBig
                    ? "#f97316"
                    : prediction?.type === "SMALL"
                      ? "#ef4444"
                      : "#666",
                }}
              >
                {prediction
                  ? prediction.type === "BIG"
                    ? "BIG ▶ 5·6·7·8·9"
                    : "SMALL ▶ 0·1·2·3·4"
                  : "SELECT A NUMBER"}
              </p>
              <div className="flex justify-center gap-6">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className="w-24 h-24 rounded-2xl flex items-center justify-center font-black transition-all"
                    style={{
                      background: isBig
                        ? "#1a0a0033"
                        : prediction?.type === "SMALL"
                          ? "#1a000033"
                          : "#111",
                      border: isBig
                        ? "3px solid #f97316"
                        : prediction?.type === "SMALL"
                          ? "3px solid #ef4444"
                          : "3px solid #333",
                      fontSize: "3.5rem",
                      color: isBig
                        ? "#f97316"
                        : prediction?.type === "SMALL"
                          ? "#ef4444"
                          : "#555",
                      boxShadow: spinning
                        ? "0 0 20px #ffffff33"
                        : isBig
                          ? "0 0 20px #f9731666"
                          : prediction?.type === "SMALL"
                            ? "0 0 20px #ef444466"
                            : "none",
                      fontFamily: "Orbitron, monospace",
                      transform: spinning ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.1s ease",
                    }}
                  >
                    {prediction || spinning ? spinDisplay[idx] : "?"}
                  </div>
                ))}
              </div>
            </div>

            {/* PREDICTION CARDS */}
            <div className="grid grid-cols-2 gap-2">
              {/* BIG/SMALL */}
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "#111",
                  border: hackMode ? "1px solid #00ff88" : "1px solid #222",
                  boxShadow: hackMode ? "0 0 10px #00ff8833" : "none",
                }}
              >
                <p className="text-xs text-gray-500 font-bold mb-1">NEXT</p>
                <p
                  className="text-xl font-black"
                  style={{
                    color:
                      prediction?.type === "BIG"
                        ? "#f97316"
                        : prediction?.type === "SMALL"
                          ? "#ef4444"
                          : "#555",
                    textShadow:
                      prediction?.type === "BIG"
                        ? "0 0 8px #f97316"
                        : prediction?.type === "SMALL"
                          ? "0 0 8px #ef4444"
                          : "none",
                  }}
                >
                  {prediction ? prediction.type : "---"}
                </p>
                {prediction && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={colorBadgeStyle(prediction.color)}
                  >
                    {prediction.color}
                  </span>
                )}
              </div>

              {/* Lucky Numbers */}
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "#111",
                  border: hackMode ? "1px solid #00ff88" : "1px solid #222",
                  boxShadow: hackMode ? "0 0 10px #00ff8833" : "none",
                }}
              >
                <p className="text-xs text-gray-500 font-bold mb-1">LUCKY</p>
                <p
                  className="text-xl font-black"
                  style={{ color: "#ffd700", textShadow: "0 0 8px #ffd700" }}
                >
                  {prediction
                    ? `${prediction.num1} • ${prediction.num2}`
                    : hackMode
                      ? `${5 + Math.floor(Math.random() * 5)} • ${5 + Math.floor(Math.random() * 5)}`
                      : "-- • --"}
                </p>
              </div>

              {/* Color Signal */}
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "#111",
                  border: hackMode ? "1px solid #00ff88" : "1px solid #222",
                  boxShadow: hackMode ? "0 0 10px #00ff8833" : "none",
                }}
              >
                <p className="text-xs text-gray-500 font-bold mb-1">
                  COLOR SIGNAL
                </p>
                <span
                  className="text-sm font-black px-3 py-1 rounded-full"
                  style={colorBadgeStyle(
                    hackMode ? "CYAN" : prediction?.color || "GREEN",
                  )}
                >
                  {hackMode ? "CYAN" : prediction?.color || "---"}
                </span>
              </div>

              {/* Profit */}
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "#111",
                  border: hackMode ? "1px solid #00ff88" : "1px solid #222",
                  boxShadow: hackMode ? "0 0 10px #00ff8833" : "none",
                }}
              >
                <p className="text-xs text-gray-500 font-bold mb-1">PROFIT</p>
                <p
                  className="text-xl font-black"
                  style={{ color: "#00ff88", textShadow: "0 0 8px #00ff88" }}
                >
                  {prediction
                    ? prediction.isWin
                      ? `${prediction.profit}x`
                      : "LOSS"
                    : "---"}
                </p>
                {hackMode && (
                  <p className="text-xs" style={{ color: "#00ff8888" }}>
                    NO LOSS
                  </p>
                )}
              </div>
            </div>

            {/* Period Input */}
            <div className="flex gap-2">
              <input
                data-ocid="main.input"
                value={periodInput}
                onChange={(e) => setPeriodInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePeriodPredict()}
                placeholder="Enter period number..."
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <button
                type="button"
                data-ocid="main.submit_button"
                onClick={handlePeriodPredict}
                disabled={spinning}
                className="px-4 py-2 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #ffd700, #f97316)",
                  color: "#000",
                  boxShadow: "0 0 12px #ffd70066",
                }}
              >
                PREDICT
              </button>
            </div>

            {/* INJECT BUTTON */}
            <button
              type="button"
              data-ocid="main.primary_button"
              onClick={handleInject}
              className="w-full py-3 rounded-xl font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
                border: "2px solid #ef4444",
                color: "#fff",
                boxShadow: "0 0 20px #ef444455",
                textShadow: "0 0 8px #fff",
              }}
            >
              💉 INJECT PROFIT
            </button>

            {/* Win/Loss Stats */}
            <div className="flex gap-3">
              <div
                className="flex-1 p-2 rounded-xl text-center"
                style={{
                  background: "#00ff8811",
                  border: "1px solid #00ff8833",
                }}
              >
                <p className="text-xs text-gray-500">WINS</p>
                <p className="text-2xl font-black" style={{ color: "#00ff88" }}>
                  {wins}
                </p>
              </div>
              <div
                className="flex-1 p-2 rounded-xl text-center"
                style={{
                  background: "#ef444411",
                  border: "1px solid #ef444433",
                }}
              >
                <p className="text-xs text-gray-500">LOSSES</p>
                <p className="text-2xl font-black" style={{ color: "#ef4444" }}>
                  {losses}
                </p>
              </div>
              <div
                className="flex-1 p-2 rounded-xl text-center"
                style={{
                  background: "#ffd70011",
                  border: "1px solid #ffd70033",
                }}
              >
                <p className="text-xs text-gray-500">TRADE#</p>
                <p className="text-2xl font-black" style={{ color: "#ffd700" }}>
                  {tradeCount}
                </p>
              </div>
            </div>

            {/* HISTORY TABLE */}
            {history.length > 0 && (
              <div
                className="rounded-xl overflow-hidden"
                data-ocid="history.table"
                style={{ border: "1px solid #222" }}
              >
                <div
                  className="px-3 py-2 text-xs font-black tracking-widest"
                  style={{ background: "#1a1a00", color: "#ffd700" }}
                >
                  📊 HISTORY
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "#111" }}>
                        <th className="px-2 py-2 text-left text-gray-500">
                          Period
                        </th>
                        <th className="px-2 py-2 text-gray-500">Nums</th>
                        <th className="px-2 py-2 text-gray-500">Type</th>
                        <th className="px-2 py-2 text-gray-500">Profit</th>
                        <th className="px-2 py-2 text-gray-500">Status</th>
                        <th className="px-2 py-2 text-gray-500">W/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 20).map((entry, idx) => (
                        <tr
                          key={entry.id}
                          data-ocid={
                            `history.row.${idx + 1}` as `history.row.${number}`
                          }
                          style={{
                            background: idx % 2 === 0 ? "#0a0a0a" : "#111",
                          }}
                        >
                          <td
                            className="px-2 py-2 text-gray-400 font-mono"
                            style={{ fontSize: "10px" }}
                          >
                            {entry.period.slice(-8)}
                          </td>
                          <td
                            className="px-2 py-2 text-center font-black"
                            style={{ color: "#ffd700" }}
                          >
                            {entry.num1}·{entry.num2}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span
                              className="px-1 py-0.5 rounded font-black"
                              style={{
                                color:
                                  entry.type === "BIG" ? "#f97316" : "#ef4444",
                                fontSize: "10px",
                              }}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td
                            className="px-2 py-2 text-center font-black"
                            style={{ color: "#00ff88" }}
                          >
                            +₹{entry.profit}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span
                              className="px-2 py-0.5 rounded-full font-black"
                              style={{
                                background:
                                  entry.status === "Succeed"
                                    ? "#00ff8822"
                                    : "#ef444422",
                                color:
                                  entry.status === "Succeed"
                                    ? "#00ff88"
                                    : "#ef4444",
                                fontSize: "10px",
                              }}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              data-ocid={
                                `history.toggle.${idx + 1}` as `history.toggle.${number}`
                              }
                              onClick={() => toggleWL(entry.id)}
                              className="px-2 py-0.5 rounded-full font-black transition-all"
                              style={{
                                background: entry.isWin
                                  ? "#00ff8822"
                                  : "#ef444422",
                                border: entry.isWin
                                  ? "1px solid #00ff88"
                                  : "1px solid #ef4444",
                                color: entry.isWin ? "#00ff88" : "#ef4444",
                                fontSize: "10px",
                              }}
                            >
                              {entry.isWin ? "W" : "L"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {history.length === 0 && (
              <div
                className="p-6 rounded-xl text-center"
                data-ocid="history.empty_state"
                style={{ background: "#111", border: "1px solid #222" }}
              >
                <p className="text-gray-600 text-sm">
                  No history yet. Click INJECT to add profit entries.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ====== BDG WIN TAB ====== */}
        {activeTab === "bdg" && (
          <div className="px-3 pt-3 space-y-3">
            {/* Header */}
            <div
              className="p-4 rounded-xl text-center"
              style={{
                background: "linear-gradient(135deg, #1a1200, #2a1f00)",
                border: "2px solid #ffd700",
                boxShadow: "0 0 20px #ffd70033",
              }}
            >
              <h2
                className="text-2xl font-black tracking-widest"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: "#ffd700",
                  textShadow: "0 0 15px #ffd700",
                }}
              >
                🏆 BDG WIN PREDICTION
              </h2>
              <p className="text-xs text-yellow-600 mt-1">
                SURESHORT JACKPOT SYSTEM
              </p>
            </div>

            {/* Time Selector */}
            <div
              className="flex gap-2"
              style={{
                background: "#111",
                padding: "8px",
                borderRadius: "12px",
              }}
            >
              {(["30s", "1m", "3m", "5m"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  data-ocid={`bdg.${mode}.tab`}
                  onClick={() => setBdgTimeMode(mode)}
                  className="flex-1 py-2 rounded-lg font-black text-sm transition-all"
                  style={{
                    background:
                      bdgTimeMode === mode ? "#00bcd422" : "transparent",
                    border:
                      bdgTimeMode === mode
                        ? "2px solid #00bcd4"
                        : "2px solid #333",
                    color: bdgTimeMode === mode ? "#00bcd4" : "#666",
                    boxShadow:
                      bdgTimeMode === mode ? "0 0 8px #00bcd444" : "none",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Auto Period Box */}
            <div
              className="p-3 rounded-xl"
              style={{ background: "#0a0a0a", border: "1px solid #333" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-gray-500 tracking-widest">
                  🤖 AUTO PERIOD
                </span>
                <span
                  className="text-xs font-black px-2 py-1 rounded-lg"
                  style={{
                    background: "#ef444422",
                    color: "#ef4444",
                    border: "1px solid #ef444444",
                  }}
                >
                  NEXT IN {countdown}s
                </span>
              </div>
              <div
                className="text-center py-2 px-3 rounded-lg font-black font-mono mb-2"
                style={{
                  background: "#111",
                  color: "#00bcd4",
                  border: "1px solid #00bcd444",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  textShadow: "0 0 8px #00bcd4",
                }}
              >
                {autoPeriod}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="bdg.secondary_button"
                  onClick={() => setBdgPeriod(autoPeriod)}
                  className="flex-1 py-2 rounded-lg font-black text-sm"
                  style={{
                    background: "#00bcd422",
                    border: "1px solid #00bcd4",
                    color: "#00bcd4",
                  }}
                >
                  USE
                </button>
                <button
                  type="button"
                  data-ocid="bdg.primary_button"
                  onClick={() => {
                    setBdgPeriod(autoPeriod);
                    triggerBdgResult(autoPeriod);
                  }}
                  className="flex-1 py-2 rounded-lg font-black text-sm"
                  style={{
                    background: "linear-gradient(135deg, #00bcd4, #0097a7)",
                    color: "#000",
                    boxShadow: "0 0 12px #00bcd444",
                  }}
                >
                  AUTO
                </button>
              </div>
            </div>

            {/* Period Input + GET RESULT */}
            <div className="flex gap-2">
              <input
                data-ocid="bdg.input"
                value={bdgPeriod}
                onChange={(e) => setBdgPeriod(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && triggerBdgResult(bdgPeriod)
                }
                placeholder="Enter period number..."
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none font-mono"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: "#00bcd4",
                }}
              />
              <button
                type="button"
                data-ocid="bdg.submit_button"
                onClick={() => triggerBdgResult(bdgPeriod)}
                disabled={bdgSpinning}
                className="px-4 py-2 rounded-xl font-black text-sm transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00bcd4, #0097a7)",
                  color: "#000",
                  boxShadow: "0 0 12px #00bcd466",
                }}
              >
                GET RESULT
              </button>
            </div>

            {/* CURRENT PERIOD */}
            {bdgPeriod && (
              <div
                className="p-2 rounded-xl text-center"
                style={{ background: "#0a1a0a", border: "1px solid #00ff8833" }}
              >
                <p className="text-xs text-gray-500">CURRENT PERIOD</p>
                <p
                  className="font-black font-mono text-sm"
                  style={{ color: "#00ff88", textShadow: "0 0 8px #00ff88" }}
                >
                  {bdgPeriod}
                </p>
              </div>
            )}

            {/* NEXT SURESHORT */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "#0a0a0a",
                border: "2px solid #ffd700",
                boxShadow: "0 0 15px #ffd70033",
              }}
            >
              <p
                className="text-center text-xs font-black tracking-widest mb-3"
                style={{ color: "#ffd700", textShadow: "0 0 8px #ffd700" }}
              >
                🎯 NEXT SURESHORT
              </p>
              <div className="flex justify-center gap-4 mb-3">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center font-black"
                    style={{
                      background:
                        bdgResult?.type === "BIG"
                          ? "#1a0a0033"
                          : bdgResult?.type === "SMALL"
                            ? "#1a000033"
                            : "#111",
                      border:
                        bdgResult?.type === "BIG"
                          ? "3px solid #f97316"
                          : bdgResult?.type === "SMALL"
                            ? "3px solid #ef4444"
                            : "3px solid #333",
                      fontSize: "3rem",
                      color:
                        bdgResult?.type === "BIG"
                          ? "#f97316"
                          : bdgResult?.type === "SMALL"
                            ? "#ef4444"
                            : "#555",
                      boxShadow: bdgSpinning
                        ? "0 0 20px #ffffff33"
                        : bdgResult?.type === "BIG"
                          ? "0 0 15px #f9731644"
                          : "0 0 15px #ef444444",
                      fontFamily: "Orbitron, monospace",
                    }}
                  >
                    {bdgResult || bdgSpinning ? bdgSpinDisplay[idx] : "?"}
                  </div>
                ))}
              </div>
              {bdgResult && (
                <div className="flex justify-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black"
                    style={colorBadgeStyle(bdgResult.color)}
                  >
                    {bdgResult.color}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black"
                    style={{
                      background: "#00ff8822",
                      border: "1px solid #00ff88",
                      color: "#00ff88",
                    }}
                  >
                    {bdgResult.profit}x PROFIT
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black"
                    style={{
                      background:
                        bdgResult.type === "BIG" ? "#f9731622" : "#ef444422",
                      border:
                        bdgResult.type === "BIG"
                          ? "1px solid #f97316"
                          : "1px solid #ef4444",
                      color: bdgResult.type === "BIG" ? "#f97316" : "#ef4444",
                    }}
                  >
                    {bdgResult.type}
                  </span>
                </div>
              )}
            </div>

            {/* Trend Indicator */}
            {bdgHistory.length > 0 && (
              <div
                className="p-3 rounded-xl"
                style={{ background: "#111", border: "1px solid #222" }}
              >
                <p className="text-xs font-black text-gray-500 mb-2 tracking-widest">
                  📈 TREND (LAST {bdgHistory.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(bdgHistory).map(([tIdx, t]) => (
                    <span
                      key={`t-${tIdx}`}
                      className="px-3 py-1 rounded-full text-xs font-black"
                      style={{
                        background: t === "BIG" ? "#f9731622" : "#ef444422",
                        border:
                          t === "BIG"
                            ? "1px solid #f97316"
                            : "1px solid #ef4444",
                        color: t === "BIG" ? "#f97316" : "#ef4444",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {bdgHistory.length >= 3 && (
                  <p className="text-xs mt-2" style={{ color: "#00bcd4" }}>
                    {bdgHistory.filter((x) => x === "BIG").length >= 3
                      ? "📊 BIG streak — SMALL likely next!"
                      : bdgHistory.filter((x) => x === "SMALL").length >= 3
                        ? "📊 SMALL streak — BIG likely next!"
                        : "📊 Mixed trend — follow HACK MODE"}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== FUND TAB ====== */}
        {activeTab === "fund" && (
          <div className="px-3 pt-3 space-y-3">
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: "linear-gradient(135deg, #1a1200, #2a1f00)",
                border: "2px solid #ffd700",
                boxShadow: "0 0 15px #ffd70033",
              }}
            >
              <h2
                className="text-xl font-black tracking-widest"
                style={{
                  color: "#ffd700",
                  textShadow: "0 0 10px #ffd700",
                  fontFamily: "Orbitron, monospace",
                }}
              >
                💰 MAINTENANCE FUND
              </h2>
              <p className="text-xs text-yellow-700 mt-1">
                5-LEVEL PROFIT SYSTEM
              </p>
            </div>

            {/* Fund levels */}
            <div className="space-y-2">
              {FUND_LEVELS.map((fl) => (
                <button
                  type="button"
                  key={fl.level}
                  data-ocid={
                    `fund.button.${fl.level}` as `fund.button.${number}`
                  }
                  onClick={() => setFundLevel(fl.level)}
                  className="w-full p-3 rounded-xl flex items-center justify-between transition-all hover:scale-102"
                  style={{
                    background:
                      fundLevel === fl.level
                        ? "linear-gradient(135deg, #0a1a0a, #112211)"
                        : "#111",
                    border:
                      fundLevel === fl.level
                        ? "2px solid #00ff88"
                        : "1px solid #222",
                    boxShadow:
                      fundLevel === fl.level ? "0 0 15px #00ff8833" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                      style={{
                        background:
                          fundLevel === fl.level ? "#00ff8822" : "#1a1a1a",
                        border:
                          fundLevel === fl.level
                            ? "2px solid #00ff88"
                            : "2px solid #333",
                        color: fundLevel === fl.level ? "#00ff88" : "#666",
                      }}
                    >
                      {fl.level}
                    </span>
                    <div className="text-left">
                      <p
                        className="font-black text-sm"
                        style={{
                          color: fundLevel === fl.level ? "#fff" : "#aaa",
                        }}
                      >
                        Level {fl.level}
                      </p>
                      <p className="text-xs" style={{ color: "#666" }}>
                        ₹{fl.amount.toLocaleString()} fund
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-black text-lg"
                      style={{
                        color: fundLevel === fl.level ? "#00ff88" : "#555",
                        textShadow:
                          fundLevel === fl.level ? "0 0 8px #00ff88" : "none",
                      }}
                    >
                      {fl.multiplier}x
                    </p>
                    <p className="text-xs" style={{ color: "#555" }}>
                      +₹{Math.round(fl.multiplier * 100)}/win
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* W W W W L Pattern tracker */}
            <div
              className="p-4 rounded-xl"
              style={{ background: "#0a0a0a", border: "1px solid #222" }}
            >
              <p className="text-xs font-black text-gray-500 mb-3 tracking-widest">
                PATTERN TRACKER (W W W W L)
              </p>
              <div className="flex gap-3 justify-center">
                {[0, 1, 2, 3, 4].map((pos) => {
                  const cyclePos = tradeCount % 5;
                  const isCurrentPos = pos === cyclePos;
                  const isPastWin = pos < cyclePos && pos < 4;
                  const isPastLoss = pos < cyclePos && pos === 4;
                  const isLossPos = pos === 4;
                  const isHackWin = hackMode;

                  let bg: string;
                  let border: string;
                  let color: string;
                  let label: string;
                  if (isHackWin) {
                    bg = "#00ff8822";
                    border = "2px solid #00ff88";
                    color = "#00ff88";
                    label = "W";
                  } else if (isLossPos && !hackMode) {
                    label = "L";
                    bg = isPastLoss
                      ? "#ef444433"
                      : isCurrentPos
                        ? "#ef444422"
                        : "#1a0000";
                    border = isCurrentPos
                      ? "2px solid #ef4444"
                      : "2px solid #ef444444";
                    color = "#ef4444";
                  } else {
                    label = "W";
                    bg = isPastWin
                      ? "#00ff8833"
                      : isCurrentPos
                        ? "#00ff8822"
                        : "#001a0a";
                    border = isCurrentPos
                      ? "2px solid #00ff88"
                      : "2px solid #00ff8844";
                    color = "#00ff88";
                  }

                  return (
                    <div
                      key={pos}
                      className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                      style={{
                        background: bg,
                        border,
                        color,
                        boxShadow: isCurrentPos
                          ? `0 0 15px ${color}66`
                          : "none",
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center mt-3" style={{ color: "#666" }}>
                {hackMode
                  ? "HACK MODE: 100% WIN — No loss ever!"
                  : `Trade ${tradeCount + 1} — Position ${(tradeCount % 5) + 1}/5`}
              </p>
            </div>
          </div>
        )}

        {/* ====== BYPASS TAB ====== */}
        {activeTab === "bypass" && (
          <div className="px-3 pt-3 space-y-3">
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: "linear-gradient(135deg, #1a0a00, #2a1500)",
                border: "2px solid #f97316",
                boxShadow: "0 0 15px #f9731633",
              }}
            >
              <h2
                className="text-xl font-black tracking-widest"
                style={{
                  color: "#f97316",
                  textShadow: "0 0 10px #f97316",
                  fontFamily: "Orbitron, monospace",
                }}
              >
                🔧 BYPASS CONTROL
              </h2>
              <p className="text-xs text-orange-800 mt-1">WINGO MOD SYSTEM</p>
            </div>

            {/* Bypass Toggles */}
            <div className="space-y-2">
              {(
                [
                  {
                    label: "BYPASS GDS (1)",
                    state: bypassGds1,
                    setter: setBypassGds1,
                    ocid: "bypass.gds1.toggle",
                  },
                  {
                    label: "BYPASS GDS (2)",
                    state: bypassGds2,
                    setter: setBypassGds2,
                    ocid: "bypass.gds2.toggle",
                  },
                  {
                    label: "BYPASS MAIN ID",
                    state: bypassMain,
                    setter: setBypassMain,
                    ocid: "bypass.main.toggle",
                  },
                ] as {
                  label: string;
                  state: boolean;
                  setter: (v: boolean) => void;
                  ocid: string;
                }[]
              ).map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: item.state ? "#1a0f0022" : "#111",
                    border: item.state ? "1px solid #f97316" : "1px solid #222",
                    boxShadow: item.state ? "0 0 10px #f9731633" : "none",
                  }}
                >
                  <span
                    className="font-black text-sm"
                    style={{ color: item.state ? "#f97316" : "#888" }}
                  >
                    {item.label}
                  </span>
                  <button
                    type="button"
                    data-ocid={item.ocid}
                    onClick={() => item.setter(!item.state)}
                    className="w-14 h-7 rounded-full transition-all relative"
                    style={{
                      background: item.state ? "#f97316" : "#333",
                      boxShadow: item.state ? "0 0 10px #f9731666" : "none",
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
                      style={{ left: item.state ? "calc(100% - 26px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}

              {/* WINGO MOD ON */}
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: wingoMod ? "#0a1a0a" : "#111",
                  border: wingoMod ? "2px solid #00ff88" : "1px solid #222",
                  boxShadow: wingoMod ? "0 0 15px #00ff8855" : "none",
                }}
              >
                <div>
                  <span
                    className="font-black text-sm"
                    style={{
                      color: wingoMod ? "#00ff88" : "#888",
                      textShadow: wingoMod ? "0 0 8px #00ff88" : "none",
                    }}
                  >
                    WINGO MOD ON
                  </span>
                  {wingoMod && (
                    <p className="text-xs" style={{ color: "#00ff8888" }}>
                      Hack Mode Auto-Activated
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  data-ocid="bypass.wingo.toggle"
                  onClick={() => setWingoMod(!wingoMod)}
                  className="w-14 h-7 rounded-full transition-all relative"
                  style={{
                    background: wingoMod ? "#00ff88" : "#333",
                    boxShadow: wingoMod ? "0 0 12px #00ff8888" : "none",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
                    style={{ left: wingoMod ? "calc(100% - 26px)" : "2px" }}
                  />
                </button>
              </div>
            </div>

            {/* Gift Code */}
            <div
              className="p-3 rounded-xl"
              style={{ background: "#111", border: "1px solid #333" }}
            >
              <p className="text-xs font-black text-gray-500 mb-2 tracking-widest">
                🎁 REDEEM GIFT CODE
              </p>
              <div className="flex gap-2">
                <input
                  data-ocid="bypass.input"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRedeemCode()}
                  placeholder="Enter code (e.g. NOLOSS)"
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none uppercase"
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #333",
                    color: "#ffd700",
                  }}
                />
                <button
                  type="button"
                  data-ocid="bypass.submit_button"
                  onClick={handleRedeemCode}
                  className="px-4 py-2 rounded-xl font-black text-sm transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "#fff",
                    boxShadow: "0 0 12px #7c3aed55",
                  }}
                >
                  REDEEM
                </button>
              </div>
              {giftMsg && (
                <p
                  className="mt-2 text-xs font-black"
                  data-ocid="bypass.success_state"
                  style={{
                    color: giftMsg.startsWith("✅") ? "#00ff88" : "#ef4444",
                    textShadow: giftMsg.startsWith("✅")
                      ? "0 0 8px #00ff88"
                      : "none",
                  }}
                >
                  {giftMsg}
                </p>
              )}
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  Hack codes: NOLOSS · WIN100 · HACK999 · ELITE999 · GODMODE ·
                  PROFIT777
                </p>
                <p className="text-xs text-gray-600">
                  VIP codes: VIP2024 · BIGWIN · PROFIT99
                </p>
              </div>
            </div>

            {/* Active Status */}
            <div
              className="p-3 rounded-xl"
              style={{ background: "#0a0a0a", border: "1px solid #222" }}
            >
              <p className="text-xs font-black text-gray-500 mb-2">
                ACTIVE STATUS
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-black"
                  style={{
                    background: hackMode ? "#00ff8822" : "#1a1a1a",
                    border: hackMode ? "1px solid #00ff88" : "1px solid #333",
                    color: hackMode ? "#00ff88" : "#444",
                  }}
                >
                  {hackMode ? "✅ HACK ON" : "❌ HACK OFF"}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-black"
                  style={{
                    background: wingoMod ? "#f9731622" : "#1a1a1a",
                    border: wingoMod ? "1px solid #f97316" : "1px solid #333",
                    color: wingoMod ? "#f97316" : "#444",
                  }}
                >
                  {wingoMod ? "✅ WINGO MOD" : "❌ WINGO OFF"}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-black"
                  style={{
                    background: "#ffd70022",
                    border: "1px solid #ffd70044",
                    color: "#ffd700",
                  }}
                >
                  FUND LVL {fundLevel}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 py-2 text-center z-20"
        style={{ background: "#000", borderTop: "1px solid #111" }}
      >
        <p className="text-xs text-gray-700">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
