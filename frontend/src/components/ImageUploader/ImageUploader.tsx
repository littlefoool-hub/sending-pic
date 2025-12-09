import { useState, useRef } from 'react';
import clsx from 'clsx';
import { validateImageFile } from '../../utils/validation';
import { uploadImage } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import ProgressBar from '../ProgressBar';
import styles from './ImageUploader.module.css';

export default function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const handleFileSelect = (file: File) => {
    setError(null);
    
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Ошибка валидации файла');
      return;
    }

    setSelectedFile(file);
    
    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      await uploadImage(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      // Показываем уведомление об успехе
      showNotification('Изображение успешно загружено!', 'success');

      // Очищаем форму
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Переход на страницу результата с данными (опционально)
      // navigate('/result', {
      //   state: {
      //     imageUrl: preview,
      //     imageLink: response.url,
      //   },
      // });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Произошла ошибка при загрузке изображения';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Загрузка изображения</h1>
      
      {!preview ? (
        <div
          className={clsx(styles.uploadArea, {
            [styles.dragover]: isDragging,
          })}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className={styles.icon}>+</div>
          <p className={styles.text}>Перетащите сюда картинку</p>
          <button type="button" className={styles.button}>
            Выбрать с устройства
          </button>
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <button
            type="button"
            className={styles.changeButton}
            onClick={() => {
              setPreview(null);
              setSelectedFile(null);
              setError(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Выбрать другое изображение
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        className={styles.fileInput}
      />

      {error && <div className={styles.error}>{error}</div>}

      {uploadProgress !== null && (
        <ProgressBar progress={uploadProgress} />
      )}

      {selectedFile && !isUploading && (
        <button
          type="button"
          onClick={handleUpload}
          className={styles.uploadButton}
        >
          Загрузить изображение
        </button>
      )}
    </div>
  );
}

