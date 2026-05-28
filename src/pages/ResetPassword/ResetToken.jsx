import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
} from 'react-icons/fi';
import { updateResetPassword, validateResetToken } from '../../api/auth';
import '../VerifyEmail/VerifyEmail.css';

const ResetToken = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState(token && email ? 'checking' : 'missing');
  const [message, setMessage] = useState('');
  const [validated, setValidated] = useState(null);
  const [passwords, setPasswords] = useState({ password: '', c_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const getValidationMessage = (errors) => {
    if (!errors) return null;
    return Object.values(errors).flat()[0] || null;
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (status === 'update-error') {
      setStatus('valid');
      setMessage('Token valide. Vous pouvez maintenant choisir un nouveau mot de passe.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwords.password !== passwords.c_password) {
      setStatus('update-error');
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setStatus('updating');
    setMessage('');

    try {
      const data = await updateResetPassword({
        email: validated?.email || email,
        token: validated?.token || token,
        password: passwords.password,
        c_password: passwords.c_password,
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setStatus('updated');
      setMessage(data.message || 'Mot de passe mis a jour avec succes. Veuillez vous reconnecter.');
      setPasswords({ password: '', c_password: '' });
    } catch (err) {
      const data = err.response?.data;
      setStatus('update-error');
      setMessage(getValidationMessage(data?.errors) || data?.message || 'Impossible de mettre a jour le mot de passe.');
    }
  };

  const isChecking = status === 'checking';
  const canUpdatePassword = status === 'valid' || status === 'updating' || status === 'update-error';
  const isTokenValid = status === 'valid' || status === 'updating';
  const isUpdateError = status === 'update-error';
  const isUpdated = status === 'updated';
  const isError = status === 'error' || status === 'missing';
  const isUpdating = status === 'updating';

  return (
    <main className="verify-email-page">
      <section className="verify-email-card">
        <div className="verify-email-icon">
          {isChecking ? <FiClock /> : null}
          {isTokenValid ? <FiCheckCircle /> : null}
          {isUpdated ? <FiCheckCircle /> : null}
          {isError || isUpdateError ? <FiAlertCircle /> : null}
        </div>

        <div className="verify-email-header">
          <span className="verify-email-kicker">Reinitialisation du mot de passe</span>
          <h1>
            {isChecking ? 'Validation du lien...' : isUpdated ? 'Mot de passe modifie' : canUpdatePassword ? 'Nouveau mot de passe' : 'Lien invalide'}
          </h1>
          <p>{canUpdatePassword ? 'Choisissez un mot de passe securise pour votre compte.' : 'Nous verifions que le lien recu par email est encore valide.'}</p>
        </div>

        <div className="verify-email-details">
          <div>
            <span>Email</span>
            <strong>{validated?.email || email || 'Email manquant'}</strong>
          </div>
        </div>

        {message && (
          <div className={`verify-email-message ${isTokenValid || isUpdated ? 'verify-email-message-verified' : 'verify-email-message-error'}`}>
            {message}
          </div>
        )}

        {canUpdatePassword && (
          <form className="reset-password-form" onSubmit={handleUpdatePassword}>
            <div className="reset-password-field">
              <FiLock className="reset-password-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Nouveau mot de passe"
                value={passwords.password}
                onChange={handlePasswordChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Afficher le mot de passe"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="reset-password-field">
              <FiLock className="reset-password-input-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="c_password"
                placeholder="Confirmer le mot de passe"
                value={passwords.c_password}
                onChange={handlePasswordChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Afficher la confirmation du mot de passe"
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" className="verify-email-button" disabled={isUpdating}>
              {isUpdating ? 'Mise a jour...' : 'Mettre a jour le mot de passe'}
            </button>
          </form>
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
