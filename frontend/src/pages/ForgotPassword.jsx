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
                <div className="max-w-md w-full bg-white rounded-2xl p-8 space-y-8 text-center animate-fade-in border border-gray-100 shadow-2xl">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 text-primary-600 shadow-lg">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
                    <p className="text-gray-600 font-medium">
                        A password reset link has been sent to <span className="font-bold text-primary-600 italic">{email}</span>.
                    </p>
                    <div className="mt-8">
                        <Link to="/login" className="btn btn-primary w-full shadow-xl shadow-primary-500/20 active:scale-95">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl p-8 space-y-8 animate-fade-in relative overflow-hidden border border-gray-100 shadow-2xl">
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-bold text-gray-900">
                        Sportify
                    </h2>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address to reset your password.
                    </p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 text-left">
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
                                className="btn btn-primary w-full shadow-lg hover:shadow-xl transform active:scale-95 transition-all text-sm font-bold"
                            >
                                {loading ? 'Sending link...' : 'Reset Password'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-500 transition-colors">
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
