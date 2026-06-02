import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiArrowRight, FiCheckCircle, FiAlertCircle,
  FiLogOut, FiUser, FiMapPin, FiPlus, FiCreditCard, FiTruck,
  FiPackage, FiShoppingBag, FiCheck, FiEdit2, FiTrash2, FiLock,
} from 'react-icons/fi';
import { processOrder } from '../../api/orders';
import { deleteAddress, getAddresses, storeAddress, updateAddress } from '../../api/catalogue';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Navbar } from '../../components';
import './Checkout.css';

/* ── Stepper ── */
const STEPS = ['Résumé', 'Adresse', 'Paiement'];

const extractAddresses = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.addresses)) return data.addresses;
  if (Array.isArray(data?.adresses)) return data.adresses;
  return [];
};

const extractAddress = (payload) => {
  const data = payload?.data ?? payload;
  return data?.address ?? data?.adresse ?? data;
};

const Stepper = ({ current }) => (
  <div className="ck-stepper">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={label}>
          <div className={`ck-step${active ? ' active' : ''}${done ? ' done' : ''}`}>
            <div className="ck-step-circle">
              {done ? <FiCheck size={13} /> : <span>{i + 1}</span>}
            </div>
            <span className="ck-step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`ck-step-line${done ? ' done' : ''}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Étape 1 : Résumé commande ── */
const StepSummary = ({ cart, total, onNext }) => (
  <div className="ck-section">
    <h2 className="ck-section-title"><FiShoppingBag size={16} /> Articles commandés</h2>

    <div className="ck-items">
      {cart.map((item) => (
        <div className="ck-item" key={item.id}>
          <div className="ck-item-img">
            <img
              src={item.produit?.image_url || `${process.env.PUBLIC_URL}/images/honey-pure.png`}
              alt={item.produit?.nom}
              onError={(e) => { e.currentTarget.src = `${process.env.PUBLIC_URL}/images/honey-pure.png`; }}
            />
          </div>
          <div className="ck-item-info">
            <p className="ck-item-name">{item.produit?.nom}</p>
            <p className="ck-item-unit">{item.produit?.prix} DH × {item.quantite}</p>
          </div>
          <span className="ck-item-sub">
            {((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH
          </span>
        </div>
      ))}
    </div>

    <div className="ck-total-box">
      <div className="ck-total-row"><span>Sous-total</span><span>{total.toFixed(2)} DH</span></div>
      <div className="ck-total-row"><span>Livraison</span><span className="ck-free">Gratuite</span></div>
      <div className="ck-total-row ck-total-final">
        <span>Total</span><span>{total.toFixed(2)} DH</span>
      </div>
    </div>

    <button className="ck-btn-next" onClick={onNext}>
      Choisir l'adresse <FiArrowRight size={15} />
    </button>
  </div>
);

/* ── Étape 2 : Adresse de livraison ── */
const StepAddress = ({ onNext, onBack, selectedId, setSelectedId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState({ rue: '', ville: '', code_postal: '', est_par_defaut: false });
  const [err, setErr]             = useState('');

  useEffect(() => {
    getAddresses()
      .then((res) => {
        const list = extractAddresses(res);
        setAddresses(list);
        const def = list.find((a) => a.est_par_defaut) || list[0];
        if (def) setSelectedId((current) => current || def.id);
      })
      .catch(() => setErr('Impossible de charger les adresses.'))
      .finally(() => setLoading(false));
  }, [setSelectedId]);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({ rue: '', ville: '', code_postal: '', est_par_defaut: false });
  };

  const openCreateForm = () => {
    setErr('');
    setEditingId(null);
    setForm({ rue: '', ville: '', code_postal: '', est_par_defaut: false });
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    setErr('');
    setEditingId(addr.id);
    setForm({
      rue: addr.rue || '',
      ville: addr.ville || '',
      code_postal: addr.code_postal || '',
      est_par_defaut: Boolean(addr.est_par_defaut),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.rue || !form.ville || !form.code_postal) { setErr('Remplissez tous les champs.'); return; }
    setSaving(true); setErr('');
    try {
      const res = editingId
        ? await updateAddress(editingId, form)
        : await storeAddress(form);
      const savedAddress = {
        ...form,
        ...extractAddress(res),
        id: extractAddress(res)?.id || editingId,
      };

      setAddresses((prev) => {
        const next = editingId
          ? prev.map((addr) => (addr.id === editingId ? { ...addr, ...savedAddress } : addr))
          : [...prev, savedAddress];

        return form.est_par_defaut
          ? next.map((addr) => ({ ...addr, est_par_defaut: addr.id === savedAddress.id }))
          : next;
      });

      setSelectedId(savedAddress.id);
      resetForm();
    } catch (e) {
      setErr(e.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr) => {
    setDeletingId(addr.id);
    setErr('');
    try {
      await deleteAddress(addr.id);
      setAddresses((prev) => {
        const next = prev.filter((item) => item.id !== addr.id);
        if (selectedId === addr.id) setSelectedId(next[0]?.id || null);
        return next;
      });
      if (editingId === addr.id) resetForm();
    } catch (e) {
      setErr(e.response?.data?.message || 'Impossible de supprimer cette adresse.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ck-section">
      <h2 className="ck-section-title"><FiMapPin size={16} /> Adresse de livraison</h2>

      {err && <div className="ck-alert ck-alert-error"><FiAlertCircle size={14} /> {err}</div>}

      {loading ? (
        <div className="ck-skeletons">{[1,2].map(i=><div key={i} className="ck-skeleton"/>)}</div>
      ) : (
        <>
          <div className="ck-address-list">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`ck-address-card${selectedId === addr.id ? ' selected' : ''}`}
                onClick={() => setSelectedId(addr.id)}
              >
                <div className="ck-address-radio">
                  {selectedId === addr.id && <FiCheck size={12} />}
                </div>
                <div className="ck-address-info">
                  <p className="ck-addr-rue">{addr.rue}</p>
                  <p className="ck-addr-city">{addr.code_postal} {addr.ville}</p>
                  {addr.est_par_defaut && <span className="ck-addr-default">Par défaut</span>}
                </div>
                <div className="ck-address-actions">
                  <button
                    type="button"
                    className="ck-address-action"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditForm(addr);
                    }}
                    aria-label="Modifier cette adresse"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="ck-address-action ck-address-action--danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(addr);
                    }}
                    disabled={deletingId === addr.id}
                    aria-label="Supprimer cette adresse"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Ajouter nouvelle adresse */}
            {!showForm && (
              <button className="ck-add-addr" onClick={openCreateForm}>
                <FiPlus size={14} /> Ajouter une adresse
              </button>
            )}

            {!addresses.length && !showForm && (
              <p className="ck-address-empty">Aucune adresse enregistrée. Ajoutez une adresse pour continuer.</p>
            )}
          </div>

          {showForm && (
            <div className="ck-addr-form">
              <h3 className="ck-form-title">{editingId ? 'Modifier adresse' : 'Nouvelle adresse'}</h3>
              <div className="ck-form-grid">
                <div className="ck-field">
                  <label>Rue *</label>
                  <input
                    type="text"
                    placeholder="Ex: 12 Rue Al Massira"
                    value={form.rue}
                    onChange={(e) => setForm(f => ({ ...f, rue: e.target.value }))}
                  />
                </div>
                <div className="ck-field">
                  <label>Ville *</label>
                  <input
                    type="text"
                    placeholder="Ex: Casablanca"
                    value={form.ville}
                    onChange={(e) => setForm(f => ({ ...f, ville: e.target.value }))}
                  />
                </div>
                <div className="ck-field">
                  <label>Code postal *</label>
                  <input
                    type="text"
                    placeholder="Ex: 20000"
                    value={form.code_postal}
                    onChange={(e) => setForm(f => ({ ...f, code_postal: e.target.value }))}
                  />
                </div>
                <div className="ck-field ck-field-check">
                  <label className="ck-checkbox">
                    <input
                      type="checkbox"
                      checked={form.est_par_defaut}
                      onChange={(e) => setForm(f => ({ ...f, est_par_defaut: e.target.checked }))}
                    />
                    Définir comme adresse par défaut
                  </label>
                </div>
              </div>
              <div className="ck-form-actions">
                <button className="ck-btn-cancel" onClick={resetForm}>Annuler</button>
                <button className="ck-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="ck-nav-btns">
        <button className="ck-btn-back" onClick={onBack}><FiArrowLeft size={15} /> Retour</button>
        <button
          className="ck-btn-next"
          onClick={onNext}
          disabled={!selectedId}
        >
          Mode de paiement <FiArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

/* ── Étape 3 : Paiement ── */
const StepPayment = ({ total, onBack, onConfirm, submitting, user }) => {
  const [method, setMethod] = useState('livraison'); // 'livraison' | 'carte'
  const [card, setCard]     = useState({ numero: '', nom: '', expiry: '', cvv: '' });

  const formatCard = (val) => val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExp  = (val) => {
    const v = val.replace(/\D/g,'').slice(0,4);
    return v.length >= 3 ? v.slice(0,2)+'/'+v.slice(2) : v;
  };

  const canSubmit = method === 'livraison' || (card.numero.replace(/\s/g,'').length===16 && card.nom && card.expiry.length===5 && card.cvv.length===3);

  return (
    <div className="ck-section">
      <h2 className="ck-section-title"><FiCreditCard size={16} /> Mode de paiement</h2>

      <div className="ck-pay-methods">

        {/* Paiement à la livraison */}
        <div
          className={`ck-pay-card${method==='livraison'?' selected':''}`}
          onClick={() => setMethod('livraison')}
        >
          <div className="ck-pay-radio">{method==='livraison'&&<FiCheck size={12}/>}</div>
          <FiTruck size={22} className="ck-pay-icon" />
          <div>
            <p className="ck-pay-title">Paiement à la livraison</p>
            <p className="ck-pay-sub">Payez en espèces lors de la réception</p>
          </div>
        </div>

        {/* Carte bancaire */}
        <div
          className={`ck-pay-card${method==='carte'?' selected':''}`}
          onClick={() => setMethod('carte')}
        >
          <div className="ck-pay-radio">{method==='carte'&&<FiCheck size={12}/>}</div>
          <FiCreditCard size={22} className="ck-pay-icon" />
          <div>
            <p className="ck-pay-title">Carte bancaire</p>
            <p className="ck-pay-sub">Visa, Mastercard, CMI</p>
          </div>
        </div>
      </div>

      {/* Formulaire carte */}
      {method === 'carte' && (
        <div className="ck-card-form">
          <div className="ck-card-preview">
            <div className="ck-card-chip" />
            <p className="ck-card-num">{card.numero || '•••• •••• •••• ••••'}</p>
            <div className="ck-card-bottom">
              <span>{card.nom || 'NOM PRÉNOM'}</span>
              <span>{card.expiry || 'MM/AA'}</span>
            </div>
          </div>

          <div className="ck-form-grid">
            <div className="ck-field ck-field-full">
              <label>Numéro de carte *</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={card.numero}
                onChange={(e) => setCard(c=>({...c, numero: formatCard(e.target.value)}))}
                maxLength={19}
              />
            </div>
            <div className="ck-field ck-field-full">
              <label>Nom sur la carte *</label>
              <input
                type="text"
                placeholder="ILHAM BENALI"
                value={card.nom}
                onChange={(e) => setCard(c=>({...c, nom: e.target.value.toUpperCase()}))}
              />
            </div>
            <div className="ck-field">
              <label>Date d'expiration *</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={card.expiry}
                onChange={(e) => setCard(c=>({...c, expiry: formatExp(e.target.value)}))}
                maxLength={5}
              />
            </div>
            <div className="ck-field">
              <label>CVV *</label>
              <input
                type="password"
                placeholder="•••"
                value={card.cvv}
                onChange={(e) => setCard(c=>({...c, cvv: e.target.value.replace(/\D/,'').slice(0,3)}))}
                maxLength={3}
              />
            </div>
          </div>
          <p className="ck-card-note">🔒 Formulaire de démonstration — aucune donnée réelle envoyée</p>
          <div className="ck-secure-payment">
            <div className="ck-secure-badge">
              <div className="ck-secure-header">
                <div className="ck-secure-header-icon"><FiLock size={16} /></div>
                <div className="ck-secure-header-text">
                  <p className="ck-secure-title">PAIEMENT SÉCURISÉ</p>
                  <p className="ck-secure-subtitle">en partenariat avec</p>
                </div>
              </div>
              <div className="ck-secure-body">
                <div className="ck-logo-badge ck-logo-cb">
                  <span className="ck-cb-text">CB</span>
                </div>
                <div className="ck-logo-badge ck-logo-visa">
                  <img src={`${process.env.PUBLIC_URL}/images/visa.jfif`} alt="Visa" />
                </div>
                <div className="ck-logo-badge ck-logo-mc">
                  <img src={`${process.env.PUBLIC_URL}/images/${encodeURIComponent('master card.jfif')}`} alt="MasterCard" />
                </div>
                <div className="ck-logo-badge ck-logo-paypal">
                  <img src={`${process.env.PUBLIC_URL}/images/paypal.jfif`} alt="PayPal" />
                </div>
                <div className="ck-logo-badge ck-logo-virement">
                  Virement Bancaire
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Récap final */}
      <div className="ck-final-recap">
        <div className="ck-recap-row">
          <span>Client</span>
          <span>{user?.prenom} {user?.nom}</span>
        </div>
        <div className="ck-recap-row">
          <span>Total à payer</span>
          <strong className="ck-recap-total">{total.toFixed(2)} DH</strong>
        </div>
        <div className="ck-recap-row">
          <span>Livraison</span>
          <span className="ck-free">Gratuite</span>
        </div>
      </div>

      <div className="ck-nav-btns">
        <button className="ck-btn-back" onClick={onBack}><FiArrowLeft size={15} /> Retour</button>
        <button
          className="ck-btn-confirm"
          onClick={onConfirm}
          disabled={!canSubmit || submitting}
        >
          {submitting
            ? <><span className="ck-spinner" /> Traitement...</>
            : <><FiCheckCircle size={15} /> Confirmer la commande — {total.toFixed(2)} DH</>
          }
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
   ══════════════════════════════════════════ */
const Checkout = () => {
  const { logout, user }                          = useAuth();
  const { cartItems: cart, refreshCart, setCartItems } = useCart();
  const navigate                                  = useNavigate();

  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [result, setResult]       = useState(null); // { ok, msg }

  useEffect(() => {
    refreshCart().catch(() => {}).finally(() => setLoading(false));
  }, [refreshCart]);

  const total = cart.reduce((sum, item) => sum + (item.produit?.prix || 0) * item.quantite, 0);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await processOrder();
      console.log('[Checkout] processOrder response:', res);
      setCartItems([]);
      setResult({ ok: true, msg: res.message || 'Commande confirmée avec succès ! Un email vous a été envoyé.' });
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      console.error('[Checkout] processOrder error:', err?.response?.data ?? err);
      setResult({ ok: false, msg: err.response?.data?.message || 'Erreur lors de la commande. Réessayez.' });
      setSubmitting(false);
    }
  };

  return (
    <div className="ck-page">
      <Navbar
        variant="honey"
        brandTo="/products"
        links={[
          { to: '/profile', label: user?.prenom || 'Profil', icon: <FiUser /> },
          { type: 'button', label: 'Déconnexion', icon: <FiLogOut />, onClick: logout },
        ]}
      />

      <div className="ck-container">

        {/* Header */}
        <div className="ck-header">
          <h1 className="ck-title"><FiPackage /> Finaliser ma commande</h1>
          <Link to="/cart" className="ck-back-link"><FiArrowLeft size={14} /> Retour au panier</Link>
        </div>

        {/* Result banner */}
        {result && (
          <div className={`ck-alert${result.ok ? ' ck-alert-success' : ' ck-alert-error'}`}>
            {result.ok ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
            {result.msg}
            {result.ok && <span className="ck-redirect">Redirection vers vos commandes...</span>}
          </div>
        )}

        {loading ? (
          <div className="ck-skeletons">
            {[1,2,3].map(i=><div key={i} className="ck-skeleton"/>)}
          </div>
        ) : cart.length === 0 && !result?.ok ? (
          <div className="ck-empty">
            <FiShoppingBag size={40} />
            <p>Votre panier est vide.</p>
            <Link to="/products" className="ck-btn-next">Voir les produits</Link>
          </div>
        ) : !result?.ok && (
          <>
            <Stepper current={step} />

            {step === 0 && (
              <StepSummary cart={cart} total={total} onNext={() => setStep(1)} />
            )}
            {step === 1 && (
              <StepAddress
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
                selectedId={selectedAddr}
                setSelectedId={setSelectedAddr}
              />
            )}
            {step === 2 && (
              <StepPayment
                total={total}
                user={user}
                onBack={() => setStep(1)}
                onConfirm={handleConfirm}
                submitting={submitting}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
