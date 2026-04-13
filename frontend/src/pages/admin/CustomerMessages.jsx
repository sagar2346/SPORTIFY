import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { messageService } from '../../services/api';
import { FiMail, FiMessageSquare, FiX, FiCheck, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import ConfirmModal from '../../components/common/ConfirmModal';

const CustomerMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!idToDelete) return;
        
        setIsDeleting(true);
        try {
            await messageService.deleteMessage(idToDelete);
            toast.success('Message deleted successfully');
            setMessages(messages.filter(msg => msg._id !== idToDelete));
            setIsDeleteModalOpen(false);
            setIdToDelete(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        } finally {
            setIsDeleting(false);
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
                <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-bold">
                    Total: {messages.length}
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <FiMail className="mx-auto h-16 w-16 text-gray-400 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-gray-900">No messages yet</h3>
                    <p className="text-gray-500 mt-2">Messages sent by customers from the contact page will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {messages.map((msg) => (
                        <div key={msg._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-primary-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{msg.subject}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <span className="font-bold text-gray-900 mr-2">{msg.name}</span>
                                        <span>&lt;{msg.email}&gt;</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 block font-medium">
                                        {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="flex items-center justify-end mt-2 space-x-4">
                                        {!msg.reply && (
                                            <button
                                                onClick={() => handleReplyClick(msg)}
                                                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-bold transition-colors"
                                            >
                                                <FiMessageSquare className="mr-1" /> Reply
                                            </button>
                                        )}
                                            <button
                                                onClick={() => handleDeleteClick(msg._id)}
                                                className="inline-flex items-center text-sm text-red-600 hover:text-red-800 font-bold transition-colors"
                                            >
                                                <FiTrash2 className="mr-1" /> Delete
                                            </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 text-gray-700 whitespace-pre-wrap mb-4 border border-gray-100 leading-relaxed">
                                {msg.message}
                            </div>

                            {msg.reply && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-5 ml-8 relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-xl"></div>
                                    <div className="flex items-center text-green-800 text-sm font-bold mb-2">
                                        <FiCheck className="mr-1" /> Replied on {new Date(msg.repliedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
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
                <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 animate-slide-up">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                Reply to {selectedMessage?.name}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={submitReply} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Customer Message
                                </label>
                                <div className="p-4 bg-gray-50 rounded-xl text-gray-600 text-sm italic border border-gray-100 leading-relaxed">
                                    "{selectedMessage?.message}"
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Your Reply
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium resize-none shadow-sm"
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
                                    className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingReply}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {sendingReply ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Message"
                message="Are you sure you want to delete this message? This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Delete Message"}
                type="danger"
            />
        </div>
    );
};

export default CustomerMessages;
