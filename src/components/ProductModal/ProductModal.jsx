import React, { useEffect, useState } from 'react';
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiHeart, FiTruck, FiShield, FiPackage } from 'react-icons/fi';
import Stars from '../Stars/Stars';
import { checkReviewForm, submitReview } from '../../api/catalogue';
import './ProductModal.css';

const fallbackImage = `${process.env.PUBLIC_URL}/images/honey-pure.png`;

/* ══════════════════════════════════════════
   Bloc notation — vérifie si l'user peut noter
   ══════════════════════════════════════════ */
const RatingBlock = ({ productId, currentRating, onRated }) => {
  const [status, setStatus]       = useState('idle'); // idle | checking | can | already | must_buy | error
  const [hovered, setHovered]     = useState(0);
  const [selected, setSelected]   = useState(0);
  const [comment, setComment]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingNote, setExistingNote] = useState(null);
  const [errMsg, setErrMsg]       = useState('');

  // Vérifier si l'user peut noter dès l'ouverture
  useEffect(() => {
    setStatus('checking');
    checkReviewForm(productId)
      .then((res) => {
        const data = res?.data ?? res ?? {};
        if (data.avis_existant) {
          setExistingNote(data.avis_existant.note);
          setSelected(data.avis_existant.note);
          setStatus('already');
        } else if (data.peut_commenter) {
          setStatus('can');
        } else {
          setStatus('must_buy');
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || '';
        if (msg.includes('acheter') || err.response?.status === 403) {
          setStatus('must_buy');
        } else {
          setStatus('error');
          setErrMsg(msg || 'Erreur.');
        }
      });
  }, [productId]);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setErrMsg('');
    try {
      await submitReview(productId, selected, comment);
      setStatus('done');
      onRated && onRated(selected);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setSubmitting(false);
    }
  };

  const display = hovered || selected;

  // ── Rendu selon status ──

  if (status === 'checking') {
    return <div className="pm-rate-info">Chargement...</div>;
  }

  if (status === 'must_buy') {
    return (
      <div className="pm-rate-info pm-rate-info--muted">
        🛒 Achetez ce produit pour laisser un avis
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="pm-rate-done">
        <div className="pm-rate-stars-row">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`pm-star-ico${i <= existingNote ? ' on' : ''}`}>★</span>
          ))}
        </div>
        <span className="pm-rate-thanks">Vous avez déjà noté ce produit</span>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="pm-rate-done">
        <div className="pm-rate-stars-row">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`pm-star-ico${i <= selected ? ' on' : ''}`}>★</span>
          ))}
        </div>
        <span className="pm-rate-thanks">✓ Merci pour votre avis !</span>
      </div>
    );
  }

  if (status === 'error') {
    return <div className="pm-rate-info pm-rate-info--error">{errMsg}</div>;
  }

  // status === 'can'
  return (
    <div className="pm-rate-wrap">
      <p className="pm-rate-label">Donnez votre avis :</p>

      <div className="pm-rate-stars-row">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            className={`pm-star-btn${i <= display ? ' on' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(i)}
            disabled={submitting}
            aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
          >★</button>
        ))}
        {selected > 0 && (
          <span className="pm-rate-hint">
            {['','Mauvais','Passable','Bien','Très bien','Excellent'][selected]}
          </span>
        )}
      </div>

      <textarea
        className="pm-rate-comment"
        placeholder="Commentaire (optionnel)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={2}
        disabled={submitting}
      />

      {errMsg && <p className="pm-rate-error">{errMsg}</p>}

      <button
        className="pm-rate-submit"
        onClick={handleSubmit}
        disabled={!selected || submitting}
      >
        {submitting ? 'Envoi...' : 'Publier mon avis'}
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════
   Modal principal
   ══════════════════════════════════════════ */
const ProductModal = ({ product, isFavorite, onClose, onAddToCart, onToggleFavorite }) => {
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [added, setAdded]       = useState(false);
  const [liveRating, setLiveRating] = useState(product.note_moyenne || 0);

  const isOutOfStock = product.quantite_stock === 0;
  const isLowStock   = product.quantite_stock > 0 && product.quantite_stock <= 5;
  const maxQty       = product.quantite_stock || 99;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    await onAddToCart(product.id, qty);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getBadge = () => {
    if (product.badge) return { label: product.badge, cls: 'badge-gold' };
    if (product.categorie?.nom) return { label: product.categorie.nom, cls: 'badge-gold' };
    return null;
  };
  const badge = getBadge();

  return (
    <div className="pm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>

        <button className="pm-close" onClick={onClose} aria-label="Fermer">
          <FiX size={18} />
        </button>

        <div className="pm-inner">

          {/* ── Gauche ── */}
          <div className="pm-left">
            <div className="pm-img-wrap">
              {badge && <span className={`pm-badge ${badge.cls}`}>{badge.label}</span>}
              <img
                src={product.image_url || fallbackImage}
                alt={product.nom}
                className="pm-img"
                onError={(e) => { e.currentTarget.src = fallbackImage; }}
              />
            </div>
            <div className="pm-trust">
              <div className="pm-trust-item"><FiTruck size={13} /> Livraison gratuite</div>
              <div className="pm-trust-item"><FiShield size={13} /> Qualité garantie 100%</div>
              <div className="pm-trust-item"><FiPackage size={13} /> Emballage soigné</div>
            </div>
          </div>

          {/* ── Droite ── */}
          <div className="pm-right">
            <h2 className="pm-title">{product.nom}</h2>

            {product.marque && (
              <p className="pm-meta">
                Marque : <strong>{product.marque}</strong>
                {product.reference && <> &nbsp;|&nbsp; Référence : <strong>{product.reference}</strong></>}
              </p>
            )}

            <div className="pm-rating">
              <Stars rating={liveRating} />
              {liveRating > 0 && <span className="pm-rating-num">{liveRating}</span>}
              {product.reviews_count > 0 && (
                <span className="pm-rating-count">({product.reviews_count} avis)</span>
              )}
            </div>

            {product.description && (
              <div className="pm-desc">
                {product.description.split('\n').map((line, i) =>
                  line.trim() ? <p key={i}>{line}</p> : null
                )}
              </div>
            )}

            <div className="pm-price-row">
              <span className="pm-price">
                {Number(product.prix).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} Dh
              </span>
              <span className="pm-ttc">TTC</span>
              {product.old_prix && (
                <span className="pm-old-price">
                  {Number(product.old_prix).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} Dh
                </span>
              )}
            </div>

            <div className="pm-actions">
              <div className="pm-qty">
                <button className="pm-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}><FiMinus size={13} /></button>
                <span className="pm-qty-num">{qty}</span>
                <button className="pm-qty-btn" onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty || isOutOfStock}><FiPlus size={13} /></button>
              </div>
              <button
                className={`pm-add-btn${added ? ' added' : ''}`}
                onClick={handleAdd}
                disabled={isOutOfStock || adding}
              >
                {adding ? <span className="pm-spinner" /> : added ? '✓ Ajouté !' : <><FiShoppingCart size={14} /> Ajouter Au Panier</>}
              </button>
            </div>

            <p className={`pm-stock${isOutOfStock ? ' out' : isLowStock ? ' low' : ''}`}>
              {isOutOfStock ? '✕ Rupture de stock' : isLowStock ? `⚠ Plus que ${product.quantite_stock} en stock` : '✓ En stock'}
            </p>

            {/* ── NOTATION ── */}
            <div className="pm-rate-section">
              <RatingBlock
                productId={product.id}
                currentRating={liveRating}
                onRated={(note) => setLiveRating(note)}
              />
            </div>

            <button
              className={`pm-fav-btn${isFavorite ? ' active' : ''}`}
              onClick={() => onToggleFavorite(product.id)}
            >
              <FiHeart size={14} />
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
