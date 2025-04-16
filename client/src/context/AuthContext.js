import React from 'react';

const AuthContext = React.createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  error: null,
  setError: () => {}
});

export default AuthContext; 