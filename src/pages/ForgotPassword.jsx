import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiSend } from 'react-icons/fi';
import { requestPasswordReset } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState('idle');
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
      const code       = err.response?.status;
      const apiMessage = err.response?.data?.message || err.response?.data?.errors?.email?.[0];
      setStatus('error');
      setMessage(code === 422 ? (apiMessage || 'Adresse e-mail invalide.') : (apiMessage || 'Une erreur est survenue.'));
    }
  };

  const isSending = status === 'sending';
  const isSent    = status === 'sent';
  const isError   = status === 'error';

  return (
    <main className="login-page">
      <section className="login-frame">

        {/* Gauche — image */}
        <div
          className="login-visual"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/miel2.jpg)` }}
        >
          <div className="login-brand">
            <span className="login-leaf">🍯</span>
            <h1>Khayrate Bladi</h1>
          </div>
        </div>

        {/* Droite — formulaire sans card */}
        <div className="login-panel">
          <div style={{ width: '100%', maxWidth: '360px' }}>

            {/* Header */}
            <div className="login-header" style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '.78rem', fontWeight: 700, letterSpacing: '.08em',
                color: '#b8860b', textTransform: 'uppercase', marginBottom: '.5rem'
              }}>
                Mot de passe oublié ?
              </p>
              <h2 style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: '1.55rem', fontWeight: 500, color: '#3b3123',
                marginBottom: '.6rem', lineHeight: 1.3
              }}>
                {isSent ? 'E-mail envoyé !' : 'Entrez votre adresse email pour recevoir un lien de réinitialisation.'}
              </h2>
              <p style={{ color: '#6d6049', fontSize: '.86rem', lineHeight: 1.5 }}>
                {isSent
                  ? 'Vérifiez votre boîte mail et cliquez sur le lien reçu.'
                  : "Saisissez l'adresse e-mail associée à votre compte pour recevoir un lien sécurisé de réinitialisation."}
              </p>
            </div>

            {/* Message alert */}
            {message && (
              <div className={`alert ${isSent ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
                <span className="alert-icon">{isSent ? '✓' : '!'}</span>
                {message}
              </div>
            )}

            {/* Formulaire */}
            {!isSent && (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                  <FiMail className="login-input-icon" />
                  <input
                    type="email"
                    placeholder="Adresse E-mail"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (isError) setStatus('idle'); }}
                    disabled={isSending}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={isSending || !email.trim()}
                >
                  {isSending
                    ? 'Envoi en cours...'
                    : <><FiSend style={{ marginRight: '.4rem' }} /> Envoyer le lien</>
                  }
                </button>
              </form>
            )}

            {/* Lien retour */}
            <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                color: '#6d6049', fontSize: '.82rem', textDecoration: 'none'
              }}>
                <FiArrowLeft /> Retour à la connexion
              </Link>
            </div>

          </div>
        </div>

      </section>
    </main>
  );
};

export default ForgotPassword;