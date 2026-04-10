// Username validation
export const validateUsername = (username) => {
    const errors = [];
    
    if (!username) {
        errors.push("Username is required");
        return errors;
    }

    if (username.length < 3 || username.length > 20) {
        errors.push("Username must be 3-20 characters");
    }

    // Allow only letters, numbers, underscore, and dot
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
        errors.push("Username can only contain letters, numbers, underscores, and dots");
    }

    return errors;
};

// Password validation
export const validatePassword = (password) => {
    const errors = [];
    
    if (!password) {
        errors.push("Password is required");
        return errors;
    }

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    return errors;
};

// treat . as empty
export const normalizeUsername = (username) => {
    return username.toLowerCase().replace(/\./g, "");
};
