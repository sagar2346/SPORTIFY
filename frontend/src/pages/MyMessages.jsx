import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { messageService } from '../services/api';
import { FiMail, FiCheck, FiClock, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, listItemVariants } from '../utils/motion';

const MyMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await messageService.getMyMessages();
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 border-t-transparent"></div>
            </div>
        );
    }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="max-w-4xl mx-auto"
    >
                <motion.div variants={fadeIn('down', 'tween', 0.1, 0.6)} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">My messages</h1>
                        <p className="text-slate-500 mt-2 font-medium">Track your conversations with our support team.</p>
                    </div>
                    <Link to="/contact">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20"
                        >
                            <FiMessageSquare size={16} />
                            New message
                        </motion.button>
                    </Link>
                </motion.div>

                {messages.length === 0 ? (
                    <motion.div
                        variants={fadeIn('up', 'tween', 0.2, 0.6)}
                        className="bg-white rounded-[3rem] shadow-sm p-16 text-center border border-slate-100 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner text-slate-200">
                            <FiMail size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">No messages yet</h3>
                        <p className="text-slate-500 font-medium mb-10 max-w-sm">When you contact our support team, your conversations will appear here.</p>
                        <Link to="/contact">
                            <button className="group flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest transition-all">
                                Send your first message
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={msg._id}
                                variants={listItemVariants}
                                className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-12 hover:shadow-2xl hover:border-slate-900/5 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl group-hover:bg-slate-100 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{msg.subject}</h3>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl border ${msg.reply ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {msg.reply ? 'Resolved' : 'In Progress'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest gap-2">
                                                <FiClock className="text-slate-900" />
                                                <span>{new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-slate-200">•</span>
                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 border-l-4 border-slate-900/10 rounded-tr-[2rem] rounded-br-[2rem] p-8 text-slate-600 mb-10 font-medium leading-relaxed italic relative">
                                        <span className="absolute -top-1 left-2 text-4xl text-slate-200 font-serif opacity-50">"</span>
                                        {msg.message}
                                        <span className="absolute -bottom-6 right-8 text-4xl text-slate-200 font-serif opacity-50">"</span>
                                    </div>

                                    {msg.reply ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-50/20 border border-emerald-100 rounded-[2.5rem] p-8 md:ml-12 relative shadow-sm"
                                        >
                                            <div className="flex items-center text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-emerald-50 pb-4">
                                                <FiCheck className="mr-3 text-lg" />
                                                <span>Support Response</span>
                                                <span className="mx-3 text-emerald-200 opacity-50">•</span>
                                                <span>{new Date(msg.repliedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="text-slate-900 font-bold leading-relaxed px-2">
                                                {msg.reply}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-3 ml-4">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Awaiting response</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
        </motion.div>
    );
};

export default MyMessages;
