import React, { useEffect, useRef } from "react";

export default function SoundscapeBackground({
  variant = "login", // "hero" | "login" | "minimal"
  waveCount = 4,
  particleCount = 45,
  speed = 0.9,
  interactive = true,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };

    const shockwaves = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = width / 2;
      mouse.targetY = height / 2;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      shockwaves.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.45,
        opacity: 0.8,
        speed: 4.5,
      });
    };

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("click", handleClick);
    }

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      hue: Math.random() > 0.4 ? 335 : 280,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const eqBarCount = 24;
    const eqBars = Array.from({ length: eqBarCount }, (_, i) => ({
      x: (i / (eqBarCount - 1)) * width,
      baseHeight: Math.random() * 26 + 8,
      phase: Math.random() * Math.PI * 2,
      freq: Math.random() * 0.04 + 0.02,
    }));

    const waveConfigs = [
      {
        baseY: 0.65,
        amplitude: 45,
        frequency: 0.0035,
        speed: 0.02 * speed,
        colorStart: "rgba(247, 7, 118, 0.45)",
        colorEnd: "rgba(195, 25, 93, 0.0)",
        strokeColor: "rgba(247, 7, 118, 0.85)",
        strokeWidth: 2,
        noiseFreq: 0.008,
      },
      {
        baseY: 0.72,
        amplitude: 55,
        frequency: 0.0028,
        speed: -0.016 * speed,
        colorStart: "rgba(195, 25, 93, 0.35)",
        colorEnd: "rgba(120, 10, 80, 0.0)",
        strokeColor: "rgba(247, 7, 118, 0.6)",
        strokeWidth: 1.5,
        noiseFreq: 0.006,
      },
      {
        baseY: 0.8,
        amplitude: 65,
        frequency: 0.0022,
        speed: 0.014 * speed,
        colorStart: "rgba(138, 43, 226, 0.3)",
        colorEnd: "rgba(20, 16, 16, 0.0)",
        strokeColor: "rgba(180, 60, 255, 0.7)",
        strokeWidth: 2,
        noiseFreq: 0.005,
      },
      {
        baseY: 0.88,
        amplitude: 50,
        frequency: 0.004,
        speed: -0.022 * speed,
        colorStart: "rgba(0, 240, 255, 0.2)",
        colorEnd: "rgba(20, 16, 16, 0.0)",
        strokeColor: "rgba(0, 240, 255, 0.6)",
        strokeWidth: 1.2,
        noiseFreq: 0.009,
      },
    ].slice(0, waveCount);

    let time = 0;

    const render = () => {
      time += 1;

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const glowX = mouse.active ? mouse.x : width * 0.5;
      const glowY = mouse.active ? mouse.y : height * 0.45;
      const radialGlow = ctx.createRadialGradient(
        glowX,
        glowY,
        10,
        glowX,
        glowY,
        Math.max(width, height) * 0.6
      );
      radialGlow.addColorStop(0, "rgba(247, 7, 118, 0.14)");
      radialGlow.addColorStop(0.45, "rgba(138, 43, 226, 0.06)");
      radialGlow.addColorStop(1, "rgba(20, 16, 16, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.opacity *= 0.96;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(247, 7, 118, ${sw.opacity})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#F70776";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();

        if (sw.opacity < 0.02 || sw.radius > sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.04;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 1.8;
            p.y += (dy / dist) * force * 1.8;
          }
        }

        const dynamicOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 60%, ${dynamicOpacity})`;
        ctx.shadowColor = `hsl(${p.hue}, 95%, 60%)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Equalizer bars
      ctx.save();
      eqBars.forEach((bar) => {
        bar.x = (bar.x + 0.2) % width;
        const pulseHeight =
          bar.baseHeight +
          Math.sin(time * bar.freq + bar.phase) * 16 +
          Math.sin(time * 0.03 + bar.x * 0.01) * 10;

        const barY = height * 0.74;
        const grad = ctx.createLinearGradient(bar.x, barY - pulseHeight, bar.x, barY);
        grad.addColorStop(0, "rgba(247, 7, 118, 0.6)");
        grad.addColorStop(1, "rgba(247, 7, 118, 0.0)");

        ctx.fillStyle = grad;
        ctx.fillRect(bar.x, barY - pulseHeight, 2.5, pulseHeight);

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(bar.x - 0.5, barY - pulseHeight - 2, 3.5, 2);
      });
      ctx.restore();

      // Multi-layered Harmonic Audio Waves
      waveConfigs.forEach((wave) => {
        ctx.save();
        ctx.beginPath();

        const baseY = height * wave.baseY;
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseY);

        for (let x = 0; x <= width; x += 6) {
          const sine1 = Math.sin(x * wave.frequency + time * wave.speed);
          const sine2 = Math.sin(x * wave.noiseFreq - time * wave.speed * 1.4);
          let mouseWarp = 0;
          if (mouse.active) {
            const distX = Math.abs(x - mouse.x);
            if (distX < 240) {
              const falloff = Math.cos((distX / 240) * (Math.PI / 2));
              mouseWarp = Math.sin((x - mouse.x) * 0.02 + time * 0.08) * falloff * 20;
            }
          }

          const y = baseY + (sine1 * 0.65 + sine2 * 0.35) * wave.amplitude + mouseWarp;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGradient = ctx.createLinearGradient(0, baseY - wave.amplitude, 0, height);
        waveGradient.addColorStop(0, wave.colorStart);
        waveGradient.addColorStop(0.8, wave.colorEnd);
        waveGradient.addColorStop(1, "rgba(20, 16, 16, 0.95)");

        ctx.fillStyle = waveGradient;
        ctx.fill();

        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const sine1 = Math.sin(x * wave.frequency + time * wave.speed);
          const sine2 = Math.sin(x * wave.noiseFreq - time * wave.speed * 1.4);
          let mouseWarp = 0;
          if (mouse.active) {
            const distX = Math.abs(x - mouse.x);
            if (distX < 240) {
              const falloff = Math.cos((distX / 240) * (Math.PI / 2));
              mouseWarp = Math.sin((x - mouse.x) * 0.02 + time * 0.08) * falloff * 20;
            }
          }
          const y = baseY + (sine1 * 0.65 + sine2 * 0.35) * wave.amplitude + mouseWarp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.strokeColor;
        ctx.lineWidth = wave.strokeWidth;
        ctx.shadowColor = wave.strokeColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("click", handleClick);
      }
    };
  }, [variant, waveCount, particleCount, speed, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ touchAction: "none" }}
    />
  );
}
