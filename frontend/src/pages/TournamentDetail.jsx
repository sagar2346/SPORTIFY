import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiMapPin, FiAward, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TournamentDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [myTeams, setMyTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        loadTournamentDetail();
        if (user && user.role === 'customer') {
            loadMyTeams();
        }
    }, [id, user]);

    const loadTournamentDetail = async () => {
        try {
            const response = await tournamentService.getTournament(id);
            setTournament(response.data.data);
        } catch (error) {
            console.error('Error loading tournament:', error);
            toast.error('Tournament not found');
            navigate('/tournaments');
        } finally {
            setLoading(false);
        }
    };

    const loadMyTeams = async () => {
        try {
            const response = await teamService.getMyTeams();
            setMyTeams(response.data.data);
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    };

    const handleRegister = async () => {
        if (!selectedTeam) {
            toast.error('Please select a team to register');
            return;
        }

        setRegistering(true);
        try {
            await tournamentService.registerTeam(id, selectedTeam);
            toast.success('Team registered successfully!');
            loadTournamentDetail(); // Refresh to show team in list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const isDeadlinePassed = new Date() > new Date(tournament.registrationDeadline);
    const isRegistered = tournament.registrations?.some(reg =>
        myTeams.some(team => team._id === reg.team._id)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2">
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold">{tournament.name}</h1>
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold 
                ${tournament.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {tournament.status.toUpperCase()}
                            </span>
                        </div>

                        {tournament.image && (
                            <img
                                src={`http://localhost:5001${tournament.image}`}
                                alt={tournament.name}
                                className="w-full h-96 object-cover rounded-lg mb-6"
                            />
                        )}

                        <div className="prose max-w-none mb-8">
                            <h3 className="text-xl font-semibold mb-2">About Tournament</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{tournament.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y">
                            <div className="flex items-center">
                                <FiCalendar className="text-primary-600 mr-3" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Start Date</p>
                                    <p className="font-semibold">{new Date(tournament.startDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FiClock className="text-primary-600 mr-3" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">End Date</p>
                                    <p className="font-semibold">{new Date(tournament.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FiAward className="text-primary-600 mr-3" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Sport</p>
                                    <p className="font-semibold capitalize">{tournament.sportType}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FiMapPin className="text-primary-600 mr-3" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                                    <p className="font-semibold">{tournament.location?.city || tournament.venue?.name || 'TBD'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <FiUsers className="text-primary-600 mr-3" size={24} />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
                                    <p className="font-semibold">{tournament.maxTeams} Teams Max</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Registered Teams ({tournament.registrations?.length || 0})</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tournament.registrations?.map((reg) => (
                                    <div key={reg._id} className="flex items-center p-3 border rounded-lg bg-gray-50">
                                        <FiCheckCircle className="text-green-500 mr-3" />
                                        <span className="font-medium">{reg.team.name}</span>
                                    </div>
                                ))}
                                {(!tournament.registrations || tournament.registrations.length === 0) && (
                                    <p className="text-gray-500 italic">No teams registered yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-4">
                        <h3 className="text-xl font-bold mb-4">Registration</h3>

                        <div className="space-y-4">
                            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                                <p className="text-sm text-primary-800">Registration Fee</p>
                                <p className="text-3xl font-bold text-primary-600">
                                    {tournament.entryFee > 0 ? `Rs. ${tournament.entryFee}` : 'FREE'}
                                </p>
                            </div>

                            <div className="py-2">
                                <p className="text-sm text-gray-500 mb-1">Deadline:</p>
                                <p className={`font-semibold ${isDeadlinePassed ? 'text-red-600' : 'text-gray-900'}`}>
                                    {new Date(tournament.registrationDeadline).toLocaleDateString()}
                                </p>
                            </div>

                            {user ? (
                                user.role === 'customer' ? (
                                    <>
                                        {!isRegistered ? (
                                            <>
                                                <div className="pb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Team</label>
                                                    <select
                                                        className="input w-full"
                                                        value={selectedTeam}
                                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                                        disabled={isDeadlinePassed || registering}
                                                    >
                                                        <option value="">-- Choose Team --</option>
                                                        {myTeams
                                                            .filter(t => t.sport.toLowerCase() === tournament.sportType.toLowerCase())
                                                            .map(team => (
                                                                <option key={team._id} value={team._id}>{team.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    {myTeams.filter(t => t.sport.toLowerCase() === tournament.sportType.toLowerCase()).length === 0 && (
                                                        <p className="text-xs text-red-500 mt-2">
                                                            You don't have any teams for {tournament.sportType}.
                                                            <button onClick={() => navigate('/my-teams')} className="ml-1 underline">Create one</button>
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleRegister}
                                                    disabled={isDeadlinePassed || registering || !selectedTeam}
                                                    className="btn btn-primary w-full py-3"
                                                >
                                                    {registering ? 'Processing...' : isDeadlinePassed ? 'Registration Closed' : 'Register Now'}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center border border-green-200">
                                                <FiCheckCircle className="mr-3" size={20} />
                                                <span className="font-medium">Your team is registered!</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center italic">Only customers can register.</p>
                                )
                            ) : (
                                <button onClick={() => navigate('/login')} className="btn btn-primary w-full">
                                    Login to Register
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetail;
