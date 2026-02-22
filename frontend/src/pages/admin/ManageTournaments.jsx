import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiEdit2, FiTrash2, FiPlus, FiMapPin, FiExternalLink } from 'react-icons/fi';

const ManageTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            const response = await tournamentService.getTournaments();
            setTournaments(response.data.data);
        } catch (error) {
            toast.error('Failed to load tournaments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tournament? This will also remove all registrations.')) return;

        const toastId = toast.loading('Deleting tournament...');
        try {
            await tournamentService.deleteTournament(id);
            toast.success('Tournament deleted successfully', { id: toastId });
            setTournaments(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete tournament', { id: toastId });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Tournaments</h2>
                <Link to="/admin/tournaments/create" className="btn btn-primary flex items-center">
                    <FiPlus className="mr-2" /> Create Tournament
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No tournaments found. Start by creating one!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tournaments.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900">{t.name}</div>
                                                <div className="text-xs text-primary-600 font-medium uppercase tracking-wider">{t.sportType}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiCalendar className="mr-1.5 text-gray-400" />
                                                {new Date(t.startDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiMapPin className="mr-1.5 text-gray-400" />
                                                {t.venue ? t.venue.name : t.location.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${t.status === 'open' ? 'bg-green-100 text-green-700' :
                                                    t.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {t.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                <Link to={`/tournaments/${t._id}`} className="text-gray-400 hover:text-gray-600" title="View Public Page">
                                                    <FiExternalLink />
                                                </Link>
                                                <Link to={`/admin/tournaments/edit/${t._id}`} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                                                    <FiEdit2 />
                                                </Link>
                                                <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-900" title="Delete">
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

export default ManageTournaments;
