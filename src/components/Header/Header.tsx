import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import styles from './Header.module.scss';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/phones', label: 'Phones' },
  { to: '/tablets', label: 'Tablets' },
  { to: '/accessories', label: 'Accessories' },
];

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `${styles.link} ${isActive ? styles.active : ''}`.trim();

export const Header = () => {
  const { favoritesCount, cartItemsCount } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const mobileMenuClassName =
    `${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`.trim();

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoTop}>Nice</span>
          <span className={styles.logoBottom}>Gadgets</span>
        </NavLink>

        <nav className={styles.nav} aria-label="Main navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={getLinkClassName}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <NavLink to="/favorites" className={styles.iconLink}>
            <span className={styles.icon}>♡</span>
            {favoritesCount > 0 && (
              <span className={styles.badge}>{favoritesCount}</span>
            )}
          </NavLink>

          <NavLink to="/cart" className={styles.iconLink}>
            <span className={styles.icon}>▢</span>
            {cartItemsCount > 0 && (
              <span className={styles.badge}>{cartItemsCount}</span>
            )}
          </NavLink>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(current => !current)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? '×' : '☰'}
        </button>
      </div>

      <div className={mobileMenuClassName}>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={getLinkClassName}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.mobileActions}>
          <NavLink
            to="/favorites"
            className={styles.mobileIconLink}
            onClick={closeMenu}
          >
            <span className={styles.icon}>♡</span>
            {favoritesCount > 0 && (
              <span className={styles.badge}>{favoritesCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/cart"
            className={styles.mobileIconLink}
            onClick={closeMenu}
          >
            <span className={styles.icon}>▢</span>
            {cartItemsCount > 0 && (
              <span className={styles.badge}>{cartItemsCount}</span>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
};
