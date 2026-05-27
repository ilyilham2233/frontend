import React from 'react';
import { FiStar } from 'react-icons/fi';
import './Stars.css';

const Stars = ({ rating = 0 }) => (
  <div className="honey-stars">
    {[1, 2, 3, 4, 5].map((index) => (
      <FiStar
        key={index}
        className={index <= Math.round(rating) ? 'star-filled' : 'star-empty'}
      />
    ))}
  </div>
);

export default Stars;
