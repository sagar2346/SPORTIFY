import React, { useState, useEffect } from 'react';
import { kycService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiUploadCloud, FiFileText } from 'react-icons/fi';

const KycVerification = () => {
    const [status, setStatus] = useState('not_verified');
    const [frontSide, setFrontSide] = useState(null);
    const [backSide, setBackSide] = useState(null);
    const [passportPhoto, setPassportPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [kycData, setKycData] = useState(null);

    useEffect(() => {
        fetchKycStatus();
    }, []);

    const fetchKycStatus = async () => {
        try {
            const response = await kycService.getKycStatus();
            if (response.data.success) {
                setStatus(response.data.data.kycStatus);
                setKycData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching KYC status:', error);
        }
    };

    const handleFrontChange = (e) => setFrontSide(e.target.files[0]);
    const handleBackChange = (e) => setBackSide(e.target.files[0]);
    const handlePhotoChange = (e) => setPassportPhoto(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!frontSide || !backSide || !passportPhoto) {
            toast.error('Please upload all required documents (Front, Back, and Passport Photo)');
            return;
        }

        const formData = new FormData();
        formData.append('front', frontSide);
        formData.append('back', backSide);
        formData.append('photo', passportPhoto);

        setLoading(true);
        try {
            const response = await kycService.uploadDocument(formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setStatus('pending');
                setKycData(response.data.data);
                // Clear selected files
                setFrontSide(null);
                setBackSide(null);
                setPassportPhoto(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload documents');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'verified':
                return <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 rounded-full flex items-center gap-1.5"><FiCheckCircle /> Verified</span>;
            case 'pending':
                return <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 rounded-full flex items-center gap-1.5"><FiUploadCloud /> Pending Verification</span>;
            case 'rejected':
                return <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 rounded-full flex items-center gap-1.5"><FiAlertCircle /> Verification Rejected</span>;
            default:
                return <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 rounded-full">Not Verified</span>;
        }
    };

    const UploadSection = ({ id, label, file, onChange }) => (
        <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className={`mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-dashed rounded-xl transition-all duration-300 bg-gray-50/50 ${file ? 'border-primary-400 bg-primary-50/10' : 'border-gray-300 hover:border-primary-400'}`}>
                <div className="space-y-1 text-center">
                    <FiUploadCloud className={`mx-auto h-8 w-8 ${file ? 'text-primary-500' : 'text-gray-400'}`} />
                    <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-bold text-primary-600 hover:text-primary-700 focus-within:outline-none px-2 py-0.5">
                            <span>{file ? 'Change file' : 'Upload file'}</span>
                            <input id={id} name={id} type="file" className="sr-only" onChange={onChange} accept="image/*,.pdf" disabled={status === 'pending' || status === 'verified'} />
                        </label>
                    </div>
                    {file && <p className="text-[10px] font-medium text-primary-600 truncate max-w-[120px] mx-auto italic">{file.name}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">KYC Verification</h2>
                    <p className="text-sm text-gray-500 font-medium">Identity verification for safe bookings</p>
                </div>
                {getStatusBadge()}
            </div>

            <div className="p-6 space-y-6">
                {status === 'rejected' && kycData?.kycRejectionReason && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex gap-3 animate-pulse">
                        <FiAlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-800">Rejection Feedback:</p>
                            <p className="text-red-700 text-sm leading-relaxed font-medium">{kycData.kycRejectionReason}</p>
                            <p className="text-xs text-red-600 mt-2 italic font-semibold">* Please address the issues above and re-upload your documents.</p>
                        </div>
                    </div>
                )}

                {status === 'verified' ? (
                    <div className="p-6 bg-green-50 border border-green-100 rounded-2xl text-green-800 flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-200/50 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Verification Complete</p>
                            <p className="text-green-700/80 font-medium">Your account is fully verified. You can now freely book any venue on Sportify.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <FiFileText className="text-blue-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 font-medium">Please provide high-quality scans or photos of your citizenship (both sides) and a recent passport-sized photo of yourself.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <UploadSection id="front-side" label="Citizenship (Front)" file={frontSide} onChange={handleFrontChange} />
                                <UploadSection id="back-side" label="Citizenship (Back)" file={backSide} onChange={handleBackChange} />
                                <UploadSection id="passport-photo" label="Passport Photo" file={passportPhoto} onChange={handlePhotoChange} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || status === 'pending' || status === 'verified'}
                                className={`w-full py-4 px-6 rounded-xl shadow-lg text-base font-black text-white transform transition-all active:scale-[0.98] ${loading || status === 'pending' || status === 'verified' ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/25'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Uploading Documents...
                                    </span>
                                ) : status === 'pending' ? 'Currently Under Review' : status === 'rejected' ? 'Re-Submit Documents' : 'Submit for Verification'}
                            </button>
                        </form>
                    </>
                )}

                {(kycData?.kycDocumentFront || kycData?.kycDocumentBack || kycData?.kycPassportPhoto) && (
                    <div className="mt-8 border-t pt-8">
                        <h3 className="text-sm font-extrabold text-gray-900 mb-6 uppercase tracking-widest text-center">Your Last Submitted Documents</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { side: 'Citizenship Front', path: kycData.kycDocumentFront },
                                { side: 'Citizenship Back', path: kycData.kycDocumentBack },
                                { side: 'Selfie Photo', path: kycData.kycPassportPhoto }
                            ].map((item) => {
                                if (!item.path) return null;
                                return (
                                    <div key={item.side} className="group">
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mb-2 truncate group-hover:text-primary-500 transition-colors">{item.side}</p>
                                        <div className="relative border-2 border-gray-100 rounded-xl overflow-hidden h-32 bg-gray-50 flex items-center justify-center shadow-sm group-hover:border-primary-200 transition-all">
                                            {item.path.endsWith('.pdf') ? (
                                                <div className="text-center">
                                                    <FiFileText className="w-8 h-8 text-gray-400 mx-auto" />
                                                    <p className="text-[10px] text-gray-400 font-bold mt-1">PDF File</p>
                                                </div>
                                            ) : (
                                                <img src={`http://localhost:5001${item.path}`} alt={item.side} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KycVerification;
