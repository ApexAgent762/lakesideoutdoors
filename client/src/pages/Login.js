import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'CREW') navigate('/schedule');
      else navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lakeside-darker flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-lakeside-blue tracking-wide">LAKESIDE</h1>
          <p className="text-lakeside-teal text-lg tracking-widest uppercase">Outdoors</p>
          <p className="text-gray-400 text-sm mt-1">Est. 2025</p>
        </div>
        <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-6">Sign In</h2>
          {error && <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lakeside-blue"
                placeholder="daltonkesti24"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lakeside-blue"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lakeside-blue hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
