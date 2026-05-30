import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiChevronDown,
  FiDownload,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi';
import { downloadReceipt, getOrderHistory, trackOrder } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { Navbar, StatusBadge } from '../../components';
import { FiShoppingCart } from 'react-icons/fi';
import './Orders.css';

const extractOrders = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.commandes)) return data.commandes;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
};

const getOrderArticles = (order) => {
  const articles = order?.articles ?? order?.items ?? order?.details ?? [];
  return Array.isArray(articles) ? articles : [];
};

const getArticleName = (item) =>
  item?.produit?.nom || item?.product?.nom || item?.product_name || item?.nom || 'Produit';

const getArticleQuantity = (item) => Number(item?.quantite ?? item?.quantity ?? 1);

const getArticleUnitPrice = (item) =>
  Number(item?.prix_unitaire ?? item?.unit_price ?? item?.prix ?? item?.produit?.prix ?? 0);

const getOrderTotal = (order) => {
  const explicitTotal = Number(order?.total ?? order?.montant_total ?? order?.amount);
  if (!Number.isNaN(explicitTotal) && explicitTotal > 0) return explicitTotal;

  return getOrderArticles(order).reduce(
    (sum, item) => sum + getArticleUnitPrice(item) * getArticleQuantity(item),
    0
  );
};

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (date) => {
  if (!date) return 'Date indisponible';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Date indisponible';

  return parsed.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const OrderHistory = () => {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [tracking, setTracking] = useState({});
  const [trackLoading, setTrackLoading] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrderHistory();
      setOrders(extractOrders(response));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger vos commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const orderStats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    return {
      count: orders.length,
      total,
    };
  }, [orders]);

  const toggleExpand = (id) => {
    setExpanded((current) => (current === id ? null : id));
  };

  const handleTrack = async (orderId) => {
    if (tracking[orderId]) return;

    setTrackLoading(orderId);
    try {
      const response = await trackOrder(orderId);
      setTracking((current) => ({
        ...current,
        [orderId]: response?.data ?? response ?? {},
      }));
    } catch (err) {
      setTracking((current) => ({
        ...current,
        [orderId]: {
          error: err.response?.data?.message || 'Suivi indisponible pour cette commande.',
        },
      }));
    } finally {
      setTrackLoading(null);
    }
  };

  const handleDownload = async (orderId) => {
    setDownloadLoading(orderId);
    try {
      await downloadReceipt(orderId);
    } catch {
      setError('Recu indisponible pour cette commande.');
    } finally {
      setDownloadLoading(null);
    }
  };

  return (
    <div className="orders-page">
      <Navbar
  variant="default"
  brand="Khayrat Bladi"
  brandTo="/home"
  isAuthenticated={true}
  onLogout={logout}
  links={[
    { to: '/products',       label: 'Produits',      icon: <FiShoppingBag /> },
    { to: '/cart',           label: 'Panier',        icon: <FiShoppingCart /> },
    { to: '/orders', label: 'Mes Commandes', icon: <FiPackage /> },
    { to: '/profile',        label: user?.prenom || 'Profil', icon: <FiUser /> },
    { type: 'button',        label: 'Déconnexion',   icon: <FiLogOut />, onClick: logout },
  ]}
/>

      <main className="orders-container">
        <header className="orders-header">
          <div>
            <span className="orders-kicker">Historique</span>
            <h1><FiPackage /> Mes commandes</h1>
            <p>Suivez vos achats, consultez les articles et telechargez vos recus.</p>
          </div>

          <Link to="/products" className="orders-back-link">
            <FiShoppingBag /> Continuer mes achats
          </Link>
        </header>

        {!loading && orders.length > 0 && (
          <section className="orders-summary" aria-label="Resume des commandes">
            <div>
              <span>Commandes</span>
              <strong>{orderStats.count}</strong>
            </div>
            <div>
              <span>Total achats</span>
              <strong>{formatPrice(orderStats.total)} DH</strong>
            </div>
          </section>
        )}

        {error && (
          <div className="orders-alert">
            <FiAlertCircle /> {error}
            <button type="button" onClick={loadOrders}>
              <FiRefreshCw /> Reessayer
            </button>
          </div>
        )}

        {loading && (
          <div className="orders-skeletons">
            {[1, 2, 3].map((item) => (
              <div key={item} className="orders-skeleton" />
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && !error && (
          <section className="orders-empty">
            <FiShoppingBag size={44} />
            <h2>Aucune commande pour le moment</h2>
            <p>Vos prochaines commandes apparaitront ici avec leur statut et leurs details.</p>
            <Link to="/products" className="orders-primary-btn">Voir les produits</Link>
          </section>
        )}

        {!loading && orders.length > 0 && (
          <section className="orders-list">
            {orders.map((order) => {
              const orderId = order.id ?? order.commande_id ?? order.reference;
              const isOpen = expanded === orderId;
              const articles = getOrderArticles(order);
              const total = getOrderTotal(order);
              const trackingInfo = tracking[orderId];

              return (
                <article className={`order-card${isOpen ? ' is-open' : ''}`} key={orderId}>
                  <button
                    type="button"
                    className="order-card-header"
                    onClick={() => toggleExpand(orderId)}
                    aria-expanded={isOpen}
                  >
                    <span className="order-main">
                      <span className="order-number">Commande #{orderId}</span>
                      <span className="order-date">{formatDate(order.created_at ?? order.date)}</span>
                    </span>

                    <span className="order-meta">
                      <StatusBadge status={order.statut ?? order.status ?? 'en_attente'} />
                      <strong>{formatPrice(total)} DH</strong>
                      <FiChevronDown className="order-chevron" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="order-card-body">
                      <div className="order-section">
                        <h3>Articles commandes</h3>

                        {articles.length > 0 ? (
                          <div className="order-items">
                            {articles.map((item, index) => {
                              const quantity = getArticleQuantity(item);
                              const unitPrice = getArticleUnitPrice(item);

                              return (
                                <div className="order-item" key={`${orderId}-${index}`}>
                                  <span className="order-item-name">{getArticleName(item)}</span>
                                  <span className="order-item-qty">x {quantity}</span>
                                  <span className="order-item-price">
                                    {formatPrice(unitPrice * quantity)} DH
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="order-muted">Aucun article detaille pour cette commande.</p>
                        )}

                        <div className="order-total-row">
                          <span>Total</span>
                          <strong>{formatPrice(total)} DH</strong>
                        </div>
                      </div>

                      <div className="order-actions">
                        <button
                          type="button"
                          className="order-action-btn"
                          onClick={() => handleTrack(orderId)}
                          disabled={trackLoading === orderId}
                        >
                          <FiMapPin />
                          {trackLoading === orderId ? 'Chargement...' : 'Suivre'}
                        </button>

                        <button
                          type="button"
                          className="order-action-btn order-action-btn--dark"
                          onClick={() => handleDownload(orderId)}
                          disabled={downloadLoading === orderId}
                        >
                          <FiDownload />
                          {downloadLoading === orderId ? 'Telechargement...' : 'Recu'}
                        </button>
                      </div>

                      {trackingInfo && (
                        <div className="order-tracking">
                          {trackingInfo.error ? (
                            <span className="order-tracking-error">{trackingInfo.error}</span>
                          ) : (
                            <>
                              <span>Statut actuel</span>
                              <StatusBadge status={trackingInfo.statut ?? trackingInfo.status ?? order.statut} />
                              {(trackingInfo.updated_at || trackingInfo.date) && (
                                <small>
                                  Mis a jour le{' '}
                                  {new Date(trackingInfo.updated_at ?? trackingInfo.date).toLocaleString('fr-FR')}
                                </small>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default OrderHistory;
