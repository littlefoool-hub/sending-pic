import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Register.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerUser, isAuthenticated, user, loading } = useAuth();
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

    // Валидация
    if (username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsSubmitting(true);

    try {
      // Если галочка "админ" отмечена, регистрируем как админ
      await registerUser(username, password, isAdmin ? 'admin' : 'user');
      // Перенаправление будет обработано через useEffect после обновления user
    } catch (err) {
      let errorMessage = 'Ошибка регистрации';
      if (err instanceof Error) {
        if (err.message.includes('username already exists') || err.message.includes('already exists')) {
          errorMessage = 'Пользователь с таким именем уже существует';
        } else if (err.message.includes('at least 3')) {
          errorMessage = 'Имя пользователя должно содержать минимум 3 символа';
        } else if (err.message.includes('at least 6')) {
          errorMessage = 'Пароль должен содержать минимум 6 символов';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>

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

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting || loading}
              required
              minLength={6}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                disabled={isSubmitting || loading}
              />
              <span>Зарегистрироваться как админ</span>
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={isSubmitting || loading} className={styles.button}>
            {isSubmitting || loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.link}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

