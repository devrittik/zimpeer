import { Box } from "@mui/material";

export default function PageWrapper({ children }) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            }}
        >
            {children}
        </Box>
    );
}