import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { Lock, Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login(email, password);
      login(data.token, data.user);
      
      if (['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER'].includes(data.user.role)) {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка авторизації. Перевірте email та пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface rounded-2xl p-8 shadow-xl">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary">Smart Lock Web</h2>
          <p className="text-textSecondary mt-2">Увійдіть для керування доступом</p>
        </div>

    
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg text-sm">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={20} className="text-textSecondary" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#13131A] border border-transparent focus:border-primary rounded-xl text-white outline-none transition-all placeholder:text-[#6C6C70]"
                placeholder="Електронна пошта"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound size={20} className="text-textSecondary" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#13131A] border border-transparent focus:border-primary rounded-xl text-white outline-none transition-all placeholder:text-[#6C6C70]"
                placeholder="Пароль"
              />
            </div>
          </div>

          {error && (
            <div className="text-[#FF453A] text-sm text-center bg-[#FF453A]/10 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Увійти'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          Немає акаунту?{' '}
          <button 
            onClick={() => navigate('/register')} 
            className="text-primary hover:text-blue-400 transition-colors font-medium"
          >
            Зареєструватися
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;