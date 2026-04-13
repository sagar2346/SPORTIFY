import React, { useState, useEffect } from 'react';
import { kycService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiUploadCloud, FiFileText, FiBriefcase, FiShield } from 'react-icons/fi';

const KycVerification = () => {
    const [status, setStatus] = useState('not_verified');
    const [businessDoc, setBusinessDoc] = useState(null);
    const [frontSide, setFrontSide] = useState(null);
    const [backSide, setBackSide] = useState(null);
    const [passportPhoto, setPassportPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [kycData, setKycData] = useState(null);
    const [identificationNumber, setIdentificationNumber] = useState('');

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

    const handleBusinessDocChange = (e) => setBusinessDoc(e.target.files[0]);
    const handleFrontChange = (e) => setFrontSide(e.target.files[0]);
    const handleBackChange = (e) => setBackSide(e.target.files[0]);
    const handlePhotoChange = (e) => setPassportPhoto(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!identificationNumber.trim() || !businessDoc || !frontSide || !backSide || !passportPhoto) {
            toast.error('Please provide identification number and upload all required documents');
            return;
        }

        const formData = new FormData();
        formData.append('identificationNumber', identificationNumber);
        formData.append('document', businessDoc);
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
                setBusinessDoc(null);
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
                return <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 rounded-lg flex items-center gap-1.5 border border-emerald-100 shadow-sm"><FiCheckCircle /> Verified partner</span>;
            case 'pending':
                return <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 rounded-lg flex items-center gap-1.5 border border-amber-100 shadow-sm animate-pulse"><FiUploadCloud /> In review</span>;
            case 'manual_verified':
                return <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 bg-slate-50 rounded-lg flex items-center gap-1.5 border border-slate-200 shadow-sm"><FiShield /> Reviewed</span>;
            case 'rejected':
                return <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 rounded-lg flex items-center gap-1.5 border border-rose-100 shadow-sm"><FiAlertCircle /> Needs attention</span>;
            default:
                return <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 rounded-lg border border-slate-200">Not verified</span>;
        }
    };

    const UploadSection = ({ id, label, file, onChange, icon: Icon = FiUploadCloud }) => (
        <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">{label}</label>
            <div className={`mt-1 flex justify-center px-4 pt-8 pb-8 border-2 border-dashed rounded-2xl transition-all duration-300 bg-slate-50/50 ${file ? 'border-slate-900/20 bg-slate-100/50' : 'border-slate-200 hover:border-slate-400'}`}>
                <div className="space-y-4 text-center">
                    <Icon className={`mx-auto h-12 w-12 ${file ? 'text-slate-900' : 'text-slate-300'}`} />
                    <div className="flex text-[10px] text-slate-600 justify-center">
                        <label htmlFor={id} className="relative cursor-pointer bg-white rounded-xl font-bold text-slate-900 border border-slate-200 px-6 py-2 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
                            <span>{file ? 'Change file' : 'Choose file'}</span>
                            <input id={id} name={id} type="file" className="sr-only" onChange={onChange} accept="image/*,.pdf" disabled={status === 'pending' || status === 'verified'} />
                        </label>
                    </div>
                    {file && <p className="text-[10px] font-bold text-slate-900 truncate max-w-[140px] mx-auto uppercase tracking-tighter opacity-50">[{file.name}]</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-colors duration-300 mb-8 shadow-sm">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Partner verification</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Verify your business to list and manage venues.</p>
                </div>
                <div className="flex-shrink-0">
                    {getStatusBadge()}
                </div>
            </div>

            <div className="p-8 space-y-10">
                {status === 'rejected' && kycData?.kycRejectionReason && (
                    <div className="p-6 bg-red-50/50 border-l-8 border-red-500 rounded-2xl flex gap-4 animate-fade-in">
                        <FiAlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-900 uppercase tracking-tight text-lg">Verification Failed</p>
                            <p className="text-red-700 text-sm leading-relaxed font-bold mt-1 shadow-sm px-3 py-2 bg-red-100 rounded-xl inline-block">{kycData.kycRejectionReason}</p>
                            <p className="text-[10px] text-red-600 mt-4 uppercase tracking-[0.2em] font-bold italic">* Please update your business documents and resubmit.</p>
                        </div>
                    </div>
                )}

                {status === 'verified' ? (
                    <div className="p-8 bg-green-50/50 border border-green-100 rounded-3xl text-green-800 flex items-center gap-6 shadow-inner">
                        <div className="h-16 w-16 bg-green-200/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <FiCheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-bold text-xl uppercase tracking-tight">Verified Partner</p>
                            <p className="text-green-700/80 font-bold mt-1">Your business identity has been verified. You can now list and manage sports venues on Sportify.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100 flex gap-4 shadow-sm">
                            <FiBriefcase className="text-primary-600 w-8 h-8 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-primary-800 font-bold leading-relaxed uppercase tracking-wider">
                                Please upload your business registration/license and the owner's valid ID (front & back) for vetting.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col gap-4 shadow-sm">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Citizenship / National ID number</label>
                                <input
                                    type="text"
                                    value={identificationNumber}
                                    onChange={(e) => setIdentificationNumber(e.target.value)}
                                    placeholder="Enter ID number precisely"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all placeholder:text-slate-300"
                                    required
                                    disabled={status === 'pending' || status === 'verified'}
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight opacity-70">* This number will be verified against the official portal.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <UploadSection id="business-doc" label="Business Doc" file={businessDoc} onChange={handleBusinessDocChange} icon={FiBriefcase} />
                                <UploadSection id="front-side" label="Owner ID (Front)" file={frontSide} onChange={handleFrontChange} />
                                <UploadSection id="back-side" label="Owner ID (Back)" file={backSide} onChange={handleBackChange} />
                                <UploadSection id="passport-photo" label="Owner Photo" file={passportPhoto} onChange={handlePhotoChange} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || status === 'pending' || status === 'verified'}
                                className={`w-full py-5 px-8 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${loading || status === 'pending' || status === 'verified' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'btn btn-primary shadow-xl shadow-slate-900/10'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Uploading...
                                    </span>
                                ) : status === 'pending' ? 'Verification in progress' : status === 'rejected' ? 'Update & resubmit' : 'Submit for partnership'}
                            </button>
                        </form>
                    </>
                )}

                {(kycData?.kycBusinessDocument || kycData?.kycOwnerIdFront || kycData?.kycOwnerIdBack || kycData?.kycPassportPhoto) && (
                    <div className="mt-12 border-t pt-10">
                        <h3 className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-[0.4em] text-center">Submitted Evidence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { side: 'Business License', path: kycData.kycBusinessDocument },
                                { side: 'ID Front', path: kycData.kycOwnerIdFront },
                                { side: 'ID Back', path: kycData.kycOwnerIdBack },
                                { side: 'Passport Photo', path: kycData.kycPassportPhoto }
                            ].map((item) => {
                                if (!item.path) return null;
                                return (
                                    <div key={item.side} className="group">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 truncate group-hover:text-primary-500 transition-colors">{item.side}</p>
                                        <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden h-32 bg-gray-50 flex items-center justify-center shadow-lg group-hover:border-primary-200 transition-all cursor-zoom-in">
                                            {item.path.endsWith('.pdf') ? (
                                                <div className="text-center">
                                                    <FiFileText className="w-8 h-8 text-gray-300 mx-auto" />
                                                    <p className="text-[8px] text-gray-400 font-bold mt-2 uppercase">PDF</p>
                                                </div>
                                            ) : (
                                                <img src={`http://localhost:5001${item.path}`} alt={item.side} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100 transition-all" />
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold uppercase tracking-tighter">File</div>
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
