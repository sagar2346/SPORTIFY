import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { messageService } from '../services/api';
import contactMap from '../assets/contact_map.png';

const Contact = () => {
    const { user, loading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        toast.error('You must be logged in to contact us.');
        return <Navigate to="/login" replace />;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);

        // Use user data if available to ensure consistency, though backend enforces it from token
        const messageData = {
            ...formData,
            name: user.name || formData.name, // Fallback if user object structure varies
            email: user.email || formData.email
        };

        messageService.sendMessage(messageData)
            .then(() => {
                toast.success('Message sent successfully! We will get back to you soon.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            })
            .catch((err) => {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
            })
            .finally(() => {
                setSending(false);
            });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-xl text-gray-600">We'd love to hear from you. Get in touch with us.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div>
                    <div className="space-y-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                                    <FiMail size={24} />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Email</h3>
                                <p className="mt-1 text-gray-600">support@sportify.com</p>
                                <p className="mt-1 text-gray-600">info@sportify.com</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                                    <FiPhone size={24} />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                                <p className="mt-1 text-gray-600">+977 9827927767</p>
                                <p className="mt-1 text-gray-600">+9763509969</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                                    <FiMapPin size={24} />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Office</h3>
                                <p className="mt-1 text-gray-600">
                                    Damak-09, Jhapa<br />
                                    Saraswati Tol
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 h-64 bg-gray-200 rounded-lg overflow-hidden border shadow-sm">
                        <img src={contactMap} alt="Contact Location Map" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="input w-full bg-gray-100"
                                value={user?.name || formData.name}
                                onChange={handleChange}
                                disabled={!!user} // Disable if user is logged in
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="input w-full bg-gray-100"
                                value={user?.email || formData.email}
                                onChange={handleChange}
                                disabled={!!user} // Disable if user is logged in
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                required
                                className="input w-full"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                name="message"
                                required
                                rows="4"
                                className="input w-full"
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={sending}>
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
