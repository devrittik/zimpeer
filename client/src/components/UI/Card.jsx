import { Box } from "@mui/material";

export default function Card({ children }) {
    return (
        <Box
            sx={{
                p: 3,
                borderRadius: 3,
                backdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                width: "100%",
                maxWidth: "420px",
                // maxHeight: "90vh",
                // overflowY: "auto",
            }}
        >
            {children}
        </Box>
    );
}