import { Shield, Lock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center font-sans tracking-wide">
            {/* Navigation */}
            <nav className="w-full max-w-6xl py-6 px-8 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
                    {/* <Shield className="w-8 h-8" strokeWidth={2.5} /> */}
                    <img src="/rage.svg" alt="" className='w-10 h-10' />
                    noName
                </div>
                <div className="space-x-6 text-sm font-medium">
                    <Link to="/auth" className="hover:text-gray-300 transition-colors">Login</Link>
                    <Link to="/auth" className="bg-white text-black px-5 py-2 rounded-md hover:bg-gray-200 transition-colors">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full mt-24 mb-15">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-widest mb-8">
                    <Lock className="w-3 h-3" />
                    Complete Privacy Friendly   
                </div>

                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
                    Speak Freely.<br />
                    Leave No Trace.
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
                    A truly private messaging platform where your identity remains completely anonymous. Zero logs. Zero compromises.
                </p>

                <Link
                    to="/auth"
                    className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-3 group"
                >
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Start Chatting Now
                </Link>
                <p className="text-xl md:text-xl text-gray-400 mb-12 max-w-2xl font-light pt-10">
                    Request From Developer : <br />
                    Please Donot Use Your Or Someone Else's Real Name As Username For This App
                </p>
            </main>

            {/* Features */}
            <section className="w-full bg-black border-t border-white/10 pb-24 pt-20 px-8">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Absolute Security</h3>
                        <p className="text-gray-400 font-light text-sm leading-relaxed">
                            Auto chat delete after 24 hours from database and anonimity lets you allow say anything without hesitation.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Privacy First</h3>
                        <p className="text-gray-400 font-light text-sm leading-relaxed">
                            No tracking, no data mining, and no metadata retention. Your conversations are yours alone.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Instant Communication</h3>
                        <p className="text-gray-400 font-light text-sm leading-relaxed">
                            Lightning-fast WebSocket delivery for real-time messaging without any delays.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-8 text-center border-t border-white/10 text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} . noName . all rights reserved . built by Sanzeebeyy in a single night
            </footer>
        </div>
    );
}
