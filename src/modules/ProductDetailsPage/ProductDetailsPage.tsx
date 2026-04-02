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

      <h1>{product.name}</h1>

      <div className={styles.hero}>
        <div>
          <img
            src={normalizeImagePath(selectedImage)}
            alt={product.name}
            className={styles.galleryImage}
          />

          <div className={styles.thumbs}>
            {product.images.map(image => (
              <button
                type="button"
                key={image}
                className={styles.thumb}
                onClick={() => setSelectedImage(image)}
              >
                <img src={normalizeImagePath(image)} alt={product.name} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.section}>
            <h2>Available colors</h2>
            <div className={styles.options}>
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
                    className={`${styles.option} ${color === product.color ? styles.activeOption : ''}`.trim()}
                  >
                    {color}
                  </Link>
                );
              })}
            </div>

            <h2>Select capacity</h2>
            <div className={styles.options}>
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
                    className={`${styles.option} ${capacity === product.capacity ? styles.activeOption : ''}`.trim()}
                  >
                    {capacity}
                  </Link>
                );
              })}
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
                className={`${styles.button} ${styles.secondary}`.trim()}
                onClick={() => toggleFavorite(summary.itemId)}
              >
                {isFavorite(summary.itemId) ? 'Favorited' : 'Add to favorites'}
              </button>
            </div>

            <div className={styles.specs}>
              <span>Price: ${product.priceDiscount}</span>
              <span>Regular price: ${product.priceRegular}</span>
              <span>Screen: {product.screen}</span>
              <span>Resolution: {product.resolution}</span>
              <span>Processor: {product.processor}</span>
              <span>RAM: {product.ram}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h2>About</h2>
            {product.description.map(block => (
              <article key={block.title}>
                <h3>{block.title}</h3>
                {block.text.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>You may also like</h2>
        <ProductList products={suggestedProducts} />
      </div>
    </section>
  );
};
