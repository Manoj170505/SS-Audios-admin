// BACKUP VARIANT: DJ Vinyl Turntable & Needle Scratch Animation
import React, { useState } from 'react';
import SoundscapeBackground from '../SoundscapeBackground';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'ssaudios25@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'ssaudios.admin1').trim();

const LoginPageVinylTurntable = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        setTimeout(() => {
            setTurntableState('wrong_stopped');
            setError(msg || 'Wrong Credentials');
        }, 450);

        setTimeout(() => {
            setTurntableState('idle');
        }, 3000);
    };

    const handleSuccessCredentials = () => {
        setIsLoading(false);
        setTurntableState('success_playing');
        setError('');

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
            <style>{`
                @keyframes vinylSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes vinylSkidStop {
                    0% { transform: rotate(0deg); }
                    60% { transform: rotate(180deg); }
                    85% { transform: rotate(240deg) skewX(-2deg); }
                    100% { transform: rotate(250deg); }
                }
                @keyframes tonearmDropSuccess {
                    0% { transform: rotate(-35deg); transform-origin: 85% 15%; }
                    60% { transform: rotate(0deg); transform-origin: 85% 15%; }
                    80% { transform: rotate(-3deg); transform-origin: 85% 15%; }
                    100% { transform: rotate(0deg); transform-origin: 85% 15%; }
                }
                @keyframes tonearmScratchSkid {
                    0% { transform: rotate(-25deg); transform-origin: 85% 15%; }
                    35% { transform: rotate(5deg); transform-origin: 85% 15%; }
                    60% { transform: rotate(-18deg); transform-origin: 85% 15%; }
                    100% { transform: rotate(8deg); transform-origin: 85% 15%; }
                }
                @keyframes soundwavePulsePink {
                    0% { transform: scale(0.6); opacity: 0.9; }
                    100% { transform: scale(2.6); opacity: 0; }
                }
                @keyframes needleSparkBurst {
                    0% { transform: scale(0.3) rotate(0deg); opacity: 1; }
                    100% { transform: scale(2.2) rotate(45deg); opacity: 0; }
                }
                @keyframes scratchPopIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.06); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
                <SoundscapeBackground variant="login" waveCount={4} particleCount={50} speed={0.9} interactive={true} />
            </div>

            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141010] via-transparent to-[#141010]/80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f70776]/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 bg-[#1C1717]/90 backdrop-blur-xl border border-[#2B2323] hover:border-[#f70776]/40 transition-colors duration-500 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row w-full max-w-4xl min-h-[560px] md:h-[580px]">
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

                <div className="relative md:w-1/2 bg-[#1C1717]/95 p-8 sm:p-10 flex flex-col justify-between shrink-0 overflow-hidden border-t md:border-t-0 md:border-l border-[#2B2323]">
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
                                className="w-full px-4 py-3 text-sm rounded-xl bg-[#141010] border border-[#2B2323] text-white placeholder-[#6b6161] focus:outline-none focus:border-[#f70776]"
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
                                className="w-full px-4 py-3 text-sm rounded-xl bg-[#141010] border border-[#2B2323] text-white placeholder-[#6b6161] focus:outline-none focus:border-[#f70776]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || turntableState === 'success_playing'}
                            className="w-full py-3.5 mt-1 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg bg-[#f70776] hover:bg-[#c3195d] text-white shadow-[#f70776]/25 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>Access Studio</span>
                        </button>
                    </form>

                    {turntableState !== 'idle' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]">
                            <div className="relative w-56 h-56 flex items-center justify-center">
                                <div
                                    className="relative w-44 h-44 rounded-full bg-[#0d090c] border-4 border-[#241c21] flex items-center justify-center"
                                    style={{
                                        animation:
                                            turntableState === 'success_playing'
                                                ? 'vinylSpin 0.7s linear infinite'
                                                : turntableState === 'wrong_scratching'
                                                ? 'vinylSkidStop 0.45s ease-out forwards'
                                                : 'none'
                                    }}
                                >
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#c3195d] to-[#f70776] border-2 border-black flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-black text-white">SS</span>
                                        <span className="text-[7px] font-bold text-white/90">AUDIOS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPageVinylTurntable;
