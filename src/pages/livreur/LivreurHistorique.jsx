import React, { useEffect, useState } from 'react';
import { FiList, FiLogOut, FiTruck, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components';
import { getHistoriqueLivraisons } from '../../api/livreur';
import './livreur.css';

const PERIODS = [
  { value: '',        label: 'Tout' },
  { value: 'today',  label: "Aujourd'hui" },
  { value: 'week',   label: 'Cette semaine' },
  { value: 'month',  label: 'Ce mois' },
];

const LivreurHistorique = () => {
  const { user, logout } = useAuth();
  const [historique, setHistorique] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [period,     setPeriod]     = useState('');

  useEffect(() => {
    setLoading(true);
    getHistoriqueLivraisons(period)
      .then(res => {
        const data = res?.data ?? res ?? [];
        setHistorique(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Impossible de charger l\'historique.'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="lv-root">
      <Navbar
        variant="default"
        brand="Khayrat Bladi"
        brandTo="/livreur/dashboard"
        links={[
          { to: '/livreur/dashboard',  label: 'Mes Livraisons', icon: <FiTruck /> },
          { to: '/livreur/historique', label: 'Historique',     icon: <FiList /> },
        ]}
        rightLinks={[
          { to: '/profile', label: user?.prenom || 'Profil', icon: <FiUser /> },
          { type: 'button', label: 'Déconnexion', icon: <FiLogOut />, onClick: logout },
        ]}
      />

      <div className="lv-page">
        <div className="lv-header">
          <h1 className="lv-title"><FiList /> Historique des Tournées</h1>
          <span className="lv-total">{historique.length} livraison(s)</span>
        </div>

        {/* Filtres */}
        <div className="lv-filters">
          {PERIODS.map(p => (
            <button
              key={p.value}
              className={`lv-filter-btn${period === p.value ? ' active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && <div className="lv-alert">{error}</div>}

        {loading ? (
          <div className="lv-skeletons">
            {[1,2,3].map(i => <div key={i} className="lv-skeleton" />)}
          </div>
        ) : historique.length === 0 ? (
          <div className="lv-empty">
            <FiList size={48} />
            <p>Aucune livraison terminée pour cette période.</p>
          </div>
        ) : (
          <div className="lv-list">
            {historique.map(l => (
              <div key={l.id} className="lv-card lv-card-done">
                <div className="lv-card-header">
                  <span className="lv-commande-id">Commande #{l.commande_id ?? l.id}</span>
                  <span className="lv-statut" style={{ color: '#10b981' }}>
                    ✅ Livrée
                  </span>
                </div>
                <div className="lv-card-body">
                  <div className="lv-info">
                    <FiCalendar size={14} />
                    <span>{new Date(l.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="lv-info">
                    <FiUser size={14} />
                    <span>{l.commande?.user?.prenom} {l.commande?.user?.nom}</span>
                  </div>
                  <div className="lv-info">
                    <FiMapPin size={14} />
                    <span>{l.commande?.adresse?.ville}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivreurHistorique;