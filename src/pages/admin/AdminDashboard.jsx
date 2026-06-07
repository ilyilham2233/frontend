import { useState, useEffect, useCallback } from "react";
import API from "../../api/auth";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  honey: "#C8960C", honeyLight: "#FFF8E7", honeyMid: "#F5D76E",
  amber: "#D4811A", earthDark: "#4A3728", earthMid: "#7A5C44",
  success: "#16A34A", successLight: "#DCFCE7",
  danger: "#DC2626", dangerLight: "#FEE2E2",
  warning: "#D97706", warningLight: "#FEF3C7",
  info: "#2563EB", infoLight: "#DBEAFE",
  purple: "#7C3AED", purpleLight: "#EDE9FE",
  gray50: "#FAFAFA", gray100: "#F4F4F5", gray200: "#E4E4E7",
  gray400: "#A1A1AA", gray600: "#52525B", white: "#FFFFFF",
};

const STATUS_CFG = {
  en_attente:     { label: "En attente",     color: C.warning, bg: C.warningLight },
  en_preparation: { label: "En préparation", color: C.info,    bg: C.infoLight },
  expediee:       { label: "Expédiée",       color: C.amber,   bg: "#FEF3C7" },
  livree:         { label: "Livrée",         color: C.success, bg: C.successLight },
  annulee:        { label: "Annulée",        color: C.danger,  bg: C.dangerLight },
  actif:          { label: "Actif",          color: C.success, bg: C.successLight },
  masque:         { label: "Masqué",         color: C.gray600, bg: C.gray100 },
  client:         { label: "Client",         color: C.info,    bg: C.infoLight },
  vendeur:        { label: "Vendeur",        color: C.amber,   bg: "#FEF3C7" },
  livreur:        { label: "Livreur",        color: C.purple,  bg: C.purpleLight },
  admin:          { label: "Admin",          color: C.danger,  bg: C.dangerLight },
  assignee:       { label: "Assignée",       color: C.info,    bg: C.infoLight },
  recuperee:      { label: "Récupérée",      color: C.amber,   bg: "#FEF3C7" },
  en_cours:       { label: "En cours",       color: C.purple,  bg: C.purpleLight },
  non_livree:     { label: "Non livrée",     color: C.danger,  bg: C.dangerLight },
};

const NAV_ITEMS = [
  { id: "overview",    label: "Vue d'ensemble", icon: "📊" },
  { id: "users",       label: "Utilisateurs",   icon: "👥" },
  { id: "catalogue",   label: "Catalogue",      icon: "📦" },
  { id: "orders",      label: "Commandes",      icon: "🛒" },
  { id: "deliveries",  label: "Livraisons",     icon: "🚚" },
  { id: "reports",     label: "Rapports",       icon: "📈" },
  { id: "settings",    label: "Paramètres",     icon: "⚙️" },
];

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const Badge = ({ value }) => {
  const cfg = STATUS_CFG[value] || { label: value, color: C.gray600, bg: C.gray100 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 500,
      color: cfg.color, background: cfg.bg,
    }}>{cfg.label}</span>
  );
};

const MetricCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: C.white, border: `1px solid ${C.gray200}`,
    borderRadius: 14, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 8,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: C.gray600 }}>{label}</span>
      <span style={{
        width: 36, height: 36, borderRadius: 10,
        background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 600, color: C.earthDark }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.gray400 }}>{sub}</div>}
  </div>
);

