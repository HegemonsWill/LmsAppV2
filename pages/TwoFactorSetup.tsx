import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
// @ts-ignore
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';

const TwoFactorSetup: React.FC<{ user: User; onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [secret, setSecret] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const { secret, otpauth_url } = await authService.generateTwoFactorSecret(user.id);
                setSecret(secret);
                const url = await QRCode.toDataURL(otpauth_url);
                setQrUrl(url);
            } catch (e) {
                console.error(e);
            }
        };
        init();
    }, [user.id]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const success = await authService.enableTwoFactor(user.id, secret, verifyCode);
            if (success) {
                onUpdateUser({ ...user, isTwoFactorEnabled: true });
                setStep(2); // Success step
            } else {
                setError("Invalid code. Please try again.");
            }
        } catch (e) {
            setError("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F7F9FC] p-4 md:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[800px]">
                
                {/* LEFT PANEL */}
                <div className="md:w-1/2 brand-gradient p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white blur-3xl"></div>
                         <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-black blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <button onClick={() => navigate('/settings')} className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/30 hover:bg-white/30 transition-all">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                             </svg>
                        </button>
                    </div>

                    <div className="relative z-10 mb-12">
                        <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
                            Enable <br/> Authenticator
                        </h1>
                        <p className="text-white/80 text-lg lg:text-xl font-light max-w-md leading-relaxed">
                            Secure your account with two-factor authentication. Use Google Authenticator or any compatible app.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-2">
                        <div className={`h-2 rounded-full bg-white transition-all ${step === 1 ? 'w-12 opacity-100' : 'w-2 opacity-40'}`}></div>
                        <div className={`h-2 rounded-full bg-white transition-all ${step === 2 ? 'w-12 opacity-100' : 'w-2 opacity-40'}`}></div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="md:w-1/2 bg-white flex items-center justify-center p-8 lg:p-24 relative">
                    <div className="w-full max-w-md">
                        {step === 1 ? (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Scan QR Code</h2>
                                    <p className="text-gray-400">Open your authenticator app and scan the code below.</p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                                        {qrUrl ? (
                                            <img src={qrUrl} alt="2FA QR Code" className="w-48 h-48 rounded-lg" />
                                        ) : (
                                            <div className="w-48 h-48 flex items-center justify-center text-gray-400">Generating...</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-8 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                    <span className="text-sm font-mono text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap mr-4">{secret}</span>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(secret)}
                                        className="text-xs font-bold text-[#D81814] hover:text-[#FF3A2F]"
                                    >
                                        COPY
                                    </button>
                                </div>

                                <form onSubmit={handleVerify} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1 text-center">Enter 6-digit Code</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full bg-gray-50 text-gray-900 text-3xl font-display font-bold tracking-[0.5em] text-center rounded-2xl focus:ring-2 focus:ring-[#FF3A2F] focus:border-transparent block w-full p-4 border-none transition-all placeholder-gray-200"
                                            placeholder="000000"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-[#D81814] text-sm p-4 rounded-xl text-center font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || verifyCode.length < 6}
                                        className="w-full text-white brand-gradient focus:ring-4 focus:ring-red-200 font-bold rounded-2xl text-lg px-5 py-4 text-center brand-shadow hover:opacity-90 transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Enable 2FA'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">You're Protected!</h2>
                                <p className="text-gray-500 mb-8">Two-factor authentication has been successfully enabled on your account.</p>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="w-full text-white brand-gradient font-bold rounded-2xl text-lg px-5 py-4 brand-shadow hover:opacity-90 transition-all"
                                >
                                    Return to Settings
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;