import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { footageService } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiVideo, FiActivity, FiInfo } from 'react-icons/fi';

const FootageView = () => {
    const { id } = useParams();
    const [footage, setFootage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFootage();
    }, [id]);

    const loadFootage = async () => {
        try {
            const response = await footageService.getAll();
            const current = response.data.data.find(f => f._id === id);
            setFootage(current);
        } catch (error) {
            toast.error('Failed to load footage details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!footage) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <p className="text-gray-500">Footage not found.</p>
                <Link to="/dashboard" className="text-primary-600 hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    const getEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors font-medium">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>

            <div className="space-y-6 animate-fade-in">
                {/* Video Section */}
                <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl relative border-4 border-white">
                    <iframe
                        className="w-full h-full"
                        src={getEmbedUrl(footage.videoUrl)}
                        title={footage.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="card h-full">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{footage.title}</h1>
                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-semibold">
                                    <FiActivity className="mr-1.5" /> Analysis Ready
                                </span>
                                <span>Uploaded {new Date(footage.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                                    <FiInfo className="mr-2 text-primary-600" /> Description
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {footage.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="card bg-gray-50/50 border-primary-100 border-2">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                                <FiActivity className="mr-2 text-primary-600" /> Professional Notes
                            </h3>
                            <p className="text-sm text-gray-600 italic leading-relaxed">
                                "{footage.analysisText}"
                            </p>
                            <div className="mt-4 pt-4 border-t border-primary-100 flex items-center justify-between text-xs text-primary-400">
                                <span className="uppercase tracking-widest font-bold">Admin Insights</span>
                                <FiVideo />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FootageView;

