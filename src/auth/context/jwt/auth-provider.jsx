import PropTypes from 'prop-types';
import { useLocation } from 'react-router';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { AuthContext } from './auth-context';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'FORGOTPASSWORD') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'NEWPASSWORD') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  if (action.type === 'VERIFY') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const location = useLocation();
  const shouldFetch = !/^\/event(\/|$)/.test(location.pathname);

  const initialize = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.auth.me);

      // Using HTTPOnly cookie
      if (response.status === 200) {
        const { user } = response.data;
        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) {
      initialize();
    }
  }, [initialize, shouldFetch]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    const data = {
      email,
      password,
    };

    const response = await axios.post(endpoints.auth.login, data);

    const { user } = response.data;

    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
        },
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = {
      email,
      password,
      firstName,
      lastName,
    };

    const response = await axios.post(endpoints.auth.register, data);

    const { user } = response.data;

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
        },
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    await axios.post(endpoints.auth.logout);
    setSession(null);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const response = await axios.post(endpoints.auth.forgetPassword, { email });
    const { user } = response.data;
    return user;
  }, []);

  const resetPassword = useCallback(async (email, code, password) => {
    const response = await axios.post(endpoints.auth.resetPassword, { email, code, password });
    const { user } = response.data;
    return user;
  }, []);

  const verify = useCallback(async (email, code) => {
    const data = {
      email,
      code,
    };

    const response = await axios.post(endpoints.auth.verify, data);

    const { user } = response.data;

    dispatch({
      type: 'VERIFY',
      payload: {
        user: {
          ...user,
        },
      },
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user?.isVerified ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      login,
      register,
      logout,
      verify,
      forgotPassword,
      resetPassword,
    }),
    [login, logout, register, verify, state.user, status, forgotPassword, resetPassword]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
