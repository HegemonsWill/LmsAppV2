import React, { useState } from 'react';
import { authService } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@library.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'register') {
        setError('Registration is currently closed for demo.');
        return;
    }

    setLoading(true);
    setError('');
    
    try {
      const user = await authService.login(email);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F7F9FC] p-4 md:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1600px] mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[800px]">
        
        {/* LEFT PANEL - GRADIENT */}
        <div className="md:w-1/2 brand-gradient p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-black blur-3xl"></div>
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/30">
                    <span className="text-white font-display font-bold text-3xl">lt</span>
                </div>
            </div>

            <div className="relative z-10 mb-12">
                <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
                    Hegemon’s <br/>
                    Library <br/>
                    System
                </h1>
                <p className="text-white/80 text-lg lg:text-xl font-light max-w-md leading-relaxed">
                    A next-generation platform for managing knowledge, resources, and community engagement with effortless style.
                </p>
            </div>

            <div className="relative z-10 flex gap-2">
                 <div className="h-2 w-12 bg-white rounded-full opacity-100"></div>
                 <div className="h-2 w-2 bg-white rounded-full opacity-40"></div>
                 <div className="h-2 w-2 bg-white rounded-full opacity-40"></div>
            </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="md:w-1/2 bg-white flex items-center justify-center p-8 lg:p-24 relative">
            <div className="w-full max-w-md">
                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-full p-1 mb-10 w-fit mx-auto">
                    <button 
                        onClick={() => setActiveTab('login')}
                        className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                            activeTab === 'login' 
                            ? 'bg-white text-gray-900 shadow-md' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Login
                    </button>
                    <button 
                         onClick={() => setActiveTab('register')}
                         className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                            activeTab === 'register' 
                            ? 'bg-white text-gray-900 shadow-md' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Register
                    </button>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-400">
                        Please enter your details to continue.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-[#FF3A2F] focus:border-transparent block w-full p-4 border-none transition-all"
                                placeholder="name@company.com"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
                         <div className="relative">
                             <input
                                 type="password"
                                 disabled
                                 className="w-full bg-gray-50 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-[#FF3A2F] focus:border-transparent block w-full p-4 border-none transition-all"
                                 placeholder="••••••••"
                             />
                             <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                             </div>
                         </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-[#D81814] text-sm p-4 rounded-xl text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white brand-gradient focus:ring-4 focus:ring-red-200 font-bold rounded-2xl text-lg px-5 py-4 text-center brand-shadow hover:opacity-90 transition-all duration-300 transform hover:translate-y-[-2px]"
                    >
                        {loading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider">Demo Accounts</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => setEmail('admin@library.com')} className="px-3 py-1 bg-gray-50 hover:bg-red-50 hover:text-[#D81814] rounded-lg text-xs font-medium text-gray-500 transition-colors">Admin</button>
                        <button onClick={() => setEmail('sarah@library.com')} className="px-3 py-1 bg-gray-50 hover:bg-red-50 hover:text-[#D81814] rounded-lg text-xs font-medium text-gray-500 transition-colors">Librarian</button>
                        <button onClick={() => setEmail('john@user.com')} className="px-3 py-1 bg-gray-50 hover:bg-red-50 hover:text-[#D81814] rounded-lg text-xs font-medium text-gray-500 transition-colors">User</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;