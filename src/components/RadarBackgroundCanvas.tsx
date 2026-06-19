import React, { useEffect, useRef, useState } from "react";

interface ActiveHex {
  key: string; // "col,row"
  col: number;
  row: number;
  opacity: number;
  targetOpacity: number;
  status: "fadeIn" | "pulse" | "fadeOut";
  type: "glow" | "number";
  text: string;
  lifetime: number; // counter to change phases
  pulseSpeed: number;
  maxOpacity: number;
}

export default function RadarBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    let activeHexes = new Map<string, ActiveHex>();

    // Mock tech security dataset to fill hex cells
    const dataWordList = [
      "SEC", "0xFA", "SYS", "OK", "SAFE", "SHD", "PORT", "99.8%", "ON", "LOCK",
      "01", "F5", "3B", "ERR", "AUD", "ARC", "NET", "LIVE", "E8", "A2"
    ];

    const radius = 44; // size of the hex cells
    const h = Math.sqrt(3) * radius;
    const xSpacing = 1.5 * radius;
    const ySpacing = h;

    const drawHex = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      ctx.closePath();
    };

    const render = () => {
      if (!canvas || !isRunning) return;
      const { width, height } = dimensions;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / xSpacing) + 2;
      const rows = Math.ceil(height / ySpacing) + 2;

      // Randomly spawn active hexes slowly
      if (Math.random() < 0.03 && activeHexes.size < 28) {
        const c = Math.floor(Math.random() * (cols + 2)) - 1;
        const r = Math.floor(Math.random() * (rows + 2)) - 1;
        const key = `${c},${r}`;

        if (!activeHexes.has(key)) {
          const type = Math.random() > 0.45 ? "glow" : "number";
          const text = dataWordList[Math.floor(Math.random() * dataWordList.length)];
          const maxOpacity = 0.4 + Math.random() * 0.45;

          activeHexes.set(key, {
            key,
            col: c,
            row: r,
            opacity: 0,
            targetOpacity: maxOpacity,
            status: "fadeIn",
            type,
            text,
            lifetime: 200 + Math.random() * 250, // frames
            pulseSpeed: 0.01 + Math.random() * 0.015,
            maxOpacity,
          });
        }
      }

      // 1. DRAW BASE HONEYCOMB GRID OUTLINES (Subtle opacity 0.12)
      ctx.strokeStyle = "rgba(0, 102, 255, 0.12)";
      ctx.lineWidth = 1.2;

      for (let c = -1; c < cols; c++) {
        const cx = c * xSpacing;
        for (let r = -1; r < rows; r++) {
          const cy = r * ySpacing + (c % 2 === 0 ? 0 : ySpacing / 2);
          drawHex(cx, cy, radius);
          ctx.stroke();
        }
      }

      // 2. UPDATE AND DRAW ACTIVE/ILLUMINATED HEXAGONS
      activeHexes.forEach((hex, key) => {
        // Position on viewport
        const cx = hex.col * xSpacing;
        const cy = hex.row * ySpacing + (hex.col % 2 === 0 ? 0 : ySpacing / 2);

        // Update state
        if (hex.status === "fadeIn") {
          hex.opacity += 0.008;
          if (hex.opacity >= hex.targetOpacity) {
            hex.opacity = hex.targetOpacity;
            hex.status = "pulse";
          }
        } else if (hex.status === "pulse") {
          hex.lifetime--;
          // slow pulse glow
          const pulseOffset = Math.sin(hex.lifetime * hex.pulseSpeed) * 0.12;
          hex.opacity = Math.max(0.05, Math.min(1.0, hex.maxOpacity + pulseOffset));

          if (hex.lifetime <= 0) {
            hex.status = "fadeOut";
          }
        } else if (hex.status === "fadeOut") {
          hex.opacity -= 0.006;
          if (hex.opacity <= 0) {
            hex.opacity = 0;
            activeHexes.delete(key);
            return;
          }
        }

        ctx.save();

        // Layer glow/fill inside the active hexagon
        if (hex.type === "glow") {
          // radial-like glowing fill
          const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.1);
          grad.addColorStop(0, `rgba(0, 102, 255, ${hex.opacity * 0.45})`);
          grad.addColorStop(0.65, `rgba(0, 102, 255, ${hex.opacity * 0.18})`);
          grad.addColorStop(1, "rgba(0, 102, 255, 0)");
          ctx.fillStyle = grad;
        } else {
          // lighter technological honeycomb panel
          ctx.fillStyle = `rgba(0, 102, 255, ${hex.opacity * 0.15})`;
        }

        drawHex(cx, cy, radius);
        ctx.fill();

        // Thicker blue highlights outline for active hexes
        ctx.strokeStyle = `rgba(0, 150, 255, ${hex.opacity * 0.85})`;
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Ambient shadow pulse
        ctx.shadowColor = "#0066FF";
        ctx.shadowBlur = 10 * hex.opacity;
        ctx.stroke();

        ctx.restore();

        // Print premium security codes/numbers in cell centers
        if (hex.type === "number") {
          ctx.font = "bold 11px 'JetBrains Mono', 'Orbitron', monospace";
          ctx.fillStyle = `rgba(0, 150, 255, ${hex.opacity * 0.95})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Optional subtle text shadow to emulate digital terminal glow
          ctx.shadowColor = "#0096FF";
          ctx.shadowBlur = 4;
          ctx.fillText(hex.text, cx, cy);
          ctx.shadowBlur = 0;
        }
      });

      // Ambient Corner Radial Gradients
      const ambientTop = ctx.createRadialGradient(width, 0, 0, width, 0, 500);
      ambientTop.addColorStop(0, "rgba(0, 102, 255, 0.08)");
      ambientTop.addColorStop(1, "rgba(0, 8, 20, 0)");
      ctx.fillStyle = ambientTop;
      ctx.fillRect(0, 0, width, height);

      const ambientBottom = ctx.createRadialGradient(0, height, 0, 0, height, 500);
      ambientBottom.addColorStop(0, "rgba(0, 102, 255, 0.06)");
      ambientBottom.addColorStop(1, "rgba(0, 8, 20, 0)");
      ctx.fillStyle = ambientBottom;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      isRunning = false;
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
