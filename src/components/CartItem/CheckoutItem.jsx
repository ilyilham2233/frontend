import React from 'react';

const fallbackImage = `${process.env.PUBLIC_URL}`;

const CheckoutItem = ({ item }) => (
  <div className="cart-item checkout-item">
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
    </div>
    <div className="checkout-item-qty">x {item.quantite}</div>
    <div className="cart-item-subtotal">
      {((item.produit?.prix || 0) * item.quantite).toFixed(2)} DH
    </div>
  </div>
);

export default CheckoutItem;
