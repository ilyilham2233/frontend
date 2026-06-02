import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerStats, downloadSellerStatsPdf } from '../../api/vendeur';
import './VendeurDashboard.css';

export default function VendeurDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerStats()
      .then(res => setStats(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="vd-page">
      <div className="vd-header">
        <div>
          <h1 className="vd-title">Tableau de bord</h1>
          <p className="vd-subtitle">Bienvenue dans votre espace vendeur</p>
        </div>
        <button className="vd-btn-pdf" onClick={downloadSellerStatsPdf}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 14v2a2 2 0 002 2h8a2 2 0 002-2v-2M10 3v10M7 10l3 3 3-3"/>
          </svg>
          Télécharger PDF
        </button>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="vd-loading">Chargement des statistiques…</div>
      ) : (
        <div className="vd-stats-grid">
          <StatCard
         label="Produits"
         value={stats?.nombre_produits ?? '—'}
         icon={<BoxIcon />}
         color="honey"
                   />
       <StatCard
        label="Commandes totales"
        value={stats?.nombre_commandes ?? '—'}
     icon={<OrderIcon />}
     color="blue"
        />
     <StatCard
  label="Chiffre d'affaires"
  value={stats?.total_ventes != null ? `${parseFloat(stats.total_ventes).toFixed(2)} DH` : '—'}
  icon={<MoneyIcon />}
  color="green"
       />
        </div>
      )}

      {/* Quick links */}
      <div className="vd-quick">
        <Link to="/vendeur/produits" className="vd-quick-card">
          <div className="vd-quick-icon vd-quick-icon--honey">
            <BoxIcon />
          </div>
          <div>
            <p className="vd-quick-title">Gérer mes produits</p>
            <p className="vd-quick-desc">Ajouter, modifier ou supprimer des produits</p>
          </div>
          <svg className="vd-quick-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M7 10h6M10 7l3 3-3 3"/>
          </svg>
        </Link>

        <Link to="/vendeur/commandes" className="vd-quick-card">
          <div className="vd-quick-icon vd-quick-icon--blue">
            <OrderIcon />
          </div>
          <div>
            <p className="vd-quick-title">Mes commandes</p>
            <p className="vd-quick-desc">Suivre et mettre à jour le statut des commandes</p>
          </div>
          <svg className="vd-quick-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M7 10h6M10 7l3 3-3 3"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`vd-stat vd-stat--${color}`}>
      <div className="vd-stat-icon">{icon}</div>
      <div>
        <p className="vd-stat-value">{value}</p>
        <p className="vd-stat-label">{label}</p>
      </div>
    </div>
  );
}

const BoxIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 8l7-5 7 5v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
    <path d="M8 18V12h4v6"/>
  </svg>
);

const OrderIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 4h12v2L13 10l3 4v2H4v-2l3-4-3-4V4z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>
  </svg>
);

const MoneyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="5" width="16" height="12" rx="2"/>
    <circle cx="10" cy="11" r="2.5"/>
    <path d="M6 8h.01M14 8h.01"/>
  </svg>
);