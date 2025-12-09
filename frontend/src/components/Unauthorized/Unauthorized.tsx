import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Unauthorized.module.css';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleGoHome = () => {
    if (user?.role === 'admin') {
      navigate('/admin/users');
    } else {
      navigate('/upload');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Доступ запрещен</h1>
        <p className={styles.message}>
          У вас нет доступа к этой странице.
        </p>
        <div className={styles.actions}>
          <button onClick={handleGoHome} className={styles.button}>
            На главную
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

