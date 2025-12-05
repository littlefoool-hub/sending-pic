import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './ResultPage.module.css';

interface ResultPageState {
  imageUrl: string;
  imageLink: string;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const state = location.state as ResultPageState | null;
  const { imageUrl, imageLink } = state || {};

  useEffect(() => {
    // Если данных нет, редиректим на главную
    if (!imageUrl || !imageLink) {
      navigate('/');
    }
  }, [imageUrl, imageLink, navigate]);

  if (!imageUrl || !imageLink) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageLink);
      setCopied(true);
      
      // Сброс состояния "скопировано" через 2 секунды
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Ошибка при копировании:', err);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = imageLink;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Ошибка при копировании (fallback):', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Изображение загружено!</h1>
      
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt="Uploaded" className={styles.image} />
      </div>

      <div className={styles.linkContainer}>
        <input
          type="text"
          value={imageLink}
          readOnly
          className={styles.linkInput}
        />
        <button
          type="button"
          onClick={handleCopy}
          className={clsx(styles.copyButton, {
            [styles.copied]: copied,
          })}
          title={copied ? 'Скопировано!' : 'Копировать ссылку'}
        >
          {copied ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Скопировано
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Копировать
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleBack}
        className={styles.backButton}
      >
        Загрузить еще одно изображение
      </button>
    </div>
  );
}

