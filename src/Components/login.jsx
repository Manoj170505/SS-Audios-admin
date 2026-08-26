import React, { useState, useEffect } from 'react';
import SoundscapeBackground from './SoundscapeBackground';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ssaudios25@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'ssaudios.admin1').trim();

const BAR_COUNT = 28;

const LoginPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Spectrum States: 'idle' | 'peaking_green' | 'dropped_red'
    const [spectrumState, setSpectrumState] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || spectrumState !== 'idle') {
            setError('');
            setSpectrumState('idle');
        }
    };

    const handleInvalidCredentials = (msg) => {
        setIsLoading(false);
        setSpectrumState('dropped_red');
        setError(msg || 'Invalid Credentials');

        // Restore to standby medium frequency after 2.8s
        setTimeout(() => {
            setSpectrumState('idle');
        }, 2800);
    };

    const handleSuccessCredentials = () => {
        setIsLoading(false);
        setSpectrumState('peaking_green');
        setError('');

        // Peaks in neon green and opens admin portal smoothly
        setTimeout(() => {
            if (onLoginSuccess) {
                onLoginSuccess(formData);
            }
        }, 1100);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const inputEmail = (formData.email || '').toLowerCase().trim();
        const inputPassword = (formData.password || '').trim();

        if (!inputEmail || !inputPassword) {
            handleInvalidCredentials('Invalid Credentials: Enter Email & Password');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            if (inputEmail === ADMIN_EMAIL && inputPassword === ADMIN_PASSWORD) {
                handleSuccessCredentials();
            } else {
                handleInvalidCredentials('Invalid Credentials');
            }
        }, 350);
    };

    return (
        <div className="relative min-h-screen bg-[#141010] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
            {/* Custom Equalizer Spectrum Bar Keyframe Animations */}
            <style>{`
                /* IDLE MEDIUM FREQUENCY OSCILLATION */
                @keyframes mediumBarPulse {
                    0%, 100% { height: 18%; opacity: 0.75; }
                    30% { height: 58%; opacity: 1; }
                    60% { height: 35%; opacity: 0.85; }
                    80% { height: 68%; opacity: 1; }
                }

                /* SUCCESS MAX PEAK IN GREEN */
                @keyframes peakGreenSurge {
                    0% { height: 30%; opacity: 0.8; }
                    40% { height: 98%; opacity: 1; }
                    70% { height: 85%; opacity: 1; }
                    100% { height: 100%; opacity: 1; filter: drop-shadow(0 0 12px #00ffaa); }
                }

                /* WRONG CREDENTIALS LOW DROP / FLATLINE IN RED */
                @keyframes lowRedDrop {
                    0% { height: 50%; opacity: 0.8; }
                    35% { height: 8%; opacity: 0.5; }
                    60% { height: 14%; opacity: 0.7; }
                    100% { height: 8%; opacity: 0.6; filter: drop-shadow(0 0 6px #ef4444); }
                }

                @keyframes greenHaloExpand {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1.3); opacity: 0; }
                }

                @keyframes redGlitchJitter {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
            `}</style>

            {/* Dynamic Soundscape Animated Audio Waves Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
                <SoundscapeBackground variant="login" waveCount={4} particleCount={50} speed={0.9} interactive={true} />
            </div>

            {/* Ambient vignette and glow */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141010] via-transparent to-[#141010]/80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f70776]/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Login Card - Clean & Stable Proportions */}
            <div className="relative z-10 bg-[#1C1717]/95 backdrop-blur-xl border border-[#2B2323] hover:border-[#f70776]/40 transition-colors duration-500 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row w-full max-w-4xl min-h-[580px] md:h-[600px]">

                {/* Left Side: Visual / Hero Section */}
                <div className="relative md:w-1/2 min-h-[220px] md:min-h-full flex flex-col justify-between p-6 sm:p-8 overflow-hidden shrink-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop')`
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1717] via-[#1C1717]/65 to-transparent" />

                    <div className="relative z-10 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#f70776] bg-[#141010]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                            Audio & Visual Experience
                        </span>
                    </div>

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

                {/* Right Side: Form Container */}
                <div className="relative md:w-1/2 bg-[#1C1717]/95 p-7 sm:p-9 flex flex-col justify-between shrink-0 overflow-hidden border-t md:border-t-0 md:border-l border-[#2B2323]">
                    
                    {/* 1. Header Section */}
                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center">
                                <img
                                    src="/SS.svg"
                                    alt="SS Audios"
                                    className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(247,7,118,0.7)]"
                                />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A69B9B] px-2.5 py-1 rounded-full bg-[#141010] border border-[#2B2323]">
                                Admin Portal
                            </span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold text-white mb-0.5">Welcome Back</h2>
                            <p className="text-[#A69B9B] text-xs font-light">Enter credentials to unlock SS Audios Studio</p>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* 2. SOUND WAVE BAR IN THE GAP BETWEEN WELCOME MESSAGE & LOGIN FORM */}
                    {/* ========================================================================= */}
                    <div
                        className={`my-3 p-3 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                            spectrumState === 'peaking_green'
                                ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_30px_rgba(0,255,170,0.35)]'
                                : spectrumState === 'dropped_red'
                                ? 'bg-red-950/40 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)] animate-[redGlitchJitter_0.35s_ease-in-out]'
                                : 'bg-[#141010]/90 border-[#2B2323]'
                        }`}
                    >
                        {/* Audio Spectrum Status Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                        spectrumState === 'peaking_green'
                                            ? 'bg-[#00ffaa] shadow-[0_0_8px_#00ffaa] animate-ping'
                                            : spectrumState === 'dropped_red'
                                            ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                                            : 'bg-[#f70776] animate-pulse'
                                    }`}
                                />
                                <span
                                    className={`text-[10px] font-mono font-bold tracking-wider uppercase transition-colors duration-300 ${
                                        spectrumState === 'peaking_green'
                                            ? 'text-[#00ffaa]'
                                            : spectrumState === 'dropped_red'
                                            ? 'text-red-400'
                                            : 'text-[#BDB2B2]'
                                    }`}
                                >
                                    {spectrumState === 'peaking_green'
                                        ? '⚡ MAX PEAK RESONANCE • ACCESS GRANTED'
                                        : spectrumState === 'dropped_red'
                                        ? '⚠️ SIGNAL FLATLINED • INVALID CREDENTIAL'
                                        : 'LIVE AUDIO SPECTRUM // 48 kHz'}
                                </span>
                            </div>

                            <span
                                className={`text-[10px] font-mono font-bold ${
                                    spectrumState === 'peaking_green'
                                        ? 'text-[#00ffaa]'
                                        : spectrumState === 'dropped_red'
                                        ? 'text-red-400'
                                        : 'text-[#A69B9B]'
                                }`}
                            >
                                {spectrumState === 'peaking_green'
                                    ? '+6.0 dB [PEAK]'
                                    : spectrumState === 'dropped_red'
                                    ? '-inf dB [LOW]'
                                    : '-12 dB [MED]'}
                            </span>
                        </div>

                        {/* Animated Equalizer Frequency Wave Bars */}
                        <div className="h-10 flex items-end justify-between gap-[3px] px-1 overflow-hidden">
                            {Array.from({ length: BAR_COUNT }).map((_, idx) => {
                                // Calculate wave rhythm offset for harmonic shape
                                const waveOffset = Math.sin((idx / (BAR_COUNT - 1)) * Math.PI);
                                const animDelay = (idx * 0.04).toFixed(2);
                                const animDuration = (0.7 + (idx % 4) * 0.15).toFixed(2);

                                return (
                                    <div
                                        key={idx}
                                        className={`w-full rounded-t-sm transition-all duration-300 ${
                                            spectrumState === 'peaking_green'
                                                ? 'bg-gradient-to-t from-[#059669] via-[#10b981] to-[#00ffaa] shadow-[0_0_8px_#00ffaa]'
                                                : spectrumState === 'dropped_red'
                                                ? 'bg-gradient-to-t from-red-950 via-red-800 to-red-500'
                                                : 'bg-gradient-to-t from-[#c3195d] via-[#f70776] to-[#FAF6F6]'
                                        }`}
                                        style={{
                                            animation:
                                                spectrumState === 'peaking_green'
                                                    ? `peakGreenSurge 0.5s ease-out infinite alternate`
                                                    : spectrumState === 'dropped_red'
                                                    ? `lowRedDrop 0.4s ease-in forwards`
                                                    : `mediumBarPulse ${animDuration}s ease-in-out infinite`,
                                            animationDelay:
                                                spectrumState === 'peaking_green'
                                                    ? `${(idx * 0.02).toFixed(2)}s`
                                                    : `${animDelay}s`,
                                            height:
                                                spectrumState === 'peaking_green'
                                                    ? `${Math.min(100, 75 + waveOffset * 25)}%`
                                                    : spectrumState === 'dropped_red'
                                                    ? `${Math.max(6, 12 - waveOffset * 6)}%`
                                                    : `${20 + waveOffset * 40}%`
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Form Section */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A69B9B] mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@soundscape.io"
                                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#141010] border text-white placeholder-[#6b6161] focus:outline-none transition-all ${
                                    spectrumState === 'dropped_red'
                                        ? 'border-red-500 ring-1 ring-red-500/40 bg-red-950/20'
                                        : spectrumState === 'peaking_green'
                                        ? 'border-emerald-400 ring-1 ring-emerald-400/50 bg-emerald-950/20'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A69B9B] mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#141010] border text-white placeholder-[#6b6161] focus:outline-none transition-all ${
                                    spectrumState === 'dropped_red'
                                        ? 'border-red-500 ring-1 ring-red-500/40 bg-red-950/20'
                                        : spectrumState === 'peaking_green'
                                        ? 'border-emerald-400 ring-1 ring-emerald-400/50 bg-emerald-950/20'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || spectrumState === 'peaking_green'}
                            className={`w-full py-3 mt-1 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 ${
                                spectrumState === 'peaking_green'
                                    ? 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] text-black shadow-emerald-500/50 scale-[1.02]'
                                    : spectrumState === 'dropped_red'
                                    ? 'bg-red-600 text-white shadow-red-600/40'
                                    : 'bg-[#f70776] hover:bg-[#c3195d] text-white shadow-[#f70776]/25 hover:-translate-y-0.5 active:translate-y-0'
                            } disabled:opacity-75`}
                        >
                            {spectrumState === 'peaking_green' ? (
                                <>
                                    <span>⚡</span>
                                    <span>Resonance Locked • Opening Studio...</span>
                                </>
                            ) : isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Scanning Frequency...</span>
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