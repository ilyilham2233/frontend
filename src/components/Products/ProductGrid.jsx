import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import SkeletonCard from '../SkeletonCard/SkeletonCard';

const ProductGrid = ({
  loading,
  products,
  favorites,
  cartLoading,
  onToggleFavorite,
  onAddToCart,
  onClearFilters,
}) => (
  <div className="honey-grid">
    {loading ? (
      Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
    ) : products.length === 0 ? (
      <div className="catalogue-empty">
        <p>Aucun produit trouve pour ces criteres.</p>
        <button type="button" onClick={onClearFilters}>Voir tous les produits</button>
      </div>
    ) : (
      products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favorites.includes(product.id)}
          isAdding={cartLoading === product.id}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
        />
      ))
    )}
  </div>
);

export default ProductGrid;
