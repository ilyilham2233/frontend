import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiSend } from 'react-icons/fi';
import { requestPasswordReset } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getValidationMessage = (errors) => {
    if (!errors) return null;
    const firstError = Object.values(errors).flat()[0];
    return firstError || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message || 'Si cet email existe, un lien de réinitialisation a été envoyé.');
    } catch (err) {
      const data = err.response?.data;
      const validationMessage = getValidationMessage(data?.errors);
      setError(validationMessage || data?.message || "Impossible d'envoyer le lien. Vérifiez l'adresse email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-frame forgot-frame">
        <div
          className="login-visual forgot-visual"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/miel2.jpg)` }}
        />

        <div className="login-panel">
          <div className="login-card">
            <div className="login-header">
              <h2>Mot de passe oublié ?</h2>
              <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
            </div>

            {message && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                {message}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <FiMail className="login-input-icon" />
                <input
                  type="email"
                  id="forgot-password-email"
                  name="email"
                  placeholder="Adresse E-mail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setMessage('');
                  }}
                  required
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner-small" />
                    Envoi...
                  </span>
                ) : (
                  <span className="btn-content">
                    Envoyer le lien
                    <FiSend />
                  </span>
                )}
              </button>
            </form>

            <p className="login-register forgot-back">
              <Link to="/login">
                <FiArrowLeft />
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;
