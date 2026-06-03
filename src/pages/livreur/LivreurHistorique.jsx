import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiList, FiTruck, FiUser, FiLogOut, FiCheckCircle,
  FiAlertCircle, FiCalendar, FiPackage, FiClock,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components';
import { getHistoriqueLivraisons } from '../../api/livreur';
import './Livreur.css';

const PERIODS = [
  { value: '',           label: "Toutes" },
  { value: 'today',      label: "Aujourd'hui" },
  { value: 'week',       label: 'Cette semaine' },
  { value: 'month',      label: 'Ce mois' },
  { value: 'last_month', label: 'Mois dernier' },
];

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const fmtHour = (d) => d
  ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  : '';

const LivreurHistorique = () => {
  const { user, logout } = useAuth();
  const [historique, setHistorique] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [period,     setPeriod]     = useState('month');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getHistoriqueLivraisons(period)
      .then(res => {
        const raw = res?.data ?? res;
        const list = raw?.livraisons ?? raw?.data ?? raw;
        const arr = Array.isArray(list) ? list : [];
        setHistorique(arr);
        setTotal(raw?.total ?? arr.length);
      })
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const livrees    = historique.filter(l => l.statut_suivi === 'livree');
  const nonLivrees = historique.filter(l => l.statut_suivi === 'non_livree');
  const taux       = historique.length > 0
    ? Math.round((livrees.length / historique.length) * 100)
    : 0;

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

        {/* ── Hero ── */}
        <header className="lv-hero">
          <div className="lv-hero-text">
            <span className="lv-kicker">Historique</span>
            <h1 className="lv-headline"><em>Mes tournées</em></h1>
            <p className="lv-tagline">{total} livraison{total !== 1 ? 's' : ''} au total</p>
          </div>
          <Link to="/livreur/dashboard" className="lv-hist-btn">
            <FiTruck size={14} /> Livraisons actives
          </Link>
        </header>

        {/* ── Period tabs ── */}
        <div className="lv-periods">
          {PERIODS.map(p => (
            <button
              key={p.value}
              className={`lv-period-btn ${period === p.value ? 'lv-period-btn--active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── KPIs ── */}
        {!loading && historique.length > 0 && (
          <div className="lv-kpis lv-kpis--hist">
            <div className="lv-kpi lv-kpi--gold">
              <FiPackage size={16} />
              <span className="lv-kpi-num">{historique.length}</span>
              <span className="lv-kpi-label">Total</span>
            </div>
            <div className="lv-kpi lv-kpi--green">
              <FiCheckCircle size={16} />
              <span className="lv-kpi-num">{livrees.length}</span>
              <span className="lv-kpi-label">Livrées</span>
            </div>
            <div className="lv-kpi lv-kpi--red">
              <FiAlertCircle size={16} />
              <span className="lv-kpi-num">{nonLivrees.length}</span>
              <span className="lv-kpi-label">Non livrées</span>
            </div>
            <div className="lv-kpi lv-kpi--blue">
              <FiClock size={16} />
              <span className="lv-kpi-num">{taux}%</span>
              <span className="lv-kpi-label">Taux réussite</span>
            </div>
          </div>
        )}

        {/* ── Barre de progression ── */}
        {!loading && historique.length > 0 && (
          <div className="lv-progress-section">
            <div className="lv-progress-bar-wrap">
              <div
                className="lv-progress-bar-fill"
                style={{ width: `${taux}%` }}
              />
            </div>
            <span className="lv-progress-label">{taux}% de réussite</span>
          </div>
        )}

        {error && (
          <div className="lv-alert">
            <FiAlertCircle size={15} /> {error}
            <button onClick={() => setError('')} className="lv-alert-close">✕</button>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="lv-skeletons">
            {[1,2,3,4].map(i => <div key={i} className="lv-skeleton" />)}
          </div>
        ) : historique.length === 0 ? (
          <div className="lv-empty">
            <div className="lv-empty-icon"><FiList size={36} /></div>
            <p className="lv-empty-title">Aucune livraison pour cette période</p>
            <p className="lv-empty-sub">Essayez une autre période ou revenez plus tard.</p>
          </div>
        ) : (
          <div className="lv-hist-table-wrap">
            <table className="lv-hist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Date estimée</th>
                  <th>Livré le</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {historique.map(l => {
                  const isLivree = l.statut_suivi === 'livree';
                  return (
                    <tr key={l.id} className={`lv-hist-row ${isLivree ? 'lv-hist-row--livree' : 'lv-hist-row--fail'}`}>
                      <td className="lv-hist-id">#{l.id}</td>
                      <td>#{l.commande_id ?? '—'}</td>
                      <td>
                        {l.commande?.user
                          ? `${l.commande.user.prenom} ${l.commande.user.nom}`
                          : '—'}
                      </td>
                      <td>
                        <div className="lv-hist-date">
                          <FiCalendar size={11} />
                          {fmt(l.date_livraison_estimee)}
                        </div>
                      </td>
                      <td>
                        {l.livre_le
                          ? <div className="lv-hist-date"><FiClock size={11}/>{fmt(l.livre_le)} {fmtHour(l.livre_le)}</div>
                          : <span className="lv-hist-na">—</span>}
                      </td>
                      <td className="lv-hist-prix">
                        {l.commande?.prix_total
                          ? `${parseFloat(l.commande.prix_total).toFixed(2)} DH`
                          : '—'}
                      </td>
                      <td>
                        {isLivree
                          ? <span className="lv-hist-badge lv-hist-badge--livree"><FiCheckCircle size={11}/> Livrée</span>
                          : <span className="lv-hist-badge lv-hist-badge--fail"><FiAlertCircle size={11}/> Non livrée</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivreurHistorique;