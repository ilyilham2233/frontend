import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiMail, FiSend } from 'react-icons/fi';
import { requestPasswordReset } from '../api/auth';
import './VerifyEmail.css';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    setMessage('');

    try {
      const data = await requestPasswordReset(email.trim());
      setStatus('sent');
      setMessage(data.message || 'Si cet email existe, un lien de réinitialisation a été envoyé.');
    } catch (err) {
      const code = err.response?.status;
      const apiMessage = err.response?.data?.message || err.response?.data?.errors?.email?.[0];

      if (code === 422) {
        setStatus('error');
        setMessage(apiMessage || 'Adresse e-mail invalide.');
      } else {
        setStatus('error');
        setMessage(apiMessage || 'Une erreur est survenue. Réessayez plus tard.');
      }
    }
  };

  const isSending = status === 'sending';
  const isSent = status === 'sent';

  return (
    <main className="verify-email-page">
      <section className="verify-email-card">

        {/* Icon */}
        <div className="verify-email-icon">
          {isSent ? <FiCheckCircle /> : <FiMail />}
        </div>

        {/* Header */}
        <div className="verify-email-header">
          <span className="verify-email-kicker">Réinitialisation du mot de passe</span>
          <h1>{isSent ? 'E-mail envoyé !' : 'Mot de passe oublié ?'}</h1>
          <p>
            {isSent
              ? 'Vérifiez votre boîte mail et cliquez sur le lien reçu pour choisir un nouveau mot de passe.'
              : 'Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`verify-email-message ${isSent ? 'verify-email-message-verified' : 'verify-email-message-error'}`}>
            {message}
          </div>
        )}

        {/* Form — masqué après envoi réussi */}
        {!isSent && (
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="forgot-field">
              <label htmlFor="fp-email">Adresse e-mail</label>
              <div className="forgot-input-wrap">
                <FiMail className="forgot-input-icon" />
                <input
                  id="fp-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={isSending}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="verify-email-button"
              disabled={isSending || !email.trim()}
            >
              <span className="btn-content">
                <FiSend />
                {isSending ? 'Envoi en cours...' : 'Envoyer le lien'}
              </span>
            </button>
          </form>
        )}

        {/* Actions */}
        <div className="verify-email-actions">
          <Link to="/login">
            <FiArrowLeft /> Retour à la connexion
          </Link>
        </div>

      </section>
    </main>
  );
};

export default ForgotPassword;