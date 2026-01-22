import { useState } from 'react';
import { FiStar, FiUpload, FiX } from 'react-icons/fi';
import { reviewService } from '../../services/api';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, onSuccess, bookingId, venueId }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            const reviewData = {
                bookingId,
                venueId,
                rating,
                comment,
                reviewImages: images
            };

            await reviewService.createReview(reviewData);
            toast.success('Review submitted successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Review Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-scale-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800">Rate this Venue</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <FiStar
                                        size={32}
                                        className={`transition-colors ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            {rating === 0 ? 'Select a rating' :
                                rating === 1 ? 'Poor' :
                                    rating === 2 ? 'Fair' :
                                        rating === 3 ? 'Good' :
                                            rating === 4 ? 'Very Good' : 'Excellent'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Share your experience (optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow resize-none"
                            rows={4}
                            placeholder="Tell us what you liked or didn't like..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Photos (optional)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {images.length > 0 && (
                            <p className="mt-2 text-sm text-green-600 font-medium text-center">
                                {images.length} image(s) selected
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
