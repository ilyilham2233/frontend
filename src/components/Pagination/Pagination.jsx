import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

const getVisiblePages = (total, currentPage) =>
  Array.from({ length: total }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === total || Math.abs(page - currentPage) <= 1)
    .reduce((pages, page, index, array) => {
      if (index > 0 && page - array[index - 1] > 1) pages.push('...');
      pages.push(page);
      return pages;
    }, []);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="catalogue-pagination">
      <button
        className="pag-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FiChevronLeft />
      </button>

      {getVisiblePages(totalPages, currentPage).map((page, index) =>
        page === '...' ? (
          <span key={`dot-${index}`} className="pag-dots">...</span>
        ) : (
          <button
            key={page}
            className={`pag-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="pag-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
