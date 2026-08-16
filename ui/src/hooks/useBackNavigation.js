import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useBackNavigation() {
  const navigate = useNavigate();

  const handleBack = useCallback((e) => {
    if (e) e.preventDefault();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  return handleBack;
}
