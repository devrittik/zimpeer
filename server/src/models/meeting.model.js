import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
  {
    meetingCode: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    blockedUsers: [{type: String}],
    participants:{ 
      type : [{
        username: String,
        joinedAt: { type: Date, default: Date.now },
        leftAt: Date,
      }],
      default: []
    },
    controls: {
      meetingLocked: { type: Boolean, default: false },
      audioLocked: { type: Boolean, default: false },
      videoLocked: { type: Boolean, default: false },
      chatLocked: { type: Boolean, default: false },
      fileLocked: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };
