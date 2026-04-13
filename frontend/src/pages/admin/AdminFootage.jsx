import { useState, useEffect } from 'react';
import { footageService, teamService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiVideo, FiUpload, FiTrash2, FiExternalLink, FiClock, FiUsers } from 'react-icons/fi';

const AdminFootage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        analysisText: '',
        teamId: '',
    });
    const [footageList, setFootageList] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const getThumbnail = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop';
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
        }
        return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop';
    };

    useEffect(() => {
        loadFootage();
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            const response = await teamService.getMyTeams();
            setTeams(response.data.data);
        } catch (error) {
            console.error('Failed to load teams');
        }
    };

    const loadFootage = async () => {
        try {
            const response = await footageService.getAll();
            setFootageList(response.data.data);
        } catch (error) {
            toast.error('Failed to load footage list');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await footageService.upload(formData);
            toast.success('Footage uploaded successfully');
            setFormData({ title: '', description: '', videoUrl: '', analysisText: '', teamId: '' });
            loadFootage(); // Refresh list
        } catch (error) {
            toast.error('Failed to upload footage');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this footage?')) return;

        const toastId = toast.loading('Deleting footage...');
        try {
            await footageService.delete(id);
            toast.success('Footage deleted successfully', { id: toastId });
            setFootageList(prev => prev.filter(f => f._id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete footage', { id: toastId });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Upload Section */}
            <div className="card bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                    <FiVideo className="mr-3 text-primary-600" />
                    Add Game Footage
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                className="input bg-white border-gray-200 text-gray-900 focus:ring-primary-500 font-medium py-3 rounded-xl"
                                placeholder="Match Highlight - Final"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (YouTube/Vimeo)</label>
                            <input
                                type="text"
                                className="input bg-white border-gray-200 text-gray-900 focus:ring-primary-500 font-medium py-3 rounded-xl"
                                placeholder="https://youtube.com/..."
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Team Selection */}
                    <div className="bg-primary-50 p-5 rounded-2xl border border-primary-100">
                        <label className="block text-sm font-bold text-primary-900 mb-3 flex items-center">
                            <FiUsers className="mr-2" /> Associate with Team (Required for Privacy)
                        </label>
                        <select
                            className="input bg-white border-gray-200 text-gray-900 focus:ring-primary-500 font-bold py-3 rounded-xl"
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                            required
                        >
                            <option value="">Select a Team</option>
                            {teams.map(team => (
                                <option key={team._id} value={team._id}>
                                    {team.name} ({team.sport})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-primary-600 mt-2 italic font-bold">
                            Footage and AI analysis will only be visible to members of the selected team.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            className="input h-28 bg-white border-gray-200 text-gray-900 focus:ring-primary-500 font-medium p-4 rounded-xl resize-none"
                            placeholder="Provide a brief description of the game..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Analysis Context (Performance Notes)</label>
                        <textarea
                            className="input h-36 bg-white border-gray-200 text-gray-900 focus:ring-primary-500 font-medium p-4 rounded-xl resize-none"
                            placeholder="e.g., The team showed strong attack but weak defense..."
                            value={formData.analysisText}
                            onChange={(e) => setFormData({ ...formData, analysisText: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full flex items-center justify-center py-4 rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all text-lg"
                    >
                        {loading ? 'Uploading...' : <><FiUpload className="mr-3" /> Upload Footage</>}
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="card bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                    <FiVideo className="mr-3 text-primary-600" />
                    Manage Uploaded Footage
                </h2>

                {fetching ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : footageList.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <FiVideo className="mx-auto h-12 w-12 opacity-20 mb-4" />
                        <p className="text-lg font-bold">No footage uploaded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Preview</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Footage Detail</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {footageList.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors group/row">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="w-20 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                <img 
                                                    src={getThumbnail(item.videoUrl)} 
                                                    alt="Thumbnail" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop' }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 group-hover/row:text-primary-600 transition-colors">{item.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs mt-1 font-medium">{item.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center font-bold">
                                                <FiClock className="mr-2 text-primary-500" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-4">
                                                <a
                                                    href={item.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all"
                                                    title="View Original Link"
                                                >
                                                    <FiExternalLink />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                                    title="Delete Footage"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFootage;

