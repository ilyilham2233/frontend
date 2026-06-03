import { useState, useEffect } from "react";

const API_BASE = "https://ice-universe-reason.ngrok-free.dev/api";

const COLORS = {
  honey: "#C8960C",
  honeyLight: "#FFF8E7",
  honeyMid: "#F5D76E",
  amber: "#D4811A",
  earthDark: "#4A3728",
  earthMid: "#7A5C44",
  earthLight: "#F5EFE6",
  success: "#16A34A",
  successLight: "#DCFCE7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  info: "#2563EB",
  infoLight: "#DBEAFE",
  gray50: "#FAFAFA",
  gray100: "#F4F4F5",
  gray200: "#E4E4E7",
  gray400: "#A1A1AA",
  gray600: "#52525B",
  gray800: "#27272A",
  white: "#FFFFFF",
};

const NAV_ITEMS = [
  { id: "overview", label: "Vue d'ensemble", icon: "ti-layout-dashboard" },
  { id: "users", label: "Utilisateurs", icon: "ti-users" },
  { id: "catalogue", label: "Catalogue", icon: "ti-package" },
  { id: "orders", label: "Commandes", icon: "ti-shopping-cart" },
  { id: "deliveries", label: "Livraisons", icon: "ti-truck" },
];

const MOCK_STATS = {
  totalRevenue: 48750,
  totalOrders: 312,
  totalUsers: 189,
  pendingProducts: 14,
  activeVendors: 23,
  activeDeliveries: 8,
  revenueByMonth: [
    { month: "Jan", value: 3200 },
    { month: "Fév", value: 4100 },
    { month: "Mar", value: 3800 },
    { month: "Avr", value: 5200 },
    { month: "Mai", value: 4600 },
    { month: "Jun", value: 6100 },
    { month: "Jul", value: 7200 },
    { month: "Aoû", value: 5900 },
  ],
  ordersByStatus: [
    { status: "en_attente", label: "En attente", count: 45, color: COLORS.warning },
    { status: "en_preparation", label: "En préparation", count: 28, color: COLORS.info },
    { status: "expediee", label: "Expédiée", count: 19, color: COLORS.amber },
    { status: "livree", label: "Livrée", count: 198, color: COLORS.success },
    { status: "annulee", label: "Annulée", count: 22, color: COLORS.danger },
  ],
};

const MOCK_USERS = [
  { id: 1, nom: "Alaoui", prenom: "Mehdi", email: "mehdi@example.com", role: "client", est_actif: true, created_at: "2025-03-12" },
  { id: 2, nom: "Benali", prenom: "Fatima", email: "fatima@example.com", role: "vendeur", est_actif: true, created_at: "2025-02-08" },
  { id: 3, nom: "Cherkaoui", prenom: "Youssef", email: "youssef@example.com", role: "livreur", est_actif: true, created_at: "2025-01-20" },
  { id: 4, nom: "Idrissi", prenom: "Samira", email: "samira@example.com", role: "client", est_actif: false, created_at: "2025-04-01" },
  { id: 5, nom: "Mansouri", prenom: "Karim", email: "karim@example.com", role: "vendeur", est_actif: true, created_at: "2025-03-28" },
  { id: 6, nom: "Tazi", prenom: "Nadia", email: "nadia@example.com", role: "client", est_actif: true, created_at: "2025-04-15" },
];

const MOCK_PRODUCTS = [
  { id: 1, nom: "Miel de Thym Authentique", categorie: "Miels", prix: 120, quantite_stock: 45, statut: "en_attente", vendeur: "Benali Fatima", image_url: "https://i.ibb.co/placeholder" },
  { id: 2, nom: "Argan Cosmétique Bio", categorie: "Huiles", prix: 95, quantite_stock: 30, statut: "actif", vendeur: "Mansouri Karim", image_url: "" },
  { id: 3, nom: "Safran Pur Taliouine", categorie: "Épices", prix: 280, quantite_stock: 12, statut: "en_attente", vendeur: "Benali Fatima", image_url: "" },
  { id: 4, nom: "Huile d'Olive Prestige", categorie: "Huiles", prix: 75, quantite_stock: 60, statut: "actif", vendeur: "Mansouri Karim", image_url: "" },
  { id: 5, nom: "Amandes Douces Aguerd", categorie: "Fruits secs", prix: 55, quantite_stock: 0, statut: "masque", vendeur: "Benali Fatima", image_url: "" },
  { id: 6, nom: "Rose de Dadès Séchée", categorie: "Épices", prix: 40, quantite_stock: 80, statut: "en_attente", vendeur: "Mansouri Karim", image_url: "" },
];

