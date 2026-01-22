import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { messageService } from '../../services/api';
import { FiMail, FiMessageSquare, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';

const CustomerMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await messageService.getMessages();
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await messageService.deleteMessage(id);
            toast.success('Message deleted successfully');
            setMessages(messages.filter(msg => msg._id !== id));
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        }
    };

    const handleReplyClick = (msg) => {
        setSelectedMessage(msg);
        setReplyModalOpen(true);
        setReplyText(''); // Reset text or prepopulate if needed
    };

    const handleCloseModal = () => {
        setReplyModalOpen(false);
        setSelectedMessage(null);
        setReplyText('');
    };

    const submitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSendingReply(true);
        try {
            await messageService.replyToMessage(selectedMessage._id, replyText);
            toast.success('Reply sent successfully');

            // Update local state to show it was replied to (if we had that field, which we added)
            setMessages(messages.map(m =>
                m._id === selectedMessage._id
                    ? { ...m, reply: replyText, repliedAt: new Date() }
                    : m
            ));

            handleCloseModal();
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Customer Messages</h2>
                <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-medium">
                    Total: {messages.length}
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <FiMail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="text-gray-500 mt-2">Messages sent by customers from the contact page will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {messages.map((msg) => (
                        <div key={msg._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{msg.subject}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <span className="font-medium text-gray-900 mr-2">{msg.name}</span>
                                        <span>&lt;{msg.email}&gt;</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 block">
                                        {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!msg.reply && (
                                        <button
                                            onClick={() => handleReplyClick(msg)}
                                            className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium mr-3"
                                        >
                                            <FiMessageSquare className="mr-1" /> Reply
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                                    >
                                        <FiTrash2 className="mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded p-4 text-gray-700 whitespace-pre-wrap mb-4">
                                {msg.message}
                            </div>

                            {msg.reply && (
                                <div className="bg-green-50 border border-green-100 rounded p-4 ml-8">
                                    <div className="flex items-center text-green-800 text-sm font-semibold mb-2">
                                        <FiCheck className="mr-1" /> Replied on {new Date(msg.repliedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {msg.reply}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Modal */}
            {replyModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Reply to {selectedMessage?.name}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={submitReply} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <div className="p-3 bg-gray-50 rounded text-gray-600 text-sm italic border">
                                    {selectedMessage?.message}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Reply
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    rows="5"
                                    placeholder="Type your reply here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingReply}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {sendingReply ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerMessages;
