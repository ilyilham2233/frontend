import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { getSuggestions } from '../../api/catalogue';

const CatalogueSearch = ({
  value,
  onChange,
  onSubmit,
  onClear,
  onSelectSuggestion,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef(null);

  // Appeler les suggestions à chaque frappe
  useEffect(() => {
    if (value.length >= 1) {
      getSuggestions(value)
        .then((res) => {
          setSuggestions(res?.data ?? []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Cacher suggestions si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clic sur une suggestion
const handleSelectSuggestion = (suggestion) => {
  setShowSuggestions(false);
  onSelectSuggestion(suggestion); 
};

  return (
   <form className="catalogue-search" style={{ position: 'relative', zIndex: 100 }} onSubmit={(e) => {
      setShowSuggestions(false);
      onSubmit(e);
    }}>
      <div className="catalogue-search-wrap" ref={wrapRef} style={{ position: 'relative', zIndex: 9999 }}>
        <FiSearch className="catalogue-search-icon" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
        {value && (
          <button type="button" className="catalogue-search-clear" onClick={() => {
            onClear();
            setSuggestions([]);
            setShowSuggestions(false);
          }}>
            <FiX />
          </button>
        )}

        {/* ===== LISTE SUGGESTIONS ===== */}
        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            listStyle: 'none',
            margin: 0,
            padding: '8px 0',
            zIndex: 9999,
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f5ee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {suggestion.image_url && (
                  <img
                    src={suggestion.image_url}
                    alt={suggestion.nom}
                    style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {suggestion.nom}
                  </div>
                  <div style={{ fontSize: '12px', color: '#C8960C', fontWeight: '600' }}>
                    {suggestion.prix} DH
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="catalogue-search-btn">Rechercher</button>
    </form>
  );
};

export default CatalogueSearch;