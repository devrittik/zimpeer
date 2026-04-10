import { Button } from "@mui/material";

export default function CustomButton(props) {
    return (
        <Button
            fullWidth
            variant="contained"
            sx={{
                borderRadius: 2,
                py: 1.2,
                fontWeight: 600,
            }}
            {...props}
        />
    );
}