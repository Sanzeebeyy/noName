import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, LogOut, ShieldAlert, ImageIcon, Loader2, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function ChatPage() {
    const { token, logout } = useAuth();
    const [messages, setMessages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // Decode the token to figure out my own username if needed, or rely on sender_id.
    // The backend uses sender_id, but now we've added 'username' to the broadcast.
    const myUsername = token ? jwtDecode(token).sub : '';

    useEffect(() => {
        if (!token) return;

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                const res = await fetch('https://noname-jfn7.onrender.com/chat/messages', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    // map backend schema to frontend expected format
                    const formatted = data.map(m => ({
                        sender_id: m.sender_id,
                        username: m.sender.username,
                        message_text: m.message_text,
                        image_url: m.image_url,
                    }));
                    setMessages(formatted);
                    requestAnimationFrame(scrollToBottom);
                }
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };

        fetchMessages();

        // Connect to WebSockets
        const wsUrl = `wss://noname-jfn7.onrender.com/ws/?token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            console.log('Connected to chat');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
            scrollToBottom();
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from chat');
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [token]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
            setSelectedImage(file);
        } else {
            alert('Please select a valid image file (JPEG, PNG)');
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() && !selectedImage) return;
        if (!isConnected || !ws.current) return;

        let imageUrl = null;

        if (selectedImage) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedImage);

            try {
                const res = await fetch('https://noname-jfn7.onrender.com/chat/upload-image', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    imageUrl = data.image_url;
                } else {
                    console.error('Failed to upload image');
                    alert('Failed to upload image');
                    setIsUploading(false);
                    return;
                }
            } catch (err) {
                console.error('Error uploading image:', err);
                setIsUploading(false);
                return;
            }
        }

        const payload = {
            message: inputMessage.trim() || null,
        };
        if (imageUrl) {
            payload.image_url = imageUrl;
        }

        ws.current.send(JSON.stringify(payload));

        setInputMessage('');
        removeImage();
        setIsUploading(false);
    };

    return (
        <div className="flex flex-col h-dvh w-full max-w-full overflow-hidden bg-black text-white font-sans tracking-tight">
            {/* Header */}
            <header className="shrink-0 w-full bg-black border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-50 relative">
                <div className="flex items-center gap-2 md:gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-white border-dashed animate-spin-slow shrink-0">
                        <img src='/rage.svg' className="w-4 h-4 md:w-5 md:h-5 text-white" alt="logo" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="font-bold text-lg md:text-xl tracking-tighter truncate">Say Anything</h1>
                        <div className="flex items-center gap-2 group relative">
                            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] md:text-xs text-gray-400 font-medium truncate">
                                {isConnected ? 'Connection Secured' : 'Disconnected'}
                            </span>

                            {/* Mobile Info Icon + Tooltip */}
                            <div className="lg:hidden flex items-center">
                                <div className="w-3 h-3 border border-gray-500 rounded-full flex items-center justify-center text-[8px] text-gray-400 font-bold cursor-help">
                                    i
                                </div>
                                {/* Tooltip Popup */}
                                <div className="absolute left-0 top-6 scale-0 group-hover:scale-100 group-active:scale-100 transition-transform origin-top-left bg-white text-black text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap z-60 shadow-xl">
                                    CHAT DELETES AFTER 24H
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Centered Text */}
                <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold pointer-events-none">
                    CHAT DELETES AFTER 6H
                </div>

                <div className="flex items-center justify-end flex-1">
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 md:px-4 md:py-2 border border-white/20 rounded-md hover:bg-white hover:text-black transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                    >
                        <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Disconnect</span>
                    </button>
                </div>
            </header>

            {/* Chat Messages */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full p-4 md:p-8 flex flex-col gap-4 md:gap-6 custom-scrollbar">
                {messages.map((msg, idx) => {
                    const isMe = msg.username === myUsername;
                    return (
                        <div key={idx} className={`flex flex-col max-w-[85%] md:max-w-xl lg:max-w-2xl ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest break-all">
                                    {isMe ? 'You' : msg.username || `User #${msg.sender_id}`}
                                </span>
                            </div>
                            <div className={`px-4 py-2.5 md:px-5 md:py-3 rounded-2xl text-sm md:text-base leading-relaxed wrap-break-word ${isMe
                                ? 'bg-white text-black rounded-tr-none'
                                : 'bg-[#111] border border-white/10 text-white rounded-tl-none'
                                }`}>
                                {msg.image_url && (
                                    <div className="mb-2">
                                        <img src={msg.image_url} alt="Shared" className="max-w-full max-h-64 md:max-h-80 rounded-xl object-contain bg-black/5" />
                                    </div>
                                )}
                                {msg.message_text && <div>{msg.message_text}</div>}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="shrink-0 w-full bg-black p-3 md:p-4 border-t border-white/10 lg:px-8">
                {selectedImage && (
                    <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between bg-[#111] border border-white/20 p-2 md:p-3 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-white text-xs md:text-sm font-medium truncate">{selectedImage.name}</span>
                                <span className="text-gray-400 text-[10px] md:text-xs">{(selectedImage.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={removeImage}
                            disabled={isUploading}
                            className="text-gray-400 hover:text-white transition-colors p-2 disabled:opacity-50 cursor-pointer"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                )}
                <form
                    onSubmit={sendMessage}
                    className="flex gap-2 md:gap-3 max-w-4xl mx-auto items-center"
                >
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        disabled={!isConnected || isUploading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isConnected || isUploading}
                        className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 bg-transparent border border-white/20 rounded-full px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-sm md:text-base min-w-0"
                        placeholder="Discuss something..."
                        disabled={!isConnected || isUploading}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || (!inputMessage.trim() && !selectedImage) || isUploading}
                        className="shrink-0 bg-white text-black w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer gap-2"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-black" /> : <img src="/send.svg" alt="Send" className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                </form>
            </footer>

            {/* Basic Custom Scrollbar styles inserted securely */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255,255,255,0.4);
        }
      `}} />
        </div>
    );
}
