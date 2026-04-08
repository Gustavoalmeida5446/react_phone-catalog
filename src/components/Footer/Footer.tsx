import styles from './Footer.module.scss';

export const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className={styles.logo}
        >
          <span className={styles.logoTop}>Nice</span>
          <span className={styles.logoBottom}>Gadgets</span>
        </a>

        <nav className={styles.nav} aria-label="Footer navigation">
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span>Contacts</span>
          <span>Rights</span>
        </nav>

        <div className={styles.backToTop}>
          <span className={styles.backText}>Back to top</span>

          <button
            type="button"
            className={styles.button}
            onClick={handleBackToTop}
            aria-label="Back to top"
          >
            ^
          </button>
        </div>
      </div>
    </footer>
  );
};
