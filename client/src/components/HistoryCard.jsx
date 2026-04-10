import { Card, CardContent, Typography, Button, Tooltip } from "@mui/material";
import {IconButton} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import { useState } from "react";

function HistoryCard({ meetingCode, time, onJoin }) {

    const formattedTime = new Date(time).toLocaleString();

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(meetingCode);
        setCopied(true);

        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Card
            variant="outlined"
            sx={{
                marginBottom: 2,
                borderRadius: 3,
                padding: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <CardContent>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Typography variant="body1">
                        {meetingCode}
                    </Typography>

                    <Tooltip title={copied ? "Copied!" : "Copy code"}>
                        <IconButton size="small" onClick={handleCopy}>
                            <FileCopyOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>

                <Typography variant="body2" color="text.secondary">
                    {formattedTime}
                </Typography>
            </CardContent>

            <Button variant="contained" startIcon={<RestoreIcon />} onClick={onJoin}>
                Join Again
            </Button>
        </Card>
    );
}

export default HistoryCard;