const MOCK_ORDERS = [
  { id: 101, client: "Alaoui Mehdi", prix_total: 375, statut: "en_attente", livreur: null, created_at: "2025-06-01" },
  { id: 102, client: "Tazi Nadia", prix_total: 190, statut: "en_preparation", livreur: "Cherkaoui Youssef", created_at: "2025-06-01" },
  { id: 103, client: "Idrissi Samira", prix_total: 560, statut: "expediee", livreur: "Cherkaoui Youssef", created_at: "2025-05-30" },
  { id: 104, client: "Alaoui Mehdi", prix_total: 120, statut: "livree", livreur: "Cherkaoui Youssef", created_at: "2025-05-28" },
  { id: 105, client: "Tazi Nadia", prix_total: 85, statut: "annulee", livreur: null, created_at: "2025-05-27" },
];

const MOCK_LIVREURS = [
  { id: 3, nom: "Cherkaoui", prenom: "Youssef" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const Badge = ({ label, color, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: "2px 10px", borderRadius: 999,
    fontSize: 12, fontWeight: 500,
    color, background: bg,
  }}>{label}</span>
);

const statusConfig = {
  en_attente: { label: "En attente", color: COLORS.warning, bg: COLORS.warningLight },
  en_preparation: { label: "En préparation", color: COLORS.info, bg: COLORS.infoLight },
  expediee: { label: "Expédiée", color: COLORS.amber, bg: "#FEF3C7" },
  livree: { label: "Livrée", color: COLORS.success, bg: COLORS.successLight },
  annulee: { label: "Annulée", color: COLORS.danger, bg: COLORS.dangerLight },
  actif: { label: "Actif", color: COLORS.success, bg: COLORS.successLight },
  masque: { label: "Masqué", color: COLORS.gray600, bg: COLORS.gray100 },
  client: { label: "Client", color: COLORS.info, bg: COLORS.infoLight },
  vendeur: { label: "Vendeur", color: COLORS.amber, bg: "#FEF3C7" },
  livreur: { label: "Livreur", color: "#7C3AED", bg: "#EDE9FE" },
  admin: { label: "Admin", color: COLORS.danger, bg: COLORS.dangerLight },
};

const StatusBadge = ({ value }) => {
  const cfg = statusConfig[value] || { label: value, color: COLORS.gray600, bg: COLORS.gray100 };
  return <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />;
};

const MetricCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
    borderRadius: 14, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 8,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: COLORS.gray600 }}>{label}</span>
      <span style={{
        width: 36, height: 36, borderRadius: 10,
        background: color + "18", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color }} aria-hidden="true" />
      </span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.earthDark }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: COLORS.gray400 }}>{sub}</div>}
  </div>
);

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
          <div style={{
            width: "100%", background: COLORS.honey,
            borderRadius: "4px 4px 0 0", opacity: 0.7 + (d.value / max) * 0.3,
            height: `${(d.value / max) * 64}px`, minHeight: 4,
            transition: "height 0.3s ease",
          }} />
          <span style={{ fontSize: 9, color: COLORS.gray400 }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Sidebar ────────────────────────────────────────────────────────────────

const Sidebar = ({ active, onNav }) => (
  <aside style={{
    width: 220, minHeight: "100vh", background: COLORS.earthDark,
    display: "flex", flexDirection: "column", padding: "0 0 24px",
    position: "sticky", top: 0, flexShrink: 0,
  }}>
    <div style={{
      padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: COLORS.honey, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18 }}>🍯</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.white }}>Khayrate Bladi</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Administration</div>
        </div>
      </div>
    </div>
    <nav style={{ padding: "12px 12px", flex: 1 }}>
      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
          cursor: "pointer", textAlign: "left", marginBottom: 2,
          background: active === item.id ? "rgba(200,150,12,0.18)" : "transparent",
          color: active === item.id ? COLORS.honeyMid : "rgba(255,255,255,0.55)",
          fontSize: 13, fontWeight: active === item.id ? 500 : 400,
          transition: "all 0.15s ease",
        }}>
          <i className={`ti ${item.icon}`} style={{ fontSize: 17 }} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </nav>
    <div style={{ padding: "0 12px" }}>
      <div style={{
        padding: "12px", borderRadius: 10,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: COLORS.honey, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: COLORS.earthDark,
          }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.white }}>Administrateur</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>admin@khayrate.ma</div>
          </div>
        </div>
      </div>
    </div>
  </aside>
);

