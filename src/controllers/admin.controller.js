import Incident from "../models/incident.model.js";
import AdminLog from "../models/adminLog.model.js";

//  DASHBOARD STATS
export const getStats = async (req, res) => {
  const total = await Incident.countDocuments();
  const pending = await Incident.countDocuments({ status: "PENDING" });
  const dispatched = await Incident.countDocuments({ status: "DISPATCHED" });
  const resolved = await Incident.countDocuments({ status: "RESOLVED" });

  res.json({
    total,
    pending,
    dispatched,
    resolved
  });
};

// ADMIN LOGS (LAST 1 HOUR)
export const getAdminLogs = async (req, res) => {
  const logs = await AdminLog.find({
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  }).sort({ createdAt: -1 });

  res.json(logs);
};
