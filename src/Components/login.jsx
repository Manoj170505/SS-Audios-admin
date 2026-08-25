import React, { useState } from 'react';
import SoundscapeBackground from './SoundscapeBackground';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ssaudios25@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'ssaudios.admin1').trim();

const LoginPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Animation States: 'idle' | 'success_dropping' | 'wrong_crashing' | 'wrong_shattered'
    const [noteAnimState, setNoteAnimState] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || noteAnimState !== 'idle') {
            setError('');
            setNoteAnimState('idle');
        }
    };

    const handleInvalidCredentials = (msg) => {
        setIsLoading(false);
        setNoteAnimState('wrong_crashing');

        // Note falls and shatters on impact
        setTimeout(() => {
            setNoteAnimState('wrong_shattered');
            setError(msg || 'Wrong Credentials');
        }, 500);

        // Reset note after displaying shatter for 2.5s
        setTimeout(() => {
            setNoteAnimState('idle');
        }, 3000);
    };

    const handleSuccessCredentials = () => {
        setIsLoading(false);
        setNoteAnimState('success_dropping');
        setError('');

        // Music symbol falls, bounces, resonates and opens Admin Panel
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
            handleInvalidCredentials('Wrong Credentials: Enter Email & Password');
            return;
        }

        setIsLoading(true);
        setNoteAnimState('idle');

        setTimeout(() => {
            if (inputEmail === ADMIN_EMAIL && inputPassword === ADMIN_PASSWORD) {
                handleSuccessCredentials();
            } else {
                handleInvalidCredentials('Wrong Credentials');
            }
        }, 300);
    };

    return (
        <div className="relative min-h-screen bg-[#141010] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
            {/* Custom Music Note Drop, Resonate & Shatter Keyframes */}
            <style>{`
                /* SUCCESS DROP & BOUNCE */
                @keyframes noteDropSuccess {
                    0% {
                        transform: translateY(-80px) scale(0.6) rotate(-15deg);
                        opacity: 0;
                    }
                    40% {
                        transform: translateY(40px) scale(1.1) rotate(5deg);
                        opacity: 1;
                    }
                    65% {
                        transform: translateY(15px) scale(0.95) rotate(-3deg);
                    }
                    85% {
                        transform: translateY(35px) scale(1.05) rotate(0deg);
                    }
                    100% {
                        transform: translateY(30px) scale(1.2);
                        opacity: 1;
                        filter: drop-shadow(0 0 35px #00ffaa) brightness(1.4);
                    }
                }

                /* SONIC RIPPLE WAVES ON SUCCESS */
                @keyframes sonicRingPulse {
                    0% {
                        transform: scale(0.3);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2.8);
                        opacity: 0;
                    }
                }

                /* WRONG CREDENTIAL DROP WITH HARD ACCELERATION */
                @keyframes noteDropCrash {
                    0% {
                        transform: translateY(-90px) scale(0.8) rotate(10deg);
                        opacity: 0;
                    }
                    30% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(65px) scale(1) rotate(-10deg);
                        opacity: 1;
                    }
                }

                /* SHATTERED LEFT PIECE FLYING APART */
                @keyframes shardFlyLeft {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    40% {
                        transform: translate(-35px, -20px) rotate(-45deg) scale(0.9);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-65px, 60px) rotate(-110deg) scale(0.6);
                        opacity: 0;
                    }
                }

                /* SHATTERED RIGHT PIECE FLYING APART */
                @keyframes shardFlyRight {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    40% {
                        transform: translate(35px, -25px) rotate(50deg) scale(0.9);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(70px, 65px) rotate(120deg) scale(0.6);
                        opacity: 0;
                    }
                }

                /* SHATTER CRACK FLASH */
                @keyframes crackFlash {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.4);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(2);
                    }
                }

                /* WRONG CREDENTIALS TEXT GLITCH POP */
                @keyframes wrongGlitchPop {
                    0% {
                        transform: scale(0.7) translateY(10px);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1) translateY(-3px);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>

            {/* Dynamic Soundscape Animated Audio Waves Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
                <SoundscapeBackground variant="login" waveCount={4} particleCount={50} speed={0.9} interactive={true} />
            </div>

            {/* Ambient vignette and glow */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141010] via-transparent to-[#141010]/80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f70776]/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Login Card */}
            <div className="relative z-10 bg-[#1C1717]/90 backdrop-blur-xl border border-[#2B2323] hover:border-[#f70776]/40 transition-colors duration-500 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row w-full max-w-4xl">

                {/* Left Side: Visual / Hero Section */}
                <div className="relative md:w-1/2 min-h-[280px] md:min-h-[500px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden">
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

                {/* Right Side: Form & Animated Drop Zone */}
                <div className="relative md:w-1/2 bg-[#1C1717]/95 p-8 sm:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#2B2323]">
                    
                    {/* Header */}
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
                        <p className="text-[#A69B9B] text-xs font-light">Enter credentials to unlock Soundscape Studio</p>
                    </div>

                    {/* ========================================================================= */}
                    {/* ANIMATED MUSIC SYMBOL DROP & SHATTER STAGE */}
                    {/* ========================================================================= */}
                    {noteAnimState !== 'idle' && (
                        <div className="relative w-full h-24 my-2 flex items-center justify-center overflow-visible pointer-events-none">
                            
                            {/* 1. SUCCESS: MUSIC SYMBOL DROPS, BOUNCES & EMITS RIPPLE WAVES */}
                            {noteAnimState === 'success_dropping' && (
                                <div className="relative flex flex-col items-center justify-center">
                                    {/* Concentric Sonic Rings */}
                                    <div
                                        className="absolute w-28 h-28 rounded-full border-2 border-[#00ffaa] shadow-[0_0_20px_#00ffaa]"
                                        style={{ animation: 'sonicRingPulse 0.9s ease-out forwards', animationDelay: '0.4s' }}
                                    />
                                    <div
                                        className="absolute w-40 h-40 rounded-full border border-[#f70776] shadow-[0_0_30px_#f70776]"
                                        style={{ animation: 'sonicRingPulse 1.1s ease-out forwards', animationDelay: '0.55s' }}
                                    />

                                    {/* Dropping & Bouncing Neon Music Symbol */}
                                    <div
                                        className="relative text-5xl filter drop-shadow-[0_0_20px_#00ffaa]"
                                        style={{ animation: 'noteDropSuccess 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
                                    >
                                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_15px_#00ffaa]">
                                            <path
                                                d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z"
                                                stroke="url(#successGrad)"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="url(#successFill)"
                                            />
                                            <defs>
                                                <linearGradient id="successGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#00FFAA" />
                                                    <stop offset="1" stopColor="#00E5FF" />
                                                </linearGradient>
                                                <linearGradient id="successFill" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#00FFAA" stopOpacity="0.8" />
                                                    <stop offset="1" stopColor="#00E5FF" stopOpacity="0.4" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* 2. WRONG: MUSIC SYMBOL FALLS RAPIDLY */}
                            {noteAnimState === 'wrong_crashing' && (
                                <div
                                    className="text-5xl filter drop-shadow-[0_0_20px_#EF4444]"
                                    style={{ animation: 'noteDropCrash 0.48s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards' }}
                                >
                                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z"
                                            stroke="#EF4444"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="rgba(239, 68, 68, 0.8)"
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* 3. WRONG: CRACKED & SHATTERED PIECES FLYING APART */}
                            {noteAnimState === 'wrong_shattered' && (
                                <div className="relative flex items-center justify-center">
                                    {/* Shatter Collision Flash */}
                                    <div
                                        className="absolute w-24 h-24 rounded-full bg-red-600/40 blur-md pointer-events-none"
                                        style={{ animation: 'crackFlash 0.5s ease-out forwards' }}
                                    />

                                    {/* Left Shard flying */}
                                    <div
                                        className="absolute"
                                        style={{ animation: 'shardFlyLeft 0.8s ease-out forwards' }}
                                    >
                                        <svg width="34" height="40" viewBox="0 0 12 24" fill="none">
                                            <path
                                                d="M9 5L3 8L8 14L2 17C2 19 4 21 6 21C8 21 9 19.5 9 18V5Z"
                                                stroke="#EF4444"
                                                strokeWidth="2"
                                                fill="#DC2626"
                                            />
                                        </svg>
                                    </div>

                                    {/* Right Shard flying */}
                                    <div
                                        className="absolute"
                                        style={{ animation: 'shardFlyRight 0.8s ease-out forwards' }}
                                    >
                                        <svg width="34" height="40" viewBox="0 0 14 24" fill="none">
                                            <path
                                                d="M2 3L12 5V16C12 17.5 10.5 19 9 19C7 19 6 17 6 15L10 11L4 7L2 3Z"
                                                stroke="#EF4444"
                                                strokeWidth="2"
                                                fill="#DC2626"
                                            />
                                        </svg>
                                    </div>

                                    {/* Red Energy Spark Shards */}
                                    <span className="absolute w-2 h-2 rounded-full bg-red-400 -translate-x-6 -translate-y-4 animate-ping" />
                                    <span className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 translate-x-7 translate-y-3 animate-ping" />
                                    <span className="absolute w-2 h-2 rounded-full bg-red-500 translate-x-4 -translate-y-6 animate-ping" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* WRONG CREDENTIALS DISPLAY MESSAGE */}
                    {error && (
                        <div
                            className="mb-4 p-3 bg-red-950/80 border-2 border-red-500 text-red-300 text-xs rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                            style={{ animation: 'wrongGlitchPop 0.4s ease-out forwards' }}
                        >
                            <span className="text-base">💥</span>
                            <span className="tracking-wide uppercase">{error}</span>
                        </div>
                    )}

                    {/* SUCCESS UNLOCK MESSAGE */}
                    {noteAnimState === 'success_dropping' && (
                        <div
                            className="mb-4 p-3 bg-emerald-950/80 border-2 border-[#00ffaa] text-[#00ffaa] text-xs rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,170,0.6)] animate-pulse"
                        >
                            <span className="text-base">🎵</span>
                            <span className="tracking-wide uppercase">Music Resonated • Opening Admin Panel...</span>
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
                                    error
                                        ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/20'
                                        : noteAnimState === 'success_dropping'
                                        ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/20'
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
                                    error
                                        ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/20'
                                        : noteAnimState === 'success_dropping'
                                        ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/20'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || noteAnimState === 'success_dropping'}
                            className={`w-full py-3.5 mt-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 ${
                                noteAnimState === 'success_dropping'
                                    ? 'bg-gradient-to-r from-emerald-500 to-[#00ffaa] text-black shadow-emerald-500/50 scale-105'
                                    : 'bg-[#f70776] hover:bg-[#c3195d] text-white shadow-[#f70776]/25 hover:-translate-y-0.5 active:translate-y-0'
                            } disabled:opacity-75`}
                        >
                            {noteAnimState === 'success_dropping' ? (
                                <>
                                    <span>🎵</span>
                                    <span>Opening Studio...</span>
                                </>
                            ) : isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Checking Key...</span>
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