// ─── Overview ───────────────────────────────────────────────────────────────

const Overview = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: COLORS.earthDark, margin: "0 0 4px" }}>Vue d'ensemble</h1>
      <p style={{ fontSize: 14, color: COLORS.gray600, margin: 0 }}>Résumé des activités — Khayrate Bladi</p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      <MetricCard icon="ti-currency-dollar" label="Chiffre d'affaires" value={`${MOCK_STATS.totalRevenue.toLocaleString("fr-MA")} DH`} sub="Cumulé toutes commandes" color={COLORS.honey} />
      <MetricCard icon="ti-shopping-cart" label="Commandes totales" value={MOCK_STATS.totalOrders} sub={`${MOCK_STATS.ordersByStatus[0].count} en attente`} color={COLORS.info} />
      <MetricCard icon="ti-users" label="Utilisateurs" value={MOCK_STATS.totalUsers} sub={`${MOCK_STATS.activeVendors} vendeurs actifs`} color="#7C3AED" />
      <MetricCard icon="ti-package" label="Produits en attente" value={MOCK_STATS.pendingProducts} sub="À valider dans le catalogue" color={COLORS.warning} />
      <MetricCard icon="ti-truck" label="Livraisons actives" value={MOCK_STATS.activeDeliveries} sub="En cours de traitement" color={COLORS.amber} />
      <MetricCard icon="ti-star" label="Avis clients" value="4.7 / 5" sub="Note moyenne générale" color={COLORS.success} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
        borderRadius: 14, padding: "20px 22px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600, color: COLORS.earthDark, fontSize: 15 }}>Revenus mensuels</div>
            <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 2 }}>Derniers 8 mois · en DH</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.honey }}>
            {MOCK_STATS.totalRevenue.toLocaleString("fr-MA")} DH
          </span>
        </div>
        <MiniBarChart data={MOCK_STATS.revenueByMonth} />
      </div>
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
        borderRadius: 14, padding: "20px 22px",
      }}>
        <div style={{ fontWeight: 600, color: COLORS.earthDark, fontSize: 15, marginBottom: 16 }}>Commandes par statut</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_STATS.ordersByStatus.map(s => (
            <div key={s.status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 12, color: COLORS.gray600 }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.earthDark }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{
      background: COLORS.honeyLight, border: `1px solid ${COLORS.honeyMid}`,
      borderRadius: 14, padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 20, color: COLORS.amber }} aria-hidden="true" />
      <div>
        <div style={{ fontWeight: 500, color: COLORS.earthDark, fontSize: 14 }}>
          {MOCK_STATS.pendingProducts} produits en attente de validation
        </div>
        <div style={{ fontSize: 12, color: COLORS.earthMid, marginTop: 2 }}>
          Des vendeurs attendent votre approbation pour mettre en vente leurs produits.
        </div>
      </div>
    </div>
  </div>
);

// ─── Users ───────────────────────────────────────────────────────────────────

