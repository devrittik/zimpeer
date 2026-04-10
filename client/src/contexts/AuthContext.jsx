import { createContext, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { HttpStatusCode } from "axios";
import { jwtDecode } from "jwt-decode";
import { USERS_API_URL } from "../config/env";

export const AuthContext = createContext(null);

const client = axios.create({
  baseURL: USERS_API_URL,
});

const GUEST_USER = {
  isGuest: true,
  name: null,
  username: null,
};

const SESSION_EXPIRED_MESSAGE = "Session Expired";
const BACKEND_UNAVAILABLE_MESSAGE = "Reconnecting to server...";

const getTokenState = (token) => {
  if (!token) {
    return { hasToken: false, isGuest: true, isExpired: false, isInvalid: false };
  }

  try {
    const decoded = jwtDecode(token);
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : null;

    return {
      hasToken: true,
      isGuest: decoded?.isGuest === true,
      isExpired: expiresAt ? expiresAt <= Date.now() : false,
      isInvalid: false,
      expiresAt,
    };
  } catch {
    return { hasToken: true, isGuest: false, isExpired: true, isInvalid: true };
  }
};

export const AuthProvider = ({ children }) => {
  const router = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(GUEST_USER);

  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);

  const getCurrentPath = useCallback(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search]
  );

  const rememberAuthRedirect = useCallback((from) => {
    if (from && from !== "/auth") {
      sessionStorage.setItem("authRedirectTo", from);
    }
  }, []);

  const consumeAuthRedirect = useCallback(() => {
    const redirectTo = sessionStorage.getItem("authRedirectTo") || "/home";
    sessionStorage.removeItem("authRedirectTo");
    return redirectTo === "/auth" ? "/home" : redirectTo;
  }, []);

  const consumeAuthMessage = useCallback(() => {
    const message = authMessage || sessionStorage.getItem("authMessage");
    setAuthMessage(null);
    sessionStorage.removeItem("authMessage");
    return message;
  }, [authMessage]);

  const handleSessionExpired = useCallback((from = getCurrentPath()) => {
    localStorage.removeItem("token");
    setUser(GUEST_USER);
    rememberAuthRedirect(from);
    setAuthMessage(SESSION_EXPIRED_MESSAGE);
    sessionStorage.setItem("authMessage", SESSION_EXPIRED_MESSAGE);

    if (location.pathname !== "/auth") {
      router("/auth", { replace: true });
    }
  }, [getCurrentPath, location.pathname, rememberAuthRedirect, router]);

  const ensureRegisteredSession = useCallback((from = getCurrentPath()) => {
    const tokenState = getTokenState(localStorage.getItem("token"));

    if (tokenState.hasToken && !tokenState.isGuest && (tokenState.isExpired || tokenState.isInvalid)) {
      handleSessionExpired(from);
      return false;
    }

    return true;
  }, [getCurrentPath, handleSessionExpired]);

  const handleAuthError = useCallback((error, from = getCurrentPath()) => {
    if (error?.response?.status !== 401) return false;

    const tokenState = getTokenState(localStorage.getItem("token"));

    if (tokenState.hasToken && !tokenState.isGuest) {
      handleSessionExpired(from);
      return true;
    }

    return false;
  }, [getCurrentPath, handleSessionExpired]);

  const isNetworkError = (error) => !error?.response;

  const handleRegister = async (name, email, username, password, agreedToTerms = false) => {
    try {
      setLoading(true);

      const request = await client.post("/register", {
        email,
        name,
        username,
        password,
        agreedToTerms,
      });

      return request.data?.message || "Verify your mail";
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);

      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === HttpStatusCode.Ok) {
        localStorage.setItem("token", request.data.token);
        await fetchUser();
        return request.data.message;
      }
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      setLoading(true);
      const request = await client.post("/forgot-password", { email });
      return request.data.message;
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(GUEST_USER);
    router("/");
  };

  const handleResend = async (userEmail) => {
    try {
      setLoading(true);
      const request = await client.post("/resend-verification", {
        email: userEmail,
      });
      return request.data?.message || "Verification email resent";
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const getUserHistory = useCallback(async () => {
    if (!ensureRegisteredSession("/history")) return [];

    try {
      let token = localStorage.getItem("token");
      let request = await client.get("/history", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return request.data;
    } catch (error) {
      throw error;
    }
  }, [ensureRegisteredSession]);

  const createMeeting = useCallback(async () => {
    if (!ensureRegisteredSession("/home")) return;

    try {
      let token = localStorage.getItem("token");
      const res = await client.post("/create-meeting", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      router(`/room/${res.data.meetingCode}`);
    } catch (error) {
      if (handleAuthError(error, "/home")) {
        return;
      }

      if (isNetworkError(error)) {
        console.warn(BACKEND_UNAVAILABLE_MESSAGE, error);
        return;
      }

      localStorage.removeItem("token");
      setUser(GUEST_USER);
      router("/auth");
    }
  }, [ensureRegisteredSession, handleAuthError, router]);

  let handleJoinCall = async (meetingCode, tokenOverride) => {
    let token = tokenOverride ?? localStorage.getItem("token");
    console.log(token);

    let res = await client.get(`/join/${meetingCode}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(res?.data);

    return res.data;
  };

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(GUEST_USER);
      setLoading(false);
      return;
    }

    const tokenState = getTokenState(token);

    if (tokenState.isExpired || tokenState.isInvalid) {
      if (tokenState.isGuest) {
        localStorage.removeItem("token");
        setUser(GUEST_USER);
      } else {
        handleSessionExpired();
      }

      setLoading(false);
      return;
    }

    try {
      const res = await client.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }

      if (isNetworkError(error)) {
        console.warn(BACKEND_UNAVAILABLE_MESSAGE, error);
        return;
      }

      setUser(GUEST_USER);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, handleSessionExpired]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    ensureRegisteredSession();
  }, [ensureRegisteredSession, location.pathname, location.search]);

  useEffect(() => {
    const tokenState = getTokenState(localStorage.getItem("token"));

    if (!tokenState.hasToken || tokenState.isGuest) return;

    if (tokenState.isExpired || tokenState.isInvalid) {
      handleSessionExpired();
      return;
    }

    if (!tokenState.expiresAt) return;

    const sessionTimer = setTimeout(() => {
      handleSessionExpired();
    }, tokenState.expiresAt - Date.now());

    return () => clearTimeout(sessionTimer);
  }, [handleSessionExpired, location.pathname, location.search, user]);

  const generateGuestToken = async () => {
    console.log("before generating");

    const res = await client.get("/guest-token");

    console.log("response:", res.data);
    console.log("token:", res.data.token);

    localStorage.removeItem("token");
    localStorage.setItem("token", res.data.token);
    console.log(localStorage.getItem("token"));
    setUser(GUEST_USER);


    console.log("after generating");
    return res.data.token;
  };

  const data = {
    user,
    setUser,
    fetchUser,
    loading,
    handleRegister,
    handleResend,
    handleLogin,
    handleLogout,
    getUserHistory,
    createMeeting,
    handleJoinCall,
    generateGuestToken,
    handleForgotPassword,
    handleSessionExpired,
    handleAuthError,
    ensureRegisteredSession,
    consumeAuthRedirect,
    consumeAuthMessage,
    authMessage,
    getTokenState
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};
