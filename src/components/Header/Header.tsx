import { NavLink } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import styles from './Header.module.scss';

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `${styles.link} ${isActive ? styles.active : ''}`.trim();

export const Header = () => {
  const { favoritesCount, cartItemsCount } = useShop();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink to="/" className={styles.logo}>
          Product Catalog
        </NavLink>

        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink to="/" end className={getLinkClassName}>
            Home
          </NavLink>
          <NavLink to="/phones" className={getLinkClassName}>
            Phones
          </NavLink>
          <NavLink to="/tablets" className={getLinkClassName}>
            Tablets
          </NavLink>
          <NavLink to="/accessories" className={getLinkClassName}>
            Accessories
          </NavLink>
          <NavLink to="/favorites" className={getLinkClassName}>
            Favorites
            {favoritesCount > 0 && (
              <span className={styles.badge}>{favoritesCount}</span>
            )}
          </NavLink>
          <NavLink to="/cart" className={getLinkClassName}>
            Cart
            {cartItemsCount > 0 && (
              <span className={styles.badge}>{cartItemsCount}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
