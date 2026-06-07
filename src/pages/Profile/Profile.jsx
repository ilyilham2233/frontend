import React, { useState, useEffect } from 'react';
import {
  FiUser, FiMapPin, FiLogOut,
  FiEdit2, FiAlertTriangle, FiCheckCircle, FiMail,
  FiShoppingBag, FiPackage, FiTrash2, FiX, FiPlus,
  FiCheck, FiHome, FiShoppingCart, FiSave, FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getOrderHistory } from '../../api/orders';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../api/Adresse';
import { updateProfile, fetchProfile } from '../../api/auth';
import { Navbar } from '../../components';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const NAV_ITEMS = [
  { key: 'profil',   label: 'Mon Profil', icon: FiUser },
  { key: 'adresses', label: 'Adresses',   icon: FiMapPin },
];

const EMPTY_FORM = { rue: '', ville: '', code_postal: '', est_par_defaut: false };

const Profile = () => {
  const { user, logout, sendVerification, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [orders,    setOrders]    = useState([]);
  const [sending,   setSending]   = useState(false);
  const [sentMsg,   setSentMsg]   = useState('');

  const [editing,    setEditing]    = useState(false);
  const [editForm,   setEditForm]   = useState({ prenom: '', nom: '', telephone: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg,    setEditMsg]    = useState('');

  const phone = user?.telephone || user?.Telephone || user?.phone || user?.Phone || '—';
  const isEmailVerified = Boolean(
    user?.email_verifie_le ||
    user?.email_verified_at ||
    user?.email_verified ||
    user?.verified ||
    user?.is_verified ||
    user?.emailVerified
  );

  const [addresses,   setAddresses]   = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError,   setAddrError]   = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState('');
  const [deleteId,    setDeleteId]    = useState(null);

  const memberSince = (() => {
    if (!user?.created_at) return null;
    return new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  })();
  useEffect(() => {
  fetchProfile()
    .then(res => {
      const fresh = res?.data?.data || res?.data || res;
      updateUser({ ...user, ...fresh });
    })
    .catch(() => {});
}, []);

  useEffect(() => {
    getOrderHistory()
      .then(res => setOrders(res?.data ?? res ?? []))
      .catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (activeTab === 'adresses') loadAddresses();
  }, [activeTab]);

  const loadAddresses = async () => {
    setAddrLoading(true); setAddrError('');
    try {
      const res = await getAddresses();
      setAddresses(res?.data ?? res ?? []);
    } catch { setAddrError('Impossible de charger les adresses.'); }
    finally  { setAddrLoading(false); }
  };

  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.prix_total ?? 0), 0);
  const initials   = [user?.prenom, user?.nom]
    .filter(Boolean).map(s => s[0].toUpperCase()).join('') || 'U';

  const handleResend = async () => {
    setSending(true); setSentMsg('');
    try {
      await sendVerification();
      setSentMsg('Email envoyé ! Vérifiez votre boîte.');
    } catch { setSentMsg('Erreur. Réessayez plus tard.'); }
    finally  { setSending(false); }
  };
  const navigate = useNavigate();

