import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLogOut,
  FiMail,
  FiShield,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page-wrapper">
      <Navbar
        brand="Maison du Miel"
        brandTo="/home"
        links={[
          { to: '/products', label: 'Produits', icon: <FiShoppingBag /> },
          { to: '/home', label: 'Accueil' },
        ]}
      />

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <FiUser size={40} />
            </div>
          </div>

          <h2 className="profile-name">{user?.name || 'Utilisateur'}</h2>
          <p className="profile-email">{user?.email || '-'}</p>

          <div className={`verification-badge ${user?.email_verified_at ? 'verified' : 'unverified'}`}>
            {user?.email_verified_at ? (
              <>
                <FiCheckCircle />
                <span>Email verifie</span>
              </>
            ) : (
              <>
                <FiAlertTriangle />
                <span>Email non verifie</span>
              </>
            )}
          </div>

          <div className="profile-info">
            <div className="info-row">
              <div className="info-icon"><FiMail /></div>
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || '-'}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-icon"><FiShield /></div>
              <div>
                <span className="info-label">Statut</span>
                <span className="info-value">
                  {user?.email_verified_at ? 'Compte verifie' : 'En attente de verification'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!user?.email_verified_at && (
              <Link to="/verify-email" className="btn btn-outline btn-full" id="profile-verify">
                <span className="btn-content"><FiMail /> Verifier mon email</span>
              </Link>
            )}
            <Link to="/products" className="btn btn-primary btn-full" id="profile-products">
              <span className="btn-content"><FiShoppingBag /> Voir les produits</span>
            </Link>
            <button type="button" onClick={logout} className="btn btn-danger btn-full" id="profile-logout">
              <span className="btn-content"><FiLogOut /> Se deconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
