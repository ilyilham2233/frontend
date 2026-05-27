import React from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi';
import './StatusBadge.css';

const statusMap = {
  en_attente: { label: 'En attente', icon: <FiClock />, cls: 'status-pending' },
  confirmee: { label: 'Confirmee', icon: <FiCheckCircle />, cls: 'status-confirmed' },
  refusee: { label: 'Refusee', icon: <FiXCircle />, cls: 'status-refused' },
  recuperee: { label: 'Recuperee', icon: <FiPackage />, cls: 'status-picked' },
  livree: { label: 'Livree', icon: <FiCheckCircle />, cls: 'status-delivered' },
  en_livraison: { label: 'En livraison', icon: <FiTruck />, cls: 'status-shipping' },
};

const StatusBadge = ({ status }) => {
  const config = statusMap[status] || { label: status, icon: <FiClock />, cls: 'status-pending' };

  return (
    <span className={`order-status-badge status-badge ${config.cls}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default StatusBadge;
