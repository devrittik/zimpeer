import { TextField } from "@mui/material";

export default function Input(props) {
    return (
        <TextField
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
                "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                },
            }}
            {...props}
        />
    );
}