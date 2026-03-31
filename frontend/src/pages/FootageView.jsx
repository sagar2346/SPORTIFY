import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { footageService } from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { FiArrowLeft, FiVideo, FiActivity, FiInfo, FiRefreshCw, FiDownload } from 'react-icons/fi';

const FootageView = () => {
    const { id } = useParams();
    const [footage, setFootage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState('');
    const [summarizing, setSummarizing] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userQuestion, setUserQuestion] = useState('');
    const [querying, setQuerying] = useState(false);
    const [showEndOverlay, setShowEndOverlay] = useState(false);
    const playerRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        loadFootage();
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadFootage = async () => {
        try {
            const response = await footageService.get(id);
            setFootage(response.data.data);
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.response?.status === 403) {
                toast.error('Access denied: This footage is private to team members.');
            } else {
                toast.error('Failed to load footage details');
            }
        } finally {
            setLoading(false);
        }
    };

    const generateAiSummary = async () => {
        setSummarizing(true);
        try {
            const response = await footageService.getSummary(id);
            setAiSummary(response.data.summary);
            toast.success('AI Summary generated!');
        } catch (error) {
            toast.error('Failed to generate AI summary');
        } finally {
            setSummarizing(false);
        }
    };

    const downloadReport = async () => {
        try {
            const response = await footageService.exportReport(id, aiSummary);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Sportify_Report_${footage.title.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const handleQuery = async (e) => {
        e.preventDefault();
        if (!userQuestion.trim() || querying) return;

        const question = userQuestion;
        setUserQuestion('');
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setQuerying(true);

        try {
            const response = await footageService.query(id, question);
            setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
        } catch (error) {
            toast.error('AI assistant failed to respond');
            setMessages(prev => [...prev, { role: 'error', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setQuerying(false);
        }
    };

    const getYouTubeID = (url) => {
        if (!url) return '';
        if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        if (url.includes('embed/')) return url.split('embed/')[1].split('?')[0];
        return '';
    };

    useEffect(() => {
        if (!footage || !footage.videoUrl) return;

        const videoId = getYouTubeID(footage.videoUrl);
        if (!videoId) return;

        const initPlayer = () => {
            if (playerRef.current) return;

            playerRef.current = new window.YT.Player('youtube-player', {
                host: 'https://www.youtube-nocookie.com',
                videoId: videoId,
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    autohide: 1,
                },
                events: {
                    'onStateChange': (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            setShowEndOverlay(true);
                        } else if (event.data === window.YT.PlayerState.PLAYING) {
                            setShowEndOverlay(false);
                        }
                    },
                },
            });
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            window.onYouTubeIframeAPIReady = initPlayer;
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            initPlayer();
        }

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [footage]);

    const handleReplay = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
            playerRef.current.playVideo();
            setShowEndOverlay(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!footage) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <p className="text-gray-500">Footage not found.</p>
                <Link to="/dashboard" className="text-primary-600 hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors font-medium">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>

            <div className="space-y-6 animate-fade-in">
                {/* Video Section */}
                <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl relative border-4 border-white">
                    <div id="youtube-player" className="w-full h-full"></div>

                    {/* End Overlay */}
                    {showEndOverlay && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 animate-fade-in">
                            <FiVideo className="text-6xl text-primary-500 mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold text-white mb-6">Video Completed</h3>
                            <button
                                onClick={handleReplay}
                                className="btn btn-primary flex items-center px-8 py-3 text-lg transition-transform hover:scale-110 active:scale-95"
                            >
                                <FiRefreshCw className="mr-2" /> Replay Video
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="card h-full">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{footage.title}</h1>
                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-semibold">
                                    <FiActivity className="mr-1.5" /> Analysis Ready
                                </span>
                                <span>Uploaded {new Date(footage.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                                    <FiInfo className="mr-2 text-primary-600" /> Description
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {footage.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="card bg-gray-50/50 border-primary-100 border-2">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                                <FiActivity className="mr-2 text-primary-600" /> Professional Notes
                            </h3>
                            <p className="text-sm text-gray-600 italic leading-relaxed">
                                "{footage.analysisText}"
                            </p>
                            <div className="mt-4 pt-4 border-t border-primary-100 flex items-center justify-between text-xs text-primary-400">
                                <span className="uppercase tracking-widest font-bold">Admin Insights</span>
                                <FiVideo />
                            </div>
                        </div>

                        {/* AI Summary Card */}
                        <div className="card bg-emerald-50/50 border-emerald-100 border-2 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <FiActivity size={80} className="text-emerald-600 rotate-12" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center relative z-10">
                                <FiActivity className="mr-2 text-emerald-600" /> AI Tactical Summary
                            </h3>

                            {!aiSummary ? (
                                <button
                                    onClick={generateAiSummary}
                                    disabled={summarizing || footage.teamInfo?.isBlocked}
                                    className={`btn btn-primary w-full flex items-center justify-center py-3 text-sm font-bold relative z-10 ${footage.teamInfo?.isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={footage.teamInfo?.isBlocked ? 'AI features restricted for blocked teams' : ''}
                                >
                                    {summarizing ? (
                                        <>
                                            <FiRefreshCw className="mr-2 animate-spin" /> Analyzing Footage...
                                        </>
                                    ) : footage.teamInfo?.isBlocked ? (
                                        <>
                                            <FiActivity className="mr-2" /> AI Restricted
                                        </>
                                    ) : (
                                        <>
                                            <FiActivity className="mr-2" /> Generate AI Summary
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4 relative z-10">
                                    <div className="bg-white/80 backdrop-blur rounded-lg p-5 shadow-sm border border-emerald-100 prose prose-sm prose-emerald max-w-none">
                                        <ReactMarkdown>{aiSummary}</ReactMarkdown>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={generateAiSummary}
                                            disabled={summarizing || footage.teamInfo?.isBlocked}
                                            className={`text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center underline ${footage.teamInfo?.isBlocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                                        >
                                            <FiRefreshCw className={`mr-1 ${summarizing ? 'animate-spin' : ''}`} /> Refresh Analysis
                                        </button>
                                        <button
                                            onClick={downloadReport}
                                            className="btn btn-outline border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white px-3 py-1 text-xs flex items-center"
                                        >
                                            <FiDownload className="mr-1" /> Export PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Tactical Assistant (Chat) */}
                        <div className="card border-primary-100 border-2 flex flex-col h-[500px] bg-white">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <FiActivity className="mr-2 text-primary-600" /> AI Tactical Assistant
                            </h3>

                            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-6">
                                        <FiActivity size={40} className="mb-2" />
                                        <p className="text-sm">Ask me about player positioning, tactical faults, or improvement tips based on this footage.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-tr-none'
                                                : msg.role === 'error'
                                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                }`}>
                                                <div className={msg.role === 'ai' || msg.role === 'bot' ? 'prose prose-sm prose-slate max-w-none break-words' : 'break-words'}>
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {querying && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleQuery} className="relative">
                                <input
                                    type="text"
                                    className={`input pr-12 text-sm focus:ring-primary-500 border-gray-200 bg-white text-gray-900 ${footage.teamInfo?.isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder={footage.teamInfo?.isBlocked ? "AI Features Restricted..." : "Ask about the game..."}
                                    value={userQuestion}
                                    onChange={(e) => setUserQuestion(e.target.value)}
                                    disabled={querying || footage.teamInfo?.isBlocked}
                                />
                                <button
                                    type="submit"
                                    disabled={!userQuestion.trim() || querying || footage.teamInfo?.isBlocked}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700 disabled:opacity-30 transition-all"
                                >
                                    <FiActivity />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FootageView;

