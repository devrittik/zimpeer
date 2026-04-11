import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import RestoreIcon from "@mui/icons-material/Restore";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useContext } from "react";
import logo from "../logo.svg";

function Navbar() {
    const router = useNavigate();
    const location = useLocation();
    const { user, handleLogout } = useContext(AuthContext);
    const authFrom = `${location.pathname}${location.search}`;
    const authMode = new URLSearchParams(location.search).get("mode") || "login";

    const goToAuth = (mode) => {
        router(`/auth?mode=${mode}`, {
            state: { from: location.pathname === "/auth" ? "/home" : authFrom }
        });
    };

    const isCurrentPath = (path) => location.pathname === path;

    const navActions = !user.isGuest
        ? [
            {
                key: "home",
                label: "Home",
                icon: <HomeRoundedIcon />,
                hidden: isCurrentPath("/home"),
                onClick: () => router("/home"),
            },
            {
                key: "history",
                label: "History",
                icon: <RestoreIcon />,
                hidden: isCurrentPath("/history"),
                onClick: () => router("/history"),
            },
            {
                key: "logout",
                label: "Logout",
                icon: <LogoutRoundedIcon />,
                hidden: false,
                onClick: handleLogout,
            },
        ]
        : [
            {
                key: "home",
                label: "Home",
                icon: <HomeRoundedIcon />,
                hidden: isCurrentPath("/home"),
                onClick: () => router("/home"),
            },
            {
                key: "login",
                label: "Login",
                icon: <LoginRoundedIcon />,
                hidden: isCurrentPath("/auth") && authMode === "login",
                onClick: () => goToAuth("login"),
            },
            {
                key: "register",
                label: "Register",
                icon: <AppRegistrationRoundedIcon />,
                hidden: isCurrentPath("/auth") && authMode === "register",
                onClick: () => goToAuth("register"),
            },
        ];

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    top: 0,
                    zIndex: (theme) => theme.zIndex.appBar,
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    width: '100%'
                }}
            >
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        minHeight: { xs: 60, sm: 68 },
                        px: { xs: 1.5, sm: 2, md: 3 },
                        gap: 1.25,
                    }}
                >

                    <Typography
                        sx={{ cursor: "pointer" }}
                        onClick={() => router("/")}
                    >
                        <img src={logo} alt="Zimpeer" className="logo"
                            style={{
                                height: "clamp(30px, 6vw, 38px)",
                                width: "auto",
                                display: "block",
                            }}
                        />
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.35, sm: 0.6, md: 0.75 } }}>
                        {navActions
                            .filter((action) => !action.hidden)
                            .map((action) => (
                                <Tooltip key={action.key} title={action.label}>
                                    <IconButton
                                        color="inherit"
                                        aria-label={action.label}
                                        onClick={action.onClick}
                                        sx={{
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            backgroundColor: "rgba(255,255,255,0.04)",
                                            width: { xs: 38, sm: 42, md: 46 },
                                            height: { xs: 38, sm: 42, md: 46 },
                                            padding: { xs: 0.7, sm: 0.9, md: 1 },
                                            transition: "all 0.2s ease",
                                            "& .MuiSvgIcon-root": {
                                                fontSize: { xs: "1.15rem", sm: "1.3rem", md: "1.45rem" },
                                            },
                                            "&:hover": {
                                                backgroundColor: "rgba(255,255,255,0.12)",
                                                transform: "translateY(-1px)",
                                            },
                                        }}
                                    >
                                        {action.icon}
                                    </IconButton>
                                </Tooltip>
                            ))}
                    </Box>

                </Toolbar>
            </AppBar>
            <Toolbar sx={{ minHeight: { xs: 60, sm: 68 } }} />
        </>
    );
}

export default Navbar;