const Spinner = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "60px 0", color: C.gray400, fontSize: 14, gap: 10,
  }}>
    <span style={{ fontSize: 20, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
    Chargement...
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorMsg = ({ msg, onRetry }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    background: C.dangerLight, border: `1px solid ${C.danger}30`,
    borderRadius: 12, padding: "14px 18px",
  }}>
    <span style={{ fontSize: 18, color: C.danger }}>⚠</span>
    <span style={{ fontSize: 14, color: C.danger, flex: 1 }}>{msg}</span>
    {onRetry && (
      <button onClick={onRetry} style={{
        padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.danger}40`,
        background: "transparent", cursor: "pointer", fontSize: 13, color: C.danger,
      }}>Réessayer</button>
    )}
  </div>
);

const MiniBarChart = ({ data }) => {
  if (!data?.length) return <div style={{ color: C.gray400, fontSize: 13, padding: "20px 0" }}>Aucune donnée disponible</div>;
  const max = Math.max(...data.map(d => Number(d.total) || Number(d.value) || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((d, i) => {
        const val = Number(d.total) || Number(d.value) || 0;
        const label = d.month || d.mois || "";
        const shortLabel = label.length > 4 ? label.slice(5) : label;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
            <div style={{
              width: "100%", background: C.honey,
              borderRadius: "4px 4px 0 0",
              opacity: 0.5 + (val / max) * 0.5,
              height: `${Math.max((val / max) * 64, 4)}px`,
              transition: "height 0.4s ease",
            }} />
            <span style={{ fontSize: 9, color: C.gray400 }}>{shortLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, onNav }) => {
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: C.earthDark,
      display: "flex", flexDirection: "column", padding: "0 0 24px",
      position: "sticky", top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.honey, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🍯</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>Khayrate Bladi</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Administration</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: "12px", flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2,
            background: active === item.id ? "rgba(200,150,12,0.18)" : "transparent",
            color: active === item.id ? C.honeyMid : "rgba(255,255,255,0.5)",
            fontSize: 13, fontWeight: active === item.id ? 500 : 400,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "0 12px" }}>
        <div style={{
          padding: 12, borderRadius: 10,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: C.honey, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: C.earthDark,
          }}>
            {(user?.prenom?.[0] || "A")}{(user?.nom?.[0] || "")}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.white }}>
              {user?.prenom ? `${user.prenom} ${user.nom}` : "Administrateur"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.email || ""}</div>
          </div>
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          style={{
            width: "100%", marginTop: 8, padding: "8px", borderRadius: 8,
            border: "none", cursor: "pointer", fontSize: 12,
            background: C.dangerLight, color: C.danger, fontWeight: 500,
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

// ─── PAGE : Vue d'ensemble ────────────────────────────────────────────────────
const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    API.get("/admin/stats")
      .then(r => setStats(r.data?.data ?? r.data))
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} onRetry={load} />;

  const ca = stats?.chiffre_affaires ?? 0;
  const totalCommandes = stats?.total_commandes ?? 0;
  const commandesParStatut = stats?.commandes_par_statut ?? {};
  const usersParRole = stats?.users_par_role ?? {};
  const produitsParStatut = stats?.produits_par_statut ?? {};
  const ventesMois = stats?.ventes_par_mois ?? [];
  const topProduits = stats?.top_produits ?? [];
  const livreurs = stats?.livreurs_disponibles ?? [];

  const enAttente = commandesParStatut?.en_attente?.total ?? 0;
  const totalClients = usersParRole?.client?.total ?? 0;
  const totalVendeurs = usersParRole?.vendeur?.total ?? 0;
  const produitsEnAttente = produitsParStatut?.en_attente?.total ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Vue d'ensemble</h1>
        <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Résumé des activités — Khayrate Bladi</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <MetricCard icon="💰" label="Chiffre d'affaires" value={`${Number(ca).toLocaleString("fr-MA")} DH`} sub="Commandes livrées" color={C.honey} />
        <MetricCard icon="🛒" label="Commandes totales" value={totalCommandes} sub={`${enAttente} en attente`} color={C.info} />
        <MetricCard icon="👤" label="Clients" value={totalClients} sub={`${totalVendeurs} vendeurs actifs`} color={C.purple} />
        <MetricCard icon="📦" label="Produits en attente" value={produitsEnAttente} sub="À valider" color={C.warning} />
        <MetricCard icon="🚚" label="Livreurs disponibles" value={livreurs.length} sub="Actifs et prêts" color={C.amber} />
        <MetricCard icon="⭐" label="Produits actifs" value={produitsParStatut?.actif?.total ?? 0} sub="Visible dans catalogue" color={C.success} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15 }}>Ventes mensuelles</div>
              <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>12 derniers mois · en DH</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.honey }}>
              {Number(ca).toLocaleString("fr-MA")} DH
            </span>
          </div>
          <MiniBarChart data={ventesMois} />
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15, marginBottom: 16 }}>Commandes par statut</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(commandesParStatut).map(([key, val]) => {
              const cfg = STATUS_CFG[key] || { label: key, color: C.gray400 };
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                    <span style={{ fontSize: 12, color: C.gray600 }}>{cfg.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.earthDark }}>{val.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {topProduits.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15, marginBottom: 16 }}>Top 5 Produits</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topProduits.map((p, i) => (
              <div key={p.produit_id || i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: C.honey, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: C.white,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.earthDark }}>{p.produit?.nom ?? p.nom ?? "—"}</div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>{p.total_vendu} vendus</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.honey }}>
                  {Number(p.chiffre_affaires || 0).toLocaleString("fr-MA")} DH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {produitsEnAttente > 0 && (
        <div style={{
          background: C.honeyLight, border: `1px solid ${C.honeyMid}`,
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 500, color: C.earthDark, fontSize: 14 }}>
              {produitsEnAttente} produit{produitsEnAttente > 1 ? "s" : ""} en attente de validation
            </div>
            <div style={{ fontSize: 12, color: C.earthMid, marginTop: 2 }}>
              Des vendeurs attendent votre approbation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE : Utilisateurs ──────────────────────────────────────────────────────
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRole] = useState("tous");
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    API.get("/admin/users")
      .then(r => {
        const d = r.data?.data ?? r.data;
        setUsers(Array.isArray(d) ? d : (d?.data ?? []));
      })
      .catch(() => setError("Impossible de charger les utilisateurs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      await API.patch(`/admin/users/${id}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, est_actif: !u.est_actif } : u));
    } catch { alert("Erreur lors de la modification."); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id) => {
    setDeleting(id); setConfirmDelete(null);
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de la suppression.");
    } finally { setDeleting(null); }
  };

  const filtered = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "tous" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Utilisateurs</h1>
        <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Gestion des comptes et accès</p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 8,
          background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: "8px 14px",
        }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            style={{ border: "none", outline: "none", flex: 1, fontSize: 14, color: C.earthDark, background: "transparent" }} />
        </div>
        <select value={roleFilter} onChange={e => setRole(e.target.value)} style={{
          padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.gray200}`,
          fontSize: 13, color: C.earthDark, background: C.white, cursor: "pointer",
        }}>
          <option value="tous">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="vendeur">Vendeur</option>
          <option value="livreur">Livreur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} onRetry={load} />}
      {!loading && !error && (
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.gray50 }}>
                {["Utilisateur", "Email", "Rôle", "Statut", "Inscrit le", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: C.gray600, borderBottom: `1px solid ${C.gray200}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.gray400 }}>Aucun utilisateur trouvé</td></tr>
              )}
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.gray100}` : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: C.honeyLight, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 600, color: C.amber,
                      }}>{u.prenom?.[0]}{u.nom?.[0]}</div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.earthDark }}>{u.prenom} {u.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray600 }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}><Badge value={u.role} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex", padding: "2px 10px", borderRadius: 999,
                      fontSize: 12, fontWeight: 500,
                      color: u.est_actif ? C.success : C.danger,
                      background: u.est_actif ? C.successLight : C.dangerLight,
                    }}>{u.est_actif ? "Actif" : "Bloqué"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray400 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {u.role !== "admin" && (
                        <>
                          <button onClick={() => handleToggle(u.id)} disabled={toggling === u.id} style={{
                            padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 500, opacity: toggling === u.id ? 0.6 : 1,
                            background: u.est_actif ? C.dangerLight : C.successLight,
                            color: u.est_actif ? C.danger : C.success,
                          }}>
                            {toggling === u.id ? "..." : u.est_actif ? "Bloquer" : "Activer"}
                          </button>
                          <button onClick={() => setConfirmDelete(u.id)} disabled={deleting === u.id} style={{
                            padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.gray200}`,
                            cursor: "pointer", fontSize: 11, background: "transparent", color: C.danger,
                          }}>🗑</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: "28px 32px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 10px", color: C.earthDark }}>Confirmer la suppression</h3>
            <p style={{ fontSize: 14, color: C.gray600, margin: "0 0 24px" }}>
              Cette action est irréversible. Le compte sera définitivement supprimé.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${C.gray200}`,
                cursor: "pointer", background: "transparent", fontSize: 14, color: C.gray600,
              }}>Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{
                flex: 1, padding: 10, borderRadius: 10, border: "none", cursor: "pointer",
                background: C.danger, fontSize: 14, fontWeight: 500, color: C.white,
              }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE : Catalogue ─────────────────────────────────────────────────────────
const Catalogue = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    API.get("/admin/catalogue")
      .then(r => {
        const d = r.data?.data ?? r.data;
        setProducts(Array.isArray(d) ? d : (d?.data ?? []));
      })
      .catch(() => setError("Impossible de charger le catalogue."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatut = async (id, newStatut) => {
    setUpdating(id);
    try {
      await API.patch(`/admin/catalogue/${id}/statut`, { statut: newStatut });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, statut: newStatut } : p));
    } catch { alert("Erreur lors de la mise à jour."); }
    finally { setUpdating(null); }
  };

  const filtered = filter === "tous" ? products : products.filter(p => p.statut === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Catalogue produits</h1>
        <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Validation et modération</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ key: "tous", label: "Tous" }, { key: "en_attente", label: "En attente" }, { key: "actif", label: "Actifs" }, { key: "masque", label: "Masqués" }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            background: filter === f.key ? C.honey : C.gray100,
            color: filter === f.key ? C.white : C.gray600,
          }}>{f.label}</button>
        ))}
      </div>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} onRetry={load} />}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: C.gray400 }}>Aucun produit</div>
          )}
          {filtered.map(p => {
            const vendeurNom = p.vendeur ? `${p.vendeur.prenom ?? ""} ${p.vendeur.nom ?? ""}`.trim() : "—";
            const categorieNom = p.categorie?.nom ?? "—";
            return (
              <div key={p.id} style={{
                background: C.white,
                border: p.statut === "en_attente" ? `1px solid ${C.warning}60` : `1px solid ${C.gray200}`,
                borderLeft: p.statut === "en_attente" ? `4px solid ${C.warning}` : undefined,
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.earthDark }}>{p.nom}</div>
                    <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>{categorieNom} · par {vendeurNom}</div>
                  </div>
                  <Badge value={p.statut} />
                </div>
                <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray400 }}>Prix</div>
                    <div style={{ fontWeight: 600, color: C.honey, fontSize: 15 }}>{p.prix} DH</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray400 }}>Stock</div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: p.quantite_stock === 0 ? C.danger : C.earthDark }}>
                      {p.quantite_stock === 0 ? "Rupture" : `${p.quantite_stock} unités`}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {p.statut === "en_attente" && (
                    <>
                      <button onClick={() => changeStatut(p.id, "actif")} disabled={updating === p.id} style={{
                        flex: 1, padding: 8, borderRadius: 8, border: "none", cursor: "pointer",
                        background: C.successLight, color: C.success, fontSize: 13, fontWeight: 500,
                        opacity: updating === p.id ? 0.6 : 1,
                      }}>✓ {updating === p.id ? "..." : "Valider"}</button>
                      <button onClick={() => changeStatut(p.id, "masque")} disabled={updating === p.id} style={{
                        flex: 1, padding: 8, borderRadius: 8, border: "none", cursor: "pointer",
                        background: C.dangerLight, color: C.danger, fontSize: 13, fontWeight: 500,
                        opacity: updating === p.id ? 0.6 : 1,
                      }}>✕ {updating === p.id ? "..." : "Masquer"}</button>
                    </>
                  )}
                  {p.statut === "actif" && (
                    <button onClick={() => changeStatut(p.id, "masque")} disabled={updating === p.id} style={{
                      padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.gray200}`,
                      cursor: "pointer", background: "transparent", fontSize: 12, color: C.gray600,
                      opacity: updating === p.id ? 0.6 : 1,
                    }}>👁 {updating === p.id ? "..." : "Masquer"}</button>
                  )}
                  {p.statut === "masque" && (
                    <button onClick={() => changeStatut(p.id, "actif")} disabled={updating === p.id} style={{
                      padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: C.successLight, color: C.success, fontSize: 12, fontWeight: 500,
                      opacity: updating === p.id ? 0.6 : 1,
                    }}>↑ {updating === p.id ? "..." : "Remettre en ligne"}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── PAGE : Commandes ─────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [filterStatut, setFilterStatut] = useState("tous");

  const load = useCallback(() => {
    setLoading(true); setError(null);
    Promise.all([API.get("/admin/commandes"), API.get("/admin/stats")])
      .then(([ordRes, statsRes]) => {
        const od = ordRes.data?.data ?? ordRes.data;
        setOrders(Array.isArray(od) ? od : (od?.data ?? []));
        const livs = statsRes.data?.data?.livreurs_disponibles ?? [];
        setLivreurs(livs);
        if (livs.length > 0) setSelectedLivreur(livs[0].id);
      })
      .catch(() => setError("Impossible de charger les commandes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async () => {
    if (!selectedLivreur || !assignModal) return;
    setAssigning(true);
    try {
      await API.post(`/admin/commandes/${assignModal}/assigner-livreur`, { livreur_id: selectedLivreur });
      const livreur = livreurs.find(l => l.id === selectedLivreur);
      setOrders(prev => prev.map(o =>
        o.id === assignModal
          ? { ...o, statut: "en_preparation", livraison: { statut_suivi: "assignee", livreur } }
          : o
      ));
      setAssignModal(null);
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de l'assignation.");
    } finally { setAssigning(false); }
  };

  const clientNom = (o) => {
    if (o.client_nom) return o.client_nom;
    if (o.user) return `${o.user.prenom ?? ""} ${o.user.nom ?? ""}`.trim();
    return "—";
  };

  const livreurNom = (o) => {
    if (o.livraison?.livreur) return `${o.livraison.livreur.prenom ?? ""} ${o.livraison.livreur.nom ?? ""}`.trim();
    return null;
  };

  const filtered = filterStatut === "tous" ? orders : orders.filter(o => o.statut === filterStatut);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Commandes</h1>
        <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Gestion et assignation des livraisons</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { key: "tous", label: "Toutes" },
          { key: "en_attente", label: "En attente" },
          { key: "en_preparation", label: "En préparation" },
          { key: "expediee", label: "Expédiée" },
          { key: "livree", label: "Livrée" },
          { key: "annulee", label: "Annulée" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterStatut(f.key)} style={{
            padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 500,
            background: filterStatut === f.key ? C.honey : C.gray100,
            color: filterStatut === f.key ? C.white : C.gray600,
          }}>{f.label}</button>
        ))}
      </div>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} onRetry={load} />}
      {!loading && !error && (
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.gray50 }}>
                {["#", "Client", "Total", "Statut", "Livreur", "Date", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: C.gray600, borderBottom: `1px solid ${C.gray200}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: C.gray400 }}>Aucune commande</td></tr>
              )}
              {filtered.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.gray100}` : "none" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.gray400 }}>#{o.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: C.earthDark }}>{clientNom(o)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: C.honey }}>{o.prix_total} DH</td>
                  <td style={{ padding: "12px 16px" }}><Badge value={o.statut} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: livreurNom(o) ? C.earthDark : C.gray400 }}>
                    {livreurNom(o) ?? "Non assigné"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray400 }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {(o.statut === "en_attente" || o.statut === "en_preparation") && !o.livraison?.livreur && (
                      <button onClick={() => setAssignModal(o.id)} style={{
                        padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 500, background: C.infoLight, color: C.info,
                      }}>+ Assigner</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assignModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: "28px 32px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 6px", color: C.earthDark }}>Assigner un livreur</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: C.gray600 }}>Commande #{assignModal}</p>
            {livreurs.length === 0 ? (
              <p style={{ fontSize: 13, color: C.warning, marginBottom: 20 }}>Aucun livreur disponible.</p>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: C.earthDark, display: "block", marginBottom: 8 }}>Livreur</label>
                <select value={selectedLivreur ?? ""} onChange={e => setSelectedLivreur(Number(e.target.value))} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${C.gray200}`, fontSize: 14, color: C.earthDark,
                }}>
                  {livreurs.map(l => (
                    <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAssignModal(null)} style={{
                flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${C.gray200}`,
                cursor: "pointer", background: "transparent", fontSize: 14, color: C.gray600,
              }}>Annuler</button>
              <button onClick={handleAssign} disabled={assigning || livreurs.length === 0} style={{
                flex: 1, padding: 10, borderRadius: 10, border: "none", cursor: "pointer",
                background: C.honey, fontSize: 14, fontWeight: 500, color: C.white,
                opacity: assigning || livreurs.length === 0 ? 0.6 : 1,
              }}>
                {assigning ? "En cours..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE : Livraisons ────────────────────────────────────────────────────────
const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    API.get("/admin/commandes")
      .then(r => {
        const all = r.data?.data ?? r.data;
        const arr = Array.isArray(all) ? all : (all?.data ?? []);
        setDeliveries(arr.filter(o => o.livraison));
      })
      .catch(() => setError("Impossible de charger les livraisons."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const actives = deliveries.filter(d => ["assignee", "recuperee", "en_cours"].includes(d.livraison?.statut_suivi));
  const livrees = deliveries.filter(d => d.livraison?.statut_suivi === "livree");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Livraisons</h1>
        <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Suivi des tournées</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <MetricCard icon="🚚" label="Livraisons actives" value={actives.length} color={C.purple} />
        <MetricCard icon="✅" label="Livrées" value={livrees.length} color={C.success} />
        <MetricCard icon="📦" label="Total avec livraison" value={deliveries.length} color={C.info} />
      </div>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} onRetry={load} />}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {deliveries.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>Aucune livraison enregistrée</div>
          )}
          {deliveries.map(d => {
            const liv = d.livraison;
            const statut = liv?.statut_suivi ?? "assignee";
            const sc = STATUS_CFG[statut] ?? { label: statut, color: C.gray600, bg: C.gray100 };
            const livreurNom = liv?.livreur ? `${liv.livreur.prenom ?? ""} ${liv.livreur.nom ?? ""}`.trim() : "—";
            const clientNom = d.user ? `${d.user.prenom ?? ""} ${d.user.nom ?? ""}`.trim() : "—";
            return (
              <div key={d.id} style={{
                background: C.white, border: `1px solid ${C.gray200}`,
                borderRadius: 14, padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>🚚</div>
                  <div>
                    <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 14 }}>
                      Commande #{d.id} — {clientNom}
                    </div>
                    <div style={{ fontSize: 12, color: C.gray400, marginTop: 3 }}>
                      Livreur : <span style={{ color: C.earthMid, fontWeight: 500 }}>{livreurNom}</span>
                    </div>
                    {liv?.date_livraison_estimee && (
                      <div style={{ fontSize: 11, color: C.gray400, marginTop: 2 }}>
                        Estimé : {new Date(liv.date_livraison_estimee).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
                <Badge value={statut} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── PAGE : Rapports ──────────────────────────────────────────────────────────
const Reports = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    API.get("/admin/reports/overview")
      .then(r => setOverview(r.data?.data ?? r.data))
      .catch(() => setError("Impossible de charger les rapports."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await API.get("/admin/reports/export-pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rapport-admin-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert("Erreur lors de l'export PDF."); }
    finally { setExporting(false); }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} onRetry={load} />;

  const ca = overview?.chiffre_affaires ?? 0;
  const totalCommandes = overview?.total_commandes ?? 0;
  const ventesMois = overview?.ventes_par_mois ?? [];
  const topProduits = overview?.top_produits ?? [];
  const commandesParStatut = overview?.commandes_par_statut ?? {};
  const usersParRole = overview?.users_par_role ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Rapports</h1>
          <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Statistiques avancées et rapports financiers</p>
        </div>
        <button onClick={handleExportPdf} disabled={exporting} style={{
          padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
          background: C.honey, color: C.white, fontSize: 14, fontWeight: 500,
          opacity: exporting ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8,
        }}>
          📄 {exporting ? "Export en cours..." : "Exporter PDF"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <MetricCard icon="💰" label="CA Total" value={`${Number(ca).toLocaleString("fr-MA")} DH`} color={C.honey} />
        <MetricCard icon="🛒" label="Total commandes" value={totalCommandes} color={C.info} />
        <MetricCard icon="👥" label="Total clients" value={usersParRole?.client?.total ?? 0} color={C.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15, marginBottom: 16 }}>Évolution des ventes (12 mois)</div>
          <MiniBarChart data={ventesMois} />
          {ventesMois.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {ventesMois.slice(-6).map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.gray600 }}>{m.mois}</span>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 12, color: C.gray400 }}>{m.nb_commandes} cmd</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.honey }}>{Number(m.total).toLocaleString("fr-MA")} DH</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15, marginBottom: 16 }}>Utilisateurs par rôle</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(usersParRole).map(([role, val]) => {
              const cfg = STATUS_CFG[role] || { label: role, color: C.gray400, bg: C.gray100 };
              return (
                <div key={role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                    <span style={{ fontSize: 13, color: C.gray600 }}>{cfg.label}s</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.earthDark }}>{val.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {topProduits.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15, marginBottom: 16 }}>🏆 Top Produits</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {topProduits.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: C.gray50, borderRadius: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i < 3 ? C.honey : C.gray200,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: i < 3 ? C.white : C.gray600,
                }}>#{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.earthDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.produit?.nom ?? p.nom ?? "—"}
                  </div>
                  <div style={{ fontSize: 11, color: C.gray400 }}>{p.total_vendu} vendus</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.honey, whiteSpace: "nowrap" }}>
                  {Number(p.chiffre_affaires || 0).toLocaleString("fr-MA")} DH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 15, marginBottom: 16 }}>Répartition des commandes</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {Object.entries(commandesParStatut).map(([key, val]) => {
            const cfg = STATUS_CFG[key] || { label: key, color: C.gray400, bg: C.gray100 };
            return (
              <div key={key} style={{
                padding: "14px", background: cfg.bg, borderRadius: 10,
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: cfg.color }}>{val.total}</span>
                <span style={{ fontSize: 12, color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE : Paramètres ────────────────────────────────────────────────────────
const Settings = () => {
  const [form, setForm] = useState({
    site_nom: "", site_email: "", site_telephone: "",
    site_adresse: "", site_logo_url: "", format_mail: "html",
    taille_logo: "200", maintenance_mode: "0",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    API.get("/admin/settings")
      .then(r => {
        const d = r.data?.data ?? r.data;
        if (d && typeof d === "object") {
          setForm(prev => ({ ...prev, ...d }));
        }
      })
      .catch(() => setError("Impossible de charger les paramètres."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await API.post("/admin/settings/update", form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const Field = ({ label, name, type = "text", options }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: C.earthDark }}>{label}</label>
      {options ? (
        <select name={name} value={form[name] ?? ""} onChange={handleChange} style={{
          padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.gray200}`,
          fontSize: 14, color: C.earthDark, background: C.white,
        }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type} name={name} value={form[name] ?? ""} onChange={handleChange}
          style={{
            padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.gray200}`,
            fontSize: 14, color: C.earthDark, outline: "none",
          }}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: C.earthDark, margin: "0 0 4px" }}>Paramètres</h1>
        <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>Configuration générale de la plateforme</p>
      </div>

      {error && <ErrorMsg msg={error} />}
      {success && (
        <div style={{
          padding: "14px 18px", borderRadius: 12,
          background: C.successLight, border: `1px solid ${C.success}40`,
          color: C.success, fontSize: 14, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ✅ Paramètres enregistrés avec succès !
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "24px" }}>
        <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 16, marginBottom: 20 }}>Informations du site</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Nom du site" name="site_nom" />
          <Field label="Email de contact" name="site_email" type="email" />
          <Field label="Téléphone" name="site_telephone" />
          <Field label="Adresse" name="site_adresse" />
          <Field label="URL du logo" name="site_logo_url" />
          <Field label="Taille du logo (px)" name="taille_logo" type="number" />
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "24px" }}>
        <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 16, marginBottom: 20 }}>Configuration technique</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Format des emails" name="format_mail" options={[{ value: "html", label: "HTML" }, { value: "text", label: "Texte brut" }]} />
          <Field label="Mode maintenance" name="maintenance_mode" options={[{ value: "0", label: "Désactivé" }, { value: "1", label: "Activé" }]} />
        </div>
        {form.maintenance_mode === "1" && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 10,
            background: C.warningLight, border: `1px solid ${C.warning}40`,
            color: C.warning, fontSize: 13, fontWeight: 500,
          }}>
            ⚠️ Le mode maintenance est activé — le site est inaccessible aux visiteurs.
          </div>
        )}
      </div>

      {form.site_logo_url && (
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "20px" }}>
          <div style={{ fontWeight: 600, color: C.earthDark, fontSize: 14, marginBottom: 12 }}>Aperçu du logo</div>
          <img
            src={form.site_logo_url} alt="Logo aperçu"
            style={{ maxHeight: 80, maxWidth: 200, objectFit: "contain", borderRadius: 8 }}
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
          background: C.honey, color: C.white, fontSize: 15, fontWeight: 600,
          opacity: saving ? 0.7 : 1,
        }}>
          {saving ? "Enregistrement..." : "💾 Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("overview");

  const pages = {
    overview:   <Overview />,
    users:      <Users />,
    catalogue:  <Catalogue />,
    orders:     <Orders />,
    deliveries: <Deliveries />,
    reports:    <Reports />,
    settings:   <Settings />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F3EE", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxWidth: "calc(100vw - 220px)" }}>
        {pages[activeNav]}
      </main>
    </div>
  );
}