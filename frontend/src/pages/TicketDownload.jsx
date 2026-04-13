import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { FiDownload, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TicketDownload = () => {
    const { id } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        handleDownload();
    }, [id]);

    const handleDownload = async () => {
        try {
            setStatus('loading');
            const response = await bookingService.downloadTicket(id);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ticket-${id.slice(-6)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setStatus('success');
            toast.success('Ticket download started!');
        } catch (error) {
            console.error('Download error:', error);
            setStatus('error');
            toast.error('Failed to download ticket. You might need to be logged in.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                {status === 'loading' && (
                    <div className="animate-fade-in">
                        <FiLoader className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Ticket</h2>
                        <p className="text-gray-500">Please wait while we generate your download...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in">
                        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Started!</h2>
                        <p className="text-gray-500 mb-8">Your ticket should be downloading now. If not, click the button below.</p>
                        <div className="space-y-4">
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary w-full py-3 flex items-center justify-center font-bold"
                            >
                                <FiDownload className="mr-2" /> Re-download Ticket
                            </button>
                            <Link
                                to="/dashboard"
                                className="block text-primary-600 font-semibold hover:underline"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fade-in">
                        <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Failed</h2>
                        <p className="text-gray-500 mb-8">We couldn't retrieve your ticket. Please make sure the booking is confirmed.</p>
                        <div className="space-y-4">
                            <Link
                                to="/login"
                                className="btn btn-primary w-full py-3 flex items-center justify-center font-bold"
                            >
                                Login to View Bookings
                            </Link>
                            <Link
                                to="/"
                                className="block text-gray-500 font-semibold hover:underline"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDownload;
