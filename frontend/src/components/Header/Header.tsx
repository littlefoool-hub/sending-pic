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

  const logoLink = isAdmin ? '/admin/users' : '/upload';

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link to={logoLink} className={styles.logo}>
          Image Uploader
        </Link>
        
        <nav className={styles.nav}>
          <span className={styles.username}>Привет, {user.username}!</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </nav>
      </div>
    </header>
  );
}

