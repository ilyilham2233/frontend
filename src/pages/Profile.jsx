import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiLogOut, FiCheckCircle, FiAlertTriangle, FiShoppingBag } from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="page-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/home" className="navbar-brand">
          <span className="brand-icon">🍯</span>
          <span className="brand-text">Maison du Miel</span>
        </Link>
        <div className="navbar-links">
          <Link to="/products" className="nav-link"><FiShoppingBag /> Produits</Link>
          <Link to="/home" className="nav-link">Accueil</Link>
        </div>
      </nav>

      <div className="profile-container">
        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar">
            <div className="avatar-circle">
              <FiUser size={40} />
            </div>
          </div>

          <h2 className="profile-name">{user?.name || 'Utilisateur'}</h2>
          <p className="profile-email">{user?.email || '—'}</p>

          {/* Verification badge */}
          <div className={`verification-badge ${user?.email_verified_at ? 'verified' : 'unverified'}`}>
            {user?.email_verified_at ? (
              <><FiCheckCircle /><span>Email vérifié</span></>
            ) : (
              <><FiAlertTriangle /><span>Email non vérifié</span></>
            )}
          </div>

          {/* Info cards */}
          <div className="profile-info">
            <div className="info-row">
              <div className="info-icon"><FiMail /></div>
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || '—'}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon"><FiShield /></div>
              <div>
                <span className="info-label">Statut</span>
                <span className="info-value">
                  {user?.email_verified_at ? 'Compte vérifié' : 'En attente de vérification'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            {!user?.email_verified_at && (
              <Link to="/verify-email" className="btn btn-outline btn-full" id="profile-verify">
                <span className="btn-content"><FiMail /> Vérifier mon email</span>
              </Link>
            )}
            <Link to="/products" className="btn btn-primary btn-full" id="profile-products">
              <span className="btn-content"><FiShoppingBag /> Voir les produits</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-danger btn-full" id="profile-logout">
              <span className="btn-content"><FiLogOut /> Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
