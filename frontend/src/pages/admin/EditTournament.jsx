import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tournamentService, venueService } from '../../services/api';
import toast from 'react-hot-toast';

const EditTournament = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [venues, setVenues] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sportType: 'football',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        maxTeams: 8,
        entryFee: 0,
        venue: '',
        status: 'open',
        location: {
            address: '',
            city: ''
        }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [venueRes, tournamentRes] = await Promise.all([
                venueService.getVenues(),
                tournamentService.getTournament(id)
            ]);

            setVenues(venueRes.data.data || []);

            const t = tournamentRes.data.data;
            setFormData({
                name: t.name,
                description: t.description,
                sportType: t.sportType,
                startDate: new Date(t.startDate).toISOString().split('T')[0],
                endDate: new Date(t.endDate).toISOString().split('T')[0],
                registrationDeadline: new Date(t.registrationDeadline).toISOString().split('T')[0],
                maxTeams: t.maxTeams,
                entryFee: t.entryFee,
                venue: t.venue?._id || '',
                status: t.status,
                location: t.location || { address: '', city: '' }
            });
        } catch (error) {
            toast.error('Failed to load tournament data');
            navigate('/admin/dashboard');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = { ...formData };
        if (!submitData.venue) {
            delete submitData.venue;
        }

        try {
            await tournamentService.updateTournament(id, submitData);
            toast.success('Tournament updated successfully!');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update tournament');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="card">
                <h1 className="text-2xl font-bold mb-6">Edit Tournament</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Venue Selection First */}
                        <div className="col-span-2 border-b pb-4">
                            <h3 className="text-lg font-medium mb-4">Location Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Existing Venue</label>
                                    <select
                                        name="venue"
                                        className="input w-full"
                                        value={formData.venue}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Manual Address / Other --</option>
                                        {venues.map(v => (
                                            <option key={v._id} value={v._id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {!formData.venue && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="location.city"
                                                className="input w-full"
                                                value={formData.location.city}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                            <input
                                                type="text"
                                                name="location.address"
                                                className="input w-full"
                                                value={formData.location.address}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="input w-full"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                className="input w-full"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sport Type</label>
                            <select
                                name="sportType"
                                required
                                className="input w-full"
                                value={formData.sportType}
                                onChange={handleChange}
                            >
                                <option value="football">Football</option>
                                <option value="futsal">Futsal</option>
                                <option value="basketball">Basketball</option>
                                <option value="cricket">Cricket</option>
                                <option value="badminton">Badminton</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                required
                                className="input w-full font-bold text-primary-600"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="open">OPEN (Accepting Registrations)</option>
                                <option value="ongoing">ONGOING (In Progress)</option>
                                <option value="completed">COMPLETED</option>
                                <option value="cancelled">CANCELLED</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Teams</label>
                            <input
                                type="number"
                                name="maxTeams"
                                required
                                min="2"
                                className="input w-full"
                                value={formData.maxTeams}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee (Rs.)</label>
                            <input
                                type="number"
                                name="entryFee"
                                required
                                min="0"
                                className="input w-full"
                                value={formData.entryFee}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    className="input w-full"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    className="input w-full"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                                <input
                                    type="date"
                                    name="registrationDeadline"
                                    required
                                    className="input w-full"
                                    value={formData.registrationDeadline}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary px-8"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTournament;
