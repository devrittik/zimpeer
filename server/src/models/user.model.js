import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        token: { type: String, unique: true, sparse: true },

        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String, default: null },
        verificationTokenExpires: { type: Date, default: null },
        lastVerificationSentAt: Date,

        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
        resetPasswordRequestedAt: Date
    }
);

const User = mongoose.model("User", userSchema);

export { User };