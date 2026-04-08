import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { ProductList } from '../../components/ProductList';
import { getProductsByCategory } from '../../services/api';
import { Category, Product } from '../../types/catalog';
import { categoryEmptyLabels, categoryLabels } from '../../utils/category';
import styles from './ProductsPage.module.scss';

type SortBy = 'age' | 'title' | 'price';
type PerPage = '4' | '8' | '16' | 'all';

const sortProducts = (products: Product[], sortBy: SortBy) => {
  const copy = [...products];

  if (sortBy === 'title') {
    return copy.sort((first, second) => first.name.localeCompare(second.name));
  }

  if (sortBy === 'price') {
    return copy.sort((first, second) => first.price - second.price);
  }

  return copy.sort((first, second) => second.year - first.year);
};

export const ProductsPage = ({ category }: { category: Category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setError(false);
    setLoading(true);

    getProductsByCategory(category)
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [category]);

  const sortBy = (searchParams.get('sort') as SortBy | null) ?? 'age';
  const perPage = (searchParams.get('perPage') as PerPage | null) ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const sortedProducts = useMemo(
    () => sortProducts(products, sortBy),
    [products, sortBy],
  );

  const itemsPerPage =
    perPage === 'all' ? sortedProducts.length : Number(perPage);
  const totalPages =
    itemsPerPage > 0 ? Math.ceil(sortedProducts.length / itemsPerPage) : 1;
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

  const visibleProducts =
    itemsPerPage > 0
      ? sortedProducts.slice(
          (safePage - 1) * itemsPerPage,
          safePage * itemsPerPage,
      )
      : sortedProducts;

  const updateParams = (changes: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);

        return;
      }

      nextParams.set(key, value);
    });

    setSearchParams(nextParams);
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateParams({
      sort: event.target.value === 'age' ? null : event.target.value,
      page: null,
    });
  };

  const handlePerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateParams({
      perPage: event.target.value === 'all' ? null : event.target.value,
      page: null,
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div>
        <p>Something went wrong.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className={styles.header}>
        <div>
          <h1>{categoryLabels[category]} page</h1>
          <p>
            {products.length} {categoryLabels[category].toLowerCase()}
          </p>
        </div>

        <div className={styles.controls}>
          <label className={styles.control}>
            Sort by
            <select
              value={sortBy}
              onChange={handleSortChange}
              className={styles.select}
            >
              <option value="age">Newest</option>
              <option value="title">Alphabetically</option>
              <option value="price">Cheapest</option>
            </select>
          </label>

          <label className={styles.control}>
            Items on page
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className={styles.select}
            >
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="all">all</option>
            </select>
          </label>
        </div>
      </div>

      {products.length === 0 ? (
        <p>{categoryEmptyLabels[category]}</p>
      ) : (
        <>
          <ProductList products={visibleProducts} />

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                currentPage => (
                  <button
                    type="button"
                    key={currentPage}
                    className={`${styles.pageButton} ${currentPage === safePage ? styles.active : ''}`.trim()}
                    onClick={() =>
                      updateParams({
                        page: currentPage === 1 ? null : String(currentPage),
                      })
                    }
                  >
                    {currentPage}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
