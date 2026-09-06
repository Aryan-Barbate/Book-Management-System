import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
    />
  </svg>
);

const AuthModal = ({ isOpen, onClose, initialMode = "login", onToast }) => {
  const {
    login,
    register,
    loginWithGoogle,
    loginAsDemo,
    authModalMode,
    setAuthModalMode,
  } = useAuth();

  const [mode, setMode] = useState(authModalMode || initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  // Clear form & errors on mode change
  useEffect(() => {
    setErrorMessage("");
  }, [mode, isOpen]);

  // Initialize Google Identity Services if client ID is available
  useEffect(() => {
    if (!isOpen) return;

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "725381923456-bookvaultdemo.apps.googleusercontent.com";

    const handleGoogleCallback = async (response) => {
      if (response && response.credential) {
        setIsLoading(true);
        try {
          await loginWithGoogle(response.credential);
          onToast?.("Successfully logged in with Google!", "success");
          onClose();
        } catch (err) {
          setErrorMessage(err.response?.data?.Message || "Google login failed.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    let intervalId = null;
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "outline",
              size: "large",
              width: 320,
              text: mode === "login" ? "signin_with" : "signup_with",
              shape: "rectangular",
            });
          }
          if (intervalId) clearInterval(intervalId);
        } catch (e) {
          console.warn("Google Sign-In initialization note:", e.message);
        }
      }
    };

    initGsi();
    if (!window.google?.accounts?.id) {
      intervalId = setInterval(initGsi, 300);
      setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, mode, loginWithGoogle, onToast, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        onToast?.("Welcome back to Book Vault!", "success");
      } else {
        await register(name, email, password);
        onToast?.("Account created! Welcome to Book Vault!", "success");
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      await loginAsDemo();
      onToast?.("Logged in with Demo Account!", "success");
      onClose();
    } catch (err) {
      setErrorMessage("Could not launch demo account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerGoogle = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn("Google prompt notice:", e);
      }
    } else {
      // Fallback demo login if Google SDK is offline/blocked by adblock
      onToast?.("Google Auth prompt unavailable offline. Logging in via Demo...", "info");
      handleDemoClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1C24] border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 nb-card-yellow border-b-3 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-black text-[#CCFF00] border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#FFFDF5]">
              <Sparkles className="w-5 h-5 stroke-2.5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-black leading-tight">
                {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
              </h2>
              <p className="text-[11px] font-extrabold text-black/80 uppercase">
                {mode === "login"
                  ? "Access your private book vault"
                  : "Start tracking your library"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-3" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-black/5 dark:bg-white/5 border-b-2 border-black">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setAuthModalMode?.("login");
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-[#2A2A38] text-black dark:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setAuthModalMode?.("register");
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white dark:bg-[#2A2A38] text-black dark:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            REGISTER
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={isLoading}
            className="w-full nb-btn nb-btn-lime flex items-center justify-center gap-2 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] cursor-pointer"
          >
            <Zap className="w-4 h-4 text-black fill-black" />
            <span>INSTANT 1-CLICK DEMO LOGIN</span>
          </button>

          {/* Google Auth Button */}
          <div className="space-y-2">
            <div
              ref={googleBtnRef}
              className="flex justify-center w-full min-h-[44px] items-center overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] bg-white dark:bg-[#2A2A38]"
            />

            {/* Fallback button if GIS script is offline or not loaded */}
            {!window.google?.accounts?.id && (
              <button
                type="button"
                onClick={handleTriggerGoogle}
                disabled={isLoading}
                className="w-full nb-btn nb-btn-white flex items-center justify-center gap-3 py-2.5 text-xs font-black shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:bg-neutral-100"
              >
                <GoogleIcon />
                <span>
                  {mode === "login"
                    ? "SIGN IN WITH GOOGLE"
                    : "SIGN UP WITH GOOGLE"}
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="h-0.5 flex-1 bg-black/20 dark:bg-white/20" />
            <span className="text-[11px] font-black uppercase text-black/50 dark:text-white/50 tracking-wider">
              OR WITH EMAIL
            </span>
            <div className="h-0.5 flex-1 bg-black/20 dark:bg-white/20" />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[#FF4D4D]/20 border-2 border-[#FF4D4D] text-[#FF4D4D] rounded-lg text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Hunter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="nb-input nb-input-has-icon text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                <input
                  type="email"
                  required
                  placeholder="reader@bookvault.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nb-input nb-input-has-icon text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nb-input nb-input-has-icon pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-2" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-2" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full nb-btn nb-btn-yellow py-3 text-sm font-black shadow-[4px_4px_0px_0px_#000] cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </div>
              ) : mode === "login" ? (
                "SIGN IN TO VAULT"
              ) : (
                "CREATE MY ACCOUNT"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
