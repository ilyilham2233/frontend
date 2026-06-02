import { useState, useEffect } from 'react';
import { getSellerOrders, getSellerOrder, updateSellerOrderStatus } from '../../api/vendeur';
import './VendeurCommandes.css';

const STATUTS_COMMANDE = [
  { value: 'en_attente',    label: 'En attente',    color: 'amber',  next: 'en_preparation' },
  { value: 'en_preparation',label: 'En préparation',color: 'blue',   next: 'expediee' },
  { value: 'expediee',      label: 'Expédiée',      color: 'purple', next: null },
  { value: 'livree',        label: 'Livrée',         color: 'green',  next: null },
  { value: 'annulee',       label: 'Annulée',        color: 'red',    next: null },
];

const statutInfo = (val) =>
  STATUTS_COMMANDE.find(s => s.value === val) ?? STATUTS_COMMANDE[0];

const NEXT_LABEL = {
  en_preparation: 'Marquer en préparation',
  expediee: 'Marquer expédiée',
};

export default function VendeurCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [detail, setDetail]       = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSellerOrders();
      setCommandes(res.data ?? res);
    } catch {
      setError('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    setDetail({ id, loading: true });
    try {
      const res = await getSellerOrder(id);
      setDetail(res.data ?? res);
    } catch {
      setDetail(null);
      alert('Impossible de charger le détail.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (id, statut) => {
    setUpdatingId(id);
    try {
      await updateSellerOrderStatus(id, statut);
      setCommandes(prev =>
        prev.map(c => c.id === id ? { ...c, statut } : c)
      );
      if (detail?.id === id) setDetail(d => ({ ...d, statut }));
    } catch {
      alert('Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = commandes.filter(c =>
    filterStatut ? c.statut === filterStatut : true
  );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="vc-page">
      {/* Header */}
      <div className="vc-header">
        <div>
          <h1 className="vc-title">Commandes reçues</h1>
          <p className="vc-subtitle">{commandes.length} commande{commandes.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="vc-btn-refresh" onClick={load} title="Actualiser">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 4a8 8 0 1 1 0 12M4 4v4h4"/>
          </svg>
          Actualiser
        </button>
      </div>

      {/* Filter tabs */}
      <div className="vc-tabs">
        <button
          className={`vc-tab ${filterStatut === '' ? 'vc-tab--active' : ''}`}
          onClick={() => setFilterStatut('')}
        >
          Toutes <span className="vc-tab-count">{commandes.length}</span>
        </button>
        {STATUTS_COMMANDE.map(s => {
          const count = commandes.filter(c => c.statut === s.value).length;
          if (count === 0) return null;
          return (
            <button
              key={s.value}
              className={`vc-tab ${filterStatut === s.value ? 'vc-tab--active' : ''}`}
              onClick={() => setFilterStatut(s.value)}
            >
              {s.label} <span className="vc-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="vc-error">{error}</p>}

      {/* Layout: list + detail */}
      <div className={`vc-layout ${detail ? 'vc-layout--split' : ''}`}>
        {/* List */}
        <div className="vc-list">
          {loading ? (
            <div className="vc-loading">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="vc-empty">Aucune commande pour ce statut.</div>
          ) : (
            filtered.map(c => {
              const st = statutInfo(c.statut);
              const isSelected = detail?.id === c.id;
              return (
                <div
                  key={c.id}
                  className={`vc-card ${isSelected ? 'vc-card--selected' : ''}`}
                  onClick={() => openDetail(c.id)}
                >
                  <div className="vc-card-top">
                    <div>
                      <p className="vc-card-id">Commande #{c.id}</p>
                      <p className="vc-card-date">{formatDate(c.created_at)}</p>
                    </div>
                    <span className={`vc-badge vc-badge--${st.color}`}>{st.label}</span>
                  </div>
                  <div className="vc-card-bottom">
                    <span className="vc-card-total">{parseFloat(c.prix_total).toFixed(2)} DH</span>
                    {st.next && (
                      <button
                        className="vc-btn-action"
                        onClick={e => { e.stopPropagation(); handleUpdateStatus(c.id, st.next); }}
                        disabled={updatingId === c.id}
                      >
                        {updatingId === c.id ? '…' : NEXT_LABEL[st.next] ?? 'Avancer'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="vc-detail">
            <div className="vc-detail-header">
              <h2>Commande #{detail.id}</h2>
              <button className="vc-detail-close" onClick={() => setDetail(null)} aria-label="Fermer">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 5l10 10M15 5 5 15"/>
                </svg>
              </button>
            </div>

            {detail.loading ? (
              <div className="vc-loading">Chargement du détail…</div>
            ) : (
              <>
                <div className="vc-detail-meta">
                  <div className="vc-meta-row">
                    <span className="vc-meta-label">Date</span>
                    <span>{formatDate(detail.created_at)}</span>
                  </div>
                  <div className="vc-meta-row">
                    <span className="vc-meta-label">Statut</span>
                    <span className={`vc-badge vc-badge--${statutInfo(detail.statut).color}`}>
                      {statutInfo(detail.statut).label}
                    </span>
                  </div>
                  <div className="vc-meta-row">
                    <span className="vc-meta-label">Total</span>
                    <span className="vc-detail-total">{parseFloat(detail.prix_total ?? 0).toFixed(2)} DH</span>
                  </div>
                </div>

                {/* Articles */}
                {detail.articles && detail.articles.length > 0 && (
                  <div className="vc-articles">
                    <p className="vc-section-label">Articles ({detail.articles.length})</p>
                    {detail.articles.map((a, i) => (
                      <div key={i} className="vc-article-row">
                        <div className="vc-article-info">
                          <p className="vc-article-name">{a.produit?.nom ?? `Produit #${a.produit_id}`}</p>
                          <p className="vc-article-qty">Qté : {a.quantite}</p>
                        </div>
                        <p className="vc-article-price">
                          {(parseFloat(a.prix_unitaire) * a.quantite).toFixed(2)} DH
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {(() => {
                  const st = statutInfo(detail.statut);
                  return st.next ? (
                    <div className="vc-detail-actions">
                      <button
                        className="vc-btn-primary"
                        onClick={() => handleUpdateStatus(detail.id, st.next)}
                        disabled={updatingId === detail.id}
                      >
                        {updatingId === detail.id ? 'Mise à jour…' : NEXT_LABEL[st.next] ?? 'Avancer'}
                      </button>
                      {detail.statut === 'en_attente' && (
                        <button
                          className="vc-btn-danger"
                          onClick={() => handleUpdateStatus(detail.id, 'annulee')}
                          disabled={updatingId === detail.id}
                        >
                          Annuler la commande
                        </button>
                      )}
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}