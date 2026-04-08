import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductList } from '../../components/ProductList';
import { Loader } from '../../components/Loader';
import { getProducts } from '../../services/api';
import { Product } from '../../types/catalog';
import { categoryLabels, categoryRouteList } from '../../utils/category';
import styles from './HomePage.module.scss';

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Something went wrong while loading the homepage.</p>;
  }

  const hotPrices = [...products]
    .sort(
      (first, second) =>
        second.fullPrice - second.price - (first.fullPrice - first.price),
    )
    .slice(0, 8);

  const brandNew = [...products]
    .sort((first, second) => second.year - first.year)
    .slice(0, 8);

  return (
    <section>
      <h1 className="visually-hidden">Product Catalog</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shop by category</h2>
        <div className={styles.categories}>
          {categoryRouteList.map(category => (
            <Link
              key={category}
              to={`/${category}`}
              className={styles.categoryCard}
            >
              <h3>{categoryLabels[category]}</h3>
              <p>
                {
                  products.filter(product => product.category === category)
                    .length
                }{' '}
                models
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hot prices</h2>
        <ProductList products={hotPrices} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Brand new</h2>
        <ProductList products={brandNew} />
      </section>
    </section>
  );
};
