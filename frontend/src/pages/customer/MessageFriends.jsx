import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUserPlus, FiMail, FiUsers, FiSend, FiX } from 'react-icons/fi';

const MessageFriends = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Forms
    const [newContact, setNewContact] = useState({ name: '', email: '' });
    const [messageData, setMessageData] = useState({ subject: '', message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const res = await userService.getContacts();
            setContacts(res.data.data);
        } catch (error) {
            console.error('Error loading contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        try {
            await userService.addContact(newContact);
            toast.success('Friend added successfully');
            setShowAddModal(false);
            setNewContact({ name: '', email: '' });
            loadContacts();
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error(error.response?.data?.message || 'Failed to add friend');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedContact) return;

        setSending(true);
        try {
            await userService.sendContactEmail({
                email: selectedContact.email,
                subject: messageData.subject,
                message: messageData.message
            });
            toast.success('Email sent successfully!');
            setShowMessageModal(false);
            setMessageData({ subject: '', message: '' });
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const openMessageModal = (contact) => {
        setSelectedContact(contact);
        setShowMessageModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FiUsers className="text-primary-600" />
                        Message Friends
                    </h1>
                    <p className="text-gray-600 mt-2">Save your friends' contacts and send them emails directly.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <FiUserPlus />
                    Add Friend
                </button>
            </div>

            {contacts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FiUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No friends added yet</h3>
                    <p className="text-gray-500 mb-6">Add your friends to easily send them messages.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-primary-600 font-medium hover:text-primary-700"
                    >
                        Add your first friend
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((contact) => (
                        <div key={contact._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                                    <p className="text-gray-600 flex items-center gap-2 text-sm mt-1">
                                        <FiMail className="text-gray-400" />
                                        {contact.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => openMessageModal(contact)}
                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                    title="Send Message"
                                >
                                    <FiSend className="text-xl" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Friend Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Friend</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleAddContact}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors"
                                >
                                    Save Friend
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Message Modal */}
            {showMessageModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Message to {selectedContact.name}</h3>
                            <button onClick={() => setShowMessageModal(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        value={messageData.subject}
                                        onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        value={messageData.message}
                                        onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                                        placeholder="Write your message here. It will be sent as an email."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                                >
                                    {sending ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageFriends;
