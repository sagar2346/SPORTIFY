import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { teamService, authService, footageService, analysisRequestService, paymentService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiHash, FiMic, FiSend, FiUsers, FiCopy, FiLogOut, FiVideo, FiShield, FiActivity, FiX, FiInfo, FiUser, FiChevronDown, FiPlay, FiClock, FiArrowRight, FiCheckCircle, FiChevronRight, FiMenu, FiDollarSign, FiHeadphones, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
// PaymentModal removed as per manual contact requirement

const API_URL = 'http://localhost:5001'; // Or from import.meta.env

const TeamChat = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser } = useAuth();
    const [teams, setTeams] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [teamFootage, setTeamFootage] = useState([]);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [analysisRequests, setAnalysisRequests] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestFormData, setRequestFormData] = useState({ title: '', description: '' });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [uploadFormData, setUploadFormData] = useState({ title: '', description: '', videoUrl: '', analysisText: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // UI States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', sport: '', inviteCode: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('chat');

    const messagesEndRef = useRef(null);

    const getThumbnail = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop';
        
        // YouTube Thumbnail Extraction
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
        }
        
        // Fallback to high-quality sports action shot
        return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop';
    };

    // Initial Load
    useEffect(() => {
        loadTeams();
        fetchUser();

        // Socket Connection
        const newSocket = io(API_URL);
        setSocket(newSocket);

        return () => {
            if (currentUser) {
                newSocket.emit('user_offline', currentUser._id);
            }
            newSocket.close();
        };
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for messages and user status
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            if (activeTeam && message.team === activeTeam._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        socket.on('message_deleted', ({ messageId }) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        });

        socket.on('user_status_change', ({ userId, isOnline }) => {
            if (activeTeam) {
                setActiveTeam(prev => ({
                    ...prev,
                    members: prev.members.map(m =>
                        m.user?._id === userId ? { ...m, user: { ...m.user, isOnline } } : m
                    )
                }));
            }
        });

        return () => {
            socket.off('receive_message');
            socket.off('message_deleted');
            socket.off('user_status_change');
        };
    }, [socket, activeTeam]);

    // Admin Redirect to Dashboard version
    useEffect(() => {
        if (authUser?.role === 'admin' && location.pathname === '/my-teams') {
            navigate('/admin/teams-chat');
        }
    }, [authUser, location, navigate]);

    const fetchUser = async () => {
        try {
            const res = await authService.getMe();
            setCurrentUser(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (socket && currentUser) {
            socket.emit('user_online', currentUser._id);
        }
    }, [socket, currentUser]);

    const loadTeams = async () => {
        try {
            const res = await teamService.getMyTeams();
            setTeams(res.data.data);
        } catch (error) { toast.error('Failed to load teams'); }
    };

    const handleTeamSelect = async (team) => {
        try {
            const teamRes = await teamService.getTeam(team._id);
            const freshTeam = teamRes.data.data;
            setActiveTeam(freshTeam);

            if (socket) {
                socket.emit('join_team', freshTeam._id);
            }

            const [msgRes, footageRes, requestRes] = await Promise.all([
                teamService.getMessages(freshTeam._id),
                footageService.getAll(freshTeam._id),
                analysisRequestService.getByTeam(freshTeam._id)
            ]);
            setMessages(msgRes.data.data);
            setTeamFootage(footageRes.data.data);
            setAnalysisRequests(requestRes.data.data);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
        } catch (error) { 
            console.error('Error loading team data:', error.response?.data || error.message);
            toast.error('Failed to load team data'); 
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const messageData = {
            team: activeTeam._id,
            sender: currentUser._id,
            senderName: currentUser.name,
            content: inputText,
            type: 'text',
            createdAt: new Date()
        };

        socket.emit('send_message', { teamId: activeTeam._id, message: messageData });
        setInputText('');
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await teamService.deleteMessage(messageId);
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                await uploadVoice(blob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            toast.error('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const uploadVoice = async (blob) => {
        const toastId = toast.loading('Sending voice message...');
        try {
            const res = await teamService.uploadVoice(activeTeam._id, blob);
            const message = res.data.data;
            socket.emit('send_message', { teamId: activeTeam._id, message });
            toast.success('Sent!', { id: toastId });
        } catch (error) {
            toast.error('Failed to send voice', { id: toastId });
        }
    };

    const createTeam = async (e) => {
        e.preventDefault();
        try {
            await teamService.createTeam(formData);
            toast.success('Team created!');
            setShowCreateModal(false);
            loadTeams();
        } catch (error) { toast.error('Failed to create team'); }
    };

    const joinTeam = async (e) => {
        e.preventDefault();
        try {
            await teamService.joinTeam(formData.inviteCode);
            toast.success('Joined team!');
            setShowJoinModal(false);
            loadTeams();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to join'); }
    };

    const inviteAdmin = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            await teamService.addAdminToTeam(activeTeam._id, adminEmail);
            toast.success('Admin added to team!');
            setShowAdminModal(false);
            setAdminEmail('');
            handleTeamSelect(activeTeam); // Refresh team info
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add admin');
        } finally {
            setInviting(false);
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm(`Are you sure you want to leave ${activeTeam.name}?`)) return;

        try {
            await teamService.leaveTeam(activeTeam._id);
            toast.success('Successfully left the team');
            setActiveTeam(null);
            loadTeams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave team');
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm(`CRITICAL: Are you sure you want to DELETE ${activeTeam.name}? This will remove all messages and cannot be undone.`)) return;

        try {
            const toastId = toast.loading('Deleting team...');
            await teamService.deleteTeam(activeTeam._id);
            toast.success('Team deleted successfully', { id: toastId });
            setActiveTeam(null);
            setMessages([]);
            loadTeams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete team');
        }
    };

    const handlePayFine = async () => {
        setIsProcessingPayment(true);
        try {
            const response = await paymentService.initiateEsewaFinePayment(activeTeam._id);
            if (response.data.success) {
                const { formData, esewaUrl } = response.data;

                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', esewaUrl);

                for (const key in formData) {
                    const hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', key);
                    hiddenField.setAttribute('value', formData[key]);
                    form.appendChild(hiddenField);
                }

                document.body.appendChild(form);
                form.submit();
            } else {
                toast.error('Failed to initialize payment');
                setIsProcessingPayment(false);
            }
        } catch (error) {
            console.error('Fine payment init error:', error);
            toast.error(error.response?.data?.message || 'Error initializing fine payment');
            setIsProcessingPayment(false);
        }
    };

    const handleKickMember = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to kick ${userName} from the team?`)) return;

        try {
            await teamService.kickMember(activeTeam._id, userId);
            toast.success(`${userName} has been removed from the team`);
            handleTeamSelect(activeTeam); // Refresh team info
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to kick member');
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            await analysisRequestService.create({
                teamId: activeTeam._id,
                ...requestFormData
            });
            toast.success('Analysis request submitted!');
            setShowRequestModal(false);
            setRequestFormData({ title: '', description: '' });
            handleTeamSelect(activeTeam);
        } catch (error) {
            toast.error('Failed to submit request');
        }
    };

    const handleUploadFootage = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const data = {
                ...uploadFormData,
                teamId: activeTeam._id,
                requestId: selectedRequest?._id
            };
            await footageService.upload(data);
            toast.success('Footage uploaded successfully!');
            setShowUploadModal(false);
            setSelectedRequest(null);
            setUploadFormData({ title: '', description: '', videoUrl: '', analysisText: '' });
            handleTeamSelect(activeTeam);
        } catch (error) {
            toast.error('Failed to upload footage');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <div className="relative h-full flex flex-col md:flex-row bg-gray-50/50 font-sans overflow-hidden">
            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* 1. Channels Sidebar */}
            <aside className={`fixed md:relative top-0 z-[50] md:z-30 h-full w-80 bg-white border-r border-gray-100 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden md:w-0'}`}>
                <div className="p-8 border-b border-gray-50/50 md:hidden">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                        <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/10">
                            <FiShield className="text-white" size={20} />
                        </div>
                        <span>SPORTIFY</span>
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-8 space-y-4 custom-scrollbar">
                    <div className="px-5 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your teams</span>
                    </div>
                    {teams.map((team) => (
                        <button
                            key={team._id}
                            onClick={() => handleTeamSelect(team)}
                            className={`w-full group relative p-4 flex items-center gap-4 rounded-2xl transition-all duration-300 ${activeTeam?._id === team._id
                                ? 'bg-gray-50 border border-gray-100'
                                : 'hover:bg-gray-50/50 border border-transparent'}`}
                        >
                            {activeTeam?._id === team._id && (
                                <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full" />
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform duration-300 group-hover:scale-105 ${activeTeam?._id === team._id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/10'
                                : 'bg-gray-100 text-gray-400'}`}>
                                {team.name.charAt(0)}
                            </div>
                            <div className="text-left min-w-0 flex-1 ml-1">
                                <h3 className={`font-bold truncate text-sm transition-colors ${activeTeam?._id === team._id ? 'text-gray-900' : 'text-gray-500'}`}>{team.name}</h3>
                                <p className="text-[10px] text-gray-400 truncate font-bold uppercase tracking-wider mt-1">{team.sport}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative transition-colors z-20 h-full overflow-hidden">
                {activeTeam ? (
                    <div className="flex-1 flex flex-col bg-slate-50/30 min-h-0 relative">
                        {/* Chat Header */}
                        <div className="h-24 px-8 flex items-center justify-between bg-white border-b border-slate-50 z-10 shrink-0">
                            <div className="flex items-center gap-6 min-w-0 overflow-hidden">
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl md:hidden shrink-0">
                                    <FiMenu size={20} />
                                </button>
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-2.5 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl shrink-0">
                                    <FiMenu className={`transform transition-transform duration-500 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`} size={20} />
                                </button>
                                <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                                    {activeTab === 'chat' && <FiHash size={24} />}
                                    {activeTab === 'members' && <FiUsers size={24} />}
                                    {activeTab === 'footage' && <FiVideo size={24} />}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">{activeTeam.name}</h2>
                                    <div className="flex items-center gap-2.5 mt-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse shrink-0" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{activeTeam.sport} team</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Switcher - Premium Pills */}
                            <div className="hidden md:flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {[
                                    { id: 'chat', icon: FiHash, label: 'Chat' },
                                    { id: 'members', icon: FiUsers, label: 'Members' },
                                    { id: 'footage', icon: FiVideo, label: 'Footage' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile Tab Switcher */}
                            <div className="md:hidden flex bg-white border-t border-slate-100 fixed bottom-0 left-0 right-0 z-[40] px-4 py-2 justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                                {[
                                    { id: 'chat', icon: FiHash, label: 'Chat' },
                                    { id: 'members', icon: FiUsers, label: 'Members' },
                                    { id: 'footage', icon: FiVideo, label: 'Footage' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-900'}`}
                                    >
                                        <tab.icon size={18} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 md:gap-8 shrink-0">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Invite code</span>
                                    <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group cursor-copy active:scale-95"
                                        onClick={() => { navigator.clipboard.writeText(activeTeam.inviteCode); toast.success('Code copied!'); }}>
                                        <code className="text-xs font-mono font-bold text-slate-900 tracking-wider">#{activeTeam.inviteCode}</code>
                                        <FiCopy size={12} className="text-slate-300 group-hover:text-slate-900" />
                                    </div>
                                </div>

                                {activeTeam.createdBy?._id === currentUser?._id || activeTeam.createdBy === currentUser?._id ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowAdminModal(true)}
                                            className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-6 shadow-xl shadow-slate-900/10 font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center transition-all active:scale-95 gap-3"
                                        >
                                            <FiShield size={16} /> <span className="hidden xs:inline">Add admin</span>
                                            <span className="xs:hidden">Add</span>
                                        </button>
                                        <button
                                            onClick={handleDeleteTeam}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 h-12 w-12 shadow-sm font-bold rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-rose-100"
                                            title="Delete Team"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleLeaveTeam}
                                        className="flex items-center gap-3 px-6 h-12 rounded-2xl text-rose-600 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all border border-rose-100"
                                    >
                                        <FiLogOut size={16} /> <span className="hidden xs:inline">Leave team</span>
                                        <span className="xs:hidden">Leave</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Blocked Status Banner */}
                        {activeTeam.isBlocked && (
                            <div className="mx-6 md:mx-8 mt-6 mb-2 shrink-0">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-rose-50/80 backdrop-blur-xl border border-rose-100 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-rose-900/5 group"
                                >
                                    <div className="flex items-center gap-5 text-rose-600">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-100 group-hover:scale-110 transition-transform duration-500">
                                            <FiShield size={24} className="animate-pulse" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1">Account Restricted</h4>
                                            <p className="text-[11px] font-bold text-rose-500/80 leading-relaxed max-w-xl">
                                                Your team is currently blocked. To regain full access, please contact the administrator personally or pay the fine of <span className="text-rose-600 font-black">Rs. {activeTeam.fineAmount}</span> directly.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {activeTeam.fineAmount > 0 && (
                                            <button
                                                onClick={handlePayFine}
                                                disabled={isProcessingPayment}
                                                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[#61bb46] hover:bg-[#4da638] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-[#61bb46]/20 active:scale-95 disabled:opacity-75"
                                            >
                                                {isProcessingPayment ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <FiDollarSign />
                                                )}
                                                Pay with eSewa
                                            </button>
                                        )}
                                        <div className="hidden lg:flex flex-col items-end shrink-0 ml-4">
                                            <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest mb-1">Current Status</span>
                                            <div className="px-4 py-1.5 bg-rose-100 rounded-full text-[9px] font-black text-rose-600 uppercase tracking-widest shadow-sm">Blocked</div>
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Mobile Payment Button */}
                                {activeTeam.fineAmount > 0 && (
                                    <button
                                        onClick={handlePayFine}
                                        disabled={isProcessingPayment}
                                        className="sm:hidden w-full mt-3 flex items-center justify-center gap-2 px-6 py-4 bg-[#61bb46] hover:bg-[#4da638] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-[#61bb46]/20 active:scale-95 disabled:opacity-75"
                                    >
                                        {isProcessingPayment ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <FiDollarSign />
                                        )}
                                        Pay fine with eSewa
                                    </button>
                                )}
                            </div>
                        )}


                        {/* Split Body */}
                        <div className="flex-1 flex overflow-hidden min-h-0">
                            {/* Messages Container */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                {activeTab === 'chat' && (
                                    <>
                                        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 pb-32 md:pb-12 custom-scrollbar">
                                            <AnimatePresence>
                                                {messages.map((msg, idx) => {
                                                    const isMe = msg.sender === currentUser?._id;
                                                    return (
                                                        <motion.div
                                                            key={msg._id || idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                                                        >
                                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%]`}>
                                                                {!isMe && (
                                                                    <div className="flex items-center gap-3 mb-2.5 ml-1">
                                                                        <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[8px] font-bold text-slate-400 border border-slate-200">
                                                                            {msg.senderName?.charAt(0)}
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.senderName}</span>
                                                                    </div>
                                                                )}
                                                                <div className={`px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group/msg ${isMe
                                                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                                                    : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                                                                    } ${msg.type === 'audio' ? 'min-w-[240px] md:min-w-[300px]' : ''}`}>
                                                                    {isMe && msg._id && (
                                                                        <button
                                                                            onClick={() => handleDeleteMessage(msg._id)}
                                                                            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover/msg:opacity-100 transition-all"
                                                                            title="Delete message"
                                                                        >
                                                                            <FiTrash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                    {msg.type === 'audio' ? (
                                                                        <div className="py-2 w-full">
                                                                            <div className="flex items-center gap-3 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                                                                                <FiHeadphones /> Voice Message
                                                                            </div>
                                                                            <audio 
                                                                                controls 
                                                                                src={msg.audioUrl.startsWith('http') ? msg.audioUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${msg.audioUrl}`} 
                                                                                className="w-full h-8"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <p className="font-medium">{msg.content}</p>
                                                                    )}
                                                                </div>
                                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2.5 px-1">
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Panel - Floating Pill */}
                                        <div className="px-6 md:px-12 pb-24 md:pb-10 pt-4 bg-transparent relative z-10">
                                            <div className="max-w-5xl mx-auto flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5">
                                                <button
                                                    onMouseDown={startRecording}
                                                    onMouseUp={stopRecording}
                                                    onMouseLeave={stopRecording}
                                                    disabled={activeTeam?.isBlocked}
                                                    className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center shrink-0 ${activeTeam?.isBlocked
                                                        ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
                                                        : isRecording
                                                            ? 'bg-rose-500 text-white animate-pulse'
                                                            : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                                                    title={activeTeam?.isBlocked ? "Voice messaging restricted" : "Record voice message"}
                                                >
                                                    <FiMic size={20} />
                                                </button>

                                                <div className="flex-1 relative flex items-center">
                                                    <input
                                                        type="text"
                                                        value={inputText}
                                                        onChange={(e) => setInputText(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                        disabled={activeTeam?.isBlocked}
                                                        placeholder={activeTeam?.isBlocked ? "Functions restricted..." : "Type a message..."}
                                                        className={`w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-900 placeholder-slate-300 text-sm font-bold outline-none ${activeTeam?.isBlocked ? 'cursor-not-allowed text-slate-300' : ''}`}
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={!inputText.trim() || activeTeam?.isBlocked}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${activeTeam?.isBlocked
                                                        ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
                                                        : inputText.trim()
                                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                                            : 'bg-slate-50 text-slate-200'}`}
                                                >
                                                    <FiSend size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'members' && (
                                    <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 bg-white custom-scrollbar">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {activeTeam?.members?.map((member) => (
                                                <motion.div
                                                    key={member.user?._id || Math.random()}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="relative mb-6">
                                                            <div className="w-20 h-20 bg-white text-slate-400 rounded-[2rem] flex items-center justify-center font-bold text-2xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
                                                                {member.user?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${member.user?.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`} />
                                                        </div>

                                                        <h4 className="font-bold text-slate-900 text-lg">
                                                            {member.user?.name || 'Anonymous player'}
                                                        </h4>

                                                        <div className={`mt-4 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${member.role === 'leader' ? 'text-slate-900 bg-white border-slate-200' :
                                                            'text-slate-400 bg-white border-slate-100'
                                                            }`}>
                                                            {member.role === 'leader' ? 'Team leader' : 'Member'}
                                                        </div>

                                                        {activeTeam.createdBy?._id === currentUser?._id && member.user?._id !== currentUser?._id && (
                                                            <button
                                                                onClick={() => handleKickMember(member.user?._id, member.user?.name)}
                                                                className="mt-8 w-full py-4 bg-white text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 opacity-0 group-hover:opacity-100 border border-rose-50"
                                                            >
                                                                Remove member
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'footage' && (
                                    <div className="flex-1 overflow-y-auto p-8 md:p-14 bg-white space-y-16 custom-scrollbar">
                                        {/* Analysis Requests Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-12">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                            <FiActivity size={20} />
                                                        </div>
                                                        Analysis requests
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 ml-12">Get help analyzing your game performance</p>
                                                </div>
                                                {authUser?.role !== 'admin' && ((activeTeam.members?.find(m => m.user?._id === currentUser?._id || m.user === currentUser?._id)?.role === 'leader') || activeTeam.createdBy?._id === currentUser?._id) && (
                                                    <button
                                                        onClick={() => setShowRequestModal(true)}
                                                        disabled={activeTeam?.isBlocked}
                                                        className={`px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 group transition-all shadow-xl shadow-slate-900/10 active:scale-95 ${activeTeam?.isBlocked ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
                                                    >
                                                        <FiPlus className="group-hover:rotate-90 transition-transform duration-500" /> New request
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {analysisRequests.length === 0 ? (
                                                    <div className="col-span-full py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center">
                                                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-sm">
                                                            <FiActivity size={32} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No analysis requests yet</p>
                                                    </div>
                                                ) : (
                                                    analysisRequests.map(request => (
                                                        <motion.div
                                                            key={request._id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] hover:bg-white hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                                                        >
                                                            <div className="flex items-start justify-between mb-8">
                                                                <span className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border ${request.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                                                    {request.status}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                                    <FiClock size={10} />
                                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-slate-600 transition-colors">{request.title}</h4>
                                                            <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-2">{request.description}</p>
                                                            <div className="flex items-center justify-between pt-8 border-t border-slate-200/50">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-sm border border-slate-100">
                                                                        {request.requestedBy?.name?.charAt(0)}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Requested by</span>
                                                                        <span className="text-xs font-bold text-slate-900">
                                                                            {currentUser?.role === 'admin' ? 'Team Leader' : (request.requestedBy?.name || 'Unknown')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {currentUser?.role === 'admin' && request.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedRequest(request);
                                                                            setUploadFormData({ ...uploadFormData, title: request.title });
                                                                            setShowUploadModal(true);
                                                                        }}
                                                                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                                                    >
                                                                        Fulfill
                                                                    </button>
                                                                )}
                                                                {request.status === 'fulfilled' && request.footageId && (
                                                                    <Link
                                                                        to={`/footage/${request.footageId}`}
                                                                        className="h-10 px-5 flex items-center gap-3 rounded-xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                                                    >
                                                                        View footage <FiChevronRight />
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        {/* Footage List Section */}
                                        <div className="mt-20">
                                            <div className="flex items-center justify-between mb-12">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                            <FiVideo size={20} />
                                                        </div>
                                                        Match footage
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 ml-12">Watch and learn from your previous matches</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                {teamFootage.length === 0 ? (
                                                    <div className="col-span-full py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center">
                                                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-sm">
                                                            <FiVideo size={32} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No match videos found</p>
                                                    </div>
                                                ) : (
                                                    teamFootage.map(video => (
                                                        <motion.div
                                                            key={video._id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-700"
                                                        >
                                                            <Link to={`/footage/${video._id}`} className="block relative aspect-video bg-slate-900 group-hover:scale-105 transition-transform duration-1000 overflow-hidden">
                                                                <img 
                                                                    src={getThumbnail(video.videoUrl)} 
                                                                    alt={video.title}
                                                                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop';
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-500">
                                                                        <FiPlay size={24} className="text-white fill-white translate-x-0.5" />
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-5 right-5 px-3 py-1 bg-emerald-500 rounded-full text-[8px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                                                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" /> Analyzed
                                                                </div>
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                                                            </Link>
                                                            <div className="p-8">
                                                                <h4 className="text-lg font-bold text-slate-900 mb-4 truncate tracking-tight">{video.title}</h4>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(video.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <Link to={`/footage/${video._id}`} className="text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center gap-2">
                                                                        Open file <FiArrowRight />
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-in overflow-y-auto bg-slate-50">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-sm border border-slate-100">
                            <FiUsers size={44} className="text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Team hub</h2>
                        <p className="max-w-[340px] mx-auto text-sm text-slate-400 leading-relaxed font-medium">Join a team using an invite code or create a new team to start chatting with your teammates.</p>

                        <div className="mt-12 flex gap-4">
                            <button onClick={() => setShowJoinModal(true)} className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95">Join team</button>
                            <button onClick={() => setShowCreateModal(true)} className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95">Create team</button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <AnimatePresence>
                {showCreateModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onSubmit={createTeam} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-[500px] relative border border-slate-100">
                            <div className="mb-12 text-center">
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Create new team</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">Fill in the details to get started</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Team name</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all font-bold placeholder:text-slate-300" placeholder="e.g. Apex Predators" required onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sport category</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all font-bold placeholder:text-slate-300" placeholder="e.g. Football" required onChange={e => setFormData({ ...formData, sport: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl h-32 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all font-medium placeholder:text-slate-300 resize-none pt-4 leading-relaxed" placeholder="What is this team about?" onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 mt-12">
                                <button type="submit" className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-widest uppercase text-[10px] transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                    Create team
                                </button>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="w-full py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-colors">Discard</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
                {showJoinModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onSubmit={joinTeam} className="bg-white p-16 rounded-[3rem] shadow-2xl w-full max-w-[450px] text-center border border-slate-100">
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-900/20">
                                <FiHash size={36} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Join a team</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 mb-12">Enter your invite code</p>

                            <input className="w-full bg-slate-50 border border-slate-100 px-8 py-7 rounded-2xl mb-12 font-mono font-bold text-center text-4xl uppercase tracking-[0.2em] outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white transition-all shadow-inner placeholder:text-slate-200"
                                placeholder="----" required onChange={e => setFormData({ ...formData, inviteCode: e.target.value })} autoFocus />

                            <div className="flex flex-col gap-4">
                                <button type="submit" className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-widest uppercase text-[10px] transition-all shadow-xl shadow-slate-900/10 active:scale-95">Join team</button>
                                <button type="button" onClick={() => setShowJoinModal(false)} className="py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-colors">Return</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
                {showAdminModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onSubmit={inviteAdmin} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-[500px] border border-slate-100">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10">
                                    <FiShield size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Make admin</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Grant administrative access</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Representative email</label>
                                    <input type="email" className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold placeholder:text-slate-300" placeholder="official@organization.com" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Admins can manage the team, remove members, and request match analysis for the group.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mt-12">
                                <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Cancel</button>
                                <button type="submit" disabled={inviting} className="flex-[2] py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                    {inviting ? 'Saving...' : 'Confirm admin'}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
                {showRequestModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onSubmit={handleCreateRequest} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-[500px] border border-slate-100">
                            <div className="mb-12">
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">New analysis</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">Request professional feedback on your game</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Session title</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all font-bold placeholder:text-slate-300" placeholder="e.g. Sunday League Finals" required onChange={e => setRequestFormData({ ...requestFormData, title: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message to analyst</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl h-40 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900/20 transition-all font-medium placeholder:text-slate-300 resize-none pt-4 leading-relaxed" placeholder="Mention specific timestamps or skills you want reviewed..." required onChange={e => setRequestFormData({ ...requestFormData, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-12">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Discard</button>
                                <button type="submit" className="flex-[2] py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-900/10 active:scale-95">Send request</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
                {showUploadModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <motion.form initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onSubmit={handleUploadFootage} className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-[600px] border border-slate-100 max-h-[95vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <FiCheckCircle size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 leading-none">Fulfill analysis request</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset title</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" required value={uploadFormData.title} onChange={e => setUploadFormData({ ...uploadFormData, title: e.target.value })} />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tactical overview</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl h-24 font-medium outline-none focus:ring-4 focus:ring-slate-900/5 transition-all resize-none pt-4" required value={uploadFormData.description} onChange={e => setUploadFormData({ ...uploadFormData, description: e.target.value })} />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Video source URL</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl font-medium outline-none focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300" placeholder="YouTube, Drive, or CDN URL" required value={uploadFormData.videoUrl} onChange={e => setUploadFormData({ ...uploadFormData, videoUrl: e.target.value })} />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Analytical insights</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl h-40 font-medium outline-none focus:ring-4 focus:ring-slate-900/5 transition-all resize-none pt-4" placeholder="Enter tactical insights for the match..." required value={uploadFormData.analysisText} onChange={e => setUploadFormData({ ...uploadFormData, analysisText: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-10">
                                <button type="button" onClick={() => { setShowUploadModal(false); setSelectedRequest(null); }} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Discard</button>
                                <button type="submit" disabled={isUploading} className="btn btn-primary flex-[2] py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                                    {isUploading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Publish analysis'
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TeamChat;
