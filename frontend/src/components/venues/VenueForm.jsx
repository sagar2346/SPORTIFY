// Venue Form Component for SPORTIFY
import { useState, useEffect } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import LocationPickerMap from './LocationPickerMap';

const VenueForm = ({ initialData, onSubmit, loading, buttonText }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        sportTypes: [],
        basePrice: '',
        images: [], // For existing images
        latitude: '',
        longitude: ''
    });
    const [newImages, setNewImages] = useState([]); // For new uploads
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                address: initialData.location?.address || '',
                city: initialData.location?.city || '',
                state: initialData.location?.state || '',
                latitude: initialData.location?.coordinates?.latitude || '',
                longitude: initialData.location?.coordinates?.longitude || '',
                sportTypes: initialData.sportTypes || [],
                basePrice: initialData.basePrice || '',
                images: initialData.images || []
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSportTypeChange = (e) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            sportTypes: options
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imagePath) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== imagePath)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, newImages);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="input w-full"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($/hr)</label>
                    <input
                        type="number"
                        name="basePrice"
                        required
                        min="0"
                        className="input w-full"
                        value={formData.basePrice}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        required
                        className="input w-full"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        type="text"
                        name="city"
                        required
                        className="input w-full"
                        value={formData.city}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                        type="text"
                        name="state"
                        required
                        className="input w-full"
                        value={formData.state}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Detailed Location (Click on map to set)</label>
                <LocationPickerMap
                    onLocationSelect={async (loc) => {
                        setFormData(prev => ({
                            ...prev,
                            latitude: loc.latitude,
                            longitude: loc.longitude
                        }));

                        // Reverse Geocoding
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`);
                            const data = await response.json();

                            if (data && data.address) {
                                setFormData(prev => ({
                                    ...prev,
                                    address: data.address.road || data.address.suburb || data.address.hamlet || prev.address,
                                    city: data.address.city || data.address.town || data.address.village || data.address.county || prev.city,
                                    state: data.address.state || prev.state,
                                }));
                            }
                        } catch (error) {
                            console.error("Error fetching address:", error);
                        }
                    }}
                    initialLocation={formData.latitude && formData.longitude ? { latitude: formData.latitude, longitude: formData.longitude } : null}
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-xs text-gray-500">Latitude</label>
                        <input type="text" name="latitude" value={formData.latitude} readOnly className="input w-full bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Longitude</label>
                        <input type="text" name="longitude" value={formData.longitude} readOnly className="input w-full bg-gray-50" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport Types (Hold Ctrl/Cmd to select multiple)</label>
                <select
                    multiple
                    name="sportTypes"
                    required
                    className="input w-full h-32"
                    value={formData.sportTypes}
                    onChange={handleSportTypeChange}
                >
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="tennis">Tennis</option>
                    <option value="badminton">Badminton</option>
                    <option value="swimming">Swimming</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="cricket">Cricket</option>
                    <option value="gym">Gym</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

                {/* Existing Images */}
                {formData.images.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Current Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={`http://localhost:5001${img}`}
                                        alt={`Venue ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Image Previews */}
                {previews.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">New Uploads:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FiUpload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-8"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                    ) : (
                        buttonText
                    )}
                </button>
            </div>
        </form>
    );
};

export default VenueForm;
