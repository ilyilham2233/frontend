import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiMapPin, FiUser, FiLogOut,
  FiClock, FiCheckCircle, FiTruck, FiList,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components';
import {
  getLivraisonsAssignees,
  updateStatutLivraison,
  confirmerLivraison,
} from '../../api/livreur';
import './livreur.css';

const STATUT_LABELS = {
  assignee:   { label: 'Assignée',   color: '#f59e0b', icon: <FiClock /> },
  en_route:   { label: 'En route',   color: '#3b82f6', icon: <FiTruck /> },
  livree:     { label: 'Livrée',     color: '#10b981', icon: <FiCheckCircle /> },
  echouee:    { label: 'Échouée',    color: '#ef4444', icon: <FiPackage /> },
};

const LivreurDashboard = () => {
  const { user, logout } = useAuth();
  const [livraisons, setLivraisons] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [updating,   setUpdating]   = useState(null);

  useEffect(() => {
    getLivraisonsAssignees()
      .then(res => {
        const data = res?.data ?? res ?? [];
        setLivraisons(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Impossible de charger les livraisons.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await updateStatutLivraison(id, statut);
      setLivraisons(prev =>
        prev.map(l => l.id === id ? { ...l, statut } : l)
      );
    } catch {
      setError('Erreur lors de la mise à jour.');
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmer = async (id) => {
    setUpdating(id);
    try {
      await confirmerLivraison(id);
      setLivraisons(prev =>
        prev.map(l => l.id === id ? { ...l, statut: 'livree' } : l)
      );
    } catch {
      setError('Erreur lors de la confirmation.');
    } finally {
      setUpdating(null);
    }
  };

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
          <h1 className="lv-title"><FiTruck /> Mes Livraisons Assignées</h1>
          <Link to="/livreur/historique" className="lv-link-hist">
            <FiList /> Voir l'historique
          </Link>
        </div>

        {error && <div className="lv-alert">{error}</div>}

        {loading ? (
          <div className="lv-skeletons">
            {[1,2,3].map(i => <div key={i} className="lv-skeleton" />)}
          </div>
        ) : livraisons.length === 0 ? (
          <div className="lv-empty">
            <FiPackage size={48} />
            <p>Aucune livraison assignée pour le moment.</p>
          </div>
        ) : (
          <div className="lv-list">
            {livraisons.map(l => {
              const statut = STATUT_LABELS[l.statut] || STATUT_LABELS.assignee;
              return (
                <div key={l.id} className="lv-card">
                  <div className="lv-card-header">
                    <span className="lv-commande-id">Commande #{l.commande_id ?? l.id}</span>
                    <span className="lv-statut" style={{ color: statut.color }}>
                      {statut.icon} {statut.label}
                    </span>
                  </div>

                  <div className="lv-card-body">
                    <div className="lv-info">
                      <FiUser size={14} />
                      <span>{l.commande?.user?.prenom} {l.commande?.user?.nom}</span>
                    </div>
                    <div className="lv-info">
                      <FiMapPin size={14} />
                      <span>
                        {l.commande?.adresse?.rue}, {l.commande?.adresse?.ville} — {l.commande?.adresse?.code_postal}
                      </span>
                    </div>
                    <div className="lv-info">
                      <FiPackage size={14} />
                      <span>{l.commande?.prix_total} DH</span>
                    </div>
                  </div>

                  <div className="lv-card-actions">
                    {l.statut === 'assignee' && (
                      <button
                        className="lv-btn lv-btn-blue"
                        onClick={() => handleStatut(l.id, 'en_route')}
                        disabled={updating === l.id}
                      >
                        <FiTruck size={14} /> Récupérée — En route
                      </button>
                    )}
                    {l.statut === 'en_route' && (
                      <button
                        className="lv-btn lv-btn-green"
                        onClick={() => handleConfirmer(l.id)}
                        disabled={updating === l.id}
                      >
                        <FiCheckCircle size={14} /> Confirmer la livraison
                      </button>
                    )}
                    {l.statut === 'livree' && (
                      <span className="lv-done">✅ Livraison confirmée</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivreurDashboard;