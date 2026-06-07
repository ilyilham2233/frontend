import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getSellerProducts,
  storeSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerStats,
  downloadSellerStatsPdf,
} from "../../api/vendeur";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css');

.kb-root *, .kb-root *::before, .kb-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
.kb-root {
  --honey: #C8830A; --honey-light: #F5C842; --honey-pale: #FDF3DC;
  --terracotta: #B85C38; --cream: #FAF6EF; --bark: #4A3728;
  --moss: #5A7A4A; --moss-light: #EBF2E6; --sand: #E8DCC8;
  --border: rgba(74,55,40,0.12);
  font-family: 'DM Sans', sans-serif;
  background: var(--cream); color: var(--bark);
  min-height: 100vh; display: flex; flex-direction: column;
}
.kb-nav {
  background: #4A3728; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; flex-shrink: 0;
}
.kb-nav-brand {
  font-family: 'Playfair Display', serif; color: var(--honey-light);
  font-size: 18px; font-weight: 500; display: flex; align-items: center; gap: 8px;
}
.kb-nav-right { display: flex; align-items: center; gap: 16px; }
.kb-nav-user {
  display: inline-flex; align-items: center; gap: 8px;
  color: #E8DCC8; font-size: 13px;
  background: transparent; border: none; padding: 6px 10px;
  border-radius: 999px; cursor: pointer; transition: background 0.2s, color 0.2s;
}
.kb-nav-user:hover, .kb-nav-user:focus { background: rgba(255,255,255,0.08); color: #fff; outline: none; }
.kb-nav-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--honey); display: flex; align-items: center; justify-content: center;
  font-weight: 500; font-size: 12px; color: var(--bark);
}
.kb-badge-role {
  background: var(--honey); color: var(--bark);
  font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 12px;
}
.kb-layout { display: flex; flex: 1; }
.kb-sidebar { width: 200px; background: #3A2B1E; padding: 20px 0; flex-shrink: 0; }
.kb-sidebar-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
  color: rgba(255,255,255,0.25); padding: 16px 20px 6px;
}
.kb-sidebar-item {
  padding: 10px 20px; cursor: pointer; font-size: 13px; color: rgba(255,255,255,0.55);
  display: flex; align-items: center; gap: 10px;
  border-left: 3px solid transparent; transition: all 0.15s; user-select: none;
  background: none; border-top: none; border-right: none; border-bottom: none;
  width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
}
.kb-sidebar-item:hover { color: var(--honey-light); background: rgba(255,255,255,0.05); }
.kb-sidebar-item.active {
  color: var(--honey-light); background: rgba(200,131,10,0.15);
  border-left-color: var(--honey);
}
.kb-sidebar-count {
  margin-left: auto; background: var(--terracotta); color: #fff;
  font-size: 10px; padding: 1px 6px; border-radius: 10px;
}
.kb-sidebar-logout { margin-top: 16px; color: rgba(255,255,255,0.75); }
.kb-sidebar-logout:hover { color: #fff; background: rgba(255,255,255,0.08); }
.kb-main { flex: 1; padding: 24px; overflow-y: auto; }
.kb-page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 24px;
}
.kb-page-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: var(--bark); }
.kb-page-subtitle { font-size: 13px; color: rgba(74,55,40,0.55); margin-top: 2px; }
.kb-btn {
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px;
  font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
}
.kb-btn:hover { opacity: 0.88; }
.kb-btn-primary  { background: var(--honey); color: var(--bark); }
.kb-btn-outline  { background: transparent; border: 1px solid var(--border); color: var(--bark); }
.kb-btn-danger   { background: #fee2e2; color: #991b1b; border: none; }
.kb-btn-sm       { padding: 5px 10px; font-size: 12px; }
.kb-stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px; margin-bottom: 24px;
}
.kb-stat-card {
  background: #fff; border-radius: 12px; padding: 16px;
  border: 1px solid var(--border); position: relative; overflow: hidden;
}
.kb-stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.kb-stat-card.honey::before { background: var(--honey); }
.kb-stat-card.moss::before  { background: var(--moss); }
.kb-stat-card.terra::before { background: var(--terracotta); }
.kb-stat-card.blue::before  { background: #3B82F6; }
.kb-stat-icon { font-size: 20px; margin-bottom: 8px; color: var(--honey); }
.kb-stat-card.moss  .kb-stat-icon { color: var(--moss); }
.kb-stat-card.terra .kb-stat-icon { color: var(--terracotta); }
.kb-stat-card.blue  .kb-stat-icon { color: #3B82F6; }
.kb-stat-value {
  font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600;
  color: var(--bark); line-height: 1; margin-bottom: 4px;
}
.kb-stat-label { font-size: 12px; color: rgba(74,55,40,0.5); }
.kb-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.kb-card { background: #fff; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; margin-bottom: 20px; }
.kb-card-header {
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.kb-card-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 500; color: var(--bark); }
.kb-card-body { padding: 16px 20px; }
.kb-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.kb-table th {
  text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.5px; color: rgba(74,55,40,0.45);
  border-bottom: 1px solid var(--border); background: var(--cream);
}
.kb-table td {
  padding: 12px; border-bottom: 1px solid rgba(74,55,40,0.06);
  vertical-align: middle; color: var(--bark);
}
.kb-table tr:last-child td { border-bottom: none; }
.kb-table tr:hover td { background: var(--honey-pale); }
.kb-prod-info { display: flex; align-items: center; gap: 10px; }
.kb-prod-thumb {
  width: 40px; height: 40px; border-radius: 8px; background: var(--sand);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0; overflow: hidden;
}
.kb-prod-thumb img { width: 100%; height: 100%; object-fit: cover; }
.kb-prod-name { font-weight: 500; font-size: 13px; }
.kb-prod-sub  { font-size: 11px; color: rgba(74,55,40,0.5); }
.kb-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.kb-badge-actif   { background: var(--moss-light); color: #2D5A1B; }
.kb-badge-attente { background: var(--honey-pale); color: #7A5200; }
.kb-badge-masque  { background: #F3F4F6; color: #6B7280; }
.kb-badge-prep    { background: #EFF6FF; color: #1D4ED8; }
.kb-badge-exped   { background: #EDE9FE; color: #6D28D9; }
.kb-badge-livre   { background: var(--moss-light); color: #2D5A1B; }
.kb-badge-annule  { background: #FEE2E2; color: #991B1B; }
.kb-top-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(74,55,40,0.06); }
.kb-top-item:last-child { border-bottom: none; }
.kb-top-rank {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--honey-pale); color: var(--honey);
  font-size: 11px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kb-top-rank.first { background: var(--honey); color: var(--bark); }
.kb-top-bar-bg { background: var(--sand); border-radius: 4px; height: 6px; margin-top: 4px; }
.kb-top-bar    { height: 6px; border-radius: 4px; background: var(--honey); }
.kb-top-amount { font-size: 12px; font-weight: 500; white-space: nowrap; }
.kb-search-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.kb-search-wrap { position: relative; flex: 1; }
.kb-search-wrap .kb-search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: 16px; color: rgba(74,55,40,0.35); pointer-events: none;
}
.kb-search-input {
  width: 100%; padding: 9px 12px 9px 34px; border: 1px solid var(--border);
  border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif;
  color: var(--bark); background: #fff; outline: none;
}
.kb-search-input:focus { border-color: var(--honey); }
.kb-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.kb-form-group { display: flex; flex-direction: column; gap: 4px; }
.kb-form-group.full { grid-column: 1 / -1; }
.kb-form-label { font-size: 12px; font-weight: 500; color: rgba(74,55,40,0.7); }
.kb-form-input {
  padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  color: var(--bark); background: #fff; outline: none; transition: border-color 0.15s;
}
.kb-form-input:focus { border-color: var(--honey); }
.kb-form-hint { font-size: 11px; color: rgba(74,55,40,0.4); margin-top: 10px; }
.kb-modal-overlay {
  position: fixed; inset: 0; background: rgba(30,15,5,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.kb-modal {
  background: #fff; border-radius: 16px; width: 520px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;
}
.kb-modal-header {
  padding: 20px 24px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.kb-modal-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; }
.kb-modal-body   { padding: 20px 24px; }
.kb-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
.kb-status-select {
  padding: 5px 8px; border: 1px solid var(--border); border-radius: 6px;
  font-size: 12px; font-family: 'DM Sans', sans-serif; background: #fff; cursor: pointer; color: var(--bark);
}
.kb-toast {
  position: fixed; top: 16px; right: 16px; background: var(--moss); color: #fff;
  padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 300;
  display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  transform: translateY(-10px); opacity: 0; transition: all 0.3s; pointer-events: none;
}
.kb-toast.show  { transform: translateY(0); opacity: 1; }
.kb-toast.error { background: var(--terracotta); }
.kb-loading { text-align: center; padding: 40px; color: rgba(74,55,40,0.4); font-size: 14px; }
.kb-empty   { text-align: center; padding: 40px 20px; color: rgba(74,55,40,0.4); }
.kb-empty i  { font-size: 36px; margin-bottom: 10px; display: block; }
.kb-chart-wrap { position: relative; height: 180px; }
`;

const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const CATEGORIES = [
  { id: 1, nom: "Miel au détail" },
  { id: 2, nom: "Huiles essentielles" },
  { id: 3, nom: "Épices & condiments" },
  { id: 4, nom: "Figues & fruits secs" },
  { id: 5, nom: "Argan & produits naturels" },
];

const STATUT_ORDER_NEXT = {
  en_attente:     ["en_preparation", "annulee"],
  en_preparation: ["expediee", "annulee"],
};

function StatutBadge({ statut }) {
  const map = {
    actif: "kb-badge-actif", en_attente: "kb-badge-attente", masque: "kb-badge-masque",
    en_preparation: "kb-badge-prep", expediee: "kb-badge-exped",
    livree: "kb-badge-livre", annulee: "kb-badge-annule",
  };
  const labels = {
    actif: "Actif", en_attente: "En attente", masque: "Masqué",
    en_preparation: "En préparation", expediee: "Expédiée",
    livree: "Livrée", annulee: "Annulée",
  };
  return <span className={`kb-badge ${map[statut] || ""}`}>{labels[statut] || statut}</span>;
}

function ProdThumb({ prod }) {
  return (
    <div className="kb-prod-thumb">
      {prod.image_url
        ? <img src={prod.image_url} alt={prod.nom} onError={e => { e.target.style.display = "none"; }} />
        : "🫙"}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState({ msg: "", show: false, error: false });
  const timerRef = useRef(null);
  const showToast = (msg, error = false) => {
    clearTimeout(timerRef.current);
    setToast({ msg, show: true, error });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };
  return { toast, showToast };
}

function ProductModal({ open, editing, onClose, onSaved, showToast }) {
  const empty = { nom: "", categorie_id: 1, prix: "", quantite_stock: "", image_url: "", description: "" };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(editing
      ? { nom: editing.nom, categorie_id: editing.categorie_id, prix: editing.prix,
          quantite_stock: editing.quantite_stock, image_url: editing.image_url || "",
          description: editing.description || "" }
      : empty);
  }, [open, editing]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prix || !form.quantite_stock) {
      showToast("Remplissez les champs obligatoires", true); return;
    }
    setLoading(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        categorie_id: parseInt(form.categorie_id),
        prix: parseFloat(form.prix),
        quantite_stock: parseInt(form.quantite_stock),
        image_url: form.image_url || null,
        description: form.description || null,
      };
      if (editing) {
        await updateSellerProduct(editing.id, payload);
        showToast("Produit modifié avec succès");
      } else {
        await storeSellerProduct(payload);
        showToast("Produit ajouté — en attente de validation admin");
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(err?.response?.data?.message || "Erreur lors de la sauvegarde", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kb-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="kb-modal" role="dialog" aria-modal="true" aria-labelledby="kb-modal-title">
        <div className="kb-modal-header">
          <span className="kb-modal-title" id="kb-modal-title">
            {editing ? "Modifier le produit" : "Ajouter un produit"}
          </span>
          <button className="kb-btn kb-btn-outline kb-btn-sm" onClick={onClose} aria-label="Fermer">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <div className="kb-modal-body">
          <div className="kb-form-grid">
            <div className="kb-form-group full">
              <label className="kb-form-label">Nom du produit *</label>
              <input className="kb-form-input" value={form.nom} onChange={e => set("nom", e.target.value)}
                placeholder="ex: Miel de Thym du Rif" />
            </div>
            <div className="kb-form-group">
              <label className="kb-form-label">Catégorie *</label>
              <select className="kb-form-input" value={form.categorie_id} onChange={e => set("categorie_id", e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="kb-form-group">
              <label className="kb-form-label">Prix (DH) *</label>
              <input className="kb-form-input" type="number" min="0" step="0.01"
                value={form.prix} onChange={e => set("prix", e.target.value)} placeholder="120.00" />
            </div>
            <div className="kb-form-group">
              <label className="kb-form-label">Quantité en stock *</label>
              <input className="kb-form-input" type="number" min="0"
                value={form.quantite_stock} onChange={e => set("quantite_stock", e.target.value)} placeholder="30" />
            </div>
            <div className="kb-form-group">
              <label className="kb-form-label">URL image</label>
              <input className="kb-form-input" value={form.image_url}
                onChange={e => set("image_url", e.target.value)} placeholder="https://i.ibb.co/..." />
            </div>
            <div className="kb-form-group full">
              <label className="kb-form-label">Description</label>
              <textarea className="kb-form-input" rows={3} value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Décrivez votre produit..." />
            </div>
          </div>
          <p className="kb-form-hint">
            <i className="ti ti-info-circle" aria-hidden="true" /> Les nouveaux produits passent en révision admin avant publication.
          </p>
        </div>
        <div className="kb-modal-footer">
          <button className="kb-btn kb-btn-outline" onClick={onClose}>Annuler</button>
          <button className="kb-btn kb-btn-primary" onClick={handleSave} disabled={loading}>
            <i className={`ti ${loading ? "ti-loader" : "ti-check"}`} aria-hidden="true" />
            {editing ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ stats, orders, showToast }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!stats || !chartRef.current) return;

    import("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js")
      .catch(() => {})
      .finally(() => {
        if (!window.Chart) return;
        if (chartInstance.current) chartInstance.current.destroy();

        // ✅ FIX: trier par mois croissant + convertir numéro → nom de mois
        const ventesTriees = [...(stats.ventes_par_mois || [])].sort((a, b) => a.mois - b.mois);
        const months = ventesTriees.map(v => MOIS_LABELS[(v.mois ?? 1) - 1]);
        const data   = ventesTriees.map(v => Number(v.total));

        chartInstance.current = new window.Chart(chartRef.current, {
          type: "bar",
          data: {
            labels: months,
            datasets: [{
              label: "Ventes (DH)",
              data,
              backgroundColor: "rgba(200,131,10,0.75)",
              borderRadius: 6,
              borderSkipped: false,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: c => Number(c.raw).toLocaleString("fr-MA") + " DH",
                },
              },
            },
            scales: {
              y: {
                grid: { color: "rgba(74,55,40,0.06)" },
                ticks: {
                  font: { size: 11 },
                  color: "rgba(74,55,40,0.45)",
                  callback: v => v.toLocaleString("fr-MA"),
                },
              },
              x: {
                grid: { display: false },
                ticks: { font: { size: 11 }, color: "rgba(74,55,40,0.45)" },
              },
            },
          },
        });
      });

    return () => {
      if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
    };
  }, [stats]);

  // ✅ FIX: champ correct = total_revenu (confirmé par la réponse API)
  const getAmount = (p) => Number(p?.total_revenu ?? 0);
  const topMax = getAmount(stats?.top_produits?.[0]) || 1;

  return (
    <div>
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Tableau de bord 🍯</h1>
          <p className="kb-page-subtitle">Résumé de votre activité de vente</p>
        </div>
        <button className="kb-btn kb-btn-outline kb-btn-sm"
          onClick={() => { downloadSellerStatsPdf(); showToast("Génération du PDF..."); }}>
          <i className="ti ti-download" aria-hidden="true" /> Rapport PDF
        </button>
      </div>

      <div className="kb-stats-grid">
        <div className="kb-stat-card honey">
          <div className="kb-stat-icon"><i className="ti ti-coins" aria-hidden="true" /></div>
          <div className="kb-stat-value">{Number(stats?.total_ventes || 0).toLocaleString("fr-MA")}</div>
          <div className="kb-stat-label">Revenus (DH)</div>
        </div>
        <div className="kb-stat-card moss">
          <div className="kb-stat-icon"><i className="ti ti-shopping-cart" aria-hidden="true" /></div>
          <div className="kb-stat-value">{stats?.nombre_commandes || 0}</div>
          <div className="kb-stat-label">Commandes</div>
        </div>
        <div className="kb-stat-card terra">
          <div className="kb-stat-icon"><i className="ti ti-package" aria-hidden="true" /></div>
          <div className="kb-stat-value">{stats?.nombre_produits || 0}</div>
          <div className="kb-stat-label">Produits</div>
        </div>
        <div className="kb-stat-card blue">
          <div className="kb-stat-icon"><i className="ti ti-star" aria-hidden="true" /></div>
          <div className="kb-stat-value">
            {stats?.note_moyenne ? Number(stats.note_moyenne).toFixed(1) : "—"}
          </div>
          <div className="kb-stat-label">Note moyenne</div>
        </div>
      </div>

      <div className="kb-two-col">
        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">Ventes par mois</span>
          </div>
          <div className="kb-card-body">
            <div className="kb-chart-wrap">
              <canvas ref={chartRef} role="img" aria-label="Graphique ventes mensuelles" />
            </div>
          </div>
        </div>

        <div className="kb-card">
          <div className="kb-card-header">
            <span className="kb-card-title">Top produits</span>
          </div>
          <div className="kb-card-body">
            {stats?.top_produits?.length ? stats.top_produits.slice(0, 4).map((p, i) => (
              <div className="kb-top-item" key={p.produit_id || i}>
                <div className={`kb-top-rank ${i === 0 ? "first" : ""}`}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  {/* ✅ FIX: nom depuis p.produit.nom */}
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {p.produit?.nom || `Produit #${p.produit_id}`}
                  </div>
                  <div className="kb-top-bar-bg">
                    <div
                      className="kb-top-bar"
                      style={{ width: `${Math.round((getAmount(p) / topMax) * 100)}%` }}
                    />
                  </div>
                </div>
                {/* ✅ FIX: affiche total_revenu en DH */}
                <div className="kb-top-amount">{getAmount(p).toLocaleString("fr-MA")} DH</div>
              </div>
            )) : <div className="kb-empty"><p>Aucune donnée</p></div>}
          </div>
        </div>
      </div>

      <div className="kb-card">
        <div className="kb-card-header">
          <span className="kb-card-title">Commandes récentes</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="kb-table" aria-label="Commandes récentes">
            <thead>
              <tr>
                <th>N°</th><th>Client</th><th>Total</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td>{o.user?.nom} {o.user?.prenom}</td>
                  <td><strong>{Number(o.prix_total).toLocaleString("fr-MA")} DH</strong></td>
                  <td><StatutBadge statut={o.statut} /></td>
                </tr>
              ))}
              {!orders.length && (
                <tr><td colSpan={4}><div className="kb-empty"><p>Aucune commande</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProduitsView({ products, loading, onRefresh, showToast }) {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = products.filter(p =>
    (!search || p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie?.nom?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatut || p.statut === filterStatut)
  );

  const handleDelete = async (p) => {
    if (!window.confirm(`Supprimer "${p.nom}" ?`)) return;
    try {
      await deleteSellerProduct(p.id);
      showToast("Produit supprimé");
      onRefresh();
    } catch {
      showToast("Erreur lors de la suppression", true);
    }
  };

  return (
    <div>
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Mes produits</h1>
          <p className="kb-page-subtitle">Gérez votre catalogue du terroir</p>
        </div>
        <button className="kb-btn kb-btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <i className="ti ti-plus" aria-hidden="true" /> Ajouter un produit
        </button>
      </div>

      <div className="kb-search-bar">
        <div className="kb-search-wrap">
          <i className="ti ti-search kb-search-icon" aria-hidden="true" />
          <input className="kb-search-input" placeholder="Rechercher un produit..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="kb-form-input" style={{ width: 160 }}
          value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="en_attente">En attente</option>
          <option value="masque">Masqué</option>
        </select>
      </div>

      <div className="kb-card">
        {loading ? <div className="kb-loading">Chargement…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table className="kb-table" aria-label="Liste des produits">
              <thead>
                <tr>
                  <th>Produit</th><th>Catégorie</th><th>Prix</th>
                  <th>Stock</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="kb-prod-info">
                        <ProdThumb prod={p} />
                        <div>
                          <div className="kb-prod-name">{p.nom}</div>
                          <div className="kb-prod-sub">#{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.categorie?.nom || "—"}</td>
                    <td><strong>{Number(p.prix).toLocaleString("fr-MA")} DH</strong></td>
                    <td>
                      {p.quantite_stock > 0
                        ? `${p.quantite_stock} unités`
                        : <span style={{ color: "var(--terracotta)" }}>Épuisé</span>}
                    </td>
                    <td><StatutBadge statut={p.statut} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="kb-btn kb-btn-outline kb-btn-sm"
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          aria-label={`Modifier ${p.nom}`}>
                          <i className="ti ti-edit" aria-hidden="true" />
                        </button>
                        <button className="kb-btn kb-btn-danger kb-btn-sm"
                          onClick={() => handleDelete(p)}
                          aria-label={`Supprimer ${p.nom}`}>
                          <i className="ti ti-trash" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6}>
                    <div className="kb-empty">
                      <i className="ti ti-package" aria-hidden="true" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onRefresh}
        showToast={showToast}
      />
    </div>
  );
}

function CommandesView({ orders, loading, onRefresh, showToast }) {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const filtered = orders.filter(o =>
    (!search || String(o.id).includes(search) ||
      `${o.user?.nom} ${o.user?.prenom}`.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatut || o.statut === filterStatut)
  );

  const handleStatusChange = async (orderId, newStatut) => {
    if (!newStatut) return;
    try {
      await updateSellerOrderStatus(orderId, newStatut);
      showToast(`Commande #${orderId} — statut mis à jour`);
      onRefresh();
    } catch {
      showToast("Erreur lors de la mise à jour", true);
    }
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString("fr-MA") : "—";

  return (
    <div>
      <div className="kb-page-header">
        <div>
          <h1 className="kb-page-title">Commandes reçues</h1>
          <p className="kb-page-subtitle">Gérez les commandes de vos clients</p>
        </div>
      </div>

      <div className="kb-search-bar">
        <div className="kb-search-wrap">
          <i className="ti ti-search kb-search-icon" aria-hidden="true" />
          <input className="kb-search-input" placeholder="Rechercher par client ou N°..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="kb-form-input" style={{ width: 180 }}
          value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="en_preparation">En préparation</option>
          <option value="expediee">Expédiée</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>

      <div className="kb-card">
        {loading ? <div className="kb-loading">Chargement…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table className="kb-table" aria-label="Liste des commandes">
              <thead>
                <tr>
                  <th>N°</th><th>Client</th><th>Date</th>
                  <th>Articles</th><th>Total</th><th>Statut</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const nextStatuts = STATUT_ORDER_NEXT[o.statut] || [];
                  const articles = o.articles_commande || [];
                  return (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.user?.nom} {o.user?.prenom}</td>
                      <td>{fmtDate(o.created_at)}</td>
                      <td style={{ fontSize: 12, color: "rgba(74,55,40,0.6)", maxWidth: 180 }}>
                        {articles.length
                          ? articles.map(a => `${a.produit?.nom} ×${a.quantite}`).join(", ")
                          : "—"}
                      </td>
                      <td><strong>{Number(o.prix_total).toLocaleString("fr-MA")} DH</strong></td>
                      <td><StatutBadge statut={o.statut} /></td>
                      <td>
                        {nextStatuts.length > 0 ? (
                          <select className="kb-status-select"
                            defaultValue=""
                            onChange={e => handleStatusChange(o.id, e.target.value)}
                            aria-label={`Changer statut commande #${o.id}`}>
                            <option value="" disabled>Changer…</option>
                            {nextStatuts.map(s => (
                              <option key={s} value={s}>
                                {{ en_preparation: "En préparation", expediee: "Expédier", annulee: "Annuler" }[s]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: 11, color: "rgba(74,55,40,0.35)" }}>Finalisée</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr><td colSpan={7}>
                    <div className="kb-empty">
                      <i className="ti ti-shopping-bag" aria-hidden="true" />
                      <p>Aucune commande trouvée</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendeurDashboard() {
  const [view, setView] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [stats, setStats]       = useState(null);
  const [loadingProd, setLoadingProd] = useState(false);
  const [loadingCmd, setLoadingCmd]   = useState(false);
  const { toast, showToast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handle401 = (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const fetchProducts = async () => {
    setLoadingProd(true);
    try {
      const res = await getSellerProducts();
      setProducts(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      handle401(err);
      showToast("Impossible de charger les produits", true);
    } finally { setLoadingProd(false); }
  };

  const fetchOrders = async () => {
    setLoadingCmd(true);
    try {
      const res = await getSellerOrders();
      setOrders(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      handle401(err);
      showToast("Impossible de charger les commandes", true);
    } finally { setLoadingCmd(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await getSellerStats();
      // ✅ FIX: API retourne { status, data: { ... } }
      // vendeur.js fait .then(r => r.data) donc res = { status, data: { top_produits, ... } }
      // On prend res.data si dispo, sinon res directement
      const s = res?.data ?? res;
      setStats(s);
    } catch (err) {
      handle401(err);
      showToast("Impossible de charger les statistiques", true);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchStats();
  }, []);

  const navItems = [
    { id: "dashboard", label: "Tableau de bord",  icon: "ti-dashboard" },
    { id: "produits",  label: "Mes produits",      icon: "ti-package",      count: products.length },
    { id: "commandes", label: "Commandes",          icon: "ti-shopping-bag", count: orders.filter(o => o.statut === "en_attente").length },
  ];

  return (
    <div className="kb-root">
      <style>{CSS}</style>

      <nav className="kb-nav">
        <div className="kb-nav-brand">
          <span aria-hidden="true">🍯</span> Khayrate Bladi
        </div>
        <div className="kb-nav-right">
          <span className="kb-badge-role">Vendeur</span>
          <button type="button" className="kb-nav-user"
            onClick={() => navigate('/profile')} aria-label="Aller au profil">
            <div className="kb-nav-avatar" aria-hidden="true">
              {user?.prenom?.[0] || 'V'}{user?.nom?.[0] || ''}
            </div>
            <span>Mon espace</span>
          </button>
        </div>
      </nav>

      <div className="kb-layout">
        <aside className="kb-sidebar" aria-label="Navigation vendeur">
          <div className="kb-sidebar-label">Principal</div>
          {navItems.map(item => (
            <button key={item.id}
              className={`kb-sidebar-item ${view === item.id ? "active" : ""}`}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
              {item.count !== undefined && item.count > 0 &&
                <span className="kb-sidebar-count">{item.count}</span>}
            </button>
          ))}
          <button type="button"
            className="kb-sidebar-item kb-sidebar-logout"
            onClick={async () => {
              try { await logout(); } catch (err) { console.error('Logout failed', err); }
              navigate('/login');
            }}>
            <i className="ti ti-logout" aria-hidden="true" />
            Déconnexion
          </button>
        </aside>

        <main className="kb-main">
          {view === "dashboard" && (
            <DashboardView stats={stats} orders={orders} showToast={showToast} />
          )}
          {view === "produits" && (
            <ProduitsView
              products={products} loading={loadingProd}
              onRefresh={fetchProducts} showToast={showToast}
            />
          )}
          {view === "commandes" && (
            <CommandesView
              orders={orders} loading={loadingCmd}
              onRefresh={fetchOrders} showToast={showToast}
            />
          )}
        </main>
      </div>

      <div className={`kb-toast ${toast.show ? "show" : ""} ${toast.error ? "error" : ""}`}
        role="status" aria-live="polite">
        <i className={`ti ${toast.error ? "ti-alert-circle" : "ti-check"}`} aria-hidden="true" />
        {toast.msg}
      </div>
    </div>
  );
}