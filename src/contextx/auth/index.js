import { useState, useEffect } from 'react';
import { auth } from '../../firebase';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Set loading to false once the auth state is confirmed
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { user, loading }; // Return both user and loading state
};

export default useAuth;
