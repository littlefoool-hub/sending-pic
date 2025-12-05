import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <div className={styles.text}>Загрузка... {Math.round(clampedProgress)}%</div>
    </div>
  );
}

