import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAdmin, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link to="/upload" className={styles.logo}>
          Image Uploader
        </Link>
        
        <nav className={styles.nav}>
          <span className={styles.username}>Привет, {user.username}!</span>
          {isAdmin && (
            <Link to="/admin/users" className={styles.link}>
              Админка
            </Link>
          )}
          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </nav>
      </div>
    </header>
  );
}

