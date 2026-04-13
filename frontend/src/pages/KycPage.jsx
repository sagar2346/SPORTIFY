import { motion } from 'framer-motion';
import KycVerification from '../components/customer/KycVerification';
import { FiShield, FiChevronLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const KycPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <Link 
                        to="/profile" 
                        className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors mb-4 group"
                    >
                        <FiChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                        <FiShield className="text-primary-600" /> Identity Verification
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Complete your KYC to unlock all platform features and loyalty rewards.</p>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <KycVerification />
            </motion.div>

            <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Why verify?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-900 uppercase">Trust & Security</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Verification helps us maintain a safe community for all players and partners.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-900 uppercase">Partner Access</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Venue owners must be verified before they can list and manage sports facilities.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-900 uppercase">Loyalty Rewards</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Only verified members can redeem loyalty points for cash or booking discounts.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycPage;
