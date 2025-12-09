import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserImages } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './UserImages.module.css';

interface Image {
  id: string;
  original_name: string;
  file_name: string;
  url: string;
  size: number;
  created_at: string;
}

export default function UserImages() {
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (id) {
      loadUserImages(id);
    }
  }, [id]);

  const loadUserImages = async (userId: string) => {
    try {
      setLoading(true);
      const data = await getUserImages(userId);
      setImages(data);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Ошибка загрузки изображений',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showNotification('Ссылка скопирована в буфер обмена', 'success');
    } catch (error) {
      showNotification('Ошибка при копировании ссылки', 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
      <div className={styles.header}>
        <button onClick={() => navigate('/admin/users')} className={styles.backButton}>
          ← Назад к списку пользователей
        </button>
        <h1 className={styles.title}>Изображения пользователя</h1>
      </div>

      {images.length === 0 ? (
        <div className={styles.empty}>У пользователя нет загруженных изображений</div>
      ) : (
        <div className={styles.imageList}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageItem}>
              <div className={styles.imageInfo}>
                <h3 className={styles.imageName}>{image.original_name}</h3>
                <div className={styles.imageDetails}>
                  <span>Размер: {formatFileSize(image.size)}</span>
                  <span>Дата: {new Date(image.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className={styles.linkContainer}>
                  <input
                    type="text"
                    value={image.url}
                    readOnly
                    className={styles.linkInput}
                  />
                  <button
                    onClick={() => handleCopyLink(image.url)}
                    className={styles.copyButton}
                  >
                    Копировать ссылку
                  </button>
                </div>
              </div>
              <div className={styles.imagePreview}>
                <img src={image.url} alt={image.original_name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