const handleVerifyEmail = async () => {
  setSending(true); setSentMsg('');
  try {
    await sendVerification();
    setSentMsg('Email envoyé !');
    setTimeout(() => navigate('/verify-email'), 1500); // ← rediriger
  } catch { setSentMsg('Erreur. Réessayez plus tard.'); }
  finally  { setSending(false); }
};

  const openEdit = () => {
    setEditForm({
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      telephone: user?.telephone || user?.Telephone || user?.phone || user?.Phone || '',
    });
    setEditMsg('');
    setEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

 const handleEditSave = async () => {
  setEditSaving(true); setEditMsg('');
  try {
    await updateProfile(editForm);
    setEditMsg('Profil mis à jour !');
    setTimeout(() => { setEditing(false); setEditMsg(''); }, 1500);
  } catch (err) {
    setEditMsg(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
  } finally {
    setEditSaving(false);
  }
};
  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setShowForm(true); };
  const openEditAddr = (addr) => {
    setEditingId(addr.id);
    setForm({ rue: addr.rue, ville: addr.ville, code_postal: addr.code_postal, est_par_defaut: !!addr.est_par_defaut });
    setFormError(''); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setFormError(''); };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = async () => {
    if (!form.rue.trim() || !form.ville.trim() || !form.code_postal.trim()) {
      setFormError('Tous les champs sont obligatoires.'); return;
    }
    setFormLoading(true); setFormError('');
    try {
      if (editingId) await updateAddress(editingId, form);
      else           await createAddress(form);
      closeForm(); await loadAddresses();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch { setAddrError('Erreur lors de la suppression.'); }
    finally  { setDeleteId(null); }
  };

  return (
    <div className="pf-root">
      <Navbar
        variant="default"
        brand="Khayrat Bladi"
        brandTo="/home"
        links={[
          { to: '/home',     label: 'Accueil',   icon: <FiShoppingBag /> },
          { to: '/products', label: 'Produits',  icon: <FiShoppingBag /> },
          { to: '/orders',   label: 'Commandes', icon: <FiPackage /> },
          { to: '/cart',     label: 'Panier',    icon: <FiShoppingCart /> },
        ]}
        rightLinks={[
          { to: '/profile', label: 'Profil',      icon: <FiUser /> },
          { type: 'button', label: 'Déconnexion', icon: <FiLogOut />, onClick: logout },
        ]}
      />

      <div className="pf-page">
        {/* ── BANNER ── */}
        <div className="pf-banner">
          <div className="pf-banner-inner">
            <div className="pf-avatar">{initials}</div>
            <div className="pf-banner-info">
              <h1 className="pf-banner-name">{user?.prenom} {user?.nom}</h1>
              <p className="pf-banner-email"><FiMail size={13} /> {user?.email}</p>
              {memberSince && <p className="pf-banner-since"><FiShield size={13} /> Membre depuis {memberSince}</p>}
            </div>
            <div className="pf-banner-stats">
              <div className="pf-stat">
                <span className="pf-stat-val">{orders.length}</span>
                <span className="pf-stat-lbl">Commandes</span>
              </div>
              <div className="pf-stat">
                <span className="pf-stat-val">{totalSpent.toFixed(0)} DH</span>
                <span className="pf-stat-lbl">Total dépensé</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="pf-body">
          <aside className="pf-sidebar">
            <nav className="pf-nav">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button key={key}
                  className={`pf-nav-item ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}>
                  <Icon size={16} />{label}
                </button>
              ))}
              <div className="pf-nav-divider" />
              <button className="pf-nav-item pf-nav-logout" onClick={logout}>
                <FiLogOut size={16} />Se déconnecter
              </button>
            </nav>
          </aside>

          <main className="pf-main">

            {/* ── MON PROFIL ── */}
            {activeTab === 'profil' && (
              <section className="pf-section">
                <div className="pf-section-head">
                  <h2>Informations personnelles</h2>
                  {!editing && (
                    <button className="pf-edit-btn" onClick={openEdit}>
                      <FiEdit2 size={14} /> Modifier
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="pf-edit-form">
                    {editMsg && <p className="pf-sent-msg">{editMsg}</p>}
                    <div className="pf-fields">
                      <div className="pf-field">
                        <span className="pf-field-label">PRÉNOM</span>
                        <input className="pf-field-input" name="prenom" value={editForm.prenom} onChange={handleEditChange} />
                      </div>
                      <div className="pf-field">
                        <span className="pf-field-label">NOM</span>
                        <input className="pf-field-input" name="nom" value={editForm.nom} onChange={handleEditChange} />
                      </div>
                      <div className="pf-field pf-field--wide">
                        <span className="pf-field-label">EMAIL</span>
                        <span className="pf-field-value">{user?.email || '—'}</span>
                      </div>
                      <div className="pf-field">
                        <span className="pf-field-label">TÉLÉPHONE</span>
                        <input className="pf-field-input" name="telephone" value={editForm.telephone} onChange={handleEditChange} placeholder="+212 6XX XXX XXX" />
                      </div>
                    </div>
                    <div className="pf-form-actions">
                      <button className="pf-btn-cancel" onClick={() => setEditing(false)}>Annuler</button>
                      <button className="pf-btn-save" onClick={handleEditSave} disabled={editSaving}>
                        {editSaving ? 'Sauvegarde…' : <><FiSave size={14} /> Enregistrer</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pf-fields">
                    <div className="pf-field">
                      <span className="pf-field-label">PRÉNOM</span>
                      <span className="pf-field-value">{user?.prenom || '—'}</span>
                    </div>
                    <div className="pf-field">
                      <span className="pf-field-label">NOM</span>
                      <span className="pf-field-value">{user?.nom || '—'}</span>
                    </div>
                    <div className="pf-field pf-field--wide">
                      <span className="pf-field-label">EMAIL</span>
                      <span className="pf-field-value">{user?.email || '—'}</span>
                    </div>
                    <div className="pf-field">
                      <span className="pf-field-label">TÉLÉPHONE</span>
                      <span className="pf-field-value">{phone}</span>
                    </div>
                    <div className="pf-field">
                      <span className="pf-field-label">RÔLE</span>
                      <span className="pf-field-value pf-role-badge">{user?.role || '—'}</span>
                    </div>
                  </div>
                )}

                {!isEmailVerified ? (
                  <div className="pf-verify-card">
                    <div className="pf-verify-icon"><FiAlertTriangle size={20} /></div>
                    <div className="pf-verify-text">
                      <strong>Email non vérifié</strong>
                      <p>Vérifiez votre email pour accéder à toutes les fonctionnalités.</p>
                    </div>
                    <button className="pf-resend-btn" onClick={handleVerifyEmail} disabled={sending}>
                      {sending ? 'Envoi…' : 'Vérifier email'}
                    </button>
                    {sentMsg && <p className="pf-sent-msg">{sentMsg}</p>}
                  </div>
                ) : (
                  <div className="pf-verified-card">
                    <FiCheckCircle size={18} /><span>Email vérifié</span>
                  </div>
                )}
              </section>
            )}

            {/* ── ADRESSES ── */}
            {activeTab === 'adresses' && (
              <section className="pf-section">
                <div className="pf-section-head">
                  <h2>Mes adresses</h2>
                  <button className="pf-edit-btn" onClick={openCreate}>
                    <FiPlus size={14} /> Ajouter
                  </button>
                </div>

                {addrError && <div className="pf-alert pf-alert--error">{addrError}</div>}

                {showForm && (
                  <div className="pf-addr-form">
                    <div className="pf-addr-form-head">
                      <h3>{editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h3>
                      <button className="pf-icon-btn" onClick={closeForm}><FiX size={16} /></button>
                    </div>
                    {formError && <div className="pf-alert pf-alert--error">{formError}</div>}
                    <div className="pf-form-grid">
                      <div className="pf-form-group pf-form-group--wide">
                        <label>Rue</label>
                        <input name="rue" value={form.rue} onChange={handleFormChange} placeholder="123 Rue de la Médina" />
                      </div>
                      <div className="pf-form-group">
                        <label>Ville</label>
                        <input name="ville" value={form.ville} onChange={handleFormChange} placeholder="Casablanca" />
                      </div>
                      <div className="pf-form-group">
                        <label>Code postal</label>
                        <input name="code_postal" value={form.code_postal} onChange={handleFormChange} placeholder="20000" />
                      </div>
                      <div className="pf-form-group pf-form-group--wide pf-form-check">
                        <label className="pf-checkbox-label">
                          <input type="checkbox" name="est_par_defaut" checked={form.est_par_defaut} onChange={handleFormChange} />
                          <span>Définir comme adresse par défaut</span>
                        </label>
                      </div>
                    </div>
                    <div className="pf-form-actions">
                      <button className="pf-btn-cancel" onClick={closeForm}>Annuler</button>
                      <button className="pf-btn-save" onClick={handleFormSubmit} disabled={formLoading}>
                        {formLoading ? 'Sauvegarde…' : <><FiCheck size={14} /> {editingId ? 'Mettre à jour' : 'Enregistrer'}</>}
                      </button>
                    </div>
                  </div>
                )}

                {addrLoading ? (
                  <div className="pf-loading">Chargement…</div>
                ) : addresses.length === 0 ? (
                  <div className="pf-empty">
                    <FiMapPin size={32} />
                    <p>Aucune adresse enregistrée.</p>
                    <button className="pf-edit-btn" onClick={openCreate}><FiPlus size={14} /> Ajouter une adresse</button>
                  </div>
                ) : (
                  <div className="pf-addr-list">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`pf-addr-card ${addr.est_par_defaut ? 'default' : ''}`}>
                        <div className="pf-addr-icon"><FiHome size={18} /></div>
                        <div className="pf-addr-info">
                          <p className="pf-addr-line">{addr.rue}</p>
                          <p className="pf-addr-sub">{addr.ville}, {addr.code_postal}</p>
                          {addr.est_par_defaut && <span className="pf-addr-default-badge">Par défaut</span>}
                        </div>
                        <div className="pf-addr-actions">
                          <button className="pf-icon-btn" onClick={() => openEditAddr(addr)}><FiEdit2 size={15} /></button>
                          <button className="pf-icon-btn pf-icon-btn--danger"
                            onClick={() => handleDelete(addr.id)}
                            disabled={deleteId === addr.id}>
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;