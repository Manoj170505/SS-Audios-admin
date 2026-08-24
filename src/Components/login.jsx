import React, { useState } from 'react';
import SoundscapeBackground from './SoundscapeBackground';

const LoginPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('Please fill in both email and password.');
            return;
        }

        setIsLoading(true);

        // Simulate authentication API call
        setTimeout(() => {
            setIsLoading(false);
            if (onLoginSuccess) {
                onLoginSuccess(formData);
            }
        }, 1000);
    };

    return (
        <div className="relative min-h-screen bg-[#141010] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
            {/* Dynamic Soundscape Animated Audio Waves & Equalizer Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
                <SoundscapeBackground variant="login" waveCount={4} particleCount={50} speed={0.9} interactive={true} />
            </div>

            {/* Ambient vignette and glow overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141010] via-transparent to-[#141010]/80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f70776]/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Container Card */}
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
                        <p className="text-[#BDB2B2] text-xs leading-relaxed font-light">Manage soundscapes, live stage visuals, and media assets in real time.</p>
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
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A69B9B] px-2.5 py-1 rounded-full bg-[#141010] border border-[#2B2323]">Admin Portal</span>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-white mb-1">Welcome Back</h2>
                        <p className="text-[#A69B9B] text-xs font-light">Log in to manage your media vault & sound gallery</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-300 text-xs rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A69B9B] mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@soundscape.io"
                                className="w-full px-4 py-3 text-sm rounded-xl bg-[#141010] border border-[#2B2323] text-white placeholder-[#6b6161] focus:outline-none focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A69B9B] mb-1.5">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 text-sm rounded-xl bg-[#141010] border border-[#2B2323] text-white placeholder-[#6b6161] focus:outline-none focus:border-[#f70776] focus:ring-1 focus:ring-[#f70776] transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 mt-2 bg-[#f70776] hover:bg-[#c3195d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#f70776]/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? 'Authenticating...' : 'Access Studio'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;