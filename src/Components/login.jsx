import React, { useState } from 'react';
import SoundscapeBackground from './SoundscapeBackground';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ssaudios25@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'ssaudios.admin1').trim();

const LoginPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const [isSuccessUnlocking, setIsSuccessUnlocking] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) {
            setError('');
            setIsGlitching(false);
        }
    };

    const triggerInvalidAnimation = (msg) => {
        setError(msg);
        setIsGlitching(true);
        setIsLoading(false);
        // Reset glitch shake class after animation completes
        setTimeout(() => {
            setIsGlitching(false);
        }, 700);
    };

    const triggerSuccessAnimation = () => {
        setIsLoading(false);
        setIsSuccessUnlocking(true);
        setError('');

        // Play the warp/unlock sequence for 950ms before switching into Admin Studio panel
        setTimeout(() => {
            if (onLoginSuccess) {
                onLoginSuccess(formData);
            }
        }, 950);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const inputEmail = (formData.email || '').toLowerCase().trim();
        const inputPassword = (formData.password || '').trim();

        if (!inputEmail || !inputPassword) {
            triggerInvalidAnimation('Please fill in both email and password.');
            return;
        }

        setIsLoading(true);
        setIsGlitching(false);

        setTimeout(() => {
            if (inputEmail === ADMIN_EMAIL && inputPassword === ADMIN_PASSWORD) {
                triggerSuccessAnimation();
            } else {
                triggerInvalidAnimation('Access Denied: Invalid administrator credentials.');
            }
        }, 400);
    };

    return (
        <div className="relative min-h-screen bg-[#141010] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
            {/* Custom Animation Keyframes */}
            <style>{`
                @keyframes errorGlitchShake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    15% { transform: translate(-12px, -3px) rotate(-1.5deg); }
                    30% { transform: translate(10px, 3px) rotate(1.2deg); }
                    45% { transform: translate(-8px, 1px) rotate(-0.8deg); }
                    60% { transform: translate(7px, -2px) rotate(0.6deg); }
                    75% { transform: translate(-4px, 1px) rotate(-0.3deg); }
                    90% { transform: translate(2px, 0px) rotate(0deg); }
                }

                @keyframes redAlarmPulse {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.75; }
                }

                @keyframes successWarpUnlock {
                    0% { transform: scale(1); opacity: 1; filter: brightness(1) drop-shadow(0 0 0 transparent); }
                    35% { transform: scale(1.03); opacity: 1; filter: brightness(1.3) drop-shadow(0 0 40px #00ffcc); }
                    100% { transform: scale(1.08) translateY(-25px); opacity: 0; filter: brightness(2) blur(10px); }
                }

                @keyframes greenPulseWave {
                    0% { transform: scale(0.6); opacity: 0.9; }
                    100% { transform: scale(2.2); opacity: 0; }
                }

                .card-glitch-error {
                    animation: errorGlitchShake 0.65s cubic-bezier(.36,.07,.19,.97) both;
                    box-shadow: 0 0 50px rgba(239, 68, 68, 0.7), inset 0 0 30px rgba(239, 68, 68, 0.3) !important;
                    border-color: #ef4444 !important;
                }

                .card-success-unlock {
                    animation: successWarpUnlock 0.95s forwards ease-in-out;
                    box-shadow: 0 0 60px rgba(0, 255, 170, 0.8), inset 0 0 40px rgba(0, 255, 170, 0.4) !important;
                    border-color: #00ffaa !important;
                }
            `}</style>

            {/* Dynamic Soundscape Animated Audio Waves & Equalizer Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
                <SoundscapeBackground variant="login" waveCount={4} particleCount={50} speed={0.9} interactive={true} />
            </div>

            {/* ERROR RED FLASH OVERLAY */}
            <div
                className={`absolute inset-0 z-10 bg-red-600/30 pointer-events-none transition-opacity duration-300 ${
                    isGlitching ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ animation: isGlitching ? 'redAlarmPulse 0.65s ease-in-out' : 'none' }}
            />

            {/* SUCCESS GREEN / CYAN PORTAL BURST OVERLAY */}
            <div
                className={`absolute inset-0 z-10 bg-gradient-to-tr from-emerald-500/20 via-[#00ffaa]/30 to-[#f70776]/20 pointer-events-none transition-opacity duration-500 flex items-center justify-center ${
                    isSuccessUnlocking ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {isSuccessUnlocking && (
                    <div
                        className="w-96 h-96 rounded-full border-4 border-[#00ffaa] shadow-[0_0_80px_#00ffaa]"
                        style={{ animation: 'greenPulseWave 0.95s forwards ease-out' }}
                    />
                )}
            </div>

            {/* Ambient vignette and glow overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141010] via-transparent to-[#141010]/80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f70776]/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Container Card */}
            <div
                className={`relative z-20 bg-[#1C1717]/90 backdrop-blur-xl border border-[#2B2323] hover:border-[#f70776]/40 transition-all duration-300 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row w-full max-w-4xl ${
                    isGlitching ? 'card-glitch-error' : ''
                } ${isSuccessUnlocking ? 'card-success-unlock' : ''}`}
            >
                {/* Left Side: Visual / Hero Section */}
                <div className="relative md:w-1/2 min-h-[280px] md:min-h-[500px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop')`
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1717] via-[#1C1717]/65 to-transparent" />

                    {/* Top Bar on Left Panel */}
                    <div className="relative z-10 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#f70776] bg-[#141010]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                            Audio & Visual Experience
                        </span>
                    </div>

                    {/* Bottom Card Preview */}
                    <div className="relative z-10 bg-[#141010]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#f70776] animate-pulse" />
                            <h4 className="text-white text-sm font-bold">Immersive Audio Hub</h4>
                        </div>
                        <p className="text-[#BDB2B2] text-xs leading-relaxed font-light">
                            Manage soundscapes, live stage visuals, and media assets in real time.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="md:w-1/2 bg-[#1C1717]/95 p-8 sm:p-12 flex flex-col justify-center relative border-t md:border-t-0 md:border-l border-[#2B2323]">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-[#f70776] flex items-center justify-between px-1.5 py-2">
                                <span className="w-1 h-1 bg-[#141010] rounded-full"></span>
                                <span className="w-1 h-1 bg-[#141010] rounded-full"></span>
                            </div>
                            <h1 className="text-xl font-black tracking-wider text-white">
                                SOUND<span className="text-[#f70776]">SCAPE</span>
                            </h1>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A69B9B] px-2.5 py-1 rounded-full bg-[#141010] border border-[#2B2323]">
                            Admin Portal
                        </span>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-white mb-1">Welcome Back</h2>
                        <p className="text-[#A69B9B] text-xs font-light">Log in to access your media vault & studio controls</p>
                    </div>

                    {/* ERROR BANNER WITH GLITCH HIGHLIGHT */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-950/70 border border-red-500 text-red-300 text-xs rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-bounce">
                            <span className="text-base">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* SUCCESS UNLOCK BANNER */}
                    {isSuccessUnlocking && (
                        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(0,255,170,0.5)]">
                            <span className="text-base">🔓</span>
                            <span>ACCESS GRANTED • Unlocking Soundscape Studio...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A69B9B] mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@soundscape.io"
                                className={`w-full px-4 py-3 text-sm rounded-xl bg-[#141010] border text-white placeholder-[#6b6161] focus:outline-none transition-all ${
                                    isGlitching
                                        ? 'border-red-500 ring-2 ring-red-500/50 bg-red-950/20'
                                        : isSuccessUnlocking
                                        ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-950/20'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A69B9B] mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 text-sm rounded-xl bg-[#141010] border text-white placeholder-[#6b6161] focus:outline-none transition-all ${
                                    isGlitching
                                        ? 'border-red-500 ring-2 ring-red-500/50 bg-red-950/20'
                                        : isSuccessUnlocking
                                        ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-950/20'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || isSuccessUnlocking}
                            className={`w-full py-3.5 mt-2 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 ${
                                isSuccessUnlocking
                                    ? 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] shadow-emerald-500/50 text-black font-black scale-105'
                                    : isGlitching
                                    ? 'bg-red-600 shadow-red-600/50'
                                    : 'bg-[#f70776] hover:bg-[#c3195d] shadow-[#f70776]/25 hover:-translate-y-0.5 active:translate-y-0'
                            } disabled:opacity-75`}
                        >
                            {isSuccessUnlocking ? (
                                <>
                                    <span>✓</span>
                                    <span>Access Granted • Entering Studio...</span>
                                </>
                            ) : isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <span>Access Studio</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;