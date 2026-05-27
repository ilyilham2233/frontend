import React from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import './CartItem.css';

const fallbackImage = `${process.env.PUBLIC_URL}/images/honey-pure.png`;

const CartItem = ({ item, updating, onUpdate, onRemove }) => (
  <div className="cart-item">
    <div className="cart-item-img">
      <img
        src={item.produit?.image_url || fallbackImage}
        alt={item.produit?.nom}
        onError={(event) => {
          event.currentTarget.src = fallbackImage;
        }}
      />
    </div>

    <div className="cart-item-info">
      <h3>{item.produit?.nom}</h3>
      <p className="cart-item-category">{item.produit?.categorie?.nom}</p>
      <p className="cart-item-price">{item.produit?.prix} DH / unite</p>
    </div>

    <div className="cart-item-qty">
      <button
        type="button"
        className="qty-btn"
        onClick={() => onUpdate(item.id, item.quantite - 1)}
        disabled={updating === item.id || item.quantite <= 1}
      >
        <FiMinus />
      </button>
      <span className="qty-value">{updating === item.id ? '...' : item.quantite}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={() => onUpdate(item.id, item.quantite + 1)}
        disabled={updating === item.id}
      >
        <FiPlus />
      </button>
    </div>

    <div className="cart-item-subtotal">
      {((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH
    </div>

    <button
      type="button"
      className="cart-remove-btn"
      onClick={() => onRemove(item.id)}
      disabled={updating === item.id}
      title="Supprimer"
    >
      <FiTrash2 />
    </button>
  </div>
);

export default CartItem;