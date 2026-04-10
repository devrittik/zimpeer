import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import Card from "../components/UI/Card";
import icon from "../icon.svg";
import { USERS_API_URL } from "../config/env";

const client = axios.create({
    baseURL: USERS_API_URL,
});

const VerifyPage = () => {

    const router = useNavigate();

    const [params] = useSearchParams();

    const [status, setStatus] = useState("verifying");

    const hasRun = useRef(false);

    useEffect(() => {
        
        if(hasRun.current) return;
        hasRun.current = true;

        const verifyUser = async () => {
            try {
                const token = params.get("token");

                if (!token) {
                    setStatus("error");
                    return;
                }

                await client.get("/verify", {
                    params: { token }
                });

                setStatus("success");

                setTimeout(() => {
                    router("/auth");
                }, 2000);

            } catch (err) {
                setStatus("error");
            }
        };

        verifyUser();
    }, [params]);

    const statusContent = {
        verifying: {
            title: "Verifying your email",
            description: "Please wait while we confirm your account.",
            color: "#cbd5e1",
        },
        success: {
            title: "Email Verified!",
            description: "Your account is ready. Redirecting you to sign in...",
            color: "#4ade80",
        },
        error: {
            title: "Invalid or Expired Link",
            description: "This verification link is no longer valid. Please request a new one.",
            color: "#f87171",
        },
    };

    const currentState = statusContent[status];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1f2937 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(circle at 20% 35%, rgba(30, 210, 229, 0.08) 0%, transparent 42%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 45%)",
                    pointerEvents: "none",
                },
            }}
        >
            <Card>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            backgroundColor: "#111827",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(148, 163, 184, 0.22)",
                            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.35)",
                        }}
                    >
                        <Box
                            component="img"
                            src={icon}
                            alt="Zimpeer icon"
                            sx={{
                                width: 44,
                                height: 44,
                                display: "block",
                                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.28))",
                            }}
                        />
                    </Box>

                    {status === "verifying" && (
                        <CircularProgress
                            size={28}
                            sx={{ color: "#1ed2e5", mt: 0.5 }}
                        />
                    )}

                    <Typography
                        variant="h4"
                        sx={{
                            color: currentState.color,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {currentState.title}
                    </Typography>

                    <Typography
                        sx={{
                            color: "#cbd5e1",
                            fontSize: "1rem",
                            lineHeight: 1.7,
                            maxWidth: 340,
                        }}
                    >
                        {currentState.description}
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
};

export default VerifyPage;
