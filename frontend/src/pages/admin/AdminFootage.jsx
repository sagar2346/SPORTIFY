import { useState, useEffect } from 'react';
import { footageService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiVideo, FiUpload, FiTrash2, FiExternalLink, FiClock } from 'react-icons/fi';

const AdminFootage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        analysisText: '',
    });
    const [footageList, setFootageList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadFootage();
    }, []);

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
            setFormData({ title: '', description: '', videoUrl: '', analysisText: '' });
            loadFootage(); // Refresh list
        } catch (error) {
            toast.error('Failed to upload footage');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this footage?')) return;

        try {
            await footageService.delete(id);
            toast.success('Footage deleted successfully');
            setFootageList(footageList.filter(f => f._id !== id));
        } catch (error) {
            toast.error('Failed to delete footage');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Upload Section */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FiVideo className="mr-3 text-primary-600" />
                    Add Game Footage
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Match Highlight - Final"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube/Vimeo)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="https://youtube.com/..."
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="input h-24"
                            placeholder="Provide a brief description of the game..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Context (Performance Notes)</label>
                        <textarea
                            className="input h-32"
                            placeholder="e.g., The team showed strong attack but weak defense..."
                            value={formData.analysisText}
                            onChange={(e) => setFormData({ ...formData, analysisText: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full flex items-center justify-center"
                    >
                        {loading ? 'Uploading...' : <><FiUpload className="mr-2" /> Upload Footage</>}
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FiVideo className="mr-3 text-primary-600" />
                    Manage Uploaded Footage
                </h2>

                {fetching ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : footageList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No footage uploaded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Footage Detail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {footageList.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900">{item.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiClock className="mr-1.5" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                <a
                                                    href={item.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-600 hover:text-primary-800 transition-colors"
                                                    title="View Original Link"
                                                >
                                                    <FiExternalLink />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
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

