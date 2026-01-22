import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VenueForm from '../components/venues/VenueForm';
import { venueService } from '../services/api';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';

const AddVenue = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData, newImages) => {
        setLoading(true);
        try {
            const data = { ...formData, venueImages: newImages };
            await venueService.createVenue(data);
            toast.success('Venue created successfully!');

            // Redirect based on role
            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/owner/dashboard');
            }
        } catch (error) {
            console.error('Error creating venue:', error);
            toast.error(error.response?.data?.message || 'Failed to create venue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Add New Venue</h1>
            <div className="card">
                <VenueForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    buttonText="Create Venue"
                />
            </div>
        </div>
    );
};

export default AddVenue;
