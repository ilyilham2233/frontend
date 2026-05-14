import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiClock, FiKey } from 'react-icons/fi';
import { validateResetToken } from '../api/auth';
import './VerifyEmail.css';

const ResetToken = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState(token && email ? 'checking' : 'missing');
  const [message, setMessage] = useState('');
  const [validated, setValidated] = useState(null);

  useEffect(() => {
    if (!token || !email) {
      setStatus('missing');
      setMessage("Le lien de reinitialisation est incomplet.");
      return;
    }

    setStatus('checking');
    validateResetToken(token, email)
      .then((data) => {
        setStatus('valid');
        setValidated({
          email: data.email || email,
          token: data.token || token,
        });
        setMessage(data.message || 'Token valide. Vous pouvez maintenant choisir un nouveau mot de passe.');
      })
      .catch((err) => {
        setStatus('error');
        setValidated(null);
        setMessage(err.response?.data?.message || 'Lien invalide ou expire.');
      });
  }, [token, email]);

  const isChecking = status === 'checking';
  const isValid = status === 'valid';
  const isError = status === 'error' || status === 'missing';

  return (
    <main className="verify-email-page">
      <section className="verify-email-card">
        <div className="verify-email-icon">
          {isChecking ? <FiClock /> : null}
          {isValid ? <FiCheckCircle /> : null}
          {isError ? <FiAlertCircle /> : null}
        </div>

        <div className="verify-email-header">
          <span className="verify-email-kicker">Reinitialisation du mot de passe</span>
          <h1>
            {isChecking ? 'Validation du lien...' : isValid ? 'Lien valide' : 'Lien invalide'}
          </h1>
          <p>Nous verifions que le lien recu par email est encore valide.</p>
        </div>

        <div className="verify-email-details">
          <div>
            <span>Email</span>
            <strong>{validated?.email || email || 'Email manquant'}</strong>
          </div>
          <div>
            <span>Jeton</span>
            <strong>{token ? `${token.slice(0, 16)}...` : 'Jeton manquant'}</strong>
          </div>
        </div>

        {message && (
          <div className={`verify-email-message ${isValid ? 'verify-email-message-verified' : 'verify-email-message-error'}`}>
            {message}
          </div>
        )}

        {isValid && (
          <div className="verify-email-endpoint">
            <span>OK</span>
            <code>Token pret pour la prochaine etape</code>
          </div>
        )}

        <div className="verify-email-actions">
          <Link to="/forgot-password">
            <FiKey /> Demander un autre lien
          </Link>
          <Link to="/login">
            <FiArrowLeft /> Connexion
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResetToken;
