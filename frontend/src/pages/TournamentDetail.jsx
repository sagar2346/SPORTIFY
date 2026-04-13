import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, teamService, paymentService } from '../services/api';
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
        const isSolo = tournament.registrationType === 'solo';

        if (!isSolo && !selectedTeam) {
            toast.error('Please select a team to register');
            return;
        }

        setRegistering(true);
        try {
            const res = await tournamentService.registerTeam(id, isSolo ? undefined : selectedTeam);
            
            if (tournament.entryFee > 0) {
                toast.loading('Redirecting to eSewa...', { id: 'payment-redirect' });
                // Initiate payment
                const regId = res.data.data._id;
                const paymentRes = await paymentService.initiateEsewaTournamentPayment(regId);
                
                if (paymentRes.data.success) {
                    const { formData, esewaUrl } = paymentRes.data;
                    
                    // Create a form and submit it to eSewa
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = esewaUrl;
                    
                    for (const key in formData) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = formData[key];
                        form.appendChild(input);
                    }
                    
                    document.body.appendChild(form);
                    form.submit();
                    return;
                }
            }

            toast.success('Successfully registered!');
            loadTournamentDetail(); // Refresh to show in list
        } catch (error) {
            toast.dismiss('payment-redirect');
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
    const isSolo = tournament.registrationType === 'solo';
    const isRegistered = isSolo 
        ? tournament.registrations?.some(reg => reg.registeredBy?._id === user?._id)
        : tournament.registrations?.some(reg => myTeams.some(team => team._id === reg.team?._id));

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-slate-100 mb-8 shadow-sm rounded-[2.5rem] p-10 overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{tournament.name}</h1>
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border
                ${tournament.status === 'open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                    {tournament.status}
                                </span>
                            </div>

                            {tournament.image ? (
                                <img
                                    src={`http://localhost:5001${tournament.image}`}
                                    alt={tournament.name}
                                    className="w-full h-[500px] object-cover rounded-3xl mb-12 shadow-2xl shadow-slate-900/10"
                                />
                            ) : tournament.venue?.images?.length > 0 ? (
                                <img
                                    src={`http://localhost:5001${tournament.venue.images[0]}`}
                                    alt={tournament.name}
                                    className="w-full h-[500px] object-cover rounded-3xl mb-12 shadow-2xl shadow-slate-900/10"
                                />
                            ) : null}

                            <div className="mb-12">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">About tournament</h3>
                                <p className="text-lg text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{tournament.description}</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 py-10 border-y border-slate-50">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">Start date</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">End date</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">Sport</p>
                                    <p className="text-sm font-bold text-slate-900 capitalize">{tournament.sportType}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">Location</p>
                                    <p className="text-sm font-bold text-slate-900">{tournament.location?.city || tournament.venue?.location?.city || tournament.venue?.name || 'TBD'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">Capacity</p>
                                    <p className="text-sm font-bold text-slate-900">{tournament.maxTeams} {tournament.registrationType === 'solo' ? 'spots' : 'teams'} max</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
                                    {tournament.registrationType === 'solo' ? 'Registered participants' : 'Registered teams'} ({tournament.registrations?.length || 0})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tournament.registrations?.map((reg) => (
                                        <div key={reg._id} className="flex items-center p-6 border border-slate-100 rounded-3xl bg-slate-50 group hover:border-slate-900 transition-all">
                                            <FiCheckCircle className="text-slate-900 mr-4" />
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                                                {tournament.registrationType === 'solo' ? reg.registeredBy?.name : (reg.team?.name || 'Deleted Team')}
                                            </span>
                                        </div>
                                    ))}
                                    {(!tournament.registrations || tournament.registrations.length === 0) && (
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic ml-1">No teams registered yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-10 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-10">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Tournament entry</h3>

                            <div className="space-y-8">
                                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Registration fee</p>
                                    <p className="text-3xl font-bold">
                                        {tournament.entryFee > 0 ? `Rs. ${tournament.entryFee}` : 'Free'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3 ml-1">Registration deadline</p>
                                    <p className={`font-bold text-sm tracking-tight ${isDeadlinePassed ? 'text-rose-600' : 'text-slate-900'}`}>
                                        {new Date(tournament.registrationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>

                                {user ? (
                                    user.role === 'customer' ? (
                                        <>
                                            {!isRegistered ? (
                                                <>
                                                    {tournament.registrationType === 'team' ? (
                                                        <div className="pb-4">
                                                            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3 ml-1">Select your team</label>
                                                            <select
                                                                className="input w-full bg-slate-50 border-slate-100 focus:border-slate-900 transition-all rounded-xl"
                                                                value={selectedTeam}
                                                                onChange={(e) => setSelectedTeam(e.target.value)}
                                                                disabled={isDeadlinePassed || registering}
                                                            >
                                                                <option value="">-- Choose team --</option>
                                                                {myTeams
                                                                    .filter(t => t.sport.toLowerCase() === tournament.sportType.toLowerCase())
                                                                    .map(team => (
                                                                        <option key={team._id} value={team._id}>{team.name}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            {myTeams.filter(t => t.sport.toLowerCase() === tournament.sportType.toLowerCase()).length === 0 && (
                                                                <p className="text-[10px] font-bold text-rose-500 mt-4 uppercase tracking-widest ml-1">
                                                                    No teams found for {tournament.sportType}.
                                                                    <button onClick={() => navigate('/my-teams')} className="ml-2 underline text-slate-900">Create one</button>
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="pb-6">
                                                            <p className="text-sm font-bold text-slate-900 tracking-tight leading-relaxed mb-4 ml-1">
                                                                Ready to compete in this {tournament.sportType} tournament? Register now to secure your spot!
                                                            </p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={handleRegister}
                                                        disabled={isDeadlinePassed || registering || (!selectedTeam && tournament.registrationType === 'team')}
                                                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-900/10"
                                                    >
                                                        {registering ? 'Processing...' : (tournament.entryFee > 0 ? `Pay Rs. ${tournament.entryFee} & Register` : 'Register now')}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="bg-emerald-50 text-emerald-600 p-6 rounded-3xl flex items-center border border-emerald-100">
                                                    <FiCheckCircle className="mr-4" size={24} />
                                                    <span className="text-xs font-bold uppercase tracking-widest">
                                                        {tournament.registrationType === 'solo' ? 'You are registered!' : 'Your team is registered!'}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-400 text-center text-[10px] font-bold uppercase tracking-widest italic pt-4">Only customers can register.</p>
                                    )
                                ) : (
                                    <button onClick={() => navigate('/login')} className="w-full py-4 border border-slate-200 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                                        Login to register
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetail;
