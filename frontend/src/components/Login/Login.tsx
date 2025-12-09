import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUser, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // Если уже авторизован, перенаправляем в зависимости от роли
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/upload', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Показываем null если уже авторизован
  if (isAuthenticated || loading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginUser(username, password);
      // Перенаправление будет обработано через useEffect после обновления user
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting || loading}
              required
              minLength={3}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || loading}
              required
              minLength={6}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={isSubmitting || loading} className={styles.button}>
            {isSubmitting || loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className={styles.link}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

