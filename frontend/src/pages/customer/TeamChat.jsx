import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { teamService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiHash, FiMic, FiSend, FiUsers, FiCopy, FiLogOut } from 'react-icons/fi';

const API_URL = 'http://localhost:5001'; // Or from import.meta.env

const TeamChat = () => {
    const [teams, setTeams] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // UI States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', sport: '', inviteCode: '' });

    const messagesEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        loadTeams();
        fetchUser();

        // Socket Connection
        const newSocket = io(API_URL);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for messages
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            if (activeTeam && message.team === activeTeam._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => socket.off('receive_message');
    }, [socket, activeTeam]);

    const fetchUser = async () => {
        try {
            const res = await authService.getMe();
            setCurrentUser(res.data.data);
        } catch (err) { console.error(err); }
    };

    const loadTeams = async () => {
        try {
            const res = await teamService.getMyTeams();
            setTeams(res.data.data);
        } catch (error) { toast.error('Failed to load teams'); }
    };

    const handleTeamSelect = async (team) => {
        setActiveTeam(team);
        if (socket) {
            // Leave previous room if needed, but simplest is just join new
            socket.emit('join_team', team._id);
        }
        try {
            const res = await teamService.getMessages(team._id);
            setMessages(res.data.data);
        } catch (error) { toast.error('Failed to load chat history'); }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Optimistic UI update or wait for socket? Socket is fast enough.
        // We actually need to save to DB first usually, or emit and let server save.
        // For simplicity, let's emit, and have specific API if we want persistence.
        // Current Plan: Emit to server -> Server handles persistence??
        // Wait, standard practice: API Call to save -> Then Emit.

        // Actually, let's just use the socket event to trigger a "Receive" but we need to save it.
        // Update: Let's simpler approach. Call API to save (not impl in backend yet? wait groupMessage logic).
        // My plan didn't have "POST /messages" for text. Let's assume we use socket for real-time.
        // AND we create a message via API?

        // Let's implement robust way: 
        // 1. Emit 'send_message' with content.
        // 2. Server creates DB entry AND broadcasts.

        // REVISIT SERVER: currently server just broadcasts. It does NOT save to DB.
        // I need to update server.js socket handler to SAVE to DB.

        const messageData = {
            team: activeTeam._id,
            sender: currentUser._id,
            senderName: currentUser.name,
            content: inputText,
            type: 'text',
            createdAt: new Date()
        };

        // Emit to socket (Validation happens on server, but let's assume trust for verified users)
        // Ideally we call an endpoint `POST /api/teams/:id/message` which saves and emits.
        // BUT, since I already wrote the socket handler to just broadcast, I should update the socket handler or use an API route.
        // Let's use the socket.emit for now to show "speed", but for *persistence* we need the server to save it.
        // I will add persistence to the `server.js` socket handler in a moment.

        socket.emit('send_message', { teamId: activeTeam._id, message: messageData });
        setInputText('');
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
            // The server saves voice msg and returns it. We should EMIT this new message to others.
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

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-100 rounded-lg overflow-hidden shadow-xl">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center"><FiUsers className="mr-2" /> My Teams</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {teams.map(team => (
                        <div key={team._id}
                            onClick={() => handleTeamSelect(team)}
                            className={`p-3 rounded-lg cursor-pointer flex items-center transition-colors ${activeTeam?._id === team._id ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 font-bold text-lg">
                                {team.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold">{team.name}</h3>
                                <p className="text-xs text-gray-400 truncate">{team.sport}</p>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setShowCreateModal(true)} className="w-full mt-4 p-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center">
                        <FiPlus className="mr-2" /> Create Team
                    </button>
                    <button onClick={() => setShowJoinModal(true)} className="w-full mt-2 p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white flex items-center justify-center">
                        <FiHash className="mr-2" /> Join with Code
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeTeam ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center shadow-sm">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">#{activeTeam.name}</h2>
                                <p className="text-sm text-gray-500">{activeTeam.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                <span className="font-mono select-all mr-2">Code: {activeTeam.inviteCode}</span>
                                <button onClick={() => { navigator.clipboard.writeText(activeTeam.inviteCode); toast.success('Copied!'); }}><FiCopy /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === currentUser?._id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                            {!isMe && <p className="text-xs font-bold text-indigo-600 mb-1">{msg.senderName}</p>}

                                            {msg.type === 'text' ? (
                                                <p>{msg.content}</p>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <audio controls src={`http://localhost:5000${msg.audioUrl}`} className="h-8 w-48" />
                                                </div>
                                            )}

                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t flex items-center space-x-2">
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onMouseLeave={stopRecording}
                                className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                title="Hold to Record"
                            >
                                <FiMic size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Message #team..."
                                className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md"
                            >
                                <FiSend size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FiUsers size={64} className="mb-4 text-gray-300" />
                        <p className="text-lg">Select a team to start chatting</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form onSubmit={createTeam} className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        <h3 className="text-xl font-bold mb-4">Create New Team</h3>
                        <input className="w-full p-2 border rounded mb-3" placeholder="Team Name" required
                            onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input className="w-full p-2 border rounded mb-3" placeholder="Sport (e.g. Football)" required
                            onChange={e => setFormData({ ...formData, sport: e.target.value })} />
                        <textarea className="w-full p-2 border rounded mb-3" placeholder="Description"
                            onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form onSubmit={joinTeam} className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        <h3 className="text-xl font-bold mb-4">Join Team</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter the team code shared by your friend.</p>
                        <input className="w-full p-2 border rounded mb-3 font-mono uppercase" placeholder="INVITE CODE" required
                            onChange={e => setFormData({ ...formData, inviteCode: e.target.value })} />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Join</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TeamChat;
