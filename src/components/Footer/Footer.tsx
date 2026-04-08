import styles from './Footer.module.scss';

export const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub repo
        </a>

        <button
          type="button"
          className={styles.button}
          onClick={handleBackToTop}
        >
          Back to top
        </button>
      </div>
    </footer>
  );
};
