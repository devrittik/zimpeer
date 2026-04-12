import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Typography, Box, CircularProgress, IconButton, InputAdornment, Chip } from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import icon from "../icon.svg";
import { Helmet } from "react-helmet-async";
import { USERS_API_URL } from "../config/env";

const client = axios.create({
    baseURL: USERS_API_URL,
});

const ResetPW = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const token = params.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

    const handlePasswordChange = (pass) => {
        setNewPassword(pass);
        validatePassword(pass);
    };

    useEffect(() => {
        setPasswordsMatch(newPassword && confPassword && newPassword === confPassword);
    }, [newPassword, confPassword]);

    const handleReset = async (e) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid or missing token");
            return;
        }

        if (!isPasswordValid()) {
            setError("Password does not meet requirements");
            return;
        }

        if (newPassword !== confPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await client.post("/reset-password", {
                token,
                newPassword,
            });

            setSuccess(res.data?.message || "Password updated successfully");

            setTimeout(() => {
                navigate("/auth");
            }, 2000);

        } catch (err) {
            setError(
                err?.response?.data?.message || "Invalid or expired link"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
              <title>Reset Password | Zimpeer</title>
              <meta name="robots" content="noindex,nofollow" />
            </Helmet>
        
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                padding: 2,
                alignItems: "flex-start",
                py: 6,
                justifyContent: "center",
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1f2937 100%)",
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
            <Card>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >
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
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        textAlign: "center", mb: 3, fontWeight: 700,
                        background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Reset Password
                </Typography>

                {!token && (
                    <Typography sx={{ color: "error.main", textAlign: "center" }}>
                        Invalid or expired link
                    </Typography>
                )}

                {token && (
                    <form onSubmit={handleReset}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                            <Input
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                edge="end"
                                                sx={{
                                                    color: "#94a3b8",
                                                    "&:hover": {
                                                        color: "#cbd5e1",
                                                    },
                                                }}
                                            >
                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password validation */}
                            {newPassword && (
                                <Box>
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

                            <Input
                                label="Confirm Password"
                                type={showConfPassword ? "text" : "password"}
                                required
                                value={confPassword}
                                onChange={(e) => setConfPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfPassword(!showConfPassword)}
                                                edge="end"
                                                sx={{
                                                    color: "#94a3b8",
                                                    "&:hover": {
                                                        color: "#cbd5e1",
                                                    },
                                                }}
                                            >
                                                {showConfPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password Match Status */}
                            {confPassword && (
                                <>
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
                                </>
                            )}
                        </Box>

                        {error && (
                            <Typography sx={{ color: "error.main", mt: 2, textAlign: "center" }}>
                                {error}
                            </Typography>
                        )}

                        {success && (
                            <Typography sx={{ color: "success.main", mt: 2, textAlign: "center" }}>
                                {success}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            sx={{ mt: 3, width: "100%" }}
                            disabled={
                                loading ||
                                !newPassword ||
                                !confPassword ||
                                !isPasswordValid() ||
                                !passwordsMatch
                            }
                        >
                            {loading ? <CircularProgress size={24} /> : "Reset Password"}
                        </Button>
                    </form>
                )}
            </Card>
        </Box>
        </>
    );
};

export default ResetPW;
