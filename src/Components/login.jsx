import React, { useState } from 'react';
import SoundscapeBackground from './SoundscapeBackground';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ssaudios25@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'ssaudios.admin1').trim();

const LoginPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Animation States: 'idle' | 'turntable_spinning' | 'success_playing' | 'wrong_scratching' | 'wrong_stopped'
    const [turntableState, setTurntableState] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || turntableState !== 'idle') {
            setError('');
            setTurntableState('idle');
        }
    };

    const handleInvalidCredentials = (msg) => {
        setIsLoading(false);
        setTurntableState('wrong_scratching');

        // Needle scratches violently and stops
        setTimeout(() => {
            setTurntableState('wrong_stopped');
            setError(msg || 'Wrong Credentials');
        }, 450);

        // Reset state after 2.6s
        setTimeout(() => {
            setTurntableState('idle');
        }, 3000);
    };

    const handleSuccessCredentials = () => {
        setIsLoading(false);
        setTurntableState('success_playing');
        setError('');

        // Needle drops cleanly, vinyl spins with brand pink soundwaves and opens studio
        setTimeout(() => {
            if (onLoginSuccess) {
                onLoginSuccess(formData);
            }
        }, 1150);
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
        setTurntableState('turntable_spinning');

        setTimeout(() => {
            if (inputEmail === ADMIN_EMAIL && inputPassword === ADMIN_PASSWORD) {
                handleSuccessCredentials();
            } else {
                handleInvalidCredentials('Wrong Credentials');
            }
        }, 350);
    };

    return (
        <div className="relative min-h-screen bg-[#141010] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
            {/* Custom Vinyl Turntable & Needle Scratch Keyframes */}
            <style>{`
                /* CONTINUOUS VINYL SPIN */
                @keyframes vinylSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* FAST VINYL SPIN ON SUCCESS */
                @keyframes vinylSpinFast {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(720deg); }
                }

                /* VINYL ABRUPT SKID STOP */
                @keyframes vinylSkidStop {
                    0% { transform: rotate(0deg); }
                    60% { transform: rotate(180deg); }
                    85% { transform: rotate(240deg) skewX(-2deg); }
                    100% { transform: rotate(250deg); }
                }

                /* TONEARM NEEDLE DROP ON SUCCESS */
                @keyframes tonearmDropSuccess {
                    0% {
                        transform: rotate(-35deg);
                        transform-origin: 85% 15%;
                    }
                    60% {
                        transform: rotate(0deg);
                        transform-origin: 85% 15%;
                    }
                    80% {
                        transform: rotate(-3deg);
                        transform-origin: 85% 15%;
                    }
                    100% {
                        transform: rotate(0deg);
                        transform-origin: 85% 15%;
                    }
                }

                /* TONEARM SCRATCH SKID ON ERROR */
                @keyframes tonearmScratchSkid {
                    0% {
                        transform: rotate(-25deg);
                        transform-origin: 85% 15%;
                    }
                    35% {
                        transform: rotate(5deg);
                        transform-origin: 85% 15%;
                    }
                    60% {
                        transform: rotate(-18deg);
                        transform-origin: 85% 15%;
                    }
                    100% {
                        transform: rotate(8deg);
                        transform-origin: 85% 15%;
                    }
                }

                /* DJ BEAT SOUNDWAVE EXPANSION IN PINK #f70776 */
                @keyframes soundwavePulsePink {
                    0% {
                        transform: scale(0.6);
                        opacity: 0.9;
                    }
                    100% {
                        transform: scale(2.6);
                        opacity: 0;
                    }
                }

                /* NEEDLE SCRATCH SPARKS */
                @keyframes needleSparkBurst {
                    0% {
                        transform: scale(0.3) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2.2) rotate(45deg);
                        opacity: 0;
                    }
                }

                /* SCRATCH CUT GLITCH POP */
                @keyframes scratchPopIn {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.06);
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

            {/* Main Login Card - Stably Proportioned */}
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

                {/* Right Side: Form Container with Fixed Proportions */}
                <div className="relative md:w-1/2 bg-[#1C1717]/95 p-8 sm:p-10 flex flex-col justify-between shrink-0 overflow-hidden border-t md:border-t-0 md:border-l border-[#2B2323]">
                    
                    {/* Top Header */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
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

                        <div>
                            <h2 className="text-2xl font-extrabold text-white mb-1">Welcome Back</h2>
                            <p className="text-[#A69B9B] text-xs font-light">Drop the needle to unlock Soundscape Studio</p>
                        </div>
                    </div>

                    {/* Dedicated Notification Slot (Zero Shift / Zero Resize) */}
                    <div className="h-10 my-2 flex items-center justify-center shrink-0">
                        {error && (
                            <div
                                className="w-full py-2 px-3 bg-red-950/85 border border-red-500 text-red-300 text-xs rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                                style={{ animation: 'scratchPopIn 0.35s ease-out forwards' }}
                            >
                                <span className="text-sm">⚡</span>
                                <span className="tracking-wide uppercase font-extrabold">{error}</span>
                            </div>
                        )}

                        {turntableState === 'success_playing' && (
                            <div
                                className="w-full py-2 px-3 bg-[#f70776]/15 border border-[#f70776] text-[#FAF6F6] text-xs rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(247,7,118,0.4)] animate-pulse"
                            >
                                <span className="text-sm text-[#f70776]">🎧</span>
                                <span className="tracking-wide uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FAF6F6] to-[#f70776]">
                                    Beat Dropped • Opening Admin Studio...
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
                                        : turntableState === 'success_playing'
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
                                        : turntableState === 'success_playing'
                                        ? 'border-[#f70776] ring-1 ring-[#f70776]/50 bg-[#f70776]/10'
                                        : 'border-[#2B2323] focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776]'
                                }`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || turntableState === 'success_playing'}
                            className={`w-full py-3.5 mt-1 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 ${
                                turntableState === 'success_playing'
                                    ? 'bg-gradient-to-r from-[#c3195d] via-[#f70776] to-[#ff007f] text-white shadow-[#f70776]/50 scale-[1.02]'
                                    : 'bg-[#f70776] hover:bg-[#c3195d] text-white shadow-[#f70776]/25 hover:-translate-y-0.5 active:translate-y-0'
                            } disabled:opacity-75`}
                        >
                            {turntableState === 'success_playing' ? (
                                <>
                                    <span>🎧</span>
                                    <span>Spinning Live • Opening Studio...</span>
                                </>
                            ) : isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Cueing Turntable...</span>
                                </>
                            ) : (
                                <span>Access Studio</span>
                            )}
                        </button>
                    </form>

                    {/* ========================================================================= */}
                    {/* ABSOLUTE OVERLAY: VINYL TURNTABLE & NEEDLE ANIMATION (ZERO LAYOUT SHIFT) */}
                    {/* ========================================================================= */}
                    {turntableState !== 'idle' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] transition-all">
                            
                            <div className="relative w-56 h-56 flex items-center justify-center">
                                
                                {/* 1. SOUNDWAVE RIPPLES ON SUCCESS IN PINK #f70776 */}
                                {turntableState === 'success_playing' && (
                                    <>
                                        <div
                                            className="absolute w-36 h-36 rounded-full border-2 border-[#f70776] shadow-[0_0_35px_#f70776]"
                                            style={{ animation: 'soundwavePulsePink 0.9s ease-out forwards', animationDelay: '0.2s' }}
                                        />
                                        <div
                                            className="absolute w-52 h-52 rounded-full border border-[#c3195d] shadow-[0_0_45px_#c3195d]"
                                            style={{ animation: 'soundwavePulsePink 1.1s ease-out forwards', animationDelay: '0.4s' }}
                                        />
                                    </>
                                )}

                                {/* 2. THE VINYL RECORD DISC */}
                                <div
                                    className={`relative w-44 h-44 rounded-full bg-[#0d090c] border-4 border-[#241c21] shadow-[0_0_40px_rgba(0,0,0,0.9)] flex items-center justify-center ${
                                        turntableState === 'success_playing'
                                            ? 'shadow-[0_0_40px_rgba(247,7,118,0.5)]'
                                            : turntableState === 'wrong_scratching' || turntableState === 'wrong_stopped'
                                            ? 'shadow-[0_0_35px_rgba(239,68,68,0.5)] border-red-900/60'
                                            : ''
                                    }`}
                                    style={{
                                        animation:
                                            turntableState === 'success_playing'
                                                ? 'vinylSpin 0.7s linear infinite'
                                                : turntableState === 'turntable_spinning'
                                                ? 'vinylSpin 1.2s linear infinite'
                                                : turntableState === 'wrong_scratching'
                                                ? 'vinylSkidStop 0.45s ease-out forwards'
                                                : 'none'
                                    }}
                                >
                                    {/* Vinyl Grooves concentric rings */}
                                    <div className="absolute inset-2 rounded-full border border-white/5" />
                                    <div className="absolute inset-5 rounded-full border border-white/10" />
                                    <div className="absolute inset-8 rounded-full border border-white/5" />
                                    <div className="absolute inset-11 rounded-full border border-white/10" />

                                    {/* Light Sheen Reflection across Vinyl surface */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                                    {/* Scratch Scuffs on Error */}
                                    {(turntableState === 'wrong_scratching' || turntableState === 'wrong_stopped') && (
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                            <div className="w-24 h-0.5 bg-red-500/80 shadow-[0_0_8px_#ef4444] rotate-45 transform" />
                                            <div className="w-20 h-0.5 bg-red-400/70 shadow-[0_0_8px_#ef4444] -rotate-12 transform" />
                                        </div>
                                    )}

                                    {/* Center Vinyl Label (SS Audios Brand Hub in Pink #f70776) */}
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#c3195d] to-[#f70776] border-2 border-black shadow-inner flex flex-col items-center justify-center text-center p-1">
                                        <span className="text-[9px] font-black text-white tracking-widest leading-none drop-shadow">SS</span>
                                        <span className="text-[7px] font-bold text-white/90 uppercase tracking-tighter">AUDIOS</span>
                                        {/* Center Spindle Hole */}
                                        <div className="w-2 h-2 rounded-full bg-[#141010] border border-black mt-0.5" />
                                    </div>
                                </div>

                                {/* 3. METALLIC DJ TONEARM & STYLUS NEEDLE */}
                                <div className="absolute top-2 right-3 w-16 h-28 pointer-events-none">
                                    <div
                                        className="relative w-full h-full"
                                        style={{
                                            animation:
                                                turntableState === 'success_playing'
                                                    ? 'tonearmDropSuccess 0.6s ease-out forwards'
                                                    : turntableState === 'wrong_scratching' || turntableState === 'wrong_stopped'
                                                    ? 'tonearmScratchSkid 0.45s ease-out forwards'
                                                    : 'none',
                                            transformOrigin: '80% 15%'
                                        }}
                                    >
                                        {/* Tonearm Base Pivot Hub */}
                                        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gradient-to-b from-gray-300 to-gray-700 border border-gray-900 shadow-md flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#f70776]" />
                                        </div>

                                        {/* Metallic Arm Shaft */}
                                        <div className="absolute top-5 right-3.5 w-1 h-16 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 rounded-full shadow-sm transform -rotate-12" />

                                        {/* Cartridge Head & Stylus Needle Point */}
                                        <div className="absolute bottom-2 left-3 w-4 h-6 bg-gray-900 border border-gray-700 rounded-sm shadow-md transform rotate-12 flex flex-col items-center justify-end">
                                            {/* Glowing Stylus Needle Tip */}
                                            <div
                                                className={`w-1 h-1.5 rounded-full ${
                                                    turntableState === 'success_playing'
                                                        ? 'bg-[#f70776] shadow-[0_0_10px_#f70776]'
                                                        : turntableState === 'wrong_scratching' || turntableState === 'wrong_stopped'
                                                        ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                                                        : 'bg-white'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. RED FRICTION SPARK BURST ON SCRATCH */}
                                {(turntableState === 'wrong_scratching' || turntableState === 'wrong_stopped') && (
                                    <div
                                        className="absolute bottom-14 right-16 w-8 h-8 rounded-full pointer-events-none"
                                        style={{ animation: 'needleSparkBurst 0.45s ease-out forwards' }}
                                    >
                                        <div className="absolute inset-0 bg-red-500/50 rounded-full blur-sm" />
                                        <span className="absolute w-2 h-2 rounded-full bg-yellow-300 -translate-x-3 -translate-y-2 animate-ping" />
                                        <span className="absolute w-2 h-2 rounded-full bg-red-500 translate-x-4 -translate-y-3 animate-ping" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;