import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTruck, FiList, FiUser, FiLogOut, FiPackage,
  FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw,
  FiChevronRight, FiCalendar,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components';
import {
  getLivraisonsAssignees,
  updateStatutLivraison,
  confirmerLivraison,
  getHistoriqueLivraisons,
} from '../../api/livreur';
import './livreur.css';

/* ── Statuts selon openapi.yaml ── */
const STATUTS = {
  assignee:   { label: 'Assignée',     color: '#b8860b', bg: '#fef9ec', icon: <FiClock />,       step: 0 },
  recuperee:  { label: 'Récupérée',    color: '#c2410c', bg: '#fff7ed', icon: <FiPackage />,      step: 1 },
  en_cours:   { label: 'En cours',     color: '#1d4ed8', bg: '#eff6ff', icon: <FiTruck />,        step: 2 },
  livree:     { label: 'Livrée',       color: '#15803d', bg: '#f0fdf4', icon: <FiCheckCircle />,  step: 3 },
  non_livree: { label: 'Non livrée',   color: '#dc2626', bg: '#fef2f2', icon: <FiAlertCircle />,  step: -1 },
};

/* Quelle action proposer selon le statut actuel */
const PROCHAINE_ACTION = {
  assignee:  { statut: 'recuperee', label: 'Marquer récupérée', icon: <FiPackage size={14} /> },
  recuperee: { statut: 'en_cours',  label: 'Démarrer la livraison', icon: <FiTruck size={14} /> },
  en_cours:  null, // → confirmerLivraison
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const LivreurDashboard = () => {
  const { user, logout } = useAuth();
  const [livraisons, setLivraisons] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [updating,   setUpdating]   = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [successId,  setSuccessId]  = useState(null);

 const load = useCallback(() => {
  setLoading(true);
  setError('');
  Promise.all([
    getLivraisonsAssignees(),
    getHistoriqueLivraisons('month'),
  ])
    .then(([resAssigned, resHistory]) => {
      const assigned = (() => {
        const raw = resAssigned?.data ?? resAssigned;
        const list = raw?.livraisons ?? raw?.data ?? raw;
        return Array.isArray(list) ? list : [];
      })();
      const history = (() => {
        const raw = resHistory?.data ?? resHistory;
        const list = raw?.livraisons ?? raw?.data ?? raw;
        return Array.isArray(list) ? list : [];
      })();
      // Fusionner sans doublons
      const ids = new Set(assigned.map(l => l.id));
      const all = [...assigned, ...history.filter(l => !ids.has(l.id))];
      setLivraisons(all);
    })
    .catch(() => setError('Impossible de charger les livraisons.'))
    .finally(() => setLoading(false));
}, []);

  useEffect(() => { load(); }, [load]);

  const handleStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await updateStatutLivraison(id, statut);
      setLivraisons(prev =>
        prev.map(l => l.id === id ? { ...l, statut_suivi: statut } : l)
      );
    } catch {
      setError('Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdating(null);
    }
  };
  const handleConfirmer = async (id) => {
    setUpdating(id);
    setConfirmId(null);
    try {
      await confirmerLivraison(id);
      setLivraisons(prev =>
        prev.map(l => l.id === id ? { ...l, statut_suivi: 'livree' } : l)
      );
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 3000);
    } catch {
      setError('Erreur lors de la confirmation.');
    } finally {
      setUpdating(null);
    }
  };

  /* Stats rapides */
  const stats = {
    total:      livraisons.length,
    assignee:   livraisons.filter(l => l.statut_suivi === 'assignee').length,
    en_cours:   livraisons.filter(l => l.statut_suivi === 'en_cours').length,
    livrees:    livraisons.filter(l => l.statut_suivi === 'livree').length,
  };

 const actives  = livraisons;
