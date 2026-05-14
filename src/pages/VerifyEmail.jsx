import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyEmail } from '../api/auth';
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiClock, FiMail, FiSend } from 'react-icons/fi';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { id, hash } = useParams();
  const { sendVerification, user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState(id && hash ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!id || !hash) return;

    setStatus('verifying');
    verifyEmail(id, hash)
      .then((data) => {
        setStatus('verified');
        setMessage(data.message || 'Votre adresse e-mail a été vérifiée avec succès.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Le lien de vérification est invalide ou a expiré.');
      });
  }, [id, hash]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendVerification = async () => {
    setStatus('sending');
    setMessage('');

    try {
      const data = await sendVerification();
      setStatus('sent');
      setMessage(data.message || 'Lien envoyé : vérifiez votre boîte mail.');
      setCooldown(60);
    } catch (err) {
      const code = err.response?.status;
      const apiMessage = err.response?.data?.message;

      if (code === 400) {
        setStatus('already-verified');
        setMessage(apiMessage || 'Adresse électronique déjà vérifiée.');
      } else if (code === 401) {
        setStatus('unauthorized');
        setMessage(apiMessage || 'Vous devez être connecté pour envoyer un e-mail de vérification.');
      } else {
        setStatus('error');
        setMessage(apiMessage || "Impossible d'envoyer le lien de vérification. Réessayez plus tard.");
      }
    }
  };

  const isBusy = status === 'sending' || status === 'verifying';
  const canSend = isAuthenticated && !isBusy && cooldown === 0;

  return (
    <main className="verify-email-page">
      <section className="verify-email-card">
        <div className="verify-email-icon">
          {status === 'verified' || status === 'sent' || status === 'already-verified' ? <FiCheckCircle /> : null}
          {status === 'idle' ? <FiMail /> : null}
          {status === 'sending' || status === 'verifying' ? <FiClock /> : null}
          {status === 'error' || status === 'unauthorized' ? <FiAlertCircle /> : null}
        </div>

        <div className="verify-email-header">
          <span className="verify-email-kicker">Vérification de l'adresse e-mail</span>
          <h1>
  {status === 'verifying'        ? 'Vérification en cours...' :
   status === 'verified'         ? 'E-mail vérifié !' :
   status === 'error'            ? 'Lien invalide' :
   status === 'sending'          ? 'Envoi en cours...' :
   status === 'sent'             ? 'E-mail envoyé !' :
   status === 'already-verified' ? 'Déjà vérifié' :
   'Envoyer un lien de vérification'}
</h1>
          <p>
            Un e-mail sera envoyé à votre adresse afin de confirmer votre compte.
          </p>
        </div>

        <div className="verify-email-details">
          <div>
            <span>Compte</span>
            <strong>{user?.email || 'Utilisateur connecté'}</strong>
          </div>
          <div>
            <span>Authentification</span>
            <strong>{isAuthenticated ? 'Jeton Bearer détecté' : 'Connexion requise'}</strong>
          </div>
        </div>

        {message && (
          <div className={`verify-email-message verify-email-message-${status}`}>
            {message}
          </div>
        )}

        {!id && !hash && (
  <button
    type="button"
    className="verify-email-button"
    onClick={handleSendVerification}
    disabled={!canSend}
  >
    <span className="btn-content">
      <FiSend />
      {isBusy ? 'Envoi en cours...' : cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Envoyer l'e-mail"}
    </span>
  </button>
)}

        <div className="verify-email-actions">
          {!isAuthenticated ? (
            <Link to="/login">Se connecter</Link>
          ) : (
            <Link to="/profile">Retour au profil</Link>
          )}
          <Link to="/home">
            Accueil <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default VerifyEmail;
