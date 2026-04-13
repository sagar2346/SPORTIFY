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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 relative animate-scale-up border border-gray-100 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-3xl font-bold mb-8 text-gray-900 uppercase tracking-tight">Rate Your Experience</h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="transition-transform hover:scale-125 focus:outline-none"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <FiStar
                                        size={36}
                                        className={`transition-colors ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                            {rating === 0 ? 'Select Rating' :
                                rating === 1 ? 'Poor' :
                                    rating === 2 ? 'Fair' :
                                        rating === 3 ? 'Good' :
                                            rating === 4 ? 'Great' : 'Excellent'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                            Your Comments (Optional)
                        </label>
                        <textarea
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none shadow-inner font-medium"
                            rows={4}
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                            Add Images (Optional)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all group shadow-inner">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiUpload className="w-10 h-10 mb-3 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        Upload Photos
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold">UP TO 5MB</p>
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
                            <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest">
                                    {images.length} Image(s) selected
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
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
