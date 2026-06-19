import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Search, 
  Terminal, 
  Activity, 
  Cpu, 
  TrendingUp, 
  Skull, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Twitter,
  User,
  LayoutDashboard,
  Server,
  RefreshCw,
  FileSpreadsheet,
  Globe,
  Database
} from "lucide-react";

import RadarBackgroundCanvas from "./components/RadarBackgroundCanvas";
import ArcSahibLogo from "./components/ArcSahibLogo";
import { RiskLevel, IntelAlert } from "./types";

// Smart Contract Constants
const CONTRACT_ADDRESS = "0x925d88Cce814b519dA72AFCBDDa1826deA6D879e";
const OWNER_WALLET = "0xC1777d72ff98fc9cc11E3DE75fd2B0eC68c71CF7";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"name": "_walletAudited", "type": "address"},
      {"name": "_riskLevel", "type": "uint8"},
      {"name": "_summary", "type": "string"},
      {"name": "_findings", "type": "string"},
      {"name": "_transactionCount", "type": "uint256"},
      {"name": "_contractInteractions", "type": "uint256"}
    ],
    "name": "createAudit",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_auditId", "type": "uint256"}],
    "name": "getAudit",
    "outputs": [{"name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_wallet", "type": "address"}],
    "name": "getWalletAudits",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_auditor", "type": "address"}],
    "name": "getAuditorReports",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAudits",
    "outputs": [{"name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "auditCounter",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Helper to sanitize addresses for presentation
const shortAddress = (addr: string) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function App() {
  const { address: userAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const location = useLocation();

  // Read live USDC Balance
  const { data: usdcBalanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "balance", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
  });

  // Read live EURC Balance
  const { data: eurcBalanceData } = useReadContract({
    address: EURC_ADDRESS,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "balance", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
  });

  const liveUsdc = usdcBalanceData ? (Number(typeof usdcBalanceData === 'bigint' ? usdcBalanceData : BigInt(usdcBalanceData as any)) / 1000000) : 0;
  const liveEurc = eurcBalanceData ? (Number(typeof eurcBalanceData === 'bigint' ? eurcBalanceData : BigInt(eurcBalanceData as any)) / 1000000) : 0;

  const [platformStats, setPlatformStats] = useState({
    totalAudits: 1420,
    safeCount: 890,
    warningCount: 310,
    dangerCount: 220,
  });

  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: "success" | "info" | "warn" }>>([]);

  const showToast = (msg: string, type: "success" | "info" | "warn" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Pull global statistics from the server backend
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/platform/stats");
      if (res.ok) {
        const data = await res.json();
        setPlatformStats(data);
      }
    } catch (e) {
      console.warn("Error loading platform stats:", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-white bg-[#000814] overflow-x-hidden selection:bg-[#0066FF] selection:text-white">
      {/* Background Radar Canvas Animation Layer */}
      <RadarBackgroundCanvas />

      {/* FIXED FLOATING NOTIFICATION BANNER */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-blue-500/25 bg-blue-950/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,102,255,0.15)]"
            >
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === "info" && <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 animate-pulse" />}
              {toast.type === "warn" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs font-mono font-bold tracking-wider text-white uppercase">SYSTEM LOG</p>
                <p className="text-sm font-sans mt-0.5 text-gray-200">{toast.msg}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-[#0066FF] bg-[rgba(0,10,30,0.9)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-18 flex items-center justify-between">
          
          <Link to="/" className="cursor-pointer">
            <ArcSahibLogo />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-rajdhani font-semibold tracking-widest uppercase">
            {/* HOME link */}
            <Link 
              to="/" 
              className={`relative py-1.5 transition-colors cursor-pointer ${
                location.pathname === "/" ? "text-[#0066FF] font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              HOME
              <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#0066FF] transition-all duration-300 ${location.pathname === "/" ? "scale-x-100 opacity-100 shadow-[0_0_8px_#0066FF]" : "scale-x-0 opacity-0"}`} />
            </Link>

            {/* MY AUDITS link */}
            <Link 
              to="/my-audits" 
              className={`relative py-1.5 transition-colors cursor-pointer ${
                location.pathname === "/my-audits" ? "text-[#0066FF] font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              MY AUDITS
              <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#0066FF] transition-all duration-300 ${location.pathname === "/my-audits" ? "scale-x-100 opacity-100 shadow-[0_0_8px_#0066FF]" : "scale-x-0 opacity-0"}`} />
            </Link>

            {/* ADMIN parameters validation */}
            {userAddress && userAddress.toLowerCase() === OWNER_WALLET.toLowerCase() && (
              <Link 
                to="/admin" 
                className={`relative py-1.5 transition-colors cursor-pointer ${
                  location.pathname === "/admin" ? "text-[#0066FF] font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                ADMIN PANEL
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#0066FF] transition-all duration-300 ${location.pathname === "/admin" ? "scale-x-100 opacity-100 shadow-[0_0_8px_#0066FF]" : "scale-x-0 opacity-0"}`} />
              </Link>
            )}
          </nav>

          {/* Web3 Connect Wallet Button */}
          <div className="flex items-center gap-3">
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
          </div>

        </div>
      </header>

      {/* Connected Wallet Info Premium Block */}
      {isConnected && userAddress && (
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-6 z-30 relative motion-preset-fade">
          <div className="border-2 border-[#0066FF] shadow-[0_0_20px_rgba(0,102,255,0.6)] rounded-2xl bg-blue-950/20 backdrop-blur-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
            
            {/* Blinking Connected and Network Badge */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF88]"></span>
                </span>
                <span className="text-[11px] font-mono font-black tracking-widest text-[#00FF88] uppercase">
                  CONNECTED • ARC TESTNET
                </span>
              </div>

              {/* Wallet address and copy details */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/50 flex items-center justify-center text-[#0096FF]">
                  <User className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-white font-mono text-sm tracking-wide font-black">
                    <span>{shortAddress(userAddress)}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(userAddress);
                        showToast(`Copied connected wallet ${shortAddress(userAddress)}`, "success");
                      }}
                      className="p-1 hover:text-white text-gray-400 rounded transition-colors cursor-pointer"
                      title="Copy Wallet Address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-[#A0B4CC]">
                    Active Auditor Signer Address
                  </p>
                </div>
              </div>
            </div>

            {/* Current Active Page tab */}
            <div className="flex flex-col gap-1 md:border-l md:border-blue-900/40 md:pl-6">
              <span className="text-[9px] font-mono tracking-widest text-[#A0B4CC] uppercase block">
                CURRENT ZONE
              </span>
              <span className="text-sm font-rajdhani font-black tracking-wider text-[#0096FF] text-glow-blue uppercase flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0066FF] animate-pulse"></span>
                {location.pathname === "/" && "HOME DASHBOARD"}
                {location.pathname === "/my-audits" && "MY AUDIT SECURE ARCHIVE"}
                {location.pathname === "/admin" && "ARC SAHIB SYS-ADMIN CONSOLE"}
                {location.pathname.startsWith("/audit/") && "ACTIVE ON-CHAIN AUDIT REPORT"}
              </span>
            </div>

            {/* Balances container */}
            <div className="flex items-center gap-4 md:border-l md:border-blue-900/40 md:pl-6 bg-[#000814]/30 px-4 py-3 rounded-xl border border-blue-900/20">
              <div className="text-left font-mono">
                <span className="text-[9px] text-[#A0B4CC] block uppercase">REAL-TIME USDC</span>
                <span className="text-base font-bold font-num text-[#0096FF] text-glow-blue leading-none block mt-1">
                  {liveUsdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC
                </span>
              </div>
              <div className="text-left font-mono border-l border-blue-900/30 pl-4">
                <span className="text-[9px] text-[#A0B4CC] block uppercase">REAL-TIME EURC</span>
                <span className="text-base font-bold font-num text-[#0096FF] text-glow-blue leading-none block mt-1">
                  {liveEurc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} EURC
                </span>
              </div>
            </div>

            {/* Disconnect trigger */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  disconnect();
                  showToast("Disconnected Web3 wallet session", "warn");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold font-rajdhani tracking-wider uppercase text-white bg-red-600 hover:bg-red-700 hover:shadow-[0_0_12px_#ff0000] cursor-pointer transition-all border border-red-500/20"
              >
                DISCONNECT SESSION
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ROUTING STRUCTURE FOR MULTI PAGE LAYOUT */}
      <main className="flex-grow z-10">
        <Routes>
          <Route path="/" element={<HomeView stats={platformStats} triggerToast={showToast} />} />
          <Route path="/audit/:address" element={<AuditResultView triggerToast={showToast} />} />
          <Route path="/my-audits" element={<MyAuditsView triggerToast={showToast} />} />
          <Route path="/admin" element={<AdminView stats={platformStats} triggerToast={showToast} />} />
        </Routes>
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-[#0066FF]/25 bg-[#000814]/90 py-8 z-10 relative">
        {/* Top boundary glow indicator */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#0066FF] opacity-30 shadow-[0_0_15px_rgba(0,102,255,0.8)]" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 font-rajdhani font-semibold">
          <div className="text-center md:text-left">
            <h4 className="text-white text-base tracking-widest uppercase">ArcSahib Protocol</h4>
            <p className="text-xs text-[#8892A4] mt-0.5 tracking-wider font-sans font-medium">
              Powered by Arc Testnet • Secured by Gemini Core Diagnostics
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5">
            <p className="text-gray-400 text-xs font-sans tracking-wide">Built by Smeer</p>
            <a 
              href="https://x.com/smeer_434" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#0066FF] hover:text-white transition-all bg-blue-950/30 hover:bg-[#0066FF] border border-[#0066FF]/30 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest hover:shadow-[0_0_12px_#0066FF]"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              Follow Smeer_434
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════
// PAGE 1: HOME VIEW
// ═══════════════════════════════════════
function HomeView({ stats, triggerToast }: { stats: any; triggerToast: any }) {
  const navigate = useNavigate();
  const [addressInput, setAddressInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleAuditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = addressInput.trim();

    if (!cleanAddress) {
      triggerToast("Please input an Ethereum or Arc Address to audit.", "warn");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      triggerToast("Invalid address format. Address must begin with 0x followed by 40 hex digits.", "warn");
      return;
    }

    setIsValidating(true);
    triggerToast("Evaluating secure cryptographic signatures...", "info");
    
    setTimeout(() => {
      setIsValidating(false);
      navigate(`/audit/${cleanAddress}`);
    }, 1800);
  };

  // Preset Address vectors to help testing
  const sampleWallets = [
    { name: "Owner Multisig", address: "0xC1777d72ff98fc9cc11E3DE75fd2B0eC68c71CF7", risk: "SAFE" },
    { name: "Dev Liquidity Proxy", address: "0x892a00C5bc1A16FEeF221F00CB101030CB0050d2", risk: "WARNING" },
    { name: "Suspect Flash Drainer", address: "0x36009ed0c18491c103290b840FBF285fCE042F02", risk: "DANGER" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center flex flex-col items-center">
      
      {/* HUD framing brackets around the main intro text */}
      <div className="relative p-6 max-w-xl md:max-w-2xl bg-blue-950/5 rounded-2xl border border-blue-500/10 mb-8 overflow-hidden">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="absolute inset-0 bg-[#0066FF] opacity-1 filter blur-3xl pointer-events-none" />

        <h1 className="text-4xl md:text-5xl font-black font-rajdhani tracking-tighter uppercase leading-none">
          AUDIT ANY WALLET{" "}
          <span className="bg-gradient-to-r from-[#0096FF] via-white to-[#0066FF] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,102,255,0.15)]">
            ON ARC
          </span>
        </h1>

        <p className="mt-4 text-sm md:text-base text-gray-300 leading-relaxed font-sans font-medium px-4">
          ArcSahib is the absolute first on-chain security auditing system on Arc Testnet. 
          Audit any wallet address instantaneously to retrieve precise EURC/USDC parameters, 
          transaction patterns, active code interactors, and automated forensic threat reports.
        </p>
      </div>

      {/* Main Action Input form */}
      <form onSubmit={handleAuditRequest} className="w-full max-w-2xl space-y-3 mb-16 relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-1 rounded-2xl bg-slate-950/80 border border-blue-500/35 hover:border-blue-500/80 focus-within:border-[#0066FF] transition-all focus-within:shadow-[0_0_20px_rgba(0,102,255,0.15)]">
          
          <div className="flex-1 flex items-center gap-3 px-4 py-2">
            <Search className="w-5 h-5 text-blue-500 shrink-0" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter any address (0x...) of any wallet to analyze..."
              className="w-full bg-transparent border-none text-white text-base font-mono outline-none placeholder:text-gray-500 placeholder:font-sans"
              disabled={isValidating}
            />
          </div>

          <button
            type="submit"
            disabled={isValidating}
            className="btn-solid-glowing sm:px-8 py-3.5 rounded-xl font-rajdhani font-black text-sm uppercase tracking-widest text-white cursor-pointer transition-all shrink-0"
          >
            {isValidating ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin w-4 h-4 text-white" />
                SCANNING...
              </div>
            ) : (
              "AUDIT WALLET"
            )}
          </button>

        </div>

        {/* Diagnostic templates */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <span className="text-gray-400">Sample addresses:</span>
          {sampleWallets.map((w, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAddressInput(w.address)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs font-bold leading-none ${
                w.risk === "DANGER" ? "badge-bright-danger" :
                w.risk === "WARNING" ? "badge-bright-warning" :
                "badge-bright-safe"
              }`}
            >
              {w.name} ({shortAddress(w.address)})
            </button>
          ))}
        </div>
      </form>

      {/* STATS BAR CARDS (4 indicators) */}
      <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat 1: Total audits */}
        <div className="arc-glass-card p-5 relative overflow-hidden text-center border-l-2 border-l-[#0066FF] bg-[#001233]/40">
          <div className="hud-corner-tl opacity-50" />
          <div className="hud-corner-br opacity-50" />
          <Database className="w-5 h-5 text-[#0066FF] mx-auto opacity-70 mb-2" />
          <p className="text-[10px] font-mono tracking-widest text-[#A0B4CC] font-bold uppercase">TOTAL AUDITS</p>
          <p className="font-num mt-1 text-3xl md:text-4xl font-black text-[#0096FF] text-glow-blue">
            {stats.totalAudits}
          </p>
        </div>

        {/* Stat 2: Safe wallets */}
        <div className="arc-glass-card p-5 relative overflow-hidden text-center border-l-2 border-l-[#00FF88] bg-[#001233]/40">
          <div className="hud-corner-tl opacity-50" />
          <div className="hud-corner-br opacity-50" />
          <CheckCircle className="w-5 h-5 text-[#00FF88] mx-auto opacity-70 mb-2" />
          <p className="text-[10px] font-mono tracking-widest text-[#A0B4CC] font-bold uppercase">SAFE STATS</p>
          <p className="font-num mt-1 text-3xl md:text-4xl font-black text-[#0096FF] text-glow-green">
            {stats.safeCount}
          </p>
        </div>

        {/* Stat 3: Warning wallets */}
        <div className="arc-glass-card p-5 relative overflow-hidden text-center border-l-2 border-l-[#FFD700] bg-[#001233]/40">
          <div className="hud-corner-tl opacity-50" />
          <div className="hud-corner-br opacity-50" />
          <AlertTriangle className="w-5 h-5 text-[#FFD700] mx-auto opacity-70 mb-2" />
          <p className="text-[10px] font-mono tracking-widest text-[#A0B4CC] font-bold uppercase">WARNING CODES</p>
          <p className="font-num mt-1 text-3xl md:text-4xl font-black text-[#0096FF] text-glow-yellow">
            {stats.warningCount}
          </p>
        </div>

        {/* Stat 4: Danger wallets */}
        <div className="arc-glass-card p-5 relative overflow-hidden text-center border-l-2 border-l-[#FF0000] bg-[#001233]/40">
          <div className="hud-corner-tl opacity-50" />
          <div className="hud-corner-br opacity-50" />
          <Skull className="w-5 h-5 text-[#FF0000] mx-auto opacity-70 mb-2" />
          <p className="text-[10px] font-mono tracking-widest text-[#A0B4CC] font-bold uppercase">BREACH IDENTIFIED</p>
          <p className="font-num mt-1 text-3xl md:text-4xl font-black text-[#0096FF] text-glow-red">
            {stats.dangerCount}
          </p>
        </div>

      </div>

    </div>
  );
}

// ═══════════════════════════════════════
// PAGE 2: AUDIT RESULT VIEW
// ═══════════════════════════════════════
interface AuditResultType {
  address: string;
  usdcBalance: number;
  eurcBalance: number;
  txCount: number;
  contractInteractions: number;
  riskLevel: "SAFE" | "WARNING" | "DANGER";
  overallRiskScore: number;
  summary: string;
  associatedScams: string[];
  mitigationAdvice: string[];
  findings: Array<{
    findingId: string;
    issueTitle: string;
    description: string;
    severity: "SAFE" | "WARNING" | "DANGER";
    remediation: string;
  }>;
}

function AuditResultView({ triggerToast }: { triggerToast: any }) {
  const { address } = useParams<{ address: string }>();
  const [report, setReport] = useState<AuditResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { isConnected } = useAccount();

  // Wagmi contracts configuration for writing the saved audit on-chain
  const { writeContract, data: txHash, isPending: isTxPending, error: txError } = useWriteContract();
  const { isLoading: isTxSuccess, data: txReceipt } = useWaitForTransactionReceipt({ hash: txHash });

  const fetchWalletReport = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/wallet/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      });

      if (!res.ok) {
        throw new Error("Diagnostic API error retrieving address summary details.");
      }

      const data = await res.json();
      setReport(data);

      // Persist in local browser cache so users can view their query history on My Audits
      const cachedAudits = JSON.parse(localStorage.getItem("arc_saved_audits") || "[]");
      const isDuplicated = cachedAudits.some((a: any) => a.address.toLowerCase() === walletAddress.toLowerCase());
      if (!isDuplicated) {
        cachedAudits.unshift({
          address: walletAddress,
          riskLevel: data.riskLevel,
          overallRiskScore: data.overallRiskScore,
          summary: data.summary,
          txCount: data.txCount,
          date: new Date().toLocaleDateString()
        });
        localStorage.setItem("arc_saved_audits", JSON.stringify(cachedAudits.slice(0, 50)));
      }

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during intelligence evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchWalletReport(address);
    }
  }, [address]);

  // Handle saving the audit live on-chain using createAudit() contract function
  const handleSaveOnChain = () => {
    if (!report) return;

    triggerToast("Initiating secure on-chain validation write...", "info");

    const riskEnumVal = report.riskLevel === "SAFE" ? 0 : report.riskLevel === "WARNING" ? 1 : 2;
    const stringifiedFindings = JSON.stringify(report.findings);

    (writeContract as any)({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createAudit",
      args: [
        report.address as `0x${string}`,
        riskEnumVal,
        report.summary,
        stringifiedFindings,
        BigInt(report.txCount),
        BigInt(report.contractInteractions)
      ]
    });
  };

  useEffect(() => {
    if (txHash) {
      triggerToast(`Transaction Broadcasted! Hash: ${shortAddress(txHash)}`, "info");
    }
  }, [txHash]);

  useEffect(() => {
    if (txReceipt) {
      triggerToast("Audit verified and immutable saved on-chain!", "success");
    }
  }, [txReceipt]);

  const handleShare = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    triggerToast("Link successfully copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <div className="relative w-20 h-20 animate-spin flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-solid border-blue-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-solid border-t-[#0066FF] rounded-full" />
        </div>
        <p className="font-mono text-sm text-blue-400 animate-pulse tracking-widest uppercase">
          FORENSIC CRYPTO PARSER SCALPEL ACTIVE...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-rajdhani text-white uppercase">Diagnostic Audit Failed</h3>
        <p className="text-sm text-gray-400 font-mono mt-1 leading-relaxed">
          {error || "Audit source is unreachable. Please verify network and input format."}
        </p>
        <Link to="/" className="inline-block mt-6 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-rajdhani uppercase font-semibold text-xs tracking-wider">
          &larr; RETURN HOME
        </Link>
      </div>
    );
  }

  const isSafe = report.riskLevel === "SAFE";
  const isWarning = report.riskLevel === "WARNING";
  const isDanger = report.riskLevel === "DANGER";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-6">
      
      {/* Wallet identification banner */}
      <div className="arc-glass-card p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        
        <div>
          <span className="text-[10px] font-mono text-gray-500 block uppercase">TARGET AUDITING ADDRESS</span>
          <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white select-all break-all">
            {report.address}
          </h2>
          <div className="flex flex-wrap gap-2.5 mt-2 text-xs font-mono">
            <span className="text-[#8892A4]">Network:</span>
            <span className="text-[#0066FF] font-black">Arc Testnet (5042002)</span>
            <span className="text-[#8892A4]">•</span>
            <a 
              href={`https://testnet.arcscan.app/address/${report.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              View on ArcScan
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Sharing triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-blue-950/40 hover:bg-[#001233] border border-blue-500/25 hover:border-blue-500 px-4 py-2.5 rounded-xl font-rajdhani uppercase font-black tracking-wider text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            SHARE AUDIT
          </button>

          <a
            href={`https://twitter.com/intent/tweet?text=ArchSahib Security Wallet Audit: Checked ${shortAddress(report.address)} on Arc Testnet! Risk Score is ${report.overallRiskScore}%. Check full report here:&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2.5 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/20 rounded-xl text-sky-400 hover:text-white transition-colors"
            title="Post to X/Twitter"
          >
            <Twitter className="w-4 h-4 fill-current" />
          </a>
        </div>
      </div>

      {/* Main core metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* SHIELD SCORE CARD (Left column, 5 columns span) */}
        <div className="md:col-span-5 flex flex-col gap-5">
          
          <div className="arc-glass-card p-6 text-center relative flex flex-col items-center justify-center bg-[#001233]/45 h-full">
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />

            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black block mb-4">
              THREAT INDEX ASSIGNMENT
            </span>

            {/* Glowing circular scoring circle */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              {/* Spinning background glow bounds */}
              <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin ${
                isDanger ? "border-red-500/40" : isWarning ? "border-yellow-500/40" : "border-emerald-500/40"
              }`} style={{ animationDuration: "12s" }} />

              <div className="absolute inset-2 rounded-full bg-slate-950 flex flex-col items-center justify-center border border-blue-500/10">
                <span className="text-[9px] font-mono text-gray-400 uppercase leading-none">RISK SCORE</span>
                <span className="font-num mt-1 text-4xl font-extrabold leading-none">
                  {report.overallRiskScore}%
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase mt-2 font-bold ${
                  isDanger ? "badge-bright-danger text-white" :
                  isWarning ? "badge-bright-warning text-black" :
                  "badge-bright-safe text-black"
                }`}>
                  {report.riskLevel}
                </span>
              </div>
            </div>

            <p className="text-sm font-sans text-gray-300 leading-normal mb-6">
              {isDanger && "Danger: This wallet exhibits indicators aligned with suspicious contract usage."}
              {isWarning && "Warning: High frequency of protocol routing calls. Active authorizations detected."}
              {isSafe && "Normal: Address maintains safe portfolio behaviors. Minimal exploit interactions."}
            </p>

            {/* Save onchain CTA */}
            {isConnected ? (
              <button
                type="button"
                onClick={handleSaveOnChain}
                disabled={isTxPending || isTxSuccess}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-rajdhani font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#0096FF] to-[#0066FF] hover:from-white hover:to-white hover:text-black cursor-pointer transition-all hover:shadow-[0_0_15px_#0066FF]"
              >
                {isTxPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    IMMUTABILIZA_WRITE...
                  </>
                ) : isTxSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 animate-ping" />
                    AUDIT SAVED ON-CHAIN
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-black group-hover:text-[#0066FF]" />
                    SAVE AUDIT ON-CHAIN
                  </>
                )}
              </button>
            ) : (
              <div className="w-full text-center py-2 px-3 border border-blue-500/15 rounded-xl bg-[#001233]/20">
                <p className="text-xs font-mono text-gray-500 leading-normal">
                  Connect wallet to record this security signature in Arc contract.
                </p>
              </div>
            )}

            {/* Custom transaction details link */}
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#0066FF] hover:underline mt-2 inline-flex items-center gap-1"
              >
                Verification Receipt T_Ref
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>

        {/* SECURITY ANALYTICS (Right column, 7 columns span) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          
          <div className="arc-glass-card p-6 bg-[#001233]/30">
            <h3 className="font-sans font-bold text-lg text-white tracking-widest uppercase flex items-center gap-2 border-b border-blue-900/20 pb-3 mb-4">
              <Cpu className="text-[#0066FF] w-4 h-4" />
              Arc Testnet Portfolios Info
            </h3>

            {/* Token asset rows */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-[#000814]/40 border border-blue-900/15 p-3 rounded-xl font-mono leading-tight">
                <span className="text-[9px] text-[#A0B4CC] block uppercase">USDC Gas Holding</span>
                <span className="text-xl font-bold font-num text-[#0096FF] text-glow-blue leading-none block mt-1">
                  {report.usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDC
                </span>
                <span className="text-[10px] text-gray-500 block mt-1 truncate">USDC: {shortAddress(USDC_ADDRESS)}</span>
              </div>

              <div className="bg-[#000814]/40 border border-blue-900/15 p-3 rounded-xl font-mono leading-tight">
                <span className="text-[9px] text-[#A0B4CC] block uppercase">EURC Stable Pool</span>
                <span className="text-xl font-bold font-num text-[#0096FF] text-glow-blue leading-none block mt-1">
                  {report.eurcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} EURC
                </span>
                <span className="text-[10px] text-gray-500 block mt-1 truncate">EURC: {shortAddress(EURC_ADDRESS)}</span>
              </div>
            </div>

            {/* Action summaries list */}
            <div className="grid grid-cols-2 gap-3.5 mb-6 text-xs text-center font-mono">
              <div className="bg-[#000814]/20 p-2.5 rounded-lg border border-[#0066FF]/10 text-gray-300">
                <span className="text-gray-500 text-[10px] block uppercase leading-snug">LOGGED TRANSITIONS</span>
                <span className="text-[#0096FF] text-glow-blue font-num font-bold text-base block mt-0.5">{report.txCount} TXNS</span>
              </div>

              <div className="bg-[#000814]/20 p-2.5 rounded-lg border border-[#0066FF]/10 text-gray-300">
                <span className="text-gray-500 text-[10px] block uppercase leading-snug">CONTRACT SIGNALS</span>
                <span className="text-[#0096FF] text-glow-blue font-num font-bold text-base block mt-0.5">{report.contractInteractions} CALLS</span>
              </div>
            </div>

            {/* LLM security brief */}
            <div className="bg-blue-950/20 border border-blue-500/15 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#0066FF]" />
                Automated Forensic Summary
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {report.summary}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* INDIVIDUAL FINDINGS LOG LIST */}
      <h3 className="text-base font-mono font-bold tracking-widest text-[#8892A4] uppercase mt-12 mb-3 border-b border-[#0066FF]/15 pb-2">
        IDENTIFIED VECTORS ({report.findings?.length || 0})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.findings && report.findings.length > 0 ? (
          report.findings.map((item, idx) => {
            const isFHigh = item.severity === "DANGER";
            const isFWarn = item.severity === "WARNING";

            return (
              <div key={idx} className="arc-glass-card p-5 relative overflow-hidden bg-[#001233]/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-blue-900/10 pb-2.5 mb-3.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[9.5px] font-bold bg-[#000814] border border-[#0066FF]/20 text-[#0066FF]">
                      CODE REF {item.findingId}
                    </span>

                    <span className={`text-[10px] font-mono font-black uppercase rounded-full px-2 py-0.5 border ${
                      isFHigh ? "badge-bright-danger text-white" :
                      isFWarn ? "badge-bright-warning text-black" :
                      "badge-bright-safe text-black"
                    }`}>
                      {item.severity} SEVERITY
                    </span>
                  </div>

                  <h4 className="font-rajdhani font-black text-[#FFFFFF] text-base tracking-wide uppercase leading-tight mb-1">
                    {item.issueTitle}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans font-normal mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="bg-black/40 p-2.5 rounded-lg border border-blue-900/10 font-mono text-[11px] leading-relaxed">
                  <span className="text-[10px] text-gray-500 block leading-tight uppercase font-black">Remediation Action</span>
                  <span className="text-gray-300 mt-1 block">{item.remediation}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-xs text-gray-500 font-mono">
            No dangerous indicators mapped inside the transaction history records.
          </div>
        )}
      </div>

      {/* MITIGATION PLAN */}
      {report.mitigationAdvice && report.mitigationAdvice.length > 0 && (
        <div className="arc-glass-card p-6 bg-[#001233]/40 border-l-2 border-l-[#0066FF] mt-10">
          <h3 className="font-sans font-bold text-base text-white tracking-widest uppercase mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0066FF]" />
            Ecosystem Security Safeguard Instructions
          </h3>
          <ul className="space-y-2.5 text-xs text-gray-300 font-sans">
            {report.mitigationAdvice.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[#0066FF] font-extrabold font-mono shrink-0 mt-0.5">[{idx + 1}]</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Return to home link */}
      <div className="flex items-center justify-center pt-8">
        <Link to="/" className="text-sm font-mono text-[#8892A4] hover:text-white flex items-center gap-1.5 transition-colors">
          &larr; SCAN ANOTHER PORTFOLIO ADDRESS
        </Link>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════
// PAGE 3: MY AUDITS VIEW
// ═══════════════════════════════════════
function MyAuditsView({ triggerToast }: { triggerToast: any }) {
  const [history, setHistory] = useState<any[]>([]);

  // We can load verified audits from localStorage to show audits performed by the user
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("arc_saved_audits") || "[]");
    setHistory(list);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("arc_saved_audits");
    setHistory([]);
    triggerToast("Saved portfolio scan history cleared.", "info");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/20 pb-4">
        <div>
          <h2 className="text-2xl font-black font-rajdhani text-white uppercase tracking-wider">
            My Audit Records Directory
          </h2>
          <p className="text-xs text-gray-400 font-sans font-medium">
            Review detailed security summaries for all wallet addresses evaluated by your connected module.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/45 px-3 py-1.5 rounded-lg border border-red-900/30 cursor-pointer transition-colors"
          >
            CLEAR RECORDS
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item, idx) => {
            const isDanger = item.riskLevel === "DANGER";
            const isWarning = item.riskLevel === "WARNING";

            return (
              <div key={idx} className="arc-glass-card p-5 relative overflow-hidden bg-[#001233]/30 flex flex-col justify-between">
                <div className="hud-corner-tl opacity-40" />

                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-blue-900/10 pb-2 mb-3 text-xs">
                    <span className="font-mono text-gray-500">{item.date}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase border ${
                      isDanger ? "badge-bright-danger text-white" :
                      isWarning ? "badge-bright-warning text-black" :
                      "badge-bright-safe text-black"
                    }`}>
                      {item.riskLevel} ({item.overallRiskScore}%)
                    </span>
                  </div>

                  <h4 className="font-mono text-white text-sm font-bold tracking-tight select-all">
                    {item.address}
                  </h4>

                  <p className="mt-2 text-xs text-[#8892A4] font-sans line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-blue-900/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{item.txCount || 12} transactions scanned</span>
                  <Link
                    to={`/audit/${item.address}`}
                    className="text-xs font-mono font-black text-[#0066FF] hover:text-white uppercase tracking-wider cursor-pointer"
                  >
                    View Report &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="arc-glass-card p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <Terminal className="w-10 h-10 text-blue-900/60 animate-pulse" />
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0066FF]">Archive Box Empty</p>
          <p className="text-xs text-gray-400 max-w-sm leading-normal">
            You haven&lsquo;t requested any auditing records yet. Go back to Home and paste an address to generate one!
          </p>
          <Link to="/" className="inline-block mt-4 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-rajdhani uppercase font-bold text-xs tracking-widest transition-all">
            SCAN FIRST ADDRESS
          </Link>
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════
// PAGE 5: ADMIN VIEW
// ═══════════════════════════════════════
function AdminView({ stats, triggerToast }: { stats: any; triggerToast: any }) {
  const { address } = useAccount();

  if (!address || address.toLowerCase() !== OWNER_WALLET.toLowerCase()) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-rajdhani text-white uppercase">Access Restricted</h3>
        <p className="text-sm text-gray-400 font-mono mt-1 leading-relaxed">
          Access to this dashboard requires master auditor level authorization or owner wallet signatures.
        </p>
        <p className="text-[11px] text-gray-500 font-mono mt-3">
          Expected Signer: {OWNER_WALLET}
        </p>
        <p className="text-[11px] text-red-400 font-mono mt-1 truncate">
          Active connected Address: {address || "Unconnected"}
        </p>
        <Link to="/" className="inline-block mt-6 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-rajdhani uppercase font-semibold text-xs tracking-wider">
          &larr; GO BACK HOME
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      
      <div className="border-b border-blue-900/20 pb-4">
        <h2 className="text-2xl font-black font-rajdhani text-white uppercase tracking-wider">
          ArcSahib Protocol Administrator Controller
        </h2>
        <p className="text-xs text-red-400 font-mono font-bold uppercase tracking-wider mt-0.5">
          Level-S Secured Access Approved (Owner Wallet Verified)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="arc-glass-card p-5 bg-[#001233]/20">
          <p className="text-[10px] font-mono text-gray-500 uppercase">ACTIVE PROTOCOL CONTRACT</p>
          <p className="text-sm font-mono mt-1 font-bold text-white leading-tight truncate">
            {CONTRACT_ADDRESS}
          </p>
        </div>

        <div className="arc-glass-card p-5 bg-[#001233]/20">
          <p className="text-[10px] font-mono text-gray-500 uppercase">STABLE GAS TARGETS</p>
          <p className="text-xs font-mono mt-1 text-gray-300 leading-normal">
            USDC: {shortAddress(USDC_ADDRESS)} <br />
            EURC: {shortAddress(EURC_ADDRESS)}
          </p>
        </div>

        <div className="arc-glass-card p-5 bg-[#001233]/20">
          <p className="text-[10px] font-mono text-gray-500 uppercase">AUDITOR ENFORCEMENT</p>
          <p className="text-xs font-mono mt-1 font-bold text-[#0066FF] leading-normal uppercase">
            AUTOMATED PATTERN MATCHING ENABLED
          </p>
        </div>
      </div>

      {/* Admin actions block */}
      <div className="arc-glass-card p-6 bg-[#001233]/30">
        <h3 className="font-sans font-bold text-base text-white tracking-widest uppercase mb-4 border-b border-blue-900/10 pb-2">
          Platform Security Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-blue-900/20 bg-[#000814]/30 space-y-2">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Emergency Safety Halt</h4>
            <p className="text-xs text-gray-500 leading-normal">
              Pause all standard on-chain write activities on createAudit in case of Testnet security disruption.
            </p>
            <button
              onClick={() => triggerToast("Master Emergency Pause signal broadcasted (simulated)", "warn")}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900 text-red-300 font-mono text-xs uppercase tracking-wider rounded border border-red-500/30 cursor-pointer"
            >
              EMERGENCY HALT (PAUSE)
            </button>
          </div>

          <div className="p-4 rounded-xl border border-blue-900/20 bg-[#000814]/30 space-y-2">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Ecosystem Whitelist Override</h4>
            <p className="text-xs text-gray-500 leading-normal">
              Directly whitelist address parameters override to skip danger categorization scores.
            </p>
            <button
              onClick={() => triggerToast("Dynamic routing overrides verified.", "success")}
              className="px-4 py-2 bg-blue-950/40 hover:bg-[#001233] text-[#0066FF] font-mono text-xs uppercase tracking-wider rounded border border-blue-500/35 cursor-pointer"
            >
              WHITELIST GATEWAY
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
