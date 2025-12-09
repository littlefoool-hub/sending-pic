import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './AdminUsers.module.css';

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
  image_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Ошибка загрузки пользователей',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewImages = (userId: string) => {
    navigate(`/admin/users/${userId}/images`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Пользователи</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Роль</th>
            <th>Количество изображений</th>
            <th>Дата регистрации</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.empty}>
                Пользователи не найдены
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className={styles.idCell}>{user.id.substring(0, 8)}...</td>
                <td>{user.username}</td>
                <td>
                  <span className={user.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                    {user.role}
                  </span>
                </td>
                <td>{user.image_count}</td>
                <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <button
                    onClick={() => handleViewImages(user.id)}
                    className={styles.viewButton}
                  >
                    Просмотр изображений
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

