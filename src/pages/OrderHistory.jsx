import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiUser,
} from 'react-icons/fi';
import { downloadReceipt, getOrderHistory, trackOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { Navbar, StatusBadge } from '../components';
import './Cart.css';
import './Orders.css';

const OrderHistory = () => {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [tracking, setTracking] = useState({});
  const [trackLoading, setTrackLoading] = useState(null);
  const [dlLoading, setDlLoading] = useState(null);

  useEffect(() => {
    getOrderHistory()
      .then((res) => setOrders(res.data || []))
      .catch(() => setError('Impossible de charger les commandes.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => setExpanded((current) => (current === id ? null : id));

  const handleTrack = async (orderId) => {
    if (tracking[orderId]) return;
    setTrackLoading(orderId);
    try {
      const res = await trackOrder(orderId);
      setTracking((current) => ({ ...current, [orderId]: res.data }));
    } catch {
      setTracking((current) => ({ ...current, [orderId]: { error: 'Suivi indisponible.' } }));
    } finally {
      setTrackLoading(null);
    }
  };

  const handleDownload = async (orderId) => {
    setDlLoading(orderId);
    try {
      await downloadReceipt(orderId);
    } catch {
      alert('Recu indisponible pour cette commande.');
    } finally {
      setDlLoading(null);
    }
  };

  return (
    <div className="cart-page">
      <Navbar
        variant="honey"
        brandTo="/products"
        links={[
          { to: '/profile', label: user?.prenom || 'Profil', icon: <FiUser /> },
          { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: logout },
        ]}
      />

      <div className="cart-container">
        <div className="cart-header">
          <h1><FiPackage /> Mes Commandes</h1>
          <Link to="/products" className="cart-back-link">Retour aux produits</Link>
        </div>

        {error && <div className="cart-alert cart-alert-error">{error}</div>}

        {loading ? (
          <div className="cart-loading">
            {[1, 2, 3].map((index) => <div key={index} className="cart-skeleton" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="cart-empty">
            <span>Commandes</span>
            <p>Vous n'avez pas encore de commandes.</p>
            <Link to="/products" className="cart-btn-primary">Decouvrir nos produits</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card parchment-card" key={order.id}>
                <div className="order-card-header" onClick={() => toggleExpand(order.id)}>
                  <div className="order-card-meta order-meta">
                    <span className="order-id">Commande #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="order-card-right order-right">
                    <StatusBadge status={order.statut} />
                    <span className="order-total order-amount">{Number(order.total || 0).toFixed(2)} DH</span>
                    {expanded === order.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="order-card-body order-body">
                    {order.articles && order.articles.length > 0 && (
                      <div className="order-articles">
                        <h4>Articles</h4>
                        {order.articles.map((item, index) => (
                          <div className="order-article-row" key={index}>
                            <span>{item.produit?.nom || 'Produit'}</span>
                            <span>x {item.quantite}</span>
                            <span>{((item.prix_unitaire || 0) * item.quantite).toFixed(2)} DH</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="order-actions">
                      <button
                        type="button"
                        className="order-action-btn btn-honey-outline btn-track"
                        onClick={() => handleTrack(order.id)}
                        disabled={trackLoading === order.id}
                      >
                        <FiMapPin />
                        {trackLoading === order.id ? 'Chargement...' : 'Suivre la commande'}
                      </button>

                      <button
                        type="button"
                        className="order-action-btn btn-honey-outline btn-download"
                        onClick={() => handleDownload(order.id)}
                        disabled={dlLoading === order.id}
                      >
                        <FiDownload />
                        {dlLoading === order.id ? 'Telechargement...' : 'Telecharger le recu'}
                      </button>
                    </div>

                    {tracking[order.id] && (
                      <div className="order-tracking-result tracking-result">
                        {tracking[order.id].error ? (
                          <span className="tracking-error">{tracking[order.id].error}</span>
                        ) : (
                          <>
                            <strong>Statut actuel :</strong>
                            <StatusBadge status={tracking[order.id].statut || order.statut} />
                            {tracking[order.id].updated_at && (
                              <span className="tracking-date">
                                Mis a jour le {new Date(tracking[order.id].updated_at).toLocaleString('fr-FR')}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
