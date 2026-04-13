import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { messageService } from '../services/api';
import { useEffect, useState } from 'react';
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

    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            toast.error('You must be logged in to contact us.', {
                id: 'contact-auth-error' // Prevents duplicate toasts
            });
        }
    }, [user, loading]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <div className="text-center mb-24 animate-fade-in px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 tracking-tight">Contact us</h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">We're here to help you with any questions or concerns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Contact Info */}
                <div className="lg:col-span-5 space-y-16 animate-slide-right">
                    <div className="space-y-12">
                        <div className="flex items-start group">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-500">
                                    <FiMail size={28} />
                                </div>
                            </div>
                            <div className="ml-8">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email us</h3>
                                <p className="text-xl font-bold text-slate-900 tracking-tight">support@sportify.com</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">24/7 Support available</p>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-500">
                                    <FiPhone size={28} />
                                </div>
                            </div>
                            <div className="ml-8">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Call us</h3>
                                <p className="text-xl font-bold text-slate-900 tracking-tight">+977 9827927767</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Direct response line</p>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-500">
                                    <FiMapPin size={28} />
                                </div>
                            </div>
                            <div className="ml-8">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Our location</h3>
                                <div className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                                    Damak-09, Jhapa<br />
                                    Saraswati tol
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative group">
                        <img src={contactMap} alt="Contact Location Map" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-500" />
                        <div className="absolute bottom-8 left-8 right-8 p-5 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <p className="text-[10px] font-bold uppercase text-slate-900 tracking-widest flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Support status
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-7 animate-slide-left">
                    <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-12 text-slate-900 tracking-tight">Send a message</h2>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 ml-1">Your name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-900 transition-all font-bold text-slate-900 placeholder-slate-300"
                                            value={user?.name || formData.name}
                                            onChange={handleChange}
                                            disabled={!!user}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 ml-1">Your email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-900 transition-all font-bold text-slate-900 placeholder-slate-300"
                                            value={user?.email || formData.email}
                                            onChange={handleChange}
                                            disabled={!!user}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-900 transition-all font-bold text-slate-900 placeholder-slate-300"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4 ml-1">Your message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="6"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-900 transition-all font-medium text-slate-900 placeholder-slate-300 resize-none leading-relaxed"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Describe your request in detail..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
                                    disabled={sending}
                                >
                                    {sending ? 'Sending...' : 'Send message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
