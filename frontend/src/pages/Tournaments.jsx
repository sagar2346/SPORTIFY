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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Upcoming Tournaments</h1>
                    <p className="text-gray-600">Join the competition and show your skills!</p>
                </div>
            </div>

            {tournaments.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500">No tournaments available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => (
                        <div key={tournament._id} className="card hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                {tournament.image ? (
                                    <img
                                        src={`http://localhost:5001${tournament.image}`}
                                        alt={tournament.name}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-primary-100 flex items-center justify-center rounded-lg">
                                        <FiAward className="text-primary-600" size={48} />
                                    </div>
                                )}
                                <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                                    {tournament.status.toUpperCase()}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-gray-500">
                                    <FiCalendar className="mr-2" />
                                    <span>{new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <FiMapPin className="mr-2" />
                                    <span>{tournament.location?.city || (tournament.venue?.name ? `At ${tournament.venue.name}` : 'TBD')}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <FiUsers className="mr-2" />
                                    <span>Max Teams: {tournament.maxTeams}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-lg font-bold text-primary-600">
                                    {tournament.entryFee > 0 ? `Rs. ${tournament.entryFee}` : 'Free Entry'}
                                </span>
                                <Link to={`/tournaments/${tournament._id}`} className="btn btn-primary btn-sm">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tournaments;
