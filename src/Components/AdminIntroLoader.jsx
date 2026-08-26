import React, { useEffect, useRef, useState } from "react";

export default function AdminIntroLoader({ onComplete }) {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING RETRO WAVE AUDIO ENGINE...");
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. Progress & Status text step progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.6;
        if (next >= 25 && next < 55) {
          setStatusText("TUNING 4K LINE-ARRAY & LASER FX...");
        } else if (next >= 55 && next < 85) {
          setStatusText("SYNCHRONIZING SS AUDIOS MEDIA VAULT...");
        } else if (next >= 85 && next < 100) {
          setStatusText("LAUNCHING SOUNDSCAPE ADMIN STUDIO...");
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete]);

  // 2. High-Performance Retro Wave + Grid Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Spectrum Equalizer Bars
    const barCount = 48;
    const bars = Array.from({ length: barCount }, (_, i) => ({
      xRatio: i / (barCount - 1),
      baseHeight: Math.random() * 40 + 15,
      speed: Math.random() * 0.08 + 0.04,
      phase: Math.random() * Math.PI * 2,
    }));

    // Flying Stars/Particles
    const starCount = 80;
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 1000 + 100,
      size: Math.random() * 2 + 1,
    }));

    let time = 0;
    let gridOffset = 0;

    const render = () => {
      time += 1;
      gridOffset = (gridOffset + 1.8) % 40;

      ctx.clearRect(0, 0, width, height);

      // Deep space background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#080407");
      bgGrad.addColorStop(0.5, "#140A12");
      bgGrad.addColorStop(0.7, "#28071E");
      bgGrad.addColorStop(1, "#0D040A");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- STARFIELD WARP EFFECT ---
      ctx.save();
      const centerX = width / 2;
      const centerY = height * 0.42;
      stars.forEach((star) => {
        star.z -= 4.5;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 250 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px >= 0 && px <= width && py >= 0 && py <= height * 0.65) {
          const alpha = Math.min(1, (1000 - star.z) / 600);
          ctx.beginPath();
          ctx.arc(px, py, star.size * k * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(247, 7, 118, ${alpha * 0.7})`;
          ctx.fill();
        }
      });
      ctx.restore();

      // --- RETRO SYNTHWAVE HORIZON SUN ---
      const sunRadius = Math.min(width, height) * 0.18;
      const sunY = height * 0.5;

      const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
      sunGrad.addColorStop(0, "#FF007F");
      sunGrad.addColorStop(0.4, "#F70776");
      sunGrad.addColorStop(0.8, "#FF8C00");
      sunGrad.addColorStop(1, "#FFD700");

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, sunY, sunRadius, Math.PI, 0, false);
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = "#F70776";
      ctx.shadowBlur = 40;
      ctx.fill();

      // Horizontal Sun Blinds / Slices
      for (let s = 1; s <= 6; s++) {
        const sliceY = sunY - sunRadius + (s * (sunRadius / 6));
        const sliceHeight = s * 1.8;
        ctx.fillStyle = "#080407";
        ctx.fillRect(centerX - sunRadius, sliceY, sunRadius * 2, sliceHeight);
      }
      ctx.restore();

      // --- 3D PERSPECTIVE RETRO GRID ---
      const horizonY = height * 0.5;
      ctx.save();
      ctx.strokeStyle = "rgba(247, 7, 118, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "#F70776";
      ctx.shadowBlur = 8;

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.strokeStyle = "rgba(247, 7, 118, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Horizontal moving grid lines with perspective exponential spacing
      for (let y = 0; y < height - horizonY; y += 18) {
        const p = Math.pow((y + gridOffset) / (height - horizonY), 2.2);
        const actualY = horizonY + p * (height - horizonY);
        if (actualY <= height) {
          ctx.beginPath();
          ctx.moveTo(0, actualY);
          ctx.lineTo(width, actualY);
          ctx.strokeStyle = `rgba(247, 7, 118, ${Math.min(0.8, p * 0.9)})`;
          ctx.stroke();
        }
      }

      // Vanishing point perspective lines
      const lineCount = 22;
      for (let i = -lineCount; i <= lineCount; i++) {
        const xBottom = centerX + (i * (width / 14));
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.strokeStyle = `rgba(195, 25, 93, 0.4)`;
        ctx.stroke();
      }
      ctx.restore();

      // --- BOTTOM EQUALIZER AUDIO FREQUENCY BARS ---
      ctx.save();
      bars.forEach((bar) => {
        const bx = bar.xRatio * width;
        const pulse = Math.sin(time * bar.speed + bar.phase);
        const barH = bar.baseHeight + Math.abs(pulse) * 45 + Math.sin(time * 0.05 + bx * 0.01) * 20;

        const eqGrad = ctx.createLinearGradient(bx, height - barH, bx, height);
        eqGrad.addColorStop(0, "#F70776");
        eqGrad.addColorStop(0.5, "#C3195D");
        eqGrad.addColorStop(1, "rgba(20, 16, 16, 0)");

        ctx.fillStyle = eqGrad;
        ctx.shadowColor = "#F70776";
        ctx.shadowBlur = 10;
        ctx.fillRect(bx - 3, height - barH, 6, barH);

        // Neon Top Cap
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(bx - 3.5, height - barH - 3, 7, 2);
      });
      ctx.restore();

      // --- SINE WAVE AUDIO STRANDS ---
      ctx.save();
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const waveY = height * (0.46 + w * 0.04);
        const waveAmp = 25 - w * 6;
        const waveFreq = 0.006 + w * 0.002;
        const waveSpeed = (w % 2 === 0 ? 1 : -1) * (0.03 + w * 0.01);

        for (let x = 0; x <= width; x += 8) {
          const y = waveY + Math.sin(x * waveFreq + time * waveSpeed) * waveAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = w === 0 ? "rgba(247, 7, 118, 0.85)" : w === 1 ? "rgba(0, 240, 255, 0.65)" : "rgba(255, 140, 0, 0.5)";
        ctx.lineWidth = w === 0 ? 2.5 : 1.5;
        ctx.shadowColor = "#F70776";
        ctx.shadowBlur = 15;
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0A0608] flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden transition-all duration-700 select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none filter blur-sm" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Interactive Retro Wave Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Ambient Vignette & CRT Scanline Screen Overlay */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-40" />

      {/* TOP BAR: SYSTEM STATUS & SKIP BUTTON */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F70776] animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FAF6F6] drop-shadow-[0_0_8px_#F70776]">
            SS AUDIOS CORE // BOOT SEQUENCE
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="px-4 py-1.5 rounded-full bg-[#1C1717]/80 hover:bg-[#F70776] border border-[#2B2323] hover:border-[#F70776] text-[#A69B9B] hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer flex items-center gap-2 group"
        >
          <span>Skip Intro</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* CENTER: ICONIC "SS AUDIOS" BRAND APPEARANCE */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center my-auto space-y-5">
        {/* Animated Sonic Rings Logo */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#F70776]/40 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-dashed border-[#F70776]/60 animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#C3195D] via-[#F70776] to-[#FF8C00] opacity-20 blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#141010]/90 border border-[#F70776] shadow-[0_0_40px_rgba(247,7,118,0.6)] flex items-center justify-center backdrop-blur-md transform hover:scale-105 transition-transform p-3 sm:p-4">
            <img
              src="/SS.svg"
              alt="SS Audios"
              className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(247,7,118,0.9)]"
            />
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(247,7,118,0.8)] font-sans">
            SOUND<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F70776] via-[#FF007F] to-[#FF8C00]">SCAPE</span>
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#BDB2B2] font-bold">
            Live Audio & Stage Production Studio
          </p>
        </div>
      </div>

      {/* BOTTOM: RETRO PROGRESS BAR & BOOTLOG */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center space-y-3">
        <div className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-[#A69B9B]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F70776] animate-pulse" />
            {statusText}
          </span>
          <span className="text-[#F70776]">{Math.floor(progress)}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2 rounded-full bg-[#181414] border border-[#2B2323] overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C3195D] via-[#F70776] to-[#FF8C00] shadow-[0_0_15px_#F70776] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
          4K RESOLUTION AUDIO VISUALIZER • CLOUD SYNCED
        </span>
      </div>
    </div>
  );
}
