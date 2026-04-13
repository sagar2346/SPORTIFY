import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VenueForm from '../components/venues/VenueForm';
import { venueService } from '../services/api';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi';

import { useAuth } from '../contexts/AuthContext';

const AddVenue = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);

    useEffect(() => {
        const isVerified = user?.kycStatus === 'verified' || user?.kycStatus === 'manual_verified';
        if (user && user.role === 'venue_owner' && !isVerified) {
            setShowKycModal(true);
        }
    }, [user]);

    const handleSubmit = async (formData, newImages) => {
        setLoading(true);
        try {
            const data = { ...formData, venueImages: newImages };
            await venueService.createVenue(data);
            toast.success('Venue created successfully!');

            // Redirect based on role
            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/owner/dashboard');
            }
        } catch (error) {
            console.error('Error creating venue:', error);
            toast.error(error.response?.data?.message || 'Failed to create venue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* KYC Modal Overlay */}
            {showKycModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center border border-gray-100 transform animate-scale-in">
                        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <FiShield className="text-5xl text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Required</h2>
                        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                            To maintain platform integrity, venue owners must complete KYC verification before listing a venue.
                        </p>
                        <div className="space-y-4">
                            <Link
                                to="/kyc"
                                className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-primary-500/30 flex items-center justify-center transition-all active:scale-95"
                            >
                                <FiShield className="mr-2" /> Verify KYC Now
                            </Link>
                            <button
                                onClick={() => navigate('/owner/dashboard')}
                                className="w-full py-4 text-gray-500 font-bold hover:text-gray-800 flex items-center justify-center transition-all group"
                            >
                                <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-8">Add New Venue</h1>
            <div className={`card ${showKycModal ? 'blur-sm pointer-events-none' : ''}`}>
                <VenueForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    buttonText="Create Venue"
                />
            </div>
        </div>
    );
};

export default AddVenue;
