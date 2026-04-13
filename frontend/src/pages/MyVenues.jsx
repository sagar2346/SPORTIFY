import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { venueService } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiSearch, FiFilter } from 'react-icons/fi';
import ConfirmModal from '../components/common/ConfirmModal';

const MyVenues = () => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Custom Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [venueToDelete, setVenueToDelete] = useState(null);

    useEffect(() => {
        loadVenues();
    }, []);

    const loadVenues = async () => {
        try {
            setLoading(true);
            const res = await venueService.getMyVenues();
            setVenues(res.data.data);
        } catch (error) {
            console.error('Error loading venues:', error);
            toast.error('Failed to load your venues');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVenue = (venue) => {
        setVenueToDelete(venue);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!venueToDelete) return;
        
        try {
            await venueService.deleteVenue(venueToDelete._id);
            toast.success('Venue deleted successfully');
            setIsDeleteModalOpen(false);
            setVenueToDelete(null);
            loadVenues();
        } catch (error) {
            console.error('Error deleting venue:', error);
            toast.error('Failed to delete venue');
        }
    };

    const filteredVenues = venues.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">My Venues</h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 inline-block">
                        Manage your properties and listings ({venues.length})
                    </p>
                </div>
                <Link 
                    to="/owner/add-venue" 
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all uppercase tracking-widest active:scale-95"
                >
                    <FiPlus size={18} />
                    Add New Venue
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search venues by name or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-600/20 outline-none transition-all text-sm font-medium"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest rounded-2xl border border-transparent hover:text-gray-900 hover:bg-gray-100 transition-all">
                    <FiFilter /> Filters
                </button>
            </div>

            {filteredVenues.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FiMapPin className="text-4xl text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">No venues found</h3>
                    <p className="text-gray-400 font-medium text-sm mb-8">
                        {searchTerm ? "Try a different search term or clear the filter." : "You haven't listed any venues yet. Start by adding your first property."}
                    </p>
                    {!searchTerm && (
                        <Link 
                            to="/owner/add-venue" 
                            className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-primary-100 hover:bg-primary-100 transition-all"
                        >
                            Create Your First Listing
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredVenues.map((venue) => (
                        <div 
                            key={venue._id} 
                            className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Image section */}
                                <div className="lg:w-72 h-64 lg:h-auto relative overflow-hidden">
                                    <img 
                                        src={venue.images?.[0] ? `http://localhost:5001${venue.images[0]}` : 'https://via.placeholder.com/400x300?text=No+Image'} 
                                        alt={venue.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                            venue.isApproved 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-amber-500 text-white'
                                        }`}>
                                            {venue.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content section */}
                                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-primary-600 mb-2">
                                                <div className="px-3 py-1 bg-primary-50 rounded-lg text-[10px] font-black uppercase tracking-wider border border-primary-100">
                                                    {venue.sportTypes?.[0] || 'Sports'}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                {venue.name}
                                            </h3>
                                            <div className="flex items-center text-gray-400 text-sm font-bold uppercase tracking-widest gap-2">
                                                <FiMapPin className="text-primary-500" />
                                                {venue.location.address}, {venue.location.city}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 lg:bg-gray-50 lg:p-2 lg:rounded-2xl">
                                            <Link 
                                                to={`/owner/edit-venue/${venue._id}`}
                                                className="p-4 bg-white text-gray-400 hover:text-primary-600 rounded-xl shadow-sm border border-gray-100 hover:border-primary-100 transition-all active:scale-90"
                                                title="Edit Venue"
                                            >
                                                <FiEdit size={20} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDeleteVenue(venue)}
                                                className="p-4 bg-white text-gray-400 hover:text-rose-600 rounded-xl shadow-sm border border-gray-100 hover:border-rose-100 transition-all active:scale-90"
                                                title="Delete Venue"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                            <p className="text-lg font-black text-gray-900 uppercase">Rs. {venue.basePrice}<span className="text-[10px] text-gray-400 ml-1">/hr</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-lg font-black text-gray-900 uppercase">{venue.rating?.average || '0.0'}</span>
                                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bookings</p>
                                            <p className="text-lg font-black text-gray-900 uppercase">{venue.totalBookings || 0}</p>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Link 
                                                to={`/venues/${venue._id}`}
                                                className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] hover:translate-x-1 transition-transform inline-flex items-center gap-2"
                                            >
                                                Preview Page
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Venue"
                message={`Are you sure you want to delete "${venueToDelete?.name}"? All associated data will be permanently removed.`}
                confirmText="Delete Venue"
                cancelText="Keep Venue"
                type="danger"
            />
        </div>
    );
};

export default MyVenues;
