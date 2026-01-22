import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, formData.password);
            toast.success('Password reset successful! You can now login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full glass rounded-2xl p-8 space-y-8 animate-fade-in relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>

                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        Sport<span className="text-emerald-600">Booking</span>
                    </h2>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your new password below.
                    </p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="********"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full shadow-lg transform hover:-translate-y-0.5 transition-all"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