const termines = [];

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

        {/* ── Hero header ── */}
        <header className="lv-hero">
          <div className="lv-hero-text">
            <span className="lv-kicker">Espace Livreur</span>
            <h1 className="lv-headline">
              Bonjour, <em>{user?.prenom || 'Livreur'}</em> 🚚
            </h1>
            <p className="lv-tagline">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="lv-hero-actions">
            <button className="lv-refresh-btn" onClick={load} disabled={loading}>
              <FiRefreshCw size={14} className={loading ? 'lv-spin' : ''} />
              Actualiser
            </button>
            <Link to="/livreur/historique" className="lv-hist-btn">
              <FiList size={14} /> Historique
            </Link>
          </div>
        </header>

        {/* ── KPIs ── */}
        <div className="lv-kpis">
          <div className="lv-kpi lv-kpi--gold">
            <span className="lv-kpi-num">{stats.total}</span>
            <span className="lv-kpi-label">Total</span>
          </div>
          <div className="lv-kpi lv-kpi--amber">
            <FiClock size={16} />
            <span className="lv-kpi-num">{stats.assignee}</span>
            <span className="lv-kpi-label">Assignées</span>
          </div>
          <div className="lv-kpi lv-kpi--blue">
            <FiTruck size={16} />
            <span className="lv-kpi-num">{stats.en_cours}</span>
            <span className="lv-kpi-label">En cours</span>
          </div>
          <div className="lv-kpi lv-kpi--green">
            <FiCheckCircle size={16} />
            <span className="lv-kpi-num">{stats.livrees}</span>
            <span className="lv-kpi-label">Livrées</span>
          </div>
        </div>

        {/* ── Alert ── */}
        {error && (
          <div className="lv-alert">
            <FiAlertCircle size={15} /> {error}
            <button onClick={() => setError('')} className="lv-alert-close">✕</button>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="lv-skeletons">
            {[1,2,3].map(i => <div key={i} className="lv-skeleton" />)}
          </div>
        ) : livraisons.length === 0 ? (
          <div className="lv-empty">
            <div className="lv-empty-icon"><FiPackage size={36} /></div>
            <p className="lv-empty-title">Aucune livraison assignée</p>
            <p className="lv-empty-sub">Revenez plus tard ou actualisez la page.</p>
          </div>
        ) : (
          <>
            {/* Actives */}
            {actives.length > 0 && (
              <section className="lv-section">
                <h2 className="lv-section-title">En attente · {actives.length}</h2>
                <div className="lv-list">
                  {actives.map(l => (
                    <LivraisonCard
                      key={l.id}
                      livraison={l}
                      updating={updating}
                      successId={successId}
                      onStatut={handleStatut}
                      onConfirmRequest={() => setConfirmId(l.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Terminées */}
            {termines.length > 0 && (
              <section className="lv-section">
                <h2 className="lv-section-title lv-section-title--muted">Terminées · {termines.length}</h2>
                <div className="lv-list">
                  {termines.map(l => (
                    <LivraisonCard
                      key={l.id}
                      livraison={l}
                      updating={updating}
                      successId={successId}
                      onStatut={handleStatut}
                      onConfirmRequest={() => setConfirmId(l.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Confirm modal ── */}
      {confirmId && (
        <div className="lv-overlay" onClick={e => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="lv-modal">
            <div className="lv-modal-icon"><FiCheckCircle size={32} /></div>
            <h3>Confirmer la livraison ?</h3>
            <p>La livraison <strong>#{confirmId}</strong> sera marquée comme remise au client.</p>
            <div className="lv-modal-actions">
              <button className="lv-modal-cancel" onClick={() => setConfirmId(null)}>Annuler</button>
              <button
                className="lv-modal-confirm"
                onClick={() => handleConfirmer(confirmId)}
                disabled={updating === confirmId}
              >
                {updating === confirmId ? 'Confirmation…' : '✅ Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Card composant ── */
const LivraisonCard = ({ livraison: l, updating, successId, onStatut, onConfirmRequest }) => {
  const statut = STATUTS[l.statut_suivi] ?? STATUTS.assignee;
  const action = PROCHAINE_ACTION[l.statut_suivi];
  const isSuccess = successId === l.id;

  return (
    <article className={`lv-card ${isSuccess ? 'lv-card--success' : ''} ${['livree','non_livree'].includes(l.statut_suivi) ? 'lv-card--done' : ''}`}>

      {/* Top */}
      <div className="lv-card-top">
        <div className="lv-card-ids">
          <span className="lv-card-id">Livraison #{l.id}</span>
          <span className="lv-card-sub">Commande #{l.commande_id ?? '—'}</span>
        </div>
        <span className="lv-badge" style={{ color: statut.color, background: statut.bg }}>
          {statut.icon} {statut.label}
        </span>
      </div>

      {/* Progress steps */}
      {statut.step >= 0 && (
        <div className="lv-steps">
          {['Assignée','Récupérée','En cours','Livrée'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`lv-step-dot ${i <= statut.step ? 'lv-step-dot--active' : ''}`}>
                {i < statut.step ? '✓' : i + 1}
              </div>
              {i < 3 && <div className={`lv-step-line ${i < statut.step ? 'lv-step-line--active' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="lv-card-info">
        {l.commande?.user && (
          <div className="lv-info-row">
            <FiUser size={13} />
            <span>{l.commande.user.prenom} {l.commande.user.nom}</span>
          </div>
        )}
        {l.date_livraison_estimee && (
          <div className="lv-info-row">
            <FiCalendar size={13} />
            <span>Estimée : {fmt(l.date_livraison_estimee)}</span>
          </div>
        )}
        {l.commande?.prix_total && (
          <div className="lv-info-row lv-info-row--prix">
            <span>{parseFloat(l.commande.prix_total).toFixed(2)} DH</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="lv-card-actions">
        {isSuccess && (
          <span className="lv-success-msg">✅ Livraison confirmée !</span>
        )}
        {!isSuccess && action && (
          <button
            className="lv-btn lv-btn--honey"
            onClick={() => onStatut(l.id, action.statut)}
            disabled={updating === l.id}
          >
            {updating === l.id ? <span className="lv-btn-spinner" /> : action.icon}
            {updating === l.id ? 'Mise à jour…' : action.label}
          </button>
        )}
        {!isSuccess && l.statut_suivi === 'en_cours' && (
          <>
            <button
              className="lv-btn lv-btn--green"
              onClick={onConfirmRequest}
              disabled={updating === l.id}
            >
              <FiCheckCircle size={14} /> Confirmer livrée
            </button>
            <button
              className="lv-btn lv-btn--danger"
              onClick={() => onStatut(l.id, 'non_livree')}
              disabled={updating === l.id}
            >
              <FiAlertCircle size={14} /> Non livrée
            </button>
          </>
        )}
        {l.statut_suivi === 'livree' && !isSuccess && (
          <span className="lv-done-label"><FiCheckCircle size={13} /> Livraison confirmée</span>
        )}
        {l.statut_suivi === 'non_livree' && (
          <span className="lv-fail-label"><FiAlertCircle size={13} /> Non livrée</span>
        )}
      </div>
    </article>
  );
};

export default LivreurDashboard;