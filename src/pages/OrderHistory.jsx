import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiDownload, FiMapPin, FiChevronDown, FiChevronUp,
  FiUser, FiLogOut, FiClock, FiCheckCircle, FiXCircle, FiTruck
} from 'react-icons/fi';
import { getOrderHistory, trackOrder, downloadReceipt } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

// ── Statut badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    en_attente:  { label: 'En attente',  icon: <FiClock />,        cls: 'status-pending'   },
    confirmee:   { label: 'Confirmée',   icon: <FiCheckCircle />,  cls: 'status-confirmed' },
    refusee:     { label: 'Refusée',     icon: <FiXCircle />,      cls: 'status-refused'   },
    recuperee:   { label: 'Récupérée',   icon: <FiPackage />,      cls: 'status-picked'    },
    livree:      { label: 'Livrée',      icon: <FiCheckCircle />,  cls: 'status-delivered' },
    en_livraison:{ label: 'En livraison',icon: <FiTruck />,        cls: 'status-shipping'  },
  };
  const s = map[status] || { label: status, icon: <FiClock />, cls: 'status-pending' };
  return (
    <span className={`order-status-badge ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const OrderHistory = () => {
  const { logout, user } = useAuth();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState(null);
  const [tracking, setTracking]   = useState({});
  const [trackLoading, setTrackLoading] = useState(null);
  const [dlLoading, setDlLoading] = useState(null);

  useEffect(() => {
    getOrderHistory()
      .then(res => setOrders(res.data || []))
      .catch(() => setError('Impossible de charger les commandes.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const handleTrack = async (orderId) => {
    if (tracking[orderId]) return;
    setTrackLoading(orderId);
    try {
      const res = await trackOrder(orderId);
      setTracking(prev => ({ ...prev, [orderId]: res.data }));
    } catch {
      setTracking(prev => ({ ...prev, [orderId]: { error: 'Suivi indisponible.' } }));
    } finally {
      setTrackLoading(null);
    }
  };

  const handleDownload = async (orderId) => {
    setDlLoading(orderId);
    try {
      await downloadReceipt(orderId);
    } catch {
      alert('Reçu indisponible pour cette commande.');
    } finally {
      setDlLoading(null);
    }
  };

  return (
   <div className="orders-page">
      {/* Navbar */}
      <nav className="honey-nav">
        <Link to="/products" className="honey-brand">
          <span className="honey-brand-icon">🍯</span>
          <span className="honey-brand-text">khayrat bladi</span>
        </Link>
        <div className="navbar-links">
          <Link to="/profile" className="nav-link"><FiUser /> {user?.prenom || 'Profil'}</Link>
          <button onClick={logout} className="nav-link nav-btn"><FiLogOut /> Déconnexion</button>
        </div>
      </nav>

      <div className="cart-container">
        <div className="cart-header">
          <h1><FiPackage /> Mes Commandes</h1>
          <Link to="/products" className="cart-back-link">Retour aux produits</Link>
        </div>

        {error && <div className="cart-alert cart-alert-error">{error}</div>}

        {loading ? (
          <div className="cart-loading">
            {[1,2,3].map(i => <div key={i} className="cart-skeleton" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="cart-empty">
            <span>📦</span>
            <p>Vous n'avez pas encore de commandes.</p>
            <Link to="/products" className="cart-btn-primary">Découvrir nos produits</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div className="order-card" key={order.id}>

                {/* Header commande */}
                <div className="order-card-header" onClick={() => toggleExpand(order.id)}>
                  <div className="order-card-meta">
                    <span className="order-id">Commande #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="order-card-right">
                    <StatusBadge status={order.statut} />
                    <span className="order-total">{Number(order.total || 0).toFixed(2)} DH</span>
                    {expanded === order.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {/* Détails dépliables */}
                {expanded === order.id && (
                  <div className="order-card-body">

                    {/* Articles */}
                    {order.articles && order.articles.length > 0 && (
                      <div className="order-articles">
                        <h4>Articles</h4>
                        {order.articles.map((item, i) => (
                          <div className="order-article-row" key={i}>
                            <span>{item.produit?.nom || 'Produit'}</span>
                            <span>× {item.quantite}</span>
                            <span>{((item.prix_unitaire || 0) * item.quantite).toFixed(2)} DH</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="order-actions">
                      {/* Suivi */}
                      <button
                        className="order-action-btn order-track-btn"
                        onClick={() => handleTrack(order.id)}
                        disabled={trackLoading === order.id}
                      >
                        <FiMapPin />
                        {trackLoading === order.id ? 'Chargement...' : 'Suivre la commande'}
                      </button>

                      {/* Télécharger reçu */}
                      <button
                        className="order-action-btn order-dl-btn"
                        onClick={() => handleDownload(order.id)}
                        disabled={dlLoading === order.id}
                      >
                        <FiDownload />
                        {dlLoading === order.id ? 'Téléchargement...' : 'Télécharger le reçu'}
                      </button>
                    </div>

                    {/* Résultat suivi */}
                    {tracking[order.id] && (
                      <div className="order-tracking-result">
                        {tracking[order.id].error ? (
                          <span className="tracking-error">{tracking[order.id].error}</span>
                        ) : (
                          <>
                            <strong>Statut actuel :</strong>
                            <StatusBadge status={tracking[order.id].statut || order.statut} />
                            {tracking[order.id].updated_at && (
                              <span className="tracking-date">
                                Mis à jour le {new Date(tracking[order.id].updated_at).toLocaleString('fr-FR')}
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