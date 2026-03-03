import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, LogOut, ShieldAlert } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function ChatPage() {
    const { token, logout } = useAuth();
    const [messages, setMessages] = useState([]);
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
                const res = await fetch('http://127.0.0.1:8000/chat/messages', {
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
        const wsUrl = `ws://127.0.0.1:8000/ws/?token=${token}`;
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

    const sendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && isConnected && ws.current) {
            const payload = { message: inputMessage.trim() };
            ws.current.send(JSON.stringify(payload));
            setInputMessage('');
        }
    };

    return (
        <div className="flex flex-col h-dvh w-full max-w-full overflow-hidden bg-black text-white font-sans tracking-tight">
            {/* Header */}
            <header className="shrink-0 w-full bg-black border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-white border-dashed animate-spin-slow shrink-0">
                        <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold text-lg md:text-xl tracking-tighter truncate">Secure Room</h1>
                        <div className="flex items-center gap-1 md:gap-2">
                            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] md:text-xs text-gray-400 font-medium truncate">
                                {isConnected ? 'Connection Secured' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 md:px-4 md:py-2 border border-white/20 rounded-md hover:bg-white hover:text-black transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                >
                    <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Disconnect</span>
                </button>
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
                                {msg.message_text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="shrink-0 w-full bg-black p-3 md:p-4 border-t border-white/10 lg:px-8">
                <form
                    onSubmit={sendMessage}
                    className="flex gap-3 max-w-4xl mx-auto items-center"
                >
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 bg-transparent border border-white/20 rounded-full px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-base"
                        placeholder="Type a secure message..."
                        disabled={!isConnected}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !inputMessage.trim()}
                        className="shrink-0 bg-white text-black w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <img src="/send.svg" alt="" />
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
