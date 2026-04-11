import React, { useEffect, useRef } from "react";
import { IconButton, Tooltip } from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import styles from "../styles/videoMeet.module.css";

const hostActionSx = {
    position: "absolute",
    top: { xs: 8, sm: 10 },
    color: "white",
    width: { xs: 30, sm: 36 },
    height: { xs: 30, sm: 36 },
    padding: { xs: 0.7, sm: 1 },
    borderRadius: 2,
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
    "& .MuiSvgIcon-root": {
        fontSize: { xs: "0.9rem", sm: "1rem" },
    },
    "&:hover": {
        transform: "scale(1.08)",
    },
};

const VideoTile = React.memo(({ stream, user, isHost, onKick, onBlock }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={styles.videoTile}>
            <video ref={videoRef} autoPlay playsInline />

            <div
                className={styles.videoTileLabel}
                title={user?.displayName || "Participant"}
            >
                {user?.displayName || "Participant"}
            </div>

            {isHost && user?.id && (
                <>
                    <Tooltip title="Block participant">
                        <IconButton
                            onClick={() => onBlock(user.id, user.username)}
                            sx={{
                                ...hostActionSx,
                                left: 8,
                                backgroundColor: "rgba(220, 38, 38, 0.9)",
                                "&:hover": {
                                    ...hostActionSx["&:hover"],
                                    backgroundColor: "rgba(220, 38, 38, 1)",
                                },
                            }}
                        >
                            <BlockIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Kick participant">
                        <IconButton
                            onClick={() => onKick(user.id, user.username)}
                            sx={{
                                ...hostActionSx,
                                right: 8,
                                backgroundColor: "rgba(99, 102, 241, 0.9)",
                                "&:hover": {
                                    ...hostActionSx["&:hover"],
                                    backgroundColor: "rgba(99, 102, 241, 1)",
                                },
                            }}
                        >
                            <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </div>
    );
});

export default VideoTile;
