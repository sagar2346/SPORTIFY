import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiMessageSquare } from 'react-icons/fi';

const KycVerificationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [rejectionModal, setRejectionModal] = useState({ show: false, userId: null, reason: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await adminService.getPendingKyc();
            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching KYC requests:', error);
            toast.error('Failed to load KYC requests');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId, status, reason = '') => {
        const toastId = toast.loading(`${status === 'verified' ? 'Verifying' : 'Rejecting'}...`);
        try {
            const response = await adminService.updateKycStatus(userId, { status, reason });
            if (response.data.success) {
                toast.success(`User KYC ${status} successfully`, { id: toastId });
                fetchRequests();
                if (status === 'rejected') setRejectionModal({ show: false, userId: null, reason: '' });
            }
        } catch (error) {
            toast.error('Operation failed', { id: toastId });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Finding requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Pending KYC Verifications</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {requests.length} Requests
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    <p>All clear! No pending KYC requests.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
                                <div className="flex items-center gap-4">
                                    {request.kycPassportPhoto && (
                                        <img
                                            src={`http://localhost:5001${request.kycPassportPhoto}`}
                                            alt="Avatar"
                                            className="w-16 h-16 rounded-full object-cover border-2 border-primary-100 shadow-sm"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{request.name}</h3>
                                        <p className="text-sm text-gray-500">{request.email}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Submitted: {new Date(request.kycSubmittedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleUpdateStatus(request._id, 'verified')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold shadow-sm"
                                    >
                                        <FiCheck className="w-5 h-5" /> <span>Verify User</span>
                                    </button>
                                    <button
                                        onClick={() => setRejectionModal({ show: true, userId: request._id, reason: '' })}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold shadow-sm"
                                    >
                                        <FiX className="w-5 h-5" /> <span>Reject</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Passport Photo */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center flex items-center justify-center gap-1">
                                        Passport Photo
                                    </p>
                                    <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100 aspect-[3/4] bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(`http://localhost:5001${request.kycPassportPhoto}`)}>
                                        <img src={`http://localhost:5001${request.kycPassportPhoto}`} alt="Passport" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                            <FiEye className="text-white w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>

                                {/* Front Side */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center">Citizenship Front</p>
                                    <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100 aspect-[3/4] bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(`http://localhost:5001${request.kycDocumentFront}`)}>
                                        {request.kycDocumentFront?.endsWith('.pdf') ? (
                                            <div className="text-center">
                                                <FiEye className="w-10 h-10 mx-auto text-gray-400" />
                                                <p className="mt-1 text-xs text-gray-500 font-medium">View PDF</p>
                                            </div>
                                        ) : (
                                            <img src={`http://localhost:5001${request.kycDocumentFront}`} alt="Front" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                            <FiEye className="text-white w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center">Citizenship Back</p>
                                    <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100 aspect-[3/4] bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(`http://localhost:5001${request.kycDocumentBack}`)}>
                                        {request.kycDocumentBack?.endsWith('.pdf') ? (
                                            <div className="text-center">
                                                <FiEye className="w-10 h-10 mx-auto text-gray-400" />
                                                <p className="mt-1 text-xs text-gray-500 font-medium">View PDF</p>
                                            </div>
                                        ) : (
                                            <img src={`http://localhost:5001${request.kycDocumentBack}`} alt="Back" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                            <FiEye className="text-white w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all border border-white/20" onClick={() => setSelectedImage(null)}>
                            <FiX className="w-6 h-6" />
                        </button>
                        <div className="p-2 max-h-[90vh] overflow-hidden flex items-center justify-center bg-gray-50">
                            {selectedImage.endsWith('.pdf') ? (
                                <iframe src={selectedImage} className="w-full h-[80vh] rounded-xl" title="KYC PDF Full View" />
                            ) : (
                                <img src={selectedImage} alt="Full View" className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-xl" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.show && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiMessageSquare className="text-red-500" /> Rejection Feedback
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">Please specify why the KYC verification is being rejected. This will be sent as feedback to the user.</p>
                        <textarea
                            className="w-full h-32 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                            placeholder="e.g., The documents are blurry, Back side of citizenship is missing..."
                            value={rejectionModal.reason}
                            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                        ></textarea>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setRejectionModal({ show: false, userId: null, reason: '' })}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(rejectionModal.userId, 'rejected', rejectionModal.reason)}
                                disabled={!rejectionModal.reason.trim()}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-300 transition-all font-semibold"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KycVerificationRequests;
