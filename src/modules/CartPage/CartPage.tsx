import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { useShop } from '../../context/ShopContext';
import { getProducts } from '../../services/api';
import { Product } from '../../types/catalog';
import { normalizeImagePath } from '../../utils/category';
import styles from './CartPage.module.scss';

export const CartPage = () => {
  const {
    cart,
    clearCart,
    decrementCartItem,
    incrementCartItem,
    removeFromCart,
  } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const cartProducts = useMemo(
    () =>
      cart
        .map(item => {
          const product = products.find(entry => entry.itemId === item.itemId);

          return product ? { product, quantity: item.quantity } : null;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number }>,
    [cart, products],
  );

  const totalQuantity = cartProducts.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const totalPrice = cartProducts.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    const shouldClear = window.confirm(
      'Checkout is not implemented yet. Do you want to clear the Cart?',
    );

    if (shouldClear) {
      clearCart();
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <section>
      <h1>Cart</h1>
      <p>
        Total: {totalQuantity} items / ${totalPrice}
      </p>

      {cartProducts.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className={styles.list}>
            {cartProducts.map(({ product, quantity }) => (
              <article key={product.itemId} className={styles.item}>
                <img
                  src={normalizeImagePath(product.image)}
                  alt={product.name}
                  className={styles.image}
                />

                <div>
                  <Link to={`/product/${product.itemId}`}>
                    <h2>{product.name}</h2>
                  </Link>
                  <p>${product.price}</p>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => decrementCartItem(product.itemId)}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => incrementCartItem(product.itemId)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => removeFromCart(product.itemId)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className={styles.checkout}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </>
      )}
    </section>
  );
};
