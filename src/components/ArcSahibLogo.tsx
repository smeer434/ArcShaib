import React from "react";

interface LogoProps {
  className?: string;
  size?: number; // width/height of the icon container
  showText?: boolean;
}

export default function ArcSahibLogo({ className = "", size = 42, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Animated SVG Shield Logo Emblem */}
      <div 
        className="relative flex items-center justify-center animate-pulse" 
        style={{ width: size, height: size, animationDuration: "3s" }}
      >
        {/* Blue pulse glowing background behind the shield */}
        <div className="absolute inset-0 bg-[#0066FF] rounded-full filter blur-md opacity-25" />
        
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 w-full h-full drop-shadow-[0_0_12px_rgba(0,102,255,0.65)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS FOR GRADIENTS */}
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0044CC" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>
            <linearGradient id="sahibGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0096FF" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>
          </defs>

          {/* Shield Outline Path */}
          <path
            d="M50 12 L85 24 V55 C85 75 50 88 50 88 C50 88 15 75 15 55 V24 L50 12 Z"
            fill="url(#shieldGrad)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Central radar scan waves concentric circles on shield */}
          {/* Wave 1 (inner) */}
          <path
            d="M38 52 A15 15 0 0 1 62 52"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Wave 2 (middle) */}
          <path
            d="M30 46 A25 25 0 0 1 70 46"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Wave 3 (outer) */}
          <path
            d="M22 40 A35 35 0 0 1 78 40"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="1.0"
          />

          {/* Central Target Radar Ping Dot */}
          <circle cx="50" cy="58" r="5" fill="#00FF88" className="animate-ping" style={{ transformOrigin: "50px 58px" }} />
          <circle cx="50" cy="58" r="3.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography Text Layout */}
      {showText && (
        <div className="flex flex-col leading-none font-rajdhani">
          <div className="flex items-baseline">
            <span className="font-extrabold tracking-tight text-white text-xl md:text-2xl">
              Arc
            </span>
            <span className="font-black tracking-normal ml-0.5 text-xl md:text-2xl bg-gradient-to-r from-[#0096FF] to-[#0066FF] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,102,255,0.25)]">
              Sahib
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.16em] text-gray-400 font-bold uppercase mt-0.5">
            WALLET SECURITY AUDIT
          </span>
        </div>
      )}
    </div>
  );
}
