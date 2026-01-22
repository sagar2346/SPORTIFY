import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VenueForm from '../components/venues/VenueForm';
import { venueService } from '../services/api';
import toast from 'react-hot-toast';

const EditVenue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadVenue();
    }, [id]);

    const loadVenue = async () => {
        try {
            const response = await venueService.getVenue(id);
            setVenue(response.data.data);
        } catch (error) {
            console.error('Error loading venue:', error);
            toast.error('Failed to load venue details');
            navigate('/owner/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData, newImages) => {
        setSaving(true);
        try {
            const data = { ...formData, images: newImages };
            // Remove 'images' array of strings from data because create/update Venue expects images to be passed differently or handled by backend, 
            // but here we are sending newImages as files. 
            // The API service logic for updateVenue uses FormData, so we need to be careful.
            // The service implementation handles appending keys.
            // Existing images are inside formData.images (strings). New images are in newImages (File objects).
            // We pass both. The backend should be smart enough or we rely on the service to handle it.
            // Re-reading service: it iterates keys. Arrays are appended item by item.

            await venueService.updateVenue(id, data);
            toast.success('Venue updated successfully!');
            navigate('/owner/dashboard');
        } catch (error) {
            console.error('Error updating venue:', error);
            toast.error(error.response?.data?.message || 'Failed to update venue');
        } finally {
            setSaving(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Edit Venue</h1>
            <div className="card">
                <VenueForm
                    initialData={venue}
                    onSubmit={handleSubmit}
                    loading={saving}
                    buttonText="Save Changes"
                />
            </div>
        </div>
    );
};

export default EditVenue;
