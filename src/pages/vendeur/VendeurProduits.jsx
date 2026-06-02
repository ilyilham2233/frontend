import { useState, useEffect, useRef } from 'react';
import {
  getSellerProducts,
  storeSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from '../../api/vendeur';
import './VendeurProduits .css';

const STATUTS = [
  { value: 'en_attente', label: 'En attente', color: 'amber' },
  { value: 'actif',      label: 'Actif',      color: 'green' },
  { value: 'masque',     label: 'Masqué',     color: 'gray'  },
];

const EMPTY_FORM = {
  nom: '',
  description: '',
  categorie_id: '',
  prix: '',
  quantite_stock: '',
  image_url: '',
  statut: 'en_attente',
};

export default function VendeurProduits() {
  const [produits, setProduits]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch]       = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const firstInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSellerProducts();
      setProduits(res.data ?? res);
    } catch {
      setError('Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showModal && firstInputRef.current) firstInputRef.current.focus();
  }, [showModal]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      nom:            p.nom,
      description:    p.description ?? '',
      categorie_id:   p.categorie_id ?? '',
      prix:           p.prix,
      quantite_stock: p.quantite_stock,
      image_url:      p.image_url ?? '',
      statut:         p.statut,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateSellerProduct(editId, form);
      } else {
        await storeSellerProduct(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    setDeletingId(id);
    try {
      await deleteSellerProduct(id);
      setProduits(p => p.filter(x => x.id !== id));
    } catch {
      alert('Impossible de supprimer ce produit.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = produits.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut ? p.statut === filterStatut : true;
    return matchSearch && matchStatut;
  });

  const statutInfo = (val) => STATUTS.find(s => s.value === val) ?? STATUTS[0];

  return (
    <div className="vp-page">
      {/* Header */}
      <div className="vp-header">
        <div>
          <h1 className="vp-title">Mes produits</h1>
          <p className="vp-subtitle">{produits.length} produit{produits.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="vp-btn-primary" onClick={openCreate}>
          + Ajouter un produit
        </button>
      </div>

      {/* Filters */}
      <div className="vp-filters">
        <div className="vp-search-wrap">
          <svg className="vp-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="9" cy="9" r="5.5"/><path d="M14.5 14.5 18 18"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="vp-search-input"
          />
        </div>
        <select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          className="vp-select"
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && <p className="vp-error">{error}</p>}

      {/* Table */}
      {loading ? (
        <div className="vp-loading">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="vp-empty">
          <p>Aucun produit trouvé.</p>
          {produits.length === 0 && (
            <button className="vp-btn-primary" onClick={openCreate}>
              Ajouter votre premier produit
            </button>
          )}
        </div>
      ) : (
        <div className="vp-table-wrap">
          <table className="vp-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = statutInfo(p.statut);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="vp-product-cell">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.nom} className="vp-product-img"
                            onError={e => e.target.style.display = 'none'} />
                        ) : (
                          <div className="vp-product-img vp-product-img--placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="M21 15l-5-5L5 21"/>
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="vp-product-name">{p.nom}</p>
                          {p.description && (
                            <p className="vp-product-desc">{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="vp-price">{parseFloat(p.prix).toFixed(2)} DH</td>
                    <td>
                      <span className={`vp-stock ${p.quantite_stock === 0 ? 'vp-stock--empty' : p.quantite_stock < 5 ? 'vp-stock--low' : ''}`}>
                        {p.quantite_stock}
                      </span>
                    </td>
                    <td>
                      <span className={`vp-badge vp-badge--${st.color}`}>{st.label}</span>
                    </td>
                    <td>
                      <div className="vp-actions">
                        <button className="vp-btn-icon" title="Modifier" onClick={() => openEdit(p)}>
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M14.5 2.5a2.12 2.12 0 0 1 3 3L6 17H2v-4L14.5 2.5Z"/>
                          </svg>
                        </button>
                        <button
                          className="vp-btn-icon vp-btn-icon--danger"
                          title="Supprimer"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                        >
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M3 6h14M8 6V4h4v2M6 6l1 11h6l1-11"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="vp-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="vp-modal" role="dialog" aria-modal="true">
            <div className="vp-modal-header">
              <h2>{editId ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button className="vp-modal-close" onClick={() => setShowModal(false)} aria-label="Fermer">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 5l10 10M15 5 5 15"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="vp-form">
              <div className="vp-form-row">
                <label className="vp-label">
                  Nom du produit <span className="vp-required">*</span>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    className="vp-input"
                    placeholder="Ex. Miel de thym"
                  />
                </label>
              </div>

              <div className="vp-form-row">
                <label className="vp-label">
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="vp-input vp-textarea"
                    placeholder="Description du produit…"
                    rows={3}
                  />
                </label>
              </div>

              <div className="vp-form-grid">
                <label className="vp-label">
                  Prix (DH) <span className="vp-required">*</span>
                  <input
                    type="number"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="vp-input"
                    placeholder="0.00"
                  />
                </label>
                <label className="vp-label">
                  Stock <span className="vp-required">*</span>
                  <input
                    type="number"
                    name="quantite_stock"
                    value={form.quantite_stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="vp-input"
                    placeholder="0"
                  />
                </label>
              </div>

              <div className="vp-form-row">
                <label className="vp-label">
                  URL de l'image
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    className="vp-input"
                    placeholder="https://…"
                  />
                </label>
              </div>

              <div className="vp-form-row">
                <label className="vp-label">
                  Statut
                  <select name="statut" value={form.statut} onChange={handleChange} className="vp-input vp-select-input">
                    {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>
              </div>

              <div className="vp-form-actions">
                <button type="button" className="vp-btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="vp-btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}