import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiKey, FiLock } from 'react-icons/fi';
import { validateResetToken, updatePassword } from '../../api/auth';
import '../VerifyEmail/VerifyEmail.css';
import '../ForgotPassword/ForgotPassword.css';
import './ResetPassword.css';

const ResetPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email') || '';
  const navigate = useNavigate();

  // Étape : 'validating' | 'invalid' | 'form' | 'submitting' | 'success' | 'error'
  const [step, setStep] = useState(token && email ? 'validating' : 'invalid');
  const [message, setMessage] = useState('');
  const [validToken, setValidToken] = useState(null);

  const [formData, setFormData] = useState({ password: '', c_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Étape 1 — valider le token au montage
  useEffect(() => {
    if (!token || !email) {
      setStep('invalid');
      setMessage('Le lien de réinitialisation est incomplet ou invalide.');
      return;
    }

    validateResetToken(token, email)
      .then((data) => {
        setValidToken({ email: data.email || email, token: data.token || token });
        setStep('form');
      })
      .catch((err) => {
        setStep('invalid');
        setMessage(err.response?.data?.message || 'Lien invalide ou expiré.');
      });
  }, [token, email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  // Étape 2 — soumettre le nouveau mot de passe
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.password) errors.password = 'Le mot de passe est requis.';
    if (formData.password !== formData.c_password) errors.c_password = 'Les mots de passe ne correspondent pas.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setStep('submitting');
    setMessage('');

    try {
      const data = await updatePassword({
        email: validToken.email,
        token: validToken.token,
        password: formData.password,
        c_password: formData.c_password,
      });
      setStep('success');
      setMessage(data.message || 'Mot de passe mis à jour avec succès. Veuillez vous reconnecter.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const code = err.response?.status;
      const apiErrors = err.response?.data?.errors;
      const apiMessage = err.response?.data?.message;

      if (code === 422 && apiErrors) {
        const mapped = {};
        if (apiErrors.password) mapped.password = apiErrors.password[0];
        if (apiErrors.c_password) mapped.c_password = apiErrors.c_password[0];
        setFieldErrors(mapped);
        setStep('form');
      } else {
        setStep('error');
        setMessage(apiMessage || 'Une erreur est survenue. Réessayez.');
      }
    }
  };

  const isLoading = step === 'validating' || step === 'submitting';
  const isInvalid = step === 'invalid' || step === 'error';
  const isSuccess = step === 'success';
  const showForm = step === 'form' || step === 'submitting';

  // Indicateur de force du mot de passe
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(formData.password);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
  const strengthClass = ['', 'weak', 'fair', 'good', 'strong'][strength];

  return (
    <main className="verify-email-page">
      <section className="verify-email-card">

        {/* Icon */}
        <div className="verify-email-icon">
          {isLoading && <FiKey className="spin" />}
          {isSuccess && <FiCheckCircle />}
          {isInvalid && <FiAlertCircle />}
          {showForm && !isLoading && <FiLock />}
        </div>

        {/* Header */}
        <div className="verify-email-header">
          <span className="verify-email-kicker">Réinitialisation du mot de passe</span>
          <h1>
            {step === 'validating' ? 'Vérification du lien...' :
             step === 'invalid'    ? 'Lien invalide' :
             step === 'error'      ? 'Erreur' :
             step === 'success'    ? 'Mot de passe mis à jour !' :
             'Choisir un nouveau mot de passe'}
          </h1>
          <p>
            {isSuccess
              ? 'Vous allez être redirigé vers la page de connexion dans 3 secondes.'
              : isInvalid
              ? 'Ce lien est invalide ou a expiré. Demandez-en un nouveau.'
              : step === 'validating'
              ? 'Nous vérifions que votre lien est encore valide...'
              : `Nouveau mot de passe pour : ${validToken?.email || email}`}
          </p>
        </div>

        {/* Message global */}
        {message && (
          <div className={`verify-email-message ${isSuccess ? 'verify-email-message-verified' : 'verify-email-message-error'}`}>
            {message}
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <form onSubmit={handleSubmit} className="forgot-form">

            {/* Mot de passe */}
            <div className="forgot-field">
              <label htmlFor="rp-password">Nouveau mot de passe</label>
              <div className="forgot-input-wrap">
                <FiLock className="forgot-input-icon" />
                <input
                  id="rp-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 8 car., maj., chiffre, symbole"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={step === 'submitting'}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="rp-field-error">{fieldErrors.password}</span>
              )}
              {/* Barre de force */}
              {formData.password && (
                <div className="rp-strength">
                  <div className={`rp-strength-bar rp-strength-${strengthClass}`}>
                    {[1,2,3,4].map(i => (
                      <span key={i} className={i <= strength ? 'active' : ''} />
                    ))}
                  </div>
                  <span className={`rp-strength-label rp-strength-label-${strengthClass}`}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="forgot-field">
              <label htmlFor="rp-confirm">Confirmer le mot de passe</label>
              <div className="forgot-input-wrap">
                <FiLock className="forgot-input-icon" />
                <input
                  id="rp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="c_password"
                  placeholder="Répétez le mot de passe"
                  value={formData.c_password}
                  onChange={handleChange}
                  disabled={step === 'submitting'}
                  required
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {fieldErrors.c_password && (
                <span className="rp-field-error">{fieldErrors.c_password}</span>
              )}
            </div>

            <button
              type="submit"
              className="verify-email-button"
              disabled={step === 'submitting'}
            >
              <span className="btn-content">
                <FiKey />
                {step === 'submitting' ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </span>
            </button>
          </form>
        )}

        {/* Actions */}
        <div className="verify-email-actions">
          {isInvalid && (
            <Link to="/forgot-password">
              <FiKey /> Demander un nouveau lien
            </Link>
          )}
          <Link to="/login">
            <FiArrowLeft /> Connexion
          </Link>
        </div>

      </section>
    </main>
  );
};

export default ResetPassword;
