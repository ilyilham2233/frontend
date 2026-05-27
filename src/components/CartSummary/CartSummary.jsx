import React from 'react';
import './CartSummary.css';

const CartSummary = ({ cart, total, onCheckout, actionLabel = 'Passer la commande', actionIcon }) => (
  <div className="cart-summary">
    <h2>Resume de commande</h2>
    <div className="summary-rows">
      {cart.map((item) => (
        <div className="summary-row" key={item.id}>
          <span>{item.produit?.nom} x {item.quantite}</span>
          <span>{((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH</span>
        </div>
      ))}
    </div>
    <div className="summary-divider" />
    <div className="summary-total">
      <span>Total</span>
      <span className="summary-total-amount">{total.toFixed(2)} DH</span>
    </div>
    <button type="button" className="cart-btn-primary cart-checkout-btn" onClick={onCheckout}>
      {actionLabel} {actionIcon}
    </button>
  </div>
);

export default CartSummary;
