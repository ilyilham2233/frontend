import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const CatalogueFilters = ({
  categories,
  categoryId,
  setCategoryId,
  prixMin,
  setPrixMin,
  prixMax,
  setPrixMax,
  sort,
  setSort,
  order,
  setOrder,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearFilters,
  resetPage,
}) => {
  const selectCategory = (id) => {
    setCategoryId(id);
    resetPage();
  };

  return (
    <>
      <div className="catalogue-filters-row">
        <div className="honey-filters">
          <FiFilter className="filter-icon" />
          <button
            type="button"
            className={`honey-filter-btn ${!categoryId ? 'active' : ''}`}
            onClick={() => selectCategory('')}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`honey-filter-btn ${categoryId === String(category.id) ? 'active' : ''}`}
              onClick={() => selectCategory(String(category.id))}
            >
              {category.nom}
              {category.produits_count ? (
                <span className="cat-count">{category.produits_count}</span>
              ) : null}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`catalogue-adv-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter /> Filtres avances
          {hasActiveFilters && <span className="filters-dot" />}
        </button>
      </div>

      {showFilters && (
        <div className="catalogue-adv-panel">
          <div className="catalogue-adv-grid">
            <div className="catalogue-adv-field">
              <label>Prix min (DH)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={prixMin}
                onChange={(event) => {
                  setPrixMin(event.target.value);
                  resetPage();
                }}
              />
            </div>
            <div className="catalogue-adv-field">
              <label>Prix max (DH)</label>
              <input
                type="number"
                min="0"
                placeholder="9999"
                value={prixMax}
                onChange={(event) => {
                  setPrixMax(event.target.value);
                  resetPage();
                }}
              />
            </div>
            <div className="catalogue-adv-field">
              <label>Trier par</label>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  resetPage();
                }}
              >
                <option value="created_at">Date d'ajout</option>
                <option value="prix">Prix</option>
                <option value="nom">Nom</option>
              </select>
            </div>
            <div className="catalogue-adv-field">
              <label>Ordre</label>
              <select
                value={order}
                onChange={(event) => {
                  setOrder(event.target.value);
                  resetPage();
                }}
              >
                <option value="asc">Croissant</option>
                <option value="desc">Decroissant</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button type="button" className="catalogue-clear-btn" onClick={clearFilters}>
              <FiX /> Reinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default CatalogueFilters;
