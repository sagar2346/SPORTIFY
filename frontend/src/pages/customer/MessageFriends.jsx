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
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 tracking-tight">
                        <FiUsers className="text-slate-400" />
                        Messages
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Send direct messages to your contacts.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10"
                >
                    <FiUserPlus className="mr-2" />
                    Add friend
                </button>
            </div>

            {contacts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-sm border border-slate-100">
                        <FiUsers size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No contacts found</h3>
                    <p className="text-sm text-slate-500 mb-10 font-medium">You haven't added any contacts to your list yet.</p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest"
                        >
                            Add first contact
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contacts.map((contact) => (
                        <div key={contact._id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-900/10 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900">{contact.name}</h3>
                                    <p className="text-slate-500 flex items-center gap-2 text-xs mt-2 font-medium">
                                        <FiMail className="text-slate-400" />
                                        {contact.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => openMessageModal(contact)}
                                    className="p-4 text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                    title="Send Message"
                                >
                                    <FiSend size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Friend Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] max-w-md w-full p-10 shadow-2xl border border-slate-100 relative">
                        <div className="flex justify-between items-center mb-8 text-center">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-900">Add friend</h3>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Register new contact</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddContact} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Contact name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:text-slate-300"
                                        placeholder="Full name"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:text-slate-300"
                                        placeholder="friend@example.com"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full btn btn-primary py-5 rounded-xl shadow-xl shadow-slate-900/10 font-bold uppercase tracking-widest text-xs"
                            >
                                Save contact
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Message Modal */}
            {showMessageModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-10 shadow-2xl border border-slate-100 relative">
                        <div className="flex justify-between items-center mb-8 text-center">
                            <div className="flex-1 pr-12">
                                <h3 className="text-2xl font-bold text-slate-900 truncate">Message to {selectedContact.name}</h3>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Send email message</p>
                            </div>
                            <button onClick={() => setShowMessageModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:text-slate-300"
                                        placeholder="Message subject"
                                        value={messageData.subject}
                                        onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Message content</label>
                                    <textarea
                                        required
                                        rows="6"
                                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:text-slate-300 resize-none pt-4"
                                        value={messageData.message}
                                        onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full btn btn-primary py-5 rounded-xl shadow-xl shadow-slate-900/10 font-bold uppercase tracking-widest text-xs disabled:bg-slate-300"
                            >
                                {sending ? 'Sending...' : 'Send message'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageFriends;
