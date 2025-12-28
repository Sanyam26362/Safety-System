import mongoose from "mongoose";

const upvoteSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  incidentId: mongoose.Schema.Types.ObjectId
});

upvoteSchema.index({ userId: 1, incidentId: 1 }, { unique: true });

export default mongoose.model("Upvote", upvoteSchema);
