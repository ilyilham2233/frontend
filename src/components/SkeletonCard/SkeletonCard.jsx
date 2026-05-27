import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => (
  <div className="honey-card skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="honey-card-body">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc short" />
      <div className="skeleton skeleton-footer" />
    </div>
  </div>
);

export default SkeletonCard;
