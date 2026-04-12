import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RestoreIcon from "@mui/icons-material/Restore";
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import "../App.css";
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer';

import { Helmet } from "react-helmet-async";

function History() {

    const { getUserHistory, handleAuthError } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [isGuest, setIsGuest] = useState(false);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getUserHistory();
                console.log("History (history.jsx) : ", history);

                setMeetings(Array.isArray(history) ? history : []);
            } catch (error) {
                if (handleAuthError(error, "/history")) {
                    return;
                }

                if (error.response?.status === 403) {
                    setIsGuest(true);
                }

                console.log(error);
            }
        }

        fetchHistory();
    }, [getUserHistory, handleAuthError]);

    return (
        <>
            <Helmet>
                <title>Meeting History | Zimpeer</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1f2937 100%)",
                padding: 4,
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
            <Navbar />
            <Box
                sx={{
                    maxWidth: 900,
                    margin: "0 auto",
                    position: "relative",
                    zIndex: 1,
                    pt: { xs: 4, md: 6 },
                }}
            >

                {/* Content */}
                {(!Array.isArray(meetings) || meetings.length === 0) ? (
                    isGuest ? (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Card>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        py: 6,
                                        px: 4,
                                        textAlign: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: "0 8px 16px rgba(139, 92, 246, 0.3)",
                                        }}
                                    >
                                        <RestoreIcon sx={{ fontSize: 40, color: "white" }} />
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: "#f8fafc",
                                            fontWeight: 700,
                                        }}
                                    >
                                        Guest Mode Enabled
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#94a3b8",
                                            fontSize: "0.95rem",
                                            maxWidth: 300,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Sign in to view your meeting history and access all features
                                    </Typography>

                                    <Button
                                        onClick={() => routeTo("/auth", { state: { from: "/history" } })}
                                        sx={{
                                            mt: 3,
                                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                            boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
                                            "&:hover": {
                                                boxShadow: "0 12px 24px rgba(99, 102, 241, 0.4)",
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </Box>
                            </Card>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Card>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        py: 8,
                                        textAlign: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            background: "rgba(99, 102, 241, 0.1)",
                                            border: "2px solid rgba(99, 102, 241, 0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <RestoreIcon sx={{ fontSize: 40, color: "#6366f1" }} />
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: "#f8fafc",
                                            fontWeight: 700,
                                        }}
                                    >
                                        No Recent Meetings
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#94a3b8",
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        Your meeting history will appear here
                                    </Typography>
                                </Box>
                            </Card>
                        </Box>
                    )
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 3,
                        }}
                    >
                        {meetings.map(el => (
                            <Box
                                key={el._id}
                                sx={{
                                    background: "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(12px)",
                                    borderRadius: 3,
                                    padding: 3,
                                    border: "1px solid rgba(99, 102, 241, 0.2)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    "&:hover": {
                                        background: "rgba(99, 102, 241, 0.08)",
                                        border: "1px solid rgba(99, 102, 241, 0.4)",
                                        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)",
                                        transform: "translateY(-4px)",
                                    },
                                }}
                            >
                                {/* Meeting Info */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: "#f8fafc",
                                                fontSize: "1rem",
                                                fontWeight: 600,
                                                fontFamily: "monospace",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            {el.meetingCode}
                                        </Typography>

                                        <Tooltip title={navigator.clipboard ? "Copy code" : "Code"}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(el.meetingCode);
                                                }}
                                                sx={{
                                                    color: "#6366f1",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                                                    },
                                                }}
                                            >
                                                <FileCopyOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <Typography
                                        sx={{
                                            color: "#94a3b8",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        {new Date(el.time).toLocaleString()}
                                    </Typography>
                                </Box>

                                {el.isActive ? (
                                    <Button
                                        onClick={() => routeTo(`/room/${el.meetingCode}`)}
                                        sx={{
                                            ml: 3,
                                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                            py: 1.2,
                                            px: 3,
                                            fontSize: "0.875rem",
                                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                                            whiteSpace: "nowrap",
                                            "&:hover": {
                                                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)",
                                            },
                                            width: "auto",
                                            height: "auto",
                                        }}
                                    >
                                        <RestoreIcon sx={{ fontSize: 22, color: "#ffffff" }} />
                                        Join Again
                                    </Button>
                                ) : (
                                    <Box
                                        sx={{
                                            ml: 3,
                                            px: 2.25,
                                            py: 1.15,
                                            borderRadius: 999,
                                            border: "1px solid rgba(248, 113, 113, 0.35)",
                                            backgroundColor: "rgba(127, 29, 29, 0.22)",
                                            color: "#fca5a5",
                                            fontSize: "0.875rem",
                                            fontWeight: 700,
                                            letterSpacing: "0.02em",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Expired
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
        <Footer />
        </>
    );
}

export default History
