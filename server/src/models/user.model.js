import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        token: { type: String, unique: true },

        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
        verificationTokenExpires: { type: Date, required: true },
        lastVerificationSentAt: Date,

        resetPasswordToken: String,
        resetPasswordExpires: Date,
        resetPasswordRequestedAt: Date
    }
);

const User = mongoose.model("User", userSchema);

export { User };