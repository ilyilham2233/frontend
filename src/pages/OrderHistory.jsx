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
  FiAlertCircle,
  FiShoppingBag,
} from 'react-icons/fi';
import { downloadReceipt, getOrderHistory, trackOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { Navbar, StatusBadge } from '../components';
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

  const toggleExpand = (id) => setExpanded((cur) => (cur === id ? null : id));

  const handleTrack = async (orderId) => {
    if (tracking[orderId]) return;
    setTrackLoading(orderId);
    try {
      const res = await trackOrder(orderId);
      setTracking((cur) => ({ ...cur, [orderId]: res.data }));
    } catch {
      setTracking((cur) => ({ ...cur, [orderId]: { error: 'Suivi indisponible.' } }));
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

  return (
    <div className="oh-page">
      <Navbar
        variant="honey"
        brandTo="/products"
        links={[
          { to: '/profile', label: user?.prenom || 'Profil', icon: <FiUser /> },
          { type: 'button', label: 'Deconnexion', icon: <FiLogOut />, onClick: logout },
        ]}
      />

      <div className="oh-container">

        {/* Header */}
        <div className="oh-header">
          <h1 className="oh-title"><FiPackage /> Mes Commandes</h1>
          <Link to="/products" className="oh-back-link">
            ← Retour aux produits
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="oh-alert">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="oh-skeletons">
            {[1, 2, 3].map((i) => <div key={i} className="oh-skeleton" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && !error && (
          <div className="oh-empty">
            <FiShoppingBag size={48} />
            <p>Vous n'avez pas encore de commandes.</p>
            <Link to="/products" className="oh-cta-btn">Découvrir nos produits</Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="oh-list">
            {orders.map((order) => {
              const isOpen = expanded === order.id;
              const total = Number(order.total || 0).toFixed(2);

              return (
                <div className={`oh-card${isOpen ? ' oh-card--open' : ''}`} key={order.id}>

                  {/* Card header — toujours visible */}
                  <div className="oh-card-header" onClick={() => toggleExpand(order.id)}>
                    <div className="oh-card-left">
                      <span className="oh-order-num">Commande #{order.id}</span>
                      <span className="oh-order-date">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="oh-card-right">
                      <StatusBadge status={order.statut} />
                      <span className="oh-order-total">{total} DH</span>
                      <span className="oh-chevron">
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    </div>
                  </div>

                  {/* Card body — expandable */}
                  {isOpen && (
                    <div className="oh-card-body">

                      {/* Articles */}
                      {order.articles && order.articles.length > 0 && (
                        <div className="oh-articles">
                          <p className="oh-articles-title">Articles commandés</p>
                          <div className="oh-articles-list">
                            {order.articles.map((item, idx) => (
                              <div className="oh-article-row" key={idx}>
                                <span className="oh-article-name">
                                  {item.produit?.nom || 'Produit'}
                                </span>
                                <span className="oh-article-qty">× {item.quantite}</span>
                                <span className="oh-article-price">
                                  {((item.prix_unitaire || 0) * item.quantite).toFixed(2)} DH
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="oh-articles-total">
                            <span>Total</span>
                            <span>{total} DH</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="oh-actions">
                        <button
                          type="button"
                          className="oh-btn oh-btn--track"
                          onClick={() => handleTrack(order.id)}
                          disabled={trackLoading === order.id}
                        >
                          <FiMapPin size={14} />
                          {trackLoading === order.id ? 'Chargement...' : 'Suivre la commande'}
                        </button>

                        <button
                          type="button"
                          className="oh-btn oh-btn--download"
                          onClick={() => handleDownload(order.id)}
                          disabled={dlLoading === order.id}
                        >
                          <FiDownload size={14} />
                          {dlLoading === order.id ? 'Téléchargement...' : 'Télécharger le reçu'}
                        </button>
                      </div>

                      {/* Tracking result */}
                      {tracking[order.id] && (
                        <div className="oh-tracking">
                          {tracking[order.id].error ? (
                            <span className="oh-tracking-error">{tracking[order.id].error}</span>
                          ) : (
                            <>
                              <strong>Statut :</strong>
                              <StatusBadge status={tracking[order.id].statut || order.statut} />
                              {tracking[order.id].updated_at && (
                                <span className="oh-tracking-date">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;