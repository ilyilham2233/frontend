import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';

const Register = () => {
  const registerBackground = `${process.env.PUBLIC_URL}/images/image 2.jpeg`;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    Telephone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/verify-email?registered=true');
    } catch (err) {
      const data = err.response?.data;
      let message = "Échec de l'inscription. Veuillez réessayer.";
      if (data?.message) message = data.message;
      else if (data?.errors) {
        message = Object.values(data.errors).flat().join(' ');
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="register-page"
      style={{ backgroundImage: `url("${registerBackground}")` }}
    >
      <section className="register-shell">
        <div className="register-card">
          <div className="register-header">
            <span className="register-card-kicker">khayrat bladi</span>
            <h2>Rejoignez la Ruche Naturelle</h2>
            <p>Créez votre compte et découvrez nos produits artisanaux aux notes dorées et naturelles.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form" id="register-form">
            <div className="register-field">
              <FiUser className="register-input-icon" />
              <input
                type="text"
                id="register-firstname"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="register-field">
              <FiUser className="register-input-icon" />
              <input
                type="text"
                id="register-lastname"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="register-field">
              <FiMail className="register-input-icon" />
              <input
                type="email"
                id="register-email"
                name="email"
                placeholder="Adresse E-mail"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="register-field">
              <FiPhone className="register-input-icon" />
              <input
                type="tel"
                id="register-phone"
                name="Telephone"
                placeholder="Téléphone"
                value={formData.Telephone}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
            </div>

            <div className="register-field">
              <FiLock className="register-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="register-password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Afficher le mot de passe"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="register-field">
              <FiLock className="register-input-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                id="register-confirm"
                name="password_confirmation"
                placeholder="Confirmer le mot de passe"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                aria-label="Afficher la confirmation du mot de passe"
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" className="register-submit" id="register-submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-small" />
                  Inscription...
                </span>
              ) : (
                <span className="btn-content">
                  Créer un compte
                  <FiArrowRight />
                </span>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Register;
