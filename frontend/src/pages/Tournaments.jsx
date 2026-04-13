import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService } from '../services/api';
import { FiCalendar, FiMapPin, FiAward, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Tournaments = () => {
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
            console.error('Error loading tournaments:', error);
            toast.error('Failed to load tournaments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'ongoing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tournaments</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Join the competition and show your skills!</p>
                </div>

                {tournaments.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
                        <p className="text-slate-500 font-medium">No tournaments available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tournaments.map((tournament) => (
                            <div key={tournament._id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-slate-900/10 transition-all duration-500 group flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    {tournament.image ? (
                                        <img
                                            src={`http://localhost:5001${tournament.image}`}
                                            alt={tournament.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : tournament.venue?.images?.length > 0 ? (
                                        <img
                                            src={`http://localhost:5001${tournament.venue.images[0]}`}
                                            alt={tournament.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                            <FiAward size={64} />
                                        </div>
                                    )}
                                    <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest uppercase border ${getStatusColor(tournament.status)}`}>
                                        {tournament.status}
                                    </span>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-4 group-hover:text-slate-700 transition-colors">
                                        {tournament.name}
                                    </h3>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <FiCalendar className="mr-3 text-slate-900" />
                                            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <FiMapPin className="mr-3 text-slate-900" />
                                            {tournament.location?.city || tournament.venue?.location?.city || 'Venue TBD'}
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <Link
                                            to={`/tournaments/${tournament._id}`}
                                            className="block text-center py-4 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                                        >
                                            View details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tournaments;
