import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import { UserPlus, Mail, KeyRound, User, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.register(email, password, fullName);
      navigate('/login', { state: { message: 'Реєстрація успішна! Тепер ви можете увійти.' } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка реєстрації. Перевірте дані або такий email вже існує.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface rounded-2xl p-8 shadow-xl">
        
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary">Створення акаунту</h2>
          <p className="text-textSecondary mt-2">Зареєструйтеся для отримання доступу</p>
        </div>

      
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-textSecondary" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#13131A] border border-transparent focus:border-primary rounded-xl text-white outline-none transition-all placeholder:text-[#6C6C70]"
                placeholder="Ваше ім'я та прізвище"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#13131A] border border-transparent focus:border-primary rounded-xl text-white outline-none transition-all placeholder:text-[#6C6C70]"
                placeholder="Пароль (мінімум 6 символів)"
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
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Зареєструватися'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          Вже маєте акаунт?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-primary hover:text-blue-400 transition-colors font-medium"
          >
            Увійти
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;