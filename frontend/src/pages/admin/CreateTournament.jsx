import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService, venueService } from '../../services/api';
import toast from 'react-hot-toast';

const CreateTournament = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        registrationType: 'team',
        venue: '',
        location: {
            address: '',
            city: ''
        }
    });

    useEffect(() => {
        loadVenues();
    }, []);

    const loadVenues = async () => {
        try {
            const response = await venueService.getVenues();
            setVenues(response.data.data || []);
        } catch (error) {
            console.error('Error loading venues:', error);
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

        // Prepare data - remove empty venue to avoid CastError
        const submitData = { ...formData };
        if (!submitData.venue) {
            delete submitData.venue;
        }

        try {
            await tournamentService.createTournament(submitData);
            toast.success('Tournament created successfully!');
            navigate('/tournaments');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create tournament');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="card">
                <h1 className="text-2xl font-bold mb-6">Create New Tournament</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                placeholder="e.g. Kathmandu"
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
                                                placeholder="Street address, neighborhood..."
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
                                placeholder="e.g. Summer Championship 2026"
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
                                placeholder="Describe the tournament, rules, prizes, etc."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
                            <select
                                name="registrationType"
                                required
                                className="input w-full font-bold"
                                value={formData.registrationType}
                                onChange={handleChange}
                            >
                                <option value="team">Team-based (Groups)</option>
                                <option value="solo">Individual-based (Solo)</option>
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                                {formData.registrationType === 'team' ? 'Requires teams to register' : 'Users register directly'}
                            </p>
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
                                <option value="tennis">Tennis</option>
                                <option value="badminton">Badminton</option>
                                <option value="swimming">Swimming</option>
                                <option value="volleyball">Volleyball</option>
                                <option value="cricket">Cricket</option>
                                <option value="gym">Gym</option>
                                <option value="table_tennis">Table Tennis</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {!formData.venue && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Poster / Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    className="input w-full"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Recommended size: 1200x600px</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.registrationType === 'solo' ? 'Max Participants' : 'Max Teams'}
                            </label>
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
                            {loading ? 'Creating...' : 'Create Tournament'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTournament;
