import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('blog_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('blog_token'));
  const [authLoading, setAuthLoading] = useState(true);

  // Verify token and load current user on app initialization
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('blog_token');
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('blog_user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        // Token expired or invalid
        localStorage.removeItem('blog_token');
        localStorage.removeItem('blog_user');
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyUser();
  }, []);

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('blog_token', newToken);
    localStorage.setItem('blog_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: loggedInUser } = response.data;

    localStorage.setItem('blog_token', newToken);
    localStorage.setItem('blog_user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    return response.data;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Ignore network error on logout, clear client state regardless
    } finally {
      localStorage.removeItem('blog_token');
      localStorage.removeItem('blog_user');
      setToken(null);
      setUser(null);
    }
  };

  /**
   * Helper to check if the current user can edit or delete a specific post.
   * Returns true if user is 'admin' OR if user is the post's author.
   */
  const canManagePost = (post) => {
    if (!user || !post) return false;
    if (user.role === 'admin') return true;
    const authorId =
      typeof post.author === 'object' ? post.author?._id : post.author;
    return authorId === user._id;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        register,
        login,
        logout,
        canManagePost,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
