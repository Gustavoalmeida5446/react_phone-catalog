import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Loader } from '../../components/Loader';
import { ProductList } from '../../components/ProductList';
import { useShop } from '../../context/ShopContext';
import {
  getProductDetails,
  getProducts,
  getProductVariants,
  getRecommendedProducts,
} from '../../services/api';
import { Product, ProductDetails } from '../../types/catalog';
import { categoryLabels, normalizeImagePath } from '../../utils/category';
import styles from './ProductDetailsPage.module.scss';

const colorMap: Record<string, string> = {
  black: '#313237',
  white: '#fafbfc',
  yellow: '#f6d65a',
  purple: '#8d5cf6',
  red: '#eb5757',
  gold: '#f0c68b',
  rosegold: '#e9b4b4',
  silver: '#d6d6d6',
  coral: '#ff7f50',
  green: '#6fcf97',
  midnight: '#25303b',
  midnightgreen: '#5f7170',
  spacegray: '#4c4c4c',
  'space-gray': '#4c4c4c',
  'sky-blue': '#9ec7e8',
  starlight: '#f3e7c9',
  pink: '#f7b4d0',
};

const buildVariantLink = (
  variants: ProductDetails[],
  color: string,
  capacity: string,
) =>
  variants.find(
    variant => variant.color === color && variant.capacity === capacity,
  )?.id;

export const ProductDetailsPage = () => {
  const { productId = '' } = useParams();
  const navigate = useNavigate();
  const { addToCart, isFavorite, isInCart, toggleFavorite } = useShop();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [summary, setSummary] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductDetails[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setSummary(null);
    setVariants([]);

    Promise.all([getProducts(), getProductDetails(productId)])
      .then(async ([products, currentProduct]) => {
        const currentSummary =
          products.find(item => item.itemId === productId) || null;

        setSummary(currentSummary);
        setProduct(currentProduct);
        setSelectedImage(currentProduct?.images[0] || '');

        if (currentProduct) {
          const currentVariants = await getProductVariants(
            currentProduct.category,
            currentProduct.namespaceId,
          );

          setVariants(currentVariants);
        }

        const recommended = await getRecommendedProducts(productId);

        setSuggestedProducts(recommended);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const breadcrumbItems = useMemo(() => {
    if (!product) {
      return [{ label: 'Home', to: '/' }, { label: 'Product not found' }];
    }

    return [
      { label: 'Home', to: '/' },
      { label: categoryLabels[product.category], to: `/${product.category}` },
      { label: product.name },
    ];
  }, [product]);

  if (loading) {
    return <Loader />;
  }

  if (!product || !summary) {
    return (
      <section>
        <Breadcrumbs items={breadcrumbItems} />
        <h1>Product was not found</h1>
      </section>
    );
  }

  return (
    <section className={styles.layout}>
      <Breadcrumbs items={breadcrumbItems} />

      <button
        type="button"
        className={styles.back}
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <h1 className={styles.title}>{product.name}</h1>

      <div className={styles.hero}>
        <div className={styles.gallery}>
          <div className={styles.thumbs}>
            {product.images.map(image => (
              <button
                type="button"
                key={image}
                className={`${styles.thumb} ${image === selectedImage ? styles.activeThumb : ''}`.trim()}
                onClick={() => setSelectedImage(image)}
              >
                <img src={normalizeImagePath(image)} alt={product.name} />
              </button>
            ))}
          </div>

          <div className={styles.imageBox}>
            <img
              src={normalizeImagePath(selectedImage)}
              alt={product.name}
              className={styles.galleryImage}
            />
          </div>
        </div>

        <div className={styles.buyBlock}>
          <div className={styles.buyPanel}>
            <div className={styles.optionSection}>
              <div className={styles.optionHeader}>
                <h2 className={styles.optionTitle}>Available colors</h2>
              </div>

              <div className={styles.colorOptions}>
                {product.colorsAvailable.map(color => {
                  const targetId = buildVariantLink(
                    variants,
                    color,
                    product.capacity,
                  );

                  return (
                    <Link
                      key={color}
                      to={targetId ? `/product/${targetId}` : '#'}
                      className={`${styles.colorOption} ${color === product.color ? styles.activeColorOption : ''}`.trim()}
                      style={{ backgroundColor: colorMap[color] || color }}
                      aria-label={color}
                    >
                      <span className="visually-hidden">{color}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className={styles.optionSection}>
              <div className={styles.optionHeader}>
                <h2 className={styles.optionTitle}>Select capacity</h2>
              </div>

              <div className={styles.capacityOptions}>
                {product.capacityAvailable.map(capacity => {
                  const targetId = buildVariantLink(
                    variants,
                    product.color,
                    capacity,
                  );

                  return (
                    <Link
                      key={capacity}
                      to={targetId ? `/product/${targetId}` : '#'}
                      className={`${styles.capacityOption} ${capacity === product.capacity ? styles.activeCapacityOption : ''}`.trim()}
                    >
                      {capacity}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>${product.priceDiscount}</span>
              <span className={styles.fullPrice}>${product.priceRegular}</span>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.button} ${styles.primary}`.trim()}
                onClick={() => addToCart(summary.itemId)}
                disabled={isInCart(summary.itemId)}
              >
                {isInCart(summary.itemId) ? 'Added to cart' : 'Add to cart'}
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.iconButton}`.trim()}
                onClick={() => toggleFavorite(summary.itemId)}
                aria-label={
                  isFavorite(summary.itemId)
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                {isFavorite(summary.itemId) ? '♥' : '♡'}
              </button>
            </div>

            <div className={styles.specs}>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Screen</span>
                <span className={styles.specValue}>{product.screen}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Resolution</span>
                <span className={styles.specValue}>{product.resolution}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Processor</span>
                <span className={styles.specValue}>{product.processor}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>RAM</span>
                <span className={styles.specValue}>{product.ram}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.infoSections}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.descriptionList}>
            {product.description.map(block => (
              <article key={block.title} className={styles.descriptionBlock}>
                <h3 className={styles.descriptionTitle}>{block.title}</h3>
                {block.text.map(paragraph => (
                  <p key={paragraph} className={styles.descriptionText}>
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tech specs</h2>
          <div className={styles.techSpecs}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Screen</span>
              <span className={styles.specValue}>{product.screen}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Resolution</span>
              <span className={styles.specValue}>{product.resolution}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Processor</span>
              <span className={styles.specValue}>{product.processor}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>RAM</span>
              <span className={styles.specValue}>{product.ram}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Built in memory</span>
              <span className={styles.specValue}>{product.capacity}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recommendations}>
        <h2 className={styles.sectionTitle}>You may also like</h2>
        <ProductList products={suggestedProducts} />
      </div>
    </section>
  );
};
