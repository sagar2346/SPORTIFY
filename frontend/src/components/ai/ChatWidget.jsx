import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/api';
import { FiMessageSquare, FiX, FiSend, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';


const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! I am the Sportify AI Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initial greeting based on role
    useEffect(() => {
        if (isOpen && messages.length === 1) {
            handleInitialGreeting();
        }
    }, [isOpen]);

    const handleInitialGreeting = async () => {
        if (!user) return; // Default greeting for guests is fine

        setLoading(true);
        try {
            if (user.role === 'customer') {
                const res = await aiService.getRecommendations();
                if (res.data.success) {
                    setMessages(prev => [...prev, { type: 'bot', text: res.data.recommendation }]);
                }
            } else if (user.role === 'admin' || user.role === 'venue_owner') {
                const res = await aiService.getInsights();
                if (res.data.success) {
                    setMessages(prev => [...prev, { type: 'bot', text: res.data.insight }]);
                }
            }
        } catch (error) {
            console.error('AI Greeting Error:', error);
            // Fallback silent, don't disturb user
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await aiService.getChatReply(userMsg);

            if (res.data.success) {
                setMessages(prev => [...prev, { type: 'bot', text: res.data.reply }]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I'm having trouble connecting to the server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-xl transition-all hover:scale-110 flex items-center justify-center border-2 border-white/20"
                    aria-label="Open AI Chat"
                >
                    <FiCpu className="w-8 h-8" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border border-gray-100 animate-slide-up h-[500px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <FiCpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white">Sportify Assistant</h3>
                                <p className="text-xs text-white opacity-90">
                                    {user ? `Hi, ${user.name}` : 'Guest Mode'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setMessages([{ type: 'bot', text: 'Hi! I am the Sportify AI Assistant. How can I help you today?' }]);
                            }}
                            className="hover:bg-white/20 p-1 rounded transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.type === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <div className={msg.type === 'bot' ? 'prose prose-sm prose-slate max-w-none break-words' : ''}>
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask something..."
                                className="flex-1 bg-gray-100 text-gray-800 placeholder-gray-500 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
                            >
                                <FiSend className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400">AI can make mistakes. Check info.</span>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
