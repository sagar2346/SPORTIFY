import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiMessageSquare, FiExternalLink, FiShield, FiSearch } from 'react-icons/fi';

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
                <h2 className="text-2xl font-bold text-gray-900">Pending KYC Verifications</h2>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                    {requests.length} Requests
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                    <FiCheck className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold">All clear! No pending KYC requests.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-6">
                                <div className="flex items-center gap-5">
                                    {request.kycPassportPhoto && (
                                        <img
                                            src={`http://localhost:5001${request.kycPassportPhoto}`}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover border-4 border-primary-50 shadow-md transition-transform group-hover:scale-105"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-2xl text-gray-900">{request.name}</h3>
                                        <p className="text-lg text-gray-500 font-medium">{request.email}</p>
                                        <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">
                                            Submitted: {new Date(request.kycSubmittedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 w-full md:w-auto">
                                    {request.kycStatus === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(request._id, 'manual_verified')}
                                            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20 active:scale-95"
                                        >
                                            <FiShield className="w-5 h-5" /> <span>Verify Locally</span>
                                        </button>
                                    )}

                                    {request.kycStatus === 'manual_verified' && (
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href="https://citizenportal.donidcr.gov.np/en/check-nid-card-status"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-amber-500/20 active:scale-95 text-sm"
                                            >
                                                <FiSearch className="w-4 h-4" /> <span>Check Govt Portal</span>
                                            </a>
                                            <button
                                                onClick={() => handleUpdateStatus(request._id, 'verified')}
                                                className="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-green-500/20 active:scale-95"
                                            >
                                                <FiCheck className="w-5 h-5" /> <span>Auto Verify (Govt OK)</span>
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setRejectionModal({ show: true, userId: request._id, reason: '' })}
                                        className="flex items-center justify-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-red-500/20 active:scale-95"
                                    >
                                        <FiX className="w-5 h-5" /> <span>Reject Request</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Passport Photo */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center tracking-widest">Partner Photo</p>
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-video bg-gray-50 flex items-center justify-center cursor-pointer shadow-inner" onClick={() => setSelectedImage(`http://localhost:5001${request.kycPassportPhoto}`)}>
                                        <img src={`http://localhost:5001${request.kycPassportPhoto}`} alt="Partner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                            <FiEye className="text-white w-10 h-10" />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Document */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center tracking-widest">Business License</p>
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-video bg-gray-50 flex items-center justify-center cursor-pointer shadow-inner" onClick={() => setSelectedImage(`http://localhost:5001${request.kycBusinessDocument}`)}>
                                        {request.kycBusinessDocument?.endsWith('.pdf') ? (
                                            <div className="text-center p-4">
                                                <FiFileText className="w-10 h-10 mx-auto text-gray-400" />
                                                <p className="mt-2 text-[10px] text-gray-500 font-bold">Business PDF</p>
                                            </div>
                                        ) : (
                                            <img src={`http://localhost:5001${request.kycBusinessDocument}`} alt="Business License" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                            <FiEye className="text-white w-10 h-10" />
                                        </div>
                                    </div>
                                </div>

                                {/* ID Front side */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center tracking-widest">Owner ID (Front)</p>
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-video bg-gray-50 flex items-center justify-center cursor-pointer shadow-inner" onClick={() => setSelectedImage(`http://localhost:5001${request.kycOwnerIdFront}`)}>
                                        {request.kycOwnerIdFront?.endsWith('.pdf') ? (
                                            <div className="text-center p-4">
                                                <FiFileText className="w-10 h-10 mx-auto text-gray-400" />
                                                <p className="mt-2 text-[10px] text-gray-500 font-bold">ID Front PDF</p>
                                            </div>
                                        ) : (
                                            <img src={`http://localhost:5001${request.kycOwnerIdFront}`} alt="ID Front" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                            <FiEye className="text-white w-10 h-10" />
                                        </div>
                                    </div>
                                </div>

                                {/* ID Back side */}
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase text-center tracking-widest">ID (Back)</p>
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-video bg-gray-50 flex items-center justify-center cursor-pointer shadow-inner" onClick={() => setSelectedImage(`http://localhost:5001${request.kycOwnerIdBack}`)}>
                                        {request.kycOwnerIdBack?.endsWith('.pdf') ? (
                                            <div className="text-center p-4">
                                                <FiFileText className="w-10 h-10 mx-auto text-gray-400" />
                                                <p className="mt-2 text-[10px] text-gray-500 font-bold">ID Back PDF</p>
                                            </div>
                                        ) : (
                                            <img src={`http://localhost:5001${request.kycOwnerIdBack}`} alt="ID Back" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                                            <FiEye className="text-white w-10 h-10" />
                                        </div>
                                    </div>
                                </div>

                                {/* ID Number / Summary */}
                                <div className="md:col-span-2 lg:col-span-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary-100 p-3 rounded-2xl">
                                            <FiShield className="text-primary-600 w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identification Number</p>
                                            <p className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">{request.kycIdentificationNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${request.kycStatus === 'manual_verified' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {request.kycStatus === 'manual_verified' ? 'Local Review Complete • Pending Govt Check' : 'Initial Document Review Pending'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-white/10" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-6 right-6 z-10 p-3 bg-black/50 hover:bg-black text-white rounded-full transition-all border border-white/20 shadow-2xl" onClick={() => setSelectedImage(null)}>
                            <FiX className="w-6 h-6" />
                        </button>
                        <div className="p-4 max-h-[90vh] overflow-hidden flex items-center justify-center bg-gray-950">
                            {selectedImage.endsWith('.pdf') ? (
                                <iframe src={selectedImage} className="w-full h-[85vh] rounded-2xl border-none" title="KYC PDF Full View" />
                            ) : (
                                <img src={selectedImage} alt="Full View" className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-2xl" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-slide-up">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <FiMessageSquare className="text-red-500" /> Rejection Feedback
                        </h3>
                        <p className="text-gray-600 mb-6 font-medium">Please specify why the KYC verification is being rejected. This will be sent as feedback to the user.</p>
                        <textarea
                            className="w-full h-40 border border-gray-200 bg-white text-gray-900 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none font-medium shadow-inner"
                            placeholder="e.g., The documents are blurry, Back side of citizenship is missing..."
                            value={rejectionModal.reason}
                            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                        ></textarea>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setRejectionModal({ show: false, userId: null, reason: '' })}
                                className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(rejectionModal.userId, 'rejected', rejectionModal.reason)}
                                disabled={!rejectionModal.reason.trim()}
                                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl disabled:bg-gray-300 transition-all font-bold shadow-lg shadow-red-500/20 active:scale-95"
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
