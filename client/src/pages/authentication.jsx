import * as React from "react";
import {
  Box,
  Typography,
  Link,
  Snackbar,
  IconButton,
  InputAdornment,
  Chip,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { USERS_API_URL } from "../config/env";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import icon from "../icon.svg";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [showResend, setShowResend] = React.useState(false);
  const [resendDisabled, setResendDisabled] = React.useState(true);
  const [timer, setTimer] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  // Validation states
  const [usernameError, setUsernameError] = React.useState("");
  const [usernameValid, setUsernameValid] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [passwordValidation, setPasswordValidation] = React.useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });
  const [passwordsMatch, setPasswordsMatch] = React.useState(false);

  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const loginInProgressRef = React.useRef(false);
  const router = useNavigate();
  const location = useLocation();
  const authMode = new URLSearchParams(location.search).get("mode");

  const switchFormState = React.useCallback((nextState) => {
    setFormState(nextState);
    setError("");
    setShowResend(false);
    setResendDisabled(true);
    setTimer(0);

    if (nextState !== 1) {
      setAgreedToTerms(false);
    }
  }, []);

  // Validation functions
  const validateUsername = (user) => {
    if (!user) {
      setUsernameError("");
      setUsernameValid(false);
      setUsernameAvailable(null);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;

    if (user.length < 3 || user.length > 20) {
      setUsernameError("Username must be 3-20 characters");
      setUsernameValid(false);
    } else if (!usernameRegex.test(user)) {
      setUsernameError("Only letters, numbers, underscores, and dots allowed");
      setUsernameValid(false);
    } else {
      setUsernameError("");
      setUsernameValid(true);
      // Check availability
      checkUsernameAvailability(user);
    }
  };

  const checkUsernameAvailability = async (user) => {
    if (user.length < 3) return;

    setCheckingUsername(true);
    try {
      const response = await fetch(`${USERS_API_URL}/check-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user }),
      });

      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const validatePassword = (pass) => {
    if (!pass) {
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
      });
      return;
    }

    setPasswordValidation({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
    });
  };

  const isPasswordValid = () => {
    return (
      passwordValidation.length &&
      passwordValidation.uppercase &&
      passwordValidation.lowercase &&
      passwordValidation.number
    );
  };

  React.useEffect(() => {
    setPasswordsMatch(password && confirmPassword && password === confirmPassword);
  }, [password, confirmPassword]);

  const {
    handleRegister,
    handleLogin,
    handleResend,
    handleForgotPassword,
    user,
    loading,
    consumeAuthRedirect,
    consumeAuthMessage,
    authMessage
  } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (authMode === "register") {
      switchFormState(1);
      return;
    }

    if (authMode === "login") {
      switchFormState(0);
    }
  }, [authMode, switchFormState]);

  React.useEffect(() => {
    const storedMessage = consumeAuthMessage();

    if (storedMessage) {
      setMessage(storedMessage);
      setOpen(true);
    }
  }, [authMessage]);

  React.useEffect(() => {
    if (!loading && user && !user.isGuest && !loginInProgressRef.current) {
      router("/home", { replace: true });
    }
  }, [loading, user, router]);

  const getLoginRedirect = () => {
    const stateFrom = location.state?.from;

    if (stateFrom && stateFrom !== "/auth") {
      return stateFrom;
    }

    return consumeAuthRedirect();
  };

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);

  let handleAuth = async () => {
    try {
      if (formState == 0) { // Login
        loginInProgressRef.current = true;
        let result = await handleLogin(username, password);
        const redirectTo = getLoginRedirect();
        console.log(result);
        setMessage(result);
        setOpen(true);
        setError("");
        router(redirectTo, { replace: true });
        return;
      } else if (formState == 1) { // Register
        // Validate before submission
        validateUsername(username);
        validatePassword(password);

        const errors = [];

        if (!name) errors.push("Full name is required");
        if (!usernameValid) errors.push("Please check username requirements");
        if (!email) errors.push("Email is required");
        if (usernameAvailable === false) errors.push("Username is unavailable");
        if (!isPasswordValid()) errors.push("Please check password requirements");
        if (!passwordsMatch) errors.push("Passwords do not match");
        if (!agreedToTerms) errors.push("You must agree to the Privacy Policy and Terms of Service");

        if (errors.length > 0) {
          setError(errors.join(" • "));
          return;
        }

        let result = await handleRegister(name, email, username, password, agreedToTerms);
        console.log(result);
        setShowResend(true);
        setResendDisabled(true);
        setTimer(30);
        setMessage(result || "Verify your mail");
        setOpen(true);
        setError("");
        setAgreedToTerms(false);
        setFormState(0);
      } else if (formState == 2) { // Forgot Password
        let result = await handleForgotPassword(email);
        console.log(result);
        setShowResend(true);
        setResendDisabled(true);
        setTimer(30);
        setMessage(result);
        setOpen(true);
        setError("");
      }
    } catch (error) {
      loginInProgressRef.current = false;
      setError(error?.message || "Something went wrong");
    }
  }

  return (
    <>

      {/* <Navbar/> */}

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          padding: 2,
          alignItems: "flex-start",
          py: 6,
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1f2937 100%)",
          // padding: 2,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        {/* Centered Card Container */}
        <Card>
          <Box sx={{ maxWidth: 1000, width: "100%" }}>
            {/* Header Section */}
            <Box
              sx={
                {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                  textAlign: "center",
                }
                // (formState === 1)
                //   ? { display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", textAlign: "center", gap: 2, mb: 3 }
                // : { display: "flex", flexDirection: "column", gap: 2, alignItems: "center", mb: 3 }

              }
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.35)",
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                }}
              >
                <Box
                  component="img"
                  src={icon}
                  alt="Zimpeer icon"
                  sx={{
                    width: 40,
                    height: 40,
                    display: "block",
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.28))",
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {formState === 0 ? "Welcome Back" : formState === 1 ? "Create Account" : "Reset Password"}
              </Typography>

              {/* Tab Buttons */}
              <Box sx={{ display: "flex", gap: 1, width: "100%", mb: 3 }}>
                <Button
                  variant={formState === 0 ? "contained" : "outlined"}
                  onClick={() => switchFormState(0)}
                  sx={{
                    flex: 1,
                    py: 0.8,
                    fontSize: "0.875rem",
                    border: formState === 0 ? "none" : "1px solid rgba(148, 163, 184, 0.3)",
                    color: formState === 0 ? "white" : "#94a3b8",
                    backgroundColor: formState === 0 ? "#6366f1" : "transparent",
                    "&:hover": {
                      backgroundColor: formState === 0 ? "#4f46e5" : "rgba(99, 102, 241, 0.1)",
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant={formState === 1 ? "contained" : "outlined"}
                  onClick={() => switchFormState(1)}
                  sx={{
                    flex: 1,
                    py: 0.8,
                    fontSize: "0.875rem",
                    border: formState === 1 ? "none" : "1px solid rgba(148, 163, 184, 0.3)",
                    color: formState === 1 ? "white" : "#94a3b8",
                    backgroundColor: formState === 1 ? "#6366f1" : "transparent",
                    "&:hover": {
                      backgroundColor: formState === 1 ? "#4f46e5" : "rgba(99, 102, 241, 0.1)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>

            {/* Form Section - Input Fields Only */}
            <Box component="form" noValidate sx={
              (formState === 1)
                ? { display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "flex-start", gap: 2, mb: 3 }
                : { display: "flex", flexDirection: "column", gap: 2, alignItems: "center", mb: 3 }
            }>

              {/* Full Name Field - Full Width */}
              {formState === 1 && (
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Input
                    required
                    id="name"
                    label="Full Name"
                    name="name"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        padding: "12px 14px",
                        color: "#f8fafc",
                        "& fieldset": {
                          borderColor: "rgba(148, 163, 184, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(99, 102, 241, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6366f1",
                          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                        },
                      },
                      "& .MuiOutlinedInput-input::placeholder": {
                        color: "rgba(148, 163, 184, 0.6)",
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Username and Email Row */}
              {formState === 1 && (
                <>
                  <Input
                    required
                    id="username"
                    label="Username"
                    name="username"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (formState === 1) validateUsername(e.target.value);
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        padding: "12px 14px",
                        color: "#f8fafc",
                        "& fieldset": {
                          borderColor: "rgba(148, 163, 184, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(99, 102, 241, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6366f1",
                          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                        },
                      },
                    }}
                  />

                  <Input
                    required
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        padding: "12px 14px",
                        color: "#f8fafc",
                        "& fieldset": {
                          borderColor: "rgba(148, 163, 184, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(99, 102, 241, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6366f1",
                          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                        },
                      },
                      "& .MuiOutlinedInput-input::placeholder": {
                        color: "rgba(148, 163, 184, 0.6)",
                        opacity: 1,
                      },
                    }}
                  />
                </>
              )}

              {/* Username Availability Status and Errors */}
              {formState === 1 && username && (
                <Box sx={{ width: "100%", gridColumn: "1 / -1" }}>
                  {usernameValid ? (
                    checkingUsername ? (
                      <Chip
                        label="Checking availability..."
                        variant="outlined"
                        sx={{ width: "100%", color: "#94a3b8" }}
                      />
                    ) : usernameAvailable ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Username available"
                        color="success"
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                    ) : (
                      <Chip
                        icon={<Cancel />}
                        label="Username unavailable"
                        color="error"
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                    )
                  ) : (
                    <Typography
                      component="p"
                      sx={{
                        color: "#ef4444",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {usernameError}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Username Field - Login */}
              {formState === 0 && (
                <Input
                  required
                  id="username"
                  label="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 48,
                      padding: "12px 14px",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: "rgba(148, 163, 184, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(99, 102, 241, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1",
                        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                      },
                    },
                  }}
                />
              )}

              {/* Password Field - Login */}
              {formState === 0 && (
                <Input
                  required
                  id="password"
                  label="Password"
                  name="password"
                  value={password}
                  type={showPassword ? "text" : "password"}
                  onChange={e => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": {
                              color: "#cbd5e1",
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 48,
                      padding: "12px 14px",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: "rgba(148, 163, 184, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(99, 102, 241, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1",
                        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                      },
                    },
                  }}
                />
              )}

              {/* Password and Confirm Password Row - Register */}
              {formState === 1 && (
                <>
                  <Input
                    required
                    id="password"
                    label="Password"
                    name="password"
                    value={password}
                    type={showPassword ? "text" : "password"}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (formState === 1) validatePassword(e.target.value);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: "#94a3b8",
                              "&:hover": {
                                color: "#cbd5e1",
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        padding: "12px 14px",
                        color: "#f8fafc",
                        "& fieldset": {
                          borderColor: "rgba(148, 163, 184, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(99, 102, 241, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6366f1",
                          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                        },
                      },
                    }}
                  />

                  <Input
                    required
                    id="confirmPassword"
                    label="Confirm Password"
                    name="confirmPassword"
                    value={confirmPassword}
                    type={showConfirmPassword ? "text" : "password"}
                    onChange={e => setConfirmPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{
                              color: "#94a3b8",
                              "&:hover": {
                                color: "#cbd5e1",
                              },
                            }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        padding: "12px 14px",
                        color: "#f8fafc",
                        "& fieldset": {
                          borderColor: "rgba(148, 163, 184, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(99, 102, 241, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6366f1",
                          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                        },
                      },
                    }}
                  />
                </>
              )}

              {/* Password validation for register form */}
              {formState === 1 && password && (
                <Box sx={{ width: "100%", gridColumn: "1 / -1" }}>
                  {isPasswordValid() ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Password is valid"
                      color="success"
                      variant="outlined"
                      sx={{ width: "100%" }}
                    />
                  ) : (
                    <Typography
                      component="p"
                      sx={{
                        color: "#ef4444",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      Password must have 8+ characters, 1 uppercase, 1 lowercase, 1 number
                    </Typography>
                  )}
                </Box>
              )}

              {/* Password Match Status - Register */}
              {formState === 1 && confirmPassword && (
                <Box sx={{ width: "100%", gridColumn: "1 / -1" }}>
                  {passwordsMatch ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Passwords match"
                      color="success"
                      variant="outlined"
                      sx={{ width: "100%" }}
                    />
                  ) : (
                    <Chip
                      icon={<Cancel />}
                      label="Passwords do not match"
                      color="error"
                      variant="outlined"
                      sx={{ width: "100%" }}
                    />
                  )}
                </Box>
              )}

              {/* Email Field - Forgot Password Form */}
              {formState === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", alignItems: "center" }}>
                  <Input
                    required
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        padding: "12px 14px",
                        color: "#f8fafc",
                        "& fieldset": {
                          borderColor: "rgba(148, 163, 184, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(99, 102, 241, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6366f1",
                          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                        },
                      },
                      "& .MuiOutlinedInput-input::placeholder": {
                        color: "rgba(148, 163, 184, 0.6)",
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
              )}

            </Box>

            {/* Buttons and Messages Section */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", width: "100%", mt: 3 }}>
              {error && (
                <Typography
                  sx={{
                    color: "#ef4444",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    p: 1.5,
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    borderRadius: 1,
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    width: "100%",
                  }}
                >
                  • {error}
                </Typography>
              )}

              {formState === 1 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      sx={{ color: '#6366f1' }}
                      aria-label="Agree to terms"
                    />
                  }
                  label={
                    <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                      I agree to the{' '}
                      <Link component={RouterLink} to="/privacy" sx={{ color: '#6366f1', textDecoration: 'none' }}>
                        Privacy Policy
                      </Link>{' '}
                      and{' '}
                      <Link component={RouterLink} to="/terms" sx={{ color: '#6366f1', textDecoration: 'none' }}>
                        Terms of Service
                      </Link>
                    </span>
                  }
                  sx={{ width: '100%', justifyContent: 'flex-start', mb: 1 }}
                />
              )}

              <Button
                variant="contained"
                onClick={handleAuth}
                disabled={
                  (formState === 0 && (!username || !password)) ||
                  (formState == 1 && (
                    !name ||
                    !usernameValid ||
                    usernameAvailable === false ||
                    !email ||
                    !isPasswordValid() ||
                    !passwordsMatch ||
                    !agreedToTerms
                  )) ||
                  (formState === 2 && (!email || (showResend && resendDisabled)))
                }
                sx={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  fontSize: "1rem",
                  py: 1.1,
                  px: 4,
                  width: "100%",
                  boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
                  "&:hover": {
                    boxShadow: "0 12px 24px rgba(99, 102, 241, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "rgba(99, 102, 241, 0.4)",
                    color: "#cbd5e1",
                    boxShadow: "none",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {
                  (formState == 2) ? "Send Reset Link" : ((formState == 1) ? "Sign Up" : "Sign In")
                }

              </Button>

              {formState === 0 && (
                <Link
                  component="button"
                  onClick={() => switchFormState(2)}
                  sx={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#8b5cf6",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              )}

              {showResend && (formState === 1 || formState === 2) && (
                <Button
                  variant="outlined"
                  disabled={resendDisabled}
                  onClick={() => {
                    (async () => {
                      try {
                        let result;

                        if (formState == 1) {
                          result = await handleResend(email);
                        } else if (formState == 2) {
                          result = await handleForgotPassword(email);
                        }

                        setMessage(result || "Mail sent");
                        setOpen(true);
                        setError("");
                        setResendDisabled(true);
                        setTimer(30);
                      } catch (error) {
                        setError(error?.message || "Something went wrong");
                      }
                    })();
                  }}
                  sx={{
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    color: resendDisabled ? "#64748b" : "#6366f1",
                    py: 1.1,
                    fontSize: "0.875rem",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                      borderColor: "#6366f1",
                    },
                    "&:disabled": {
                      color: "#64748b",
                      borderColor: "rgba(99, 102, 241, 0.2)",
                    },
                  }}
                >
                  {resendDisabled ? `Resend in ${timer}s` : "Resend"}
                </Button>
              )}

            </Box>
          </Box>
        </Card>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          message={message}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{
            "& .MuiSnackbarContent-root": {
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
            },
          }}
        />

      </Box>
    </>
  );
}
