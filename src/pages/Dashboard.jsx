import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const REDIRECTS = {
  vendeur: '/vendeur/dashboard',
  livreur: '/livreur/livraisons',
  admin:   '/admin/dashboard',
  client:  '/home',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(REDIRECTS[user?.role] ?? '/home', { replace: true });
  }, [user, navigate]);

  return null;
}