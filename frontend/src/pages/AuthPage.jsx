import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!username || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const result = isLogin
                ? await login(username, password)
                : await register(username, password);

            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 font-bold text-xl hover:text-gray-300 transition-colors">
                {/* <Shield className="w-6 h-6" /> */}
                <img src='/rage.svg' className="w-10 h-10" />
                noName
            </Link>

            <div className="w-full max-w-md bg-black border border-white/20 p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Join noName'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Enter your credentials to access the secure chat.' : 'Create an anonymous identity to start chatting.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-500 text-sm rounded-md text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            placeholder="Enter a unique username"
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            placeholder="Enter a secure password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded-md hover:bg-gray-200 transition-colors flex justify-center items-center cursor-pointer"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            isLogin ? 'Login' : 'Register'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/10 pt-6">
                    {isLogin ? "Don't have an identity? " : "Already have an identity? "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-white font-bold hover:underline cursor-pointer"
                    >
                        {isLogin ? 'Register now.' : 'Login here.'}
                    </button>
                </div>
            </div>
        </div>
    );
}
