// BACKUP VARIANT: Music Symbol Drop & Resonate (Success) / Fall & Shatter (Wrong)
import React, { useState } from 'react';
import SoundscapeBackground from '../SoundscapeBackground';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ssaudios25@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'ssaudios.admin1').trim();

const LoginPageMusicNoteAnim = ({ onLoginSuccess }) => {
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
        }, 420);

        // Reset note after displaying shatter for 2.2s
        setTimeout(() => {
            setNoteAnimState('idle');
        }, 2600);
    };

    const handleSuccessCredentials = () => {
        setIsLoading(false);
        setNoteAnimState('success_dropping');
        setError('');

        // Music symbol falls, resonates in signature pink #f70776 and opens Admin Panel
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
            handleInvalidCredentials('Wrong Credentials: Fill all fields');
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
                /* SUCCESS DROP & BOUNCE IN BRAND PINK #f70776 */
                @keyframes noteDropSuccessPink {
                    0% {
                        transform: translateY(-90px) scale(0.6) rotate(-12deg);
                        opacity: 0;
                    }
                    45% {
                        transform: translateY(20px) scale(1.1) rotate(6deg);
                        opacity: 1;
                    }
                    65% {
                        transform: translateY(-5px) scale(0.95) rotate(-2deg);
                    }
                    85% {
                        transform: translateY(12px) scale(1.05) rotate(0deg);
                    }
                    100% {
                        transform: translateY(8px) scale(1.2);
                        opacity: 1;
                        filter: drop-shadow(0 0 35px #f70776) brightness(1.3);
                    }
                }

                /* SONIC RIPPLE WAVES ON SUCCESS */
                @keyframes sonicRingPulsePink {
                    0% {
                        transform: scale(0.2);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(3);
                        opacity: 0;
                    }
                }

                /* WRONG CREDENTIAL DROP WITH HARD ACCELERATION */
                @keyframes noteDropCrashRed {
                    0% {
                        transform: translateY(-90px) scale(0.8) rotate(10deg);
                        opacity: 0;
                    }
                    30% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(35px) scale(1) rotate(-8deg);
                        opacity: 1;
                    }
                }

                /* SHATTERED LEFT PIECE FLYING APART */
                @keyframes shardFlyLeftRed {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    45% {
                        transform: translate(-30px, -15px) rotate(-40deg) scale(0.9);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-55px, 45px) rotate(-95deg) scale(0.5);
                        opacity: 0;
                    }
                }

                /* SHATTERED RIGHT PIECE FLYING APART */
                @keyframes shardFlyRightRed {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    45% {
                        transform: translate(30px, -18px) rotate(45deg) scale(0.9);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(60px, 50px) rotate(110deg) scale(0.5);
                        opacity: 0;
                    }
                }

                /* SHATTER CRACK FLASH */
                @keyframes crackFlashRed {
                    0% {
                        opacity: 0;
                        transform: scale(0.4);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.3);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(2);
                    }
                }

                /* WRONG CREDENTIALS POP */
                @keyframes wrongPopIn {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    60% {
                        transform: scale(1.05);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
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

            {/* Main Login Card - Fixed Dimensions to Prevent Jumping/Resizing */}
            <div className="relative z-10 bg-[#1C1717]/95 backdrop-blur-xl border border-[#2B2323] hover:border-[#f70776]/40 transition-colors duration-500 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row w-full max-w-4xl min-h-[560px] md:h-[580px]">

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

                {/* Right Side: Form Container with Locked Proportions */}
                <div className="relative md:w-1/2 bg-[#1C1717]/95 p-8 sm:p-10 flex flex-col justify-between shrink-0 overflow-hidden border-t md:border-t-0 md:border-l border-[#2B2323]">
                    
                    {/* Top Header Row */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
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
                            <h2 className="text-2xl font-extrabold text-white mb-1">Welcome Back</h2>
                            <p className="text-[#A69B9B] text-xs font-light">Enter credentials to unlock Soundscape Studio</p>
                        </div>
                    </div>

                    {/* Fixed Height Slot for Status Notifications (Zero Shift / Zero Resize) */}
                    <div className="h-10 my-2 flex items-center justify-center shrink-0">
                        {error && (
                            <div
                                className="w-full py-2 px-3 bg-red-950/80 border border-red-500/80 text-red-300 text-xs rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                style={{ animation: 'wrongPopIn 0.35s ease-out forwards' }}
                            >
                                <span className="text-sm">💥</span>
                                <span className="tracking-wide uppercase font-extrabold">{error}</span>
                            </div>
                        )}

                        {noteAnimState === 'success_dropping' && (
                            <div
                                className="w-full py-2 px-3 bg-[#f70776]/15 border border-[#f70776] text-[#FAF6F6] text-xs rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(247,7,118,0.4)] animate-pulse"
                            >
                                <span className="text-sm text-[#f70776]">🎵</span>
                                <span className="tracking-wide uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FAF6F6] to-[#f70776]">
                                    Music Resonated • Opening Admin Panel...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Form Controls */}
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
                                        ? 'border-red-500 ring-1 ring-red-500/40 bg-red-950/20'
                                        : noteAnimState === 'success_dropping'
                                        ? 'border-[#f70776] ring-1 ring-[#f70776]/50 bg-[#f70776]/10'
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
                                        ? 'border-red-500 ring-1 ring-red-500/40 bg-red-950/20'
                                        : noteAnimState === 'success_dropping'
                                        ? 'border-[#f70776] ring-1 ring-[#f70776]/50 bg-[#f70776]/10'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || noteAnimState === 'success_dropping'}
                            className={`w-full py-3.5 mt-1 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 ${
                                noteAnimState === 'success_dropping'
                                    ? 'bg-gradient-to-r from-[#c3195d] via-[#f70776] to-[#ff007f] text-white shadow-[#f70776]/50 scale-[1.02]'
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

                    {/* ========================================================================= */}
                    {/* ABSOLUTE OVERLAY: MUSIC NOTE FALLING & SHATTERING (NO LAYOUT SHIFT) */}
                    {/* ========================================================================= */}
                    {noteAnimState !== 'idle' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                            
                            {/* 1. SUCCESS: MUSIC SYMBOL DROPS IN BRAND PINK #f70776 & RESONATES */}
                            {noteAnimState === 'success_dropping' && (
                                <div className="relative flex items-center justify-center">
                                    {/* Concentric Sonic Rings in Signature Magenta #f70776 */}
                                    <div
                                        className="absolute w-28 h-28 rounded-full border-2 border-[#f70776] shadow-[0_0_30px_#f70776]"
                                        style={{ animation: 'sonicRingPulsePink 0.9s ease-out forwards', animationDelay: '0.35s' }}
                                    />
                                    <div
                                        className="absolute w-44 h-44 rounded-full border border-[#c3195d] shadow-[0_0_40px_#c3195d]"
                                        style={{ animation: 'sonicRingPulsePink 1.1s ease-out forwards', animationDelay: '0.5s' }}
                                    />

                                    {/* Dropping & Bouncing Neon Music Symbol in Website Pink #f70776 */}
                                    <div
                                        className="relative filter drop-shadow-[0_0_25px_#f70776]"
                                        style={{ animation: 'noteDropSuccessPink 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
                                    >
                                        <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z"
                                                stroke="url(#soundscapeBrandGrad)"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="url(#soundscapeBrandFill)"
                                            />
                                            <defs>
                                                <linearGradient id="soundscapeBrandGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FFFFFF" />
                                                    <stop offset="0.4" stopColor="#F70776" />
                                                    <stop offset="1" stopColor="#C3195D" />
                                                </linearGradient>
                                                <linearGradient id="soundscapeBrandFill" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#F70776" stopOpacity="0.9" />
                                                    <stop offset="1" stopColor="#C3195D" stopOpacity="0.6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* 2. WRONG: MUSIC SYMBOL FALLS RAPIDLY */}
                            {noteAnimState === 'wrong_crashing' && (
                                <div
                                    className="filter drop-shadow-[0_0_20px_#EF4444]"
                                    style={{ animation: 'noteDropCrashRed 0.42s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards' }}
                                >
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z"
                                            stroke="#EF4444"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="rgba(239, 68, 68, 0.85)"
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* 3. WRONG: CRACKED & SHATTERED PIECES FLYING APART */}
                            {noteAnimState === 'wrong_shattered' && (
                                <div className="relative flex items-center justify-center">
                                    {/* Shatter Collision Flash */}
                                    <div
                                        className="absolute w-28 h-28 rounded-full bg-red-600/35 blur-md pointer-events-none"
                                        style={{ animation: 'crackFlashRed 0.45s ease-out forwards' }}
                                    />

                                    {/* Left Shard flying */}
                                    <div
                                        className="absolute"
                                        style={{ animation: 'shardFlyLeftRed 0.75s ease-out forwards' }}
                                    >
                                        <svg width="38" height="46" viewBox="0 0 12 24" fill="none">
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
                                        style={{ animation: 'shardFlyRightRed 0.75s ease-out forwards' }}
                                    >
                                        <svg width="38" height="46" viewBox="0 0 14 24" fill="none">
                                            <path
                                                d="M2 3L12 5V16C12 17.5 10.5 19 9 19C7 19 6 17 6 15L10 11L4 7L2 3Z"
                                                stroke="#EF4444"
                                                strokeWidth="2"
                                                fill="#DC2626"
                                            />
                                        </svg>
                                    </div>

                                    {/* Red Energy Spark Shards */}
                                    <span className="absolute w-2 h-2 rounded-full bg-red-400 -translate-x-7 -translate-y-4 animate-ping" />
                                    <span className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 translate-x-8 translate-y-3 animate-ping" />
                                    <span className="absolute w-2 h-2 rounded-full bg-red-500 translate-x-5 -translate-y-6 animate-ping" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPageMusicNoteAnim;
