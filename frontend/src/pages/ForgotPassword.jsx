import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full glass rounded-2xl p-8 space-y-8 text-center animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
                    <p className="text-gray-600">
                        We've sent a password reset link to <span className="font-semibold">{email}</span>.
                    </p>
                    <div className="mt-6">
                        <Link to="/login" className="btn btn-primary w-full shadow-lg">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full glass rounded-2xl p-8 space-y-8 animate-fade-in relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>

                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        Sport<span className="text-emerald-600">Booking</span>
                    </h2>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full shadow-lg transform hover:-translate-y-0.5 transition-all"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
