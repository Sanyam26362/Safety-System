import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  adminId: mongoose.Schema.Types.ObjectId,
  action: String,
  incidentId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model("AdminLog", adminLogSchema);
