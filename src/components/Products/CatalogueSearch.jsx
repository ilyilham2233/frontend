import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const CatalogueSearch = ({
  value,
  onChange,
  onSubmit,
  onClear,
}) => (
  <form className="catalogue-search" onSubmit={onSubmit}>
    <div className="catalogue-search-wrap">
      <FiSearch className="catalogue-search-icon" />
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className="catalogue-search-clear" onClick={onClear}>
          <FiX />
        </button>
      )}
    </div>
    <button type="submit" className="catalogue-search-btn">Rechercher</button>
  </form>
);

export default CatalogueSearch;
