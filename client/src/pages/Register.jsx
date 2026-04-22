import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openAuthModal } from '../store/slices/uiSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'organiser') {
        navigate('/organizer-dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    dispatch(openAuthModal({ mode: 'register', role: 'customer' }));
    navigate('/', { replace: true });
  }, [dispatch, navigate, token, user]);

  return null;
};

export default Register;
