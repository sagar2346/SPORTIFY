import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { messageService } from '../services/api';
import { FiMail, FiCheck, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Messages</h1>
                <Link to="/contact" className="btn btn-primary">
                    New Message
                </Link>
            </div>

            {messages.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center border">
                    <FiMail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="text-gray-500 mt-2">Send a message to our support team and it will appear here.</p>
                    <Link to="/contact" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
                        Contact Support
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mr-3">{msg.subject}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${msg.reply ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {msg.reply ? 'Replied' : 'Pending'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <FiClock className="mr-1" />
                                        {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded p-4 text-gray-700 whitespace-pre-wrap mb-4 border-l-4 border-primary-300">
                                {msg.message}
                            </div>

                            {msg.reply ? (
                                <div className="bg-green-50 border border-green-100 rounded p-4 ml-8 animate-fade-in">
                                    <div className="flex items-center text-green-800 text-sm font-semibold mb-2">
                                        <FiCheck className="mr-1" /> Support Replied on {new Date(msg.repliedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {msg.reply}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic ml-2">Waiting for admin reply...</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMessages;
