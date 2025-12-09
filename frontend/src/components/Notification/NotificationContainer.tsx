import { useNotification } from '../../contexts/NotificationContext';
import styles from './NotificationContainer.module.css';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${styles[notification.type]}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

