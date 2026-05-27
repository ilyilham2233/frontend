import React from 'react';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import Stars from '../Stars/Stars';
import './ProductCard.css';

const fallbackImage = `${process.env.PUBLIC_URL}`;

const ProductCard = ({
  product,
  isFavorite,
  isAdding,
  onToggleFavorite,
  onAddToCart,
  onOpenDetail,
}) => {
  const isOutOfStock = product.quantite_stock === 0;
  const isLowStock = product.quantite_stock <= 5 && product.quantite_stock > 0;

  return (
    <div
      className="honey-card"
      onClick={() => onOpenDetail && onOpenDetail(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDetail && onOpenDetail(product)}
    >
      {/* Badge */}
      {isOutOfStock && <span className="honey-badge badge-purple">Epuisé</span>}
      {isLowStock && <span className="honey-badge badge-amber">Stock limité</span>}
      {!isOutOfStock && !isLowStock && product.categorie?.nom && (
        <span className="honey-badge badge-gold">{product.categorie.nom}</span>
      )}

      {/* Favorite */}
      <button
        type="button"
        className={`honey-fav${isFavorite ? ' fav-active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
        aria-label="Favoris"
      >
        <FiHeart />
      </button>

      {/* Image */}
      <div className="honey-card-img-wrapper">
        <img
          src={product.image_url || fallbackImage}
          alt={product.nom}
          className="honey-card-img"
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="honey-card-img-glow" />
      </div>

      {/* Body */}
      <div className="honey-card-body">
        <h3 className="honey-card-title">{product.nom}</h3>

        <div className="honey-card-rating">
          <Stars rating={product.note_moyenne || 0} />
          <span className="honey-rating-text">
            {product.note_moyenne ? product.note_moyenne : 'Pas encore noté'}
          </span>
        </div>

        <div className="honey-card-stock">
          {isOutOfStock
            ? <span className="stock-out">✕ Epuisé</span>
            : isLowStock
              ? <span className="stock-low">⚠ Plus que {product.quantite_stock} en stock</span>
              : <span className="stock-ok">✓ En stock</span>
          }
        </div>

        <div className="honey-card-footer">
          <div className="honey-price">
            <span className="honey-price-current">{product.prix} DH</span>
          </div>
          <button
            type="button"
            className={`honey-add-btn${isAdding ? ' adding' : ''}`}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
            disabled={isOutOfStock || isAdding}
          >
            {isAdding ? (
              <span className="cart-spinner" />
            ) : (
              <FiShoppingCart />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;