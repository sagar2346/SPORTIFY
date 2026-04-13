import { useState, useEffect } from 'react';
import { adminService, teamService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiShield, FiAlertCircle, FiCheckCircle, FiSearch, FiArrowRight, FiUnlock, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTeam, setEditingTeam] = useState(null);
    const [blockFormData, setBlockFormData] = useState({ isBlocked: false, fineAmount: 0 });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            const response = await adminService.getTeams();
            setTeams(response.data.data);
        } catch (error) {
            console.error('Error loading teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBlockStatus = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateTeamBlockStatus(editingTeam._id, blockFormData);
            toast.success(`Team "${editingTeam.name}" status updated`);
            setEditingTeam(null);
            loadTeams();
        } catch (error) {
            console.error('Error updating team:', error);
            toast.error('Failed to update team status');
        }
    };

    const handleDeleteTeam = (teamId, teamName) => {
        setTeamToDelete({ id: teamId, name: teamName });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!teamToDelete) return;

        try {
            await teamService.deleteTeam(teamToDelete.id);
            toast.success(`Team "${teamToDelete.name}" deleted successfully`);
            setTeams(prev => prev.filter(t => t._id !== teamToDelete.id));
        } catch (error) {
            console.error('Error deleting team:', error);
            toast.error(error.response?.data?.message || 'Failed to delete team');
        } finally {
            setIsDeleteModalOpen(false);
            setTeamToDelete(null);
        }
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.sport.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Teams</h1>
                    <p className="text-slate-500 mt-2 font-medium">Block or unblock teams and manage unblocking fines.</p>
                </div>

                <div className="relative max-w-md w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search teams by name or sport..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all outline-none font-medium text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTeams.map((team) => (
                    <motion.div
                        key={team._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${team.isBlocked ? 'bg-rose-50 text-rose-500' : 'bg-slate-900 text-white'}`}>
                                {team.name.charAt(0)}
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${team.isBlocked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {team.isBlocked ? 'Blocked' : 'Active'}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-primary-600 transition-colors">{team.name}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{team.sport}</p>

                        <div className="space-y-3 mb-8 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-400 font-medium">Created by</span>
                                <span className="text-slate-700 font-bold">{team.createdBy?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-400 font-medium">Fine Amount</span>
                                <span className={`font-black ${team.fineAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>Rs. {team.fineAmount || 0}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setEditingTeam(team);
                                    setBlockFormData({
                                        isBlocked: team.isBlocked,
                                        fineAmount: team.fineAmount
                                    });
                                }}
                                className={`w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn ${team.isBlocked
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                    : 'bg-slate-50 hover:bg-slate-900 hover:text-white'
                                    }`}
                            >
                                {team.isBlocked ? (
                                    <><FiUnlock size={14} /> Unblock / Manage Team</>
                                ) : (
                                    <><FiShield size={14} /> Block Team</>
                                )}
                            </button>
                            <button
                                onClick={() => handleDeleteTeam(team._id, team.name)}
                                className="px-5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-center group/trash shadow-sm shadow-rose-200/20"
                                title="Delete Team"
                            >
                                <FiTrash2 size={16} className="group-hover/trash:scale-110 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {filteredTeams.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center">
                        <FiShield size={48} className="mx-auto text-slate-200 mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No teams found matching your search</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingTeam && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4"
                    >
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onSubmit={handleUpdateBlockStatus}
                            className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-[500px] border border-slate-100"
                        >
                            <div className="mb-10 text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/10 ${blockFormData.isBlocked ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>
                                    {blockFormData.isBlocked ? <FiAlertCircle size={30} /> : <FiShield size={30} />}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingTeam.isBlocked ? 'Manage Blocked Team' : 'Block Team'}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{editingTeam.name}</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${blockFormData.isBlocked ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                            <FiAlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Blocked Status</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{blockFormData.isBlocked ? 'Team is restricted' : 'Team is active'}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setBlockFormData({ ...blockFormData, isBlocked: !blockFormData.isBlocked })}
                                        className={`w-14 h-8 rounded-full transition-all relative ${blockFormData.isBlocked ? 'bg-rose-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${blockFormData.isBlocked ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fine Amount (Rs.)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-black text-lg placeholder:text-slate-300"
                                        placeholder="0"
                                        value={blockFormData.fineAmount}
                                        onChange={(e) => setBlockFormData({ ...blockFormData, fineAmount: parseInt(e.target.value) || 0 })}
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium px-2 leading-relaxed">
                                        {blockFormData.isBlocked
                                            ? 'The team must pay this fine to be eligible for unblocking.'
                                            : 'Impose a fine while blocking the team.'}
                                    </p>
                                </div>

                            </div>

                            <div className="flex flex-col gap-4 mt-12">
                                <button type="submit" className={`w-full py-5 rounded-[1.5rem] font-bold tracking-widest uppercase text-[10px] transition-all shadow-xl active:scale-95 ${blockFormData.isBlocked === editingTeam.isBlocked
                                    ? 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
                                    : blockFormData.isBlocked
                                        ? 'bg-rose-500 text-white shadow-rose-500/10 hover:bg-rose-600'
                                        : 'bg-emerald-500 text-white shadow-emerald-500/10 hover:bg-emerald-600'
                                    }`}>
                                    {blockFormData.isBlocked === editingTeam.isBlocked
                                        ? 'Save Changes'
                                        : blockFormData.isBlocked
                                            ? 'Confirm Block'
                                            : 'Confirm Unblock'}
                                </button>
                                <button type="button" onClick={() => setEditingTeam(null)} className="w-full py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-colors">Cancel</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Team"
                message={`Are you sure you want to delete the team "${teamToDelete?.name}"? This action cannot be undone and will delete all team messages and associated data.`}
                confirmText="Delete Team"
                type="danger"
            />
        </div>
    );
};

export default ManageTeams;
