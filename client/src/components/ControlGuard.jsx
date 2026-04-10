import { Tooltip } from "@mui/material";

function ControlGuard ({
    isLocked,
    isHost,
    message = "Disabled by host",
    children
}) {
    const disabled = isLocked && !isHost;

    return (
        <Tooltip title={disabled ? message : ""}>
            <span style={{ display: "inline-flex" }}>{children}</span>
        </Tooltip>
    );
};

export default ControlGuard;
