import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      const authData = response?.user || response?.data || response || {};
      const role = authData?.role;

      if (role === 'livreur') navigate('/livreur/dashboard');
      else if (role === 'vendeur') navigate('/vendeur/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/home');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Échec de la connexion. Vérifiez vos identifiants.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-frame">
        <div
          className="login-visual"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/image1.jpeg)` }}
        />

        <div className="login-panel">
          <div className="login-card">
            <div className="login-header">
              <h2>Heureux de vous revoir !</h2>
              <p>Connectez-vous pour retrouver vos produits favoris et votre espace naturel.</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" id="login-form">
              <div className="login-field">
                <FiMail className="login-input-icon" />
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="Adresse E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <FiLock className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="login-options">
                <label className="login-remember">
                  <input type="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="login-forgot">Mot de passe oublié ?</Link>
              </div>

              <button type="submit" className="login-submit" id="login-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner-small" />
                    Connexion...
                  </span>
                ) : (
                  <span className="btn-content">
                    Se connecter
                    <FiArrowRight />
                  </span>
                )}
              </button>
            </form>

            <p className="login-register">
              Nouveau ici ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
