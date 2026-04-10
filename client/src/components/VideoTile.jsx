import React, { useEffect, useRef } from "react";
import { IconButton, Tooltip } from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import styles from "../styles/videoMeet.module.css";

const hostActionSx = {
    position: "absolute",
    top: 10,
    color: "white",
    padding: 1,
    borderRadius: 2,
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
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
                style={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(15, 23, 42, 0.72)",
                    backdropFilter: "blur(10px)",
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    maxWidth: "70%",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    zIndex: 2,
                }}
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
                                left: 10,
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
                                right: 10,
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
