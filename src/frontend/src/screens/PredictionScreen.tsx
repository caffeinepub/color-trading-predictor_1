import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Gift, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MatrixRain from "../components/MatrixRain";

interface HistoryEntry {
  period: string;
  dateTime: string;
  number: number;
  bigSmall: "BIG" | "SMALL";
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

function getBigSmall(num: number): "BIG" | "SMALL" {
  return num >= 5 ? "BIG" : "SMALL";
}

function getHackProfit(selectedLevel: number): number {
  const base = FUND_LEVELS[selectedLevel - 1]?.rupees ?? 980;
  const extra = Math.floor(Math.random() * 500);
  return base + extra;
}

function getTwoNumbers(num: number, hackMode: boolean): [number, number] {
  if (hackMode) {
    // BIG mode: always 5-9
    const a = BIG_NUMBERS[num % BIG_NUMBERS.length];
    const b = BIG_NUMBERS[(num + 2) % BIG_NUMBERS.length];
    return [a, b];
  }
  const bs = getBigSmall(num);
  if (bs === "BIG") {
    const a = BIG_NUMBERS[num % BIG_NUMBERS.length];
    const b = BIG_NUMBERS[(num + 1) % BIG_NUMBERS.length];
    return [a, b];
  }
  const a = SMALL_NUMBERS[num % SMALL_NUMBERS.length];
  const b = SMALL_NUMBERS[(num + 1) % SMALL_NUMBERS.length];
  return [a, b];
}

function formatRupees(amount: number): string {
  return `+₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(): string {
  const now = new Date();
  return now.toISOString().replace("T", " ").slice(0, 19);
}

interface Props {
  onBack: () => void;
}

export default function PredictionScreen({ onBack }: Props) {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [hackMode, setHackMode] = useState(false);
  const [periodNumber, setPeriodNumber] = useState("");
  const [livePeriod, setLivePeriod] = useState(335);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      period: "20260227100010335",
      dateTime: "2026-02-27 11:04:15",
      number: 7,
      bigSmall: "BIG",
      profit: 1960,
      result: "Succeed",
    },
    {
      period: "20260227100010335",
      dateTime: "2026-02-27 11:04:14",
      number: 6,
      bigSmall: "BIG",
      profit: 1764,
      result: "Succeed",
    },
    {
      period: "20260227100010335",
      dateTime: "2026-02-27 11:04:12",
      number: 8,
      bigSmall: "BIG",
      profit: 1960,
      result: "Succeed",
    },
  ]);
  const [giftCode, setGiftCode] = useState("");
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [badgeActive, setBadgeActive] = useState(false);
  const [selectedFundLevel, setSelectedFundLevel] = useState(4);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinNums, setSpinNums] = useState<[number, number]>([7, 8]);
  const [finalNums, setFinalNums] = useState<[number, number]>([7, 8]);
  const [showInjectPanel, setShowInjectPanel] = useState(false);
  const [injectNum, setInjectNum] = useState(6);
  const [injectBigSmall, setInjectBigSmall] = useState<"BIG" | "SMALL">("BIG");

  // BYPASS toggles
  const [bypassGds1, setBypassGds1] = useState(false);
  const [bypassGds2, setBypassGds2] = useState(true);
  const [bypassMainId, setBypassMainId] = useState(false);
  const [wingoMod, setWingoMod] = useState(false);

  const spinInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const wins = history.filter((h) => h.result === "Succeed").length;
  const losses = history.filter((h) => h.result === "Loss").length;

  // Live period auto-increment
  useEffect(() => {
    const t = setInterval(() => {
      setLivePeriod((p) => p + 1);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const triggerSpin = useCallback((n: number, hack: boolean) => {
    if (spinInterval.current) clearInterval(spinInterval.current);
    const [fn1, fn2] = getTwoNumbers(n, hack);
    setIsSpinning(true);
    setShowInjectPanel(false);
    const startTime = Date.now();
    spinInterval.current = setInterval(() => {
      if (Date.now() - startTime >= 900) {
        clearInterval(spinInterval.current!);
        setFinalNums([fn1, fn2]);
        setSpinNums([fn1, fn2]);
        setIsSpinning(false);
        const bs = hack ? "BIG" : getBigSmall(n);
        setInjectNum(fn1);
        setInjectBigSmall(bs);
        setShowInjectPanel(true);
      } else {
        if (hack) {
          setSpinNums([
            BIG_NUMBERS[Math.floor(Math.random() * BIG_NUMBERS.length)],
            BIG_NUMBERS[Math.floor(Math.random() * BIG_NUMBERS.length)],
          ]);
        } else {
          const bs2 = getBigSmall(n);
          const pool = bs2 === "BIG" ? BIG_NUMBERS : SMALL_NUMBERS;
          setSpinNums([
            pool[Math.floor(Math.random() * pool.length)],
            pool[Math.floor(Math.random() * pool.length)],
          ]);
        }
      }
    }, 70);
  }, []);

  const handleNumberClick = useCallback(
    (n: number) => {
      setSelectedNum(n);
      triggerSpin(n, hackMode);
    },
    [hackMode, triggerSpin],
  );

  const handleInject = useCallback(() => {
    const profitRupees = getHackProfit(selectedFundLevel);
    const period = periodNumber || `20260227100010${livePeriod}`;
    const entry: HistoryEntry = {
      period,
      dateTime: formatDateTime(),
      number: injectNum,
      bigSmall: injectBigSmall,
      profit: profitRupees,
      result: hackMode ? "Succeed" : Math.random() > 0.2 ? "Succeed" : "Loss",
    };
    setHistory((prev) => [entry, ...prev.slice(0, 19)]);
    setShowInjectPanel(false);
    setLivePeriod((p) => p + 1);
    toast.success(`✅ INJECTED! ${formatRupees(profitRupees)} PROFIT!`);
  }, [
    hackMode,
    selectedFundLevel,
    injectNum,
    injectBigSmall,
    periodNumber,
    livePeriod,
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
      } else {
        toast.success("✅ Code redeemed! VIP badge activated!");
      }
      setGiftCode("");
    } else {
      toast.error("Invalid code!");
    }
  }, [giftCode, redeemed]);

  const displayNums = isSpinning ? spinNums : finalNums;
  const currentBigSmall =
    selectedNum !== null ? (hackMode ? "BIG" : getBigSmall(selectedNum)) : null;

  const todayDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      className={`min-h-screen bg-black relative overflow-x-hidden ${hackMode ? "hack-bg" : ""}`}
    >
      {hackMode && <MatrixRain />}
      <Toaster theme="dark" />

      {/* Header */}
      <div
        className={`sticky top-0 z-20 bg-black border-b ${hackMode ? "border-green-500" : "border-red-800"} px-4 py-3 flex items-center justify-between`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1 text-sm font-bold ${hackMode ? "text-green-400" : "text-red-400"}`}
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <h1
          className={`font-orbitron font-black text-sm tracking-widest ${hackMode ? "hack-text-glow" : "text-red-600"}`}
        >
          VIP STABLE V14
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${hackMode ? "text-green-400" : "text-gray-400"}`}
          >
            {hackMode ? "HACK" : "SAFE"}
          </span>
          <Switch
            checked={hackMode}
            onCheckedChange={(val) => {
              setHackMode(val);
            }}
            className={hackMode ? "data-[state=checked]:bg-green-500" : ""}
          />
        </div>
      </div>

      {/* Hack Mode Banner */}
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
        {/* Stats bar */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-orbitron font-bold text-sm">
              WIN: {wins}
            </span>
          </div>
          <div
            className={`h-4 w-px ${hackMode ? "bg-green-800" : "bg-red-900"}`}
          />
          <span className="text-red-400 font-orbitron font-bold text-sm">
            LOSS: {losses}
          </span>
          {badgeActive && (
            <Badge className="bg-yellow-600 text-black font-bold text-xs">
              ⭐ VIP
            </Badge>
          )}
        </div>

        {/* === VIP STABLE V14 MAIN PANEL === */}
        <div
          className={`border-2 rounded-xl p-4 ${hackMode ? "border-green-400 bg-black hack-glow" : "border-red-600 bg-black"}`}
          style={{
            boxShadow: hackMode
              ? "0 0 20px rgba(0,255,0,0.3)"
              : "0 0 20px rgba(255,0,0,0.3)",
          }}
        >
          {/* Panel title */}
          <div className="text-center mb-3">
            <p
              className={`font-orbitron font-black text-xs tracking-widest ${hackMode ? "text-green-400" : "text-red-500"}`}
            >
              VIP STABLE V14
            </p>
          </div>

          {/* LIVE PERIOD */}
          <div className="border border-green-700 rounded-lg p-3 mb-4 bg-black text-center">
            <p className="font-orbitron text-xs text-gray-500 tracking-widest mb-1">
              LIVE PERIOD
            </p>
            <p
              className="font-orbitron font-black text-4xl text-green-400"
              style={{ textShadow: "0 0 10px #00ff00" }}
            >
              {livePeriod}
            </p>
          </div>

          {/* TWO BIG/SMALL Numbers Display */}
          {selectedNum !== null && (
            <div className="mb-4">
              <div className="flex items-center justify-center gap-4">
                {/* Number 1 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${
                      currentBigSmall === "BIG"
                        ? "bg-orange-800 border-orange-500"
                        : "bg-red-800 border-red-500"
                    } ${isSpinning ? "animate-pulse" : ""}`}
                  >
                    <span className="font-orbitron font-black text-3xl text-white">
                      {displayNums[0]}
                    </span>
                  </div>
                  <span
                    className={`font-orbitron font-bold text-xs mt-1 ${
                      currentBigSmall === "BIG"
                        ? "text-orange-400"
                        : "text-red-400"
                    }`}
                  >
                    {currentBigSmall}
                  </span>
                </div>

                {/* Center BIG/SMALL label */}
                <div className="text-center">
                  <p
                    className={`font-orbitron font-black text-3xl ${
                      currentBigSmall === "BIG"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                    style={{
                      textShadow:
                        currentBigSmall === "BIG"
                          ? "0 0 10px #ffff00"
                          : "0 0 10px #ff0000",
                    }}
                  >
                    {currentBigSmall}
                  </p>
                  {!isSpinning && (
                    <p
                      className={`font-orbitron font-black text-4xl mt-1 ${
                        hackMode
                          ? "text-green-400 hack-text-glow"
                          : "text-yellow-300"
                      }`}
                    >
                      {displayNums[0]}
                    </p>
                  )}
                  {isSpinning && (
                    <p className="font-orbitron font-black text-xl text-yellow-600 animate-pulse">
                      ...
                    </p>
                  )}
                </div>

                {/* Number 2 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${
                      currentBigSmall === "BIG"
                        ? "bg-orange-800 border-orange-500"
                        : "bg-red-800 border-red-500"
                    } ${isSpinning ? "animate-pulse" : ""}`}
                  >
                    <span className="font-orbitron font-black text-3xl text-white">
                      {displayNums[1]}
                    </span>
                  </div>
                  <span
                    className={`font-orbitron font-bold text-xs mt-1 ${
                      currentBigSmall === "BIG"
                        ? "text-orange-400"
                        : "text-red-400"
                    }`}
                  >
                    {currentBigSmall}
                  </span>
                </div>
              </div>

              {/* BIG range info */}
              <div className="text-center mt-2">
                <p className="text-gray-600 text-xs font-orbitron">
                  {currentBigSmall === "BIG"
                    ? "BIG = 5,6,7,8,9"
                    : "SMALL = 0,1,2,3,4"}
                </p>
              </div>
            </div>
          )}

          {/* If no number selected, show placeholder */}
          {selectedNum === null && (
            <div className="text-center py-6 mb-4">
              <p className="font-orbitron text-gray-600 text-sm">
                Select a number below
              </p>
              <p className="font-orbitron text-gray-700 text-xs mt-1">
                BIG = 5-9 | SMALL = 0-4
              </p>
            </div>
          )}

          {/* INJECT Button */}
          {showInjectPanel && (
            <button
              type="button"
              onClick={handleInject}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-orbitron font-black text-xl tracking-widest rounded-lg transition-all active:scale-95"
              style={{ boxShadow: "0 0 15px rgba(255,0,0,0.5)" }}
            >
              INJECT
            </button>
          )}
        </div>

        {/* Number Selector */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-red-800"} rounded p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-3 tracking-widest ${hackMode ? "text-green-400" : "text-red-500"}`}
          >
            🎯 SELECT NUMBER{" "}
            {hackMode ? "(HACK: ALWAYS BIG 5-9)" : "(0-4=SMALL | 5-9=BIG)"}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const isSelected = selectedNum === n;
              const isBig = n >= 5;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumberClick(n)}
                  className={`font-orbitron font-black text-xl py-3 rounded border-2 transition-all active:scale-90 ${
                    isSelected
                      ? hackMode
                        ? "bg-green-500 border-green-400 text-black scale-110"
                        : isBig
                          ? "bg-orange-600 border-orange-400 text-white scale-110"
                          : "bg-red-600 border-red-400 text-white scale-110"
                      : isBig
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
            <span className="text-red-600 text-xs font-orbitron">
              0-4 = SMALL
            </span>
            <span className="text-orange-500 text-xs font-orbitron">
              5-9 = BIG
            </span>
          </div>
          {hackMode && (
            <p className="text-green-700 text-xs mt-1 text-center font-orbitron">
              ⚡ Any number = BIG (5-9) + PROFIT GUARANTEED
            </p>
          )}
        </div>

        {/* Period Number Input */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-red-800"} rounded p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-2 tracking-widest ${hackMode ? "text-green-400" : "text-red-500"}`}
          >
            📊 ENTER PERIOD NUMBER
          </p>
          <Input
            type="text"
            value={periodNumber}
            onChange={(e) => setPeriodNumber(e.target.value)}
            placeholder="e.g. 20260227100010335"
            className={`bg-gray-950 ${hackMode ? "border-green-700 text-green-300 placeholder:text-green-900" : "border-red-900 text-white placeholder:text-gray-700"} font-orbitron text-sm`}
          />
        </div>

        {/* === BYPASS TOGGLES SECTION === */}
        <div className="border-2 border-yellow-600 rounded-xl p-4 bg-black bypass-glow">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg border-2 border-yellow-500 bg-gray-900 flex items-center justify-center text-2xl flex-shrink-0">
              👾
            </div>
            <div>
              <p className="font-orbitron font-black text-yellow-400 text-xs tracking-widest">
                🛡️ BYPASS CONTROL PANEL
              </p>
              <p className="text-yellow-600 text-xs mt-0.5">TG - @iamelitee</p>
              <p className="text-gray-600 text-xs">{todayDate}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "BYPASS GDS (1)",
                desc: "Route override channel 1",
                val: bypassGds1,
                set: setBypassGds1,
                activeColor: "data-[state=checked]:bg-yellow-500",
              },
              {
                label: "BYPASS GDS (2)",
                desc: "Route override channel 2",
                val: bypassGds2,
                set: setBypassGds2,
                activeColor: "data-[state=checked]:bg-red-500",
              },
              {
                label: "BYPASS MAIN ID",
                desc: "Identity masking active",
                val: bypassMainId,
                set: setBypassMainId,
                activeColor: "data-[state=checked]:bg-yellow-500",
              },
            ].map(({ label, desc, val, set, activeColor }) => (
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
                  className={val ? activeColor : ""}
                />
              </div>
            ))}
            {/* WINGO MOD */}
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

        {/* 5-Level Maintenance Fund */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-red-800"} rounded p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-3 tracking-widest ${hackMode ? "text-green-400" : "text-red-500"}`}
          >
            💰 MAINTENANCE FUND
          </p>
          <div className="space-y-2">
            {FUND_LEVELS.map((fl) => (
              <div
                key={fl.level}
                className={`flex items-center justify-between rounded p-2.5 border transition-all ${
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
                        : "bg-red-900 text-red-300 border border-red-700 hover:bg-red-800"
                    }`}
                  >
                    {selectedFundLevel === fl.level ? "✓ ACTIVE" : "SELECT"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gift Code Panel */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-red-800"} rounded p-4 bg-black`}
        >
          <p
            className={`font-orbitron text-xs font-bold mb-3 tracking-widest flex items-center gap-2 ${hackMode ? "text-green-400" : "text-red-500"}`}
          >
            <Gift className="w-3 h-3" /> GIFT CODE
          </p>
          <div className="flex gap-2">
            <Input
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
              placeholder="Enter code..."
              className={`bg-gray-950 flex-1 ${hackMode ? "border-green-700 text-green-300 placeholder:text-green-900" : "border-red-900 text-white placeholder:text-gray-700"} font-orbitron text-sm uppercase`}
            />
            <button
              type="button"
              onClick={handleRedeem}
              className={`px-4 py-2 font-orbitron font-bold text-xs rounded ${
                hackMode
                  ? "bg-green-600 text-black hover:bg-green-500"
                  : "bg-red-600 text-white hover:bg-red-700"
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

        {/* History Table - VIP Style */}
        <div
          className={`border ${hackMode ? "border-green-500 hack-glow" : "border-red-800"} rounded-xl overflow-hidden bg-black`}
        >
          <div
            className={`px-4 py-3 border-b ${hackMode ? "border-green-900" : "border-red-900"}`}
          >
            <p
              className={`font-orbitron text-xs font-bold tracking-widest ${hackMode ? "text-green-400" : "text-red-500"}`}
            >
              📋 PREDICTION HISTORY
            </p>
          </div>
          {history.length === 0 ? (
            <div className="text-center text-gray-700 py-6 font-orbitron text-xs">
              No history yet. Select a number and INJECT!
            </div>
          ) : (
            <div className="divide-y divide-gray-900">
              {history.map((entry, idx) => (
                <div
                  key={`${entry.period}-${idx}`}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  {/* Badge: BIG or Number */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-orbitron font-black text-sm flex-shrink-0 ${
                      entry.bigSmall === "BIG"
                        ? "bg-orange-700 text-white"
                        : "bg-red-700 text-white"
                    }`}
                  >
                    {entry.bigSmall === "BIG" ? (
                      <span className="text-xs">Big</span>
                    ) : (
                      <span className="text-lg">{entry.number}</span>
                    )}
                  </div>

                  {/* Period and time */}
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron text-xs text-white truncate">
                      {entry.period}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {entry.dateTime}
                    </p>
                  </div>

                  {/* Status and Profit */}
                  <div className="text-right flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
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
                        );
                      }}
                      className={`text-xs font-orbitron font-bold px-2 py-0.5 rounded border ${
                        entry.result === "Succeed"
                          ? "border-green-600 text-green-400 bg-green-950"
                          : "border-red-600 text-red-400 bg-red-950"
                      }`}
                    >
                      {entry.result}
                    </button>
                    <p className="text-green-400 font-orbitron font-black text-sm mt-1">
                      {formatRupees(entry.profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pb-2">
          <p className="text-gray-800 text-xs">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-900 hover:text-red-700"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