const Users = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("tous");

  const filtered = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "tous" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, est_actif: !u.est_actif } : u));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: COLORS.earthDark, margin: "0 0 4px" }}>Utilisateurs</h1>
        <p style={{ fontSize: 14, color: COLORS.gray600, margin: 0 }}>Gestion des comptes et accès</p>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 8,
          background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
          borderRadius: 10, padding: "8px 14px",
        }}>
          <i className="ti ti-search" style={{ fontSize: 16, color: COLORS.gray400 }} aria-hidden="true" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            style={{
              border: "none", outline: "none", flex: 1,
              fontSize: 14, color: COLORS.earthDark, background: "transparent",
            }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
          padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.gray200}`,
          fontSize: 13, color: COLORS.earthDark, background: COLORS.white, cursor: "pointer",
        }}>
          <option value="tous">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="vendeur">Vendeur</option>
          <option value="livreur">Livreur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
        borderRadius: 14, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.gray50 }}>
              {["Utilisateur", "Email", "Rôle", "Statut", "Inscrit le", "Action"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 500, color: COLORS.gray600,
                  borderBottom: `1px solid ${COLORS.gray200}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.gray100}` : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: COLORS.honeyLight, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 600, color: COLORS.amber,
                    }}>{u.prenom[0]}{u.nom[0]}</div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.earthDark }}>{u.prenom} {u.nom}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.gray600 }}>{u.email}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge value={u.role} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <Badge
                    label={u.est_actif ? "Actif" : "Bloqué"}
                    color={u.est_actif ? COLORS.success : COLORS.danger}
                    bg={u.est_actif ? COLORS.successLight : COLORS.dangerLight}
                  />
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.gray400 }}>{u.created_at}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => toggleActive(u.id)} style={{
                    padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 500,
                    background: u.est_actif ? COLORS.dangerLight : COLORS.successLight,
                    color: u.est_actif ? COLORS.danger : COLORS.success,
                  }}>
                    {u.est_actif ? "Bloquer" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Catalogue ───────────────────────────────────────────────────────────────

const Catalogue = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [filter, setFilter] = useState("tous");

  const filtered = filter === "tous" ? products : products.filter(p => p.statut === filter);

  const changeStatus = (id, newStatut) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, statut: newStatut } : p));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: COLORS.earthDark, margin: "0 0 4px" }}>Catalogue produits</h1>
        <p style={{ fontSize: 14, color: COLORS.gray600, margin: 0 }}>Validation et modération des produits</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { key: "tous", label: "Tous" },
          { key: "en_attente", label: "En attente" },
          { key: "actif", label: "Actifs" },
          { key: "masque", label: "Masqués" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            background: filter === f.key ? COLORS.honey : COLORS.gray100,
            color: filter === f.key ? COLORS.white : COLORS.gray600,
          }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {filtered.map(p => (
          <div key={p.id} style={{
            background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
            borderRadius: 14, padding: "16px 18px",
            borderLeft: p.statut === "en_attente" ? `4px solid ${COLORS.warning}` : `1px solid ${COLORS.gray200}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.earthDark }}>{p.nom}</div>
                <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 2 }}>{p.categorie} · par {p.vendeur}</div>
              </div>
              <StatusBadge value={p.statut} />
            </div>
            <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.gray400 }}>Prix</div>
                <div style={{ fontWeight: 600, color: COLORS.honey, fontSize: 15 }}>{p.prix} DH</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: COLORS.gray400 }}>Stock</div>
                <div style={{ fontWeight: 600, color: p.quantite_stock === 0 ? COLORS.danger : COLORS.earthDark, fontSize: 15 }}>
                  {p.quantite_stock === 0 ? "Rupture" : `${p.quantite_stock} unités`}
                </div>
              </div>
            </div>
            {p.statut === "en_attente" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => changeStatus(p.id, "actif")} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: COLORS.successLight, color: COLORS.success, fontSize: 13, fontWeight: 500,
                }}>
                  <i className="ti ti-check" style={{ marginRight: 5 }} aria-hidden="true" />
                  Valider
                </button>
                <button onClick={() => changeStatus(p.id, "masque")} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: COLORS.dangerLight, color: COLORS.danger, fontSize: 13, fontWeight: 500,
                }}>
                  <i className="ti ti-eye-off" style={{ marginRight: 5 }} aria-hidden="true" />
                  Masquer
                </button>
              </div>
            )}
            {p.statut === "actif" && (
              <button onClick={() => changeStatus(p.id, "masque")} style={{
                padding: "7px 14px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`,
                cursor: "pointer", background: "transparent", fontSize: 12, color: COLORS.gray600,
              }}>Masquer le produit</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Orders ──────────────────────────────────────────────────────────────────

const Orders = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedLivreur, setSelectedLivreur] = useState(MOCK_LIVREURS[0]?.id || null);

  const assignLivreur = (orderId) => {
    const livreur = MOCK_LIVREURS.find(l => l.id === selectedLivreur);
    if (livreur) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, livreur: `${livreur.prenom} ${livreur.nom}` } : o));
    }
    setAssignModal(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: COLORS.earthDark, margin: "0 0 4px" }}>Commandes</h1>
        <p style={{ fontSize: 14, color: COLORS.gray600, margin: 0 }}>Gestion et assignation des livraisons</p>
      </div>
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
        borderRadius: 14, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.gray50 }}>
              {["#", "Client", "Total", "Statut", "Livreur assigné", "Date", "Action"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 500, color: COLORS.gray600,
                  borderBottom: `1px solid ${COLORS.gray200}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? `1px solid ${COLORS.gray100}` : "none" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: COLORS.gray400 }}>#{o.id}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: COLORS.earthDark }}>{o.client}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: COLORS.honey }}>{o.prix_total} DH</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge value={o.statut} /></td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: o.livreur ? COLORS.earthDark : COLORS.gray400 }}>
                  {o.livreur || "Non assigné"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.gray400 }}>{o.created_at}</td>
                <td style={{ padding: "12px 16px" }}>
                  {(o.statut === "en_attente" || o.statut === "en_preparation") && (
                    <button onClick={() => setAssignModal(o.id)} style={{
                      padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 500,
                      background: COLORS.infoLight, color: COLORS.info,
                    }}>
                      <i className="ti ti-user-plus" style={{ marginRight: 4, fontSize: 13 }} aria-hidden="true" />
                      Assigner
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {assignModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: COLORS.white, borderRadius: 16, padding: "28px 32px",
            width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ margin: "0 0 6px", color: COLORS.earthDark, fontSize: 17 }}>
              Assigner un livreur
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: COLORS.gray600 }}>
              Commande #{assignModal}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.earthDark, display: "block", marginBottom: 8 }}>
                Choisir le livreur
              </label>
              <select value={selectedLivreur} onChange={e => setSelectedLivreur(Number(e.target.value))} style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: `1px solid ${COLORS.gray200}`, fontSize: 14, color: COLORS.earthDark,
              }}>
                {MOCK_LIVREURS.map(l => (
                  <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAssignModal(null)} style={{
                flex: 1, padding: "10px", borderRadius: 10,
                border: `1px solid ${COLORS.gray200}`, cursor: "pointer",
                background: "transparent", fontSize: 14, color: COLORS.gray600,
              }}>Annuler</button>
              <button onClick={() => assignLivreur(assignModal)} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                background: COLORS.honey, fontSize: 14, fontWeight: 500, color: COLORS.white,
              }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Deliveries ──────────────────────────────────────────────────────────────

const Deliveries = () => {
  const deliveries = [
    { id: 1, commande: 102, client: "Tazi Nadia", livreur: "Cherkaoui Youssef", statut: "en_cours", adresse: "12 Rue Atlas, Casablanca", date_estimee: "2025-06-03" },
    { id: 2, commande: 103, client: "Idrissi Samira", livreur: "Cherkaoui Youssef", statut: "recuperee", adresse: "5 Bd Mohammed V, Rabat", date_estimee: "2025-06-02" },
    { id: 3, commande: 104, client: "Alaoui Mehdi", livreur: "Cherkaoui Youssef", statut: "livree", adresse: "23 Rue des Orangers, Marrakech", date_estimee: "2025-05-28" },
  ];

  const deliveryStatusConfig = {
    assignee: { label: "Assignée", color: COLORS.info, bg: COLORS.infoLight },
    recuperee: { label: "Récupérée", color: COLORS.amber, bg: "#FEF3C7" },
    en_cours: { label: "En cours", color: "#7C3AED", bg: "#EDE9FE" },
    livree: { label: "Livrée", color: COLORS.success, bg: COLORS.successLight },
    non_livree: { label: "Non livrée", color: COLORS.danger, bg: COLORS.dangerLight },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: COLORS.earthDark, margin: "0 0 4px" }}>Livraisons</h1>
        <p style={{ fontSize: 14, color: COLORS.gray600, margin: 0 }}>Suivi des tournées en temps réel</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Actives", value: 2, color: "#7C3AED", icon: "ti-truck" },
          { label: "Livrées aujourd'hui", value: 1, color: COLORS.success, icon: "ti-circle-check" },
          { label: "Livreurs disponibles", value: 1, color: COLORS.info, icon: "ti-user-check" },
        ].map(m => <MetricCard key={m.label} {...m} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {deliveries.map(d => {
          const sc = deliveryStatusConfig[d.statut];
          return (
            <div key={d.id} style={{
              background: COLORS.white, border: `1px solid ${COLORS.gray200}`,
              borderRadius: 14, padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="ti ti-truck" style={{ fontSize: 20, color: sc.color }} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: COLORS.earthDark, fontSize: 14 }}>
                    Commande #{d.commande} — {d.client}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 3 }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 12, marginRight: 3 }} aria-hidden="true" />
                    {d.adresse}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 2 }}>
                    Livreur: <span style={{ color: COLORS.earthMid, fontWeight: 500 }}>{d.livreur}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                <span style={{ fontSize: 11, color: COLORS.gray400 }}>Estimé: {d.date_estimee}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("overview");

  const pages = {
    overview: <Overview />,
    users: <Users />,
    catalogue: <Catalogue />,
    orders: <Orders />,
    deliveries: <Deliveries />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F3EE", fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {pages[activeNav]}
      </main>
    </div>
  );
}
