import React, { useState } from "react";
import {
    Alert,
    Divider,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Snackbar,
    Tooltip,
} from "@mui/material";
import DangerousIcon from '@mui/icons-material/Dangerous';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const menuPaperSx = {
    mt: 1.5,
    borderRadius: 3,
    minWidth: 240,
    background: "rgba(15, 23, 42, 0.96)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(99, 102, 241, 0.22)",
    color: "#f8fafc",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
};

const menuItemSx = {
    borderRadius: 2,
    mx: 1,
    my: 0.5,
    minHeight: 44,
    "&:hover": {
        backgroundColor: "rgba(99, 102, 241, 0.14)",
    },
};

export default function HostControls({
    isHost,
    meetingLocked,
    audioLocked,
    videoLocked,
    chatEnabled,
    fileSendingEnabled,
    disabled,
    actionButtonSx,
    dangerButtonSx,
    onToggleMeetingLock,
    onToggleParticipantAudio,
    onToggleParticipantVideo,
    onToggleChat,
    onToggleFileSending,
    onEndMeetingForAll,
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    if (!isHost) {
        return null;
    }

    const menuOpen = Boolean(anchorEl);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const showFeedback = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleMenuAction = (action, successMessage) => {
        action();
        handleCloseMenu();
        showFeedback(successMessage);
    };

    return (
        <>
            <Tooltip title="End meeting for everyone">
                <span>
                    <IconButton
                        onClick={() => {
                            onEndMeetingForAll();
                            showFeedback("Meeting ended for all participants", "warning");
                        }}
                        disabled={disabled}
                        sx={dangerButtonSx}
                    >
                        <DangerousIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title="More host controls">
                <span>
                    <IconButton
                        onClick={handleOpenMenu}
                        disabled={disabled}
                        sx={actionButtonSx}
                    >
                        <MoreHorizIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                PaperProps={{ sx: menuPaperSx }}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <MenuItem
                    onClick={() =>
                        handleMenuAction(
                            onToggleMeetingLock,
                            meetingLocked ? "Meeting unlocked" : "Meeting locked"
                        )
                    }
                    sx={menuItemSx}
                >
                    <ListItemText
                        primary={meetingLocked ? "Unlock Meeting" : "Lock Meeting"}
                        secondary={meetingLocked ? "Allow new participants to join" : "Prevent new participants from joining"}
                        primaryTypographyProps={{ sx: { color: "#f8fafc", fontWeight: 600 } }}
                        secondaryTypographyProps={{ sx: { color: "rgba(226, 232, 240, 0.72)" } }}
                    />
                </MenuItem>

                <MenuItem
                    onClick={() =>
                        handleMenuAction(
                            onToggleParticipantAudio,
                            audioLocked ? "Participants can use audio again" : "Participants' audio disabled"
                        )
                    }
                    sx={menuItemSx}
                >
                    <ListItemText
                        primary={audioLocked ? "Enable participants' audio" : "Disable participants' audio"}
                        secondary={audioLocked ? "Let participants unmute again" : "Prevent participants from unmuting"}
                        primaryTypographyProps={{ sx: { color: "#f8fafc", fontWeight: 600 } }}
                        secondaryTypographyProps={{ sx: { color: "rgba(226, 232, 240, 0.72)" } }}
                    />
                </MenuItem>

                <MenuItem
                    onClick={() =>
                        handleMenuAction(
                            onToggleParticipantVideo,
                            videoLocked ? "Participants can use video again" : "Participants' video disabled"
                        )
                    }
                    sx={menuItemSx}
                >
                    <ListItemText
                        primary={videoLocked ? "Enable participants' video" : "Disable participants' video"}
                        secondary={videoLocked ? "Let participants turn cameras back on" : "Turn off participant cameras"}
                        primaryTypographyProps={{ sx: { color: "#f8fafc", fontWeight: 600 } }}
                        secondaryTypographyProps={{ sx: { color: "rgba(226, 232, 240, 0.72)" } }}
                    />
                </MenuItem>

                <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.12)", mx: 1 }} />

                <MenuItem
                    onClick={() =>
                        handleMenuAction(
                            onToggleChat,
                            chatEnabled ? "Chat disabled for participants" : "Chat enabled for participants"
                        )
                    }
                    sx={menuItemSx}
                >
                    <ListItemText
                        primary={chatEnabled ? "Disable chat" : "Enable chat"}
                        secondary={chatEnabled ? "Pause participant messaging" : "Allow chat again"}
                        primaryTypographyProps={{ sx: { color: "#f8fafc", fontWeight: 600 } }}
                        secondaryTypographyProps={{ sx: { color: "rgba(226, 232, 240, 0.72)" } }}
                    />
                </MenuItem>

                <MenuItem
                    onClick={() =>
                        handleMenuAction(
                            onToggleFileSending,
                            fileSendingEnabled ? "File sharing disabled for participants" : "File sharing enabled for participants"
                        )
                    }
                    disabled={!chatEnabled}
                    sx={menuItemSx}
                >
                    <ListItemText
                        primary={fileSendingEnabled ? "Disable file sending" : "Enable file sending"}
                        secondary={chatEnabled ? (fileSendingEnabled ? "Prevent participants from sharing files" : "Allow participants to share files again") : "Enable chat first to manage file sharing"}
                        primaryTypographyProps={{ sx: { color: "#f8fafc", fontWeight: 600 } }}
                        secondaryTypographyProps={{ sx: { color: "rgba(226, 232, 240, 0.72)" } }}
                    />
                </MenuItem>
            </Menu>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2600}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
