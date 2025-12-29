import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // If modal is not open, return null
    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Force role to be customer for booking purposes
            const result = await login(formData.email, formData.password, 'customer');

            if (!result.success) {
                setError(result.message);
            } else {
                toast.success('Login successful!');
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            }
        } catch (err) {
            setError('An error occurred during login');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <FiX size={24} />
                        </button>

                        <div className="sm:flex sm:items-start justify-center">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-2xl leading-6 font-bold text-gray-900 text-center mb-2" id="modal-title">
                                    Login Required
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 text-center mb-6">
                                        Please login as a customer to book this venue.
                                    </p>

                                    {error && (
                                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                                            <div className="flex">
                                                <div className="ml-3">
                                                    <p className="text-sm text-red-700">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                id="password"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mt-5 sm:mt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
                                            >
                                                {loading ? 'Logging in...' : 'Login & Continue'}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-4 text-center text-sm">
                                        <p className="text-gray-600">
                                            Don't have an account?{' '}
                                            <Link
                                                to="/register"
                                                className="font-medium text-primary-600 hover:text-primary-500"
                                                onClick={onClose}
                                            >
                                                Sign up
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
