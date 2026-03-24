import { AlertTriangle, Cloud, Gamepad2, Monitor, Server } from "lucide-react";

interface Props {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-orbitron text-2xl font-black text-red-600 tracking-widest leading-tight">
          ELITE NUMBER VIP
        </h1>
        <p className="text-red-500 text-xs font-semibold tracking-wider mt-0.5">
          ⚡ PROFESSIONAL HACK TOOL ⚡
        </p>
      </div>

      {/* Main action buttons */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          data-ocid="home.start_hack_button"
          onClick={onStart}
          className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-orbitron font-bold py-5 px-3 rounded flex flex-col items-center gap-2 red-glow"
        >
          <AlertTriangle className="w-8 h-8" />
          <span className="text-sm tracking-wider">START HACK</span>
        </button>
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="home.telegram_button"
          className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-orbitron font-bold py-5 px-3 rounded flex flex-col items-center gap-2 red-glow no-underline"
        >
          <Gamepad2 className="w-8 h-8" />
          <span className="text-sm tracking-wider">JOIN TG CHANNEL</span>
        </a>
      </div>

      {/* Info boxes */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="border border-red-600 rounded p-3 bg-black">
          <p className="text-gray-400 text-xs uppercase tracking-wider">
            Registered
          </p>
          <p className="text-red-500 font-orbitron font-bold text-sm mt-1">
            00-00-0000
          </p>
        </div>
        <div className="border border-red-600 rounded p-3 bg-black">
          <p className="text-gray-400 text-xs uppercase tracking-wider">
            Expired
          </p>
          <p className="text-red-500 font-orbitron font-bold text-sm mt-1">
            00-00-0000
          </p>
        </div>
      </div>

      {/* Labels */}
      <div className="px-4 mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider">
            Game Play Mod:
          </span>
          <span className="text-white text-sm font-semibold">
            VIP HACK MODE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider">
            Game Name:
          </span>
          <span className="text-white text-sm font-semibold">
            COLOR TRADING
          </span>
        </div>
        <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded tracking-wider w-full text-center">
          Game Version: Latest Version
        </div>
      </div>

      {/* Right-aligned buttons */}
      <div className="px-4 mt-4 space-y-2">
        <div className="flex justify-end">
          <button
            type="button"
            data-ocid="home.edit_limit_button"
            className="bg-transparent border border-red-600 text-red-400 text-xs font-bold px-4 py-2 rounded tracking-wider hover:bg-red-950 transition-colors"
          >
            Tab To Edit Daily Limit ₹0000
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            data-ocid="home.device_info_button"
            className="bg-transparent border border-red-600 text-red-400 text-xs font-bold px-4 py-2 rounded tracking-wider hover:bg-red-950 transition-colors"
          >
            Device Info: Android Mobile
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="px-4 mt-5">
        <div className="h-px bg-red-600 w-full" />
      </div>

      {/* Server illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        <div className="flex items-end justify-center gap-4 opacity-80">
          {/* Cloud */}
          <div className="flex flex-col items-center gap-1">
            <Cloud className="w-12 h-12 text-red-500" strokeWidth={1.5} />
            <div className="w-0.5 h-8 bg-red-600" />
          </div>
          {/* Server */}
          <div className="flex flex-col items-center gap-1">
            <Server className="w-10 h-10 text-red-400" strokeWidth={1.5} />
            <div className="grid grid-cols-3 gap-0.5 mt-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-red-500 rounded-full"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
          {/* Laptop */}
          <div className="flex flex-col items-center gap-1">
            <Monitor className="w-12 h-12 text-red-500" strokeWidth={1.5} />
            <div className="w-0.5 h-8 bg-red-600" />
          </div>
        </div>
        {/* Connection lines */}
        <div className="flex items-center gap-2 mt-2">
          <div className="h-px flex-1 bg-red-600 max-w-16" />
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <div className="h-px flex-1 bg-red-600 max-w-16" />
        </div>
        <p className="font-orbitron font-bold text-red-600 text-center tracking-widest text-sm animate-pulse">
          SERVER CONNECTED SUCCESSFUL
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="text-green-500 text-xs font-bold tracking-wider">
            ONLINE
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 text-center">
        <p className="text-gray-700 text-xs">
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
  );
}
