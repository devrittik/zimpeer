import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Box, Typography } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext.jsx";
import Card from "../components/UI/Card.jsx";
import Button from "../components/UI/Button.jsx";
import Input from "../components/UI/Input.jsx";

function HomeComponent() {
    let router = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [showWarning, setShowWarning] = useState("");
    const { createMeeting, user } = useContext(AuthContext);

    const handleCreateMeeting = async () => {
        if (user.isGuest) {
            setShowWarning(true);
            return;
        }

        await createMeeting();
    };

    return (
        <>
            <Navbar />

            <Box
                sx={{
                    minHeight: "calc(100vh - 64px)",
                    px: { xs: 1.5, sm: 2, md: 4 },
                    pb: { xs: 3, md: 4 },
                    pt: { xs: 0, md: 1 },
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
                        background:
                            "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                        pointerEvents: "none",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: { xs: 2, md: 8 },
                        maxWidth: 1400,
                        mx: "auto",
                        flexWrap: { xs: "wrap", md: "nowrap" },
                        py: { xs: 0, md: 2 },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 3,
                            flex: 1,
                            mt: { xs: 2, md: 0 },
                            minWidth: { xs: "90%", md: "400px" },
                            py: { xs: 2, md: 0 },
                        }}
                    >
                        <Card sx={{
                            width: "100%",
                            maxWidth: { xs: 420, md: 400 },
                            mx: "auto",
                            my: { xs: 1, md: 0 },
                            overflow: "hidden",
                        }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                    maxWidth: 400,
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        textAlign: "center",
                                        mb: 1,
                                        fontSize: { xs: "2rem", sm: "2.4rem", md: "2rem" },
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Quality Video Meetings
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "#94a3b8",
                                        fontSize: "0.95rem",
                                        textAlign: "center",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Join meetings with a code or start a new one instantly
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <Typography
                                        sx={{
                                            color: "#cbd5e1",
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        Join a Meeting
                                    </Typography>

                                    <Input
                                        value={meetingCode}
                                        onChange={(e) => setMeetingCode(e.target.value)}
                                        id="meetingCode"
                                        label="Meeting Code"
                                        placeholder="Enter meeting code"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
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

                                    <Button
                                        onClick={() => {
                                            router(`/room/${meetingCode}`);
                                        }}
                                        sx={{
                                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                            py: { xs: 1, md: 1.3 },
                                            fontSize: { xs: "0.9rem", md: "1rem" },
                                            boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
                                            "&:hover": {
                                                boxShadow: "0 12px 24px rgba(99, 102, 241, 0.4)",
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        Join Meeting
                                    </Button>
                                </Box>

                                <Box
                                    sx={{
                                        height: 1,
                                        background: "rgba(148, 163, 184, 0.2)",
                                        my: 0,
                                    }}
                                />

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <Typography
                                        sx={{
                                            color: "#cbd5e1",
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        Create New Meeting
                                    </Typography>

                                    <Button
                                        onClick={handleCreateMeeting}
                                        sx={{
                                            background: "linear-gradient(to right, #22c55e, #16a34a)",
                                            py: { xs: 1, md: 1.3 },
                                            fontSize: { xs: "0.9rem", md: "1rem" },
                                            boxShadow: "0 8px 16px rgba(34, 197, 94, 0.3)",
                                            "&:hover": {
                                                boxShadow: "0 12px 24px rgba(34, 197, 94, 0.4)",
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        Start New Meeting
                                    </Button>

                                    {showWarning && (
                                        <Box
                                            role="alert"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                px: 1.5,
                                                py: 1.25,
                                                borderRadius: 2,
                                                border: "1px solid rgba(245, 158, 11, 0.45)",
                                                backgroundColor: "rgba(251, 191, 36, 0.16)",
                                                color: "#fde68a",
                                            }}
                                        >
                                            <Box component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
                                                {"\u26A0\uFE0F"}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.9rem",
                                                    fontWeight: 500,
                                                    lineHeight: 1.5,
                                                    color: "inherit",
                                                }}
                                            >
                                                Log In to create a meeting
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    </Box>

                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                        }}
                    >
                        <Box
                            component="img"
                            alt="Video meeting illustration"
                            src="/home.png"
                            sx={{
                                width: "100%",
                                maxWidth: "400px",
                                height: "auto",
                                borderRadius: 3,
                                boxShadow: "0 20px 60px rgba(99, 102, 241, 0.2)",
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <Footer />
        </>
    );
}

export default HomeComponent;
