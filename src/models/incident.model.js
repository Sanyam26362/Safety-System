import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    caller: {
      name: String,
      phone: String
    },

    type: {
      type: String,
      enum: [
        "POLICE",
        "FIRE",
        "ACCIDENT",
        "MEDICAL",
        "CRIME",
        "TRAFFIC",
        "UTILITY",
        "DISASTER",
        "OTHER"
      ],
      required: true
    },

    description: {
      type: String,
      required: true
    },

    peopleAffected: {
      type: Number,
      default: 0
    },

    coordinates: {
      lat: Number,
      lng: Number
    },

    // 📷 MEDIA URL FROM CLOUDINARY
    mediaUrl: {
      type: String
    },

    // COMMUNITY VERIFICATION
    confirmCount: { type: Number, default: 0 },
    fakeCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["PENDING", "DISPATCHED", "RESOLVED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);



export default mongoose.model("Incident", incidentSchema);
