// File: /src/hooks/useAuth.ts
import {usePrivyWalletLogic} from '../services/walletProviders/privy';
import {useDispatch} from 'react-redux';
import {loginSuccess, logoutSuccess} from '../state/auth/reducer';
import {useCallback, useState} from 'react';

export type AuthProvider = 'privy' | 'dynamic' | 'turnkey';

export function useAuth(selectedProvider: AuthProvider = 'privy') {
  const {handlePrivyLogin, handlePrivyLogout, user} = usePrivyWalletLogic();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<string>('');

  const loginWithGoogle = useCallback(async () => {
    await handlePrivyLogin({
      loginMethod: 'google',
      setStatusMessage: setStatus,
    });
    if (user && user.id) {
      dispatch(loginSuccess({provider: 'privy', address: user.id}));
    }
  }, [handlePrivyLogin, dispatch, user]);

  const loginWithApple = useCallback(async () => {
    await handlePrivyLogin({loginMethod: 'apple', setStatusMessage: setStatus});
    if (user && user.id) {
      dispatch(loginSuccess({provider: 'privy', address: user.id}));
    }
  }, [handlePrivyLogin, dispatch, user]);

  const loginWithEmail = useCallback(async () => {
      await handlePrivyLogin({
        loginMethod: 'email',
        setStatusMessage: setStatus,
      });
      if (user && user.id) {
        dispatch(loginSuccess({provider: 'privy', address: user.id}));
      }
    },
    [handlePrivyLogin, dispatch, user],
  );

  const logout = useCallback(async () => {
    await handlePrivyLogout(setStatus);
    dispatch(logoutSuccess());
  }, [handlePrivyLogout, dispatch]);

  return {
    status,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    logout,
    user,
  };
}
