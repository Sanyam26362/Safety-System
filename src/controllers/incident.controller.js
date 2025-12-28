import Incident from "../models/incident.model.js";
import { io } from "../server.js";
import fetch from "node-fetch";
import axios from "axios";
const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/drdkrikpk/image/upload/v1766937435/default.png";

// export const reportIncident = async (req, res) => {
//   try {
//     const {
//       caller,
//       type,
//       description,
//       peopleAffected,
//       coordinates
//     } = req.body;

//     if (!type || !description) {
//       return res.status(400).json({
//         message: "Type and description are required"
//       });
//     }

//     const mediaUrl = req.file ? req.file.path : null;

//     const incident = await Incident.create({
//       caller: caller ? JSON.parse(caller) : undefined,
//       type,
//       description,
//       peopleAffected,
//       coordinates: coordinates ? JSON.parse(coordinates) : undefined,
//       mediaUrl
//     });

//     io.emit("new_incident", incident);

//     res.status(201).json(incident);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to report incident",
//       error: error.message
//     });
//   }
// };


export const getAllIncidents = async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json(incidents);
};


export const confirmIncident = async (req, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: "Not found" });

  incident.confirmCount += 1;
  if (incident.confirmCount >= 2) incident.isVerified = true;

  await incident.save();
  io.emit("incident_updated", incident);

  res.json(incident);
};


export const reportFakeIncident = async (req, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: "Not found" });

  incident.fakeCount += 1;
  await incident.save();

  io.emit("incident_updated", incident);
  res.json(incident);
};

export const updateIncident = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    io.emit("incident_updated", incident);
    res.json(incident);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update incident"
    });
  }
};

export const getRecentIncidents = async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 30;

    const sinceTime = new Date(
      Date.now() - minutes * 60 * 1000
    );

    const incidents = await Incident.find({
      createdAt: { $gte: sinceTime }
    })
      .select(
        "type description coordinates mediaUrl createdAt"
      )
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recent incidents"
    });
  }
};
export const checkDuplicateIncident = async (req, res) => {
  try {
    const incidentId = req.params.id;

    const newIncident = await Incident.findById(incidentId).lean();
    if (!newIncident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // 🚨 NEW INCIDENT MUST HAVE COORDINATES
    if (
      !newIncident.coordinates ||
      newIncident.coordinates.lat == null ||
      newIncident.coordinates.lng == null
    ) {
      return res.status(400).json({
        message: "Incident lacks coordinates, duplicate check not possible"
      });
    }

    const sinceTime = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentIncidents = await Incident.find({
      _id: { $ne: incidentId },
      createdAt: { $gte: sinceTime },
      "coordinates.lat": { $exists: true },
      "coordinates.lng": { $exists: true }
    }).lean();

    if (recentIncidents.length === 0) {
      return res.json({
        incidentId,
        possibleDuplicate: false,
        confidenceScore: 0,
        confidenceLabel: "LOW",
        matches: [],
        reason: "No recent incidents with coordinates"
      });
    }

    const payload = {
      newIncident: {
        id: newIncident._id.toString(),
        type: newIncident.type,
        description: newIncident.description,
        peopleAffected: newIncident.peopleAffected || 0,
        coordinates: newIncident.coordinates,
        isVerified: Boolean(newIncident.isVerified),
        createdAt: newIncident.createdAt
      },
      existingIncidents: recentIncidents.map(i => ({
        id: i._id.toString(),
        type: i.type,
        description: i.description,
        peopleAffected: i.peopleAffected || 0,
        coordinates: i.coordinates,
        isVerified: Boolean(i.isVerified),
        createdAt: i.createdAt
      }))
    };

    console.log("📦 ML PAYLOAD:", JSON.stringify(payload, null, 2));

    const mlResponse = await axios.post(
      "https://sampark-jqtg.onrender.com/detect-duplicate",
      payload,
      { timeout: 20000 }
    );

    return res.json({
      incidentId,
      ...mlResponse.data
    });

  } catch (err) {
    console.error("❌ Duplicate check error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Duplicate check failed",
      error: err.message
    });
  }
};
export const reportIncident = async (req, res) => {
  try {
    const {
      caller,
      type,
      description,
      peopleAffected,
      coordinates
    } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        message: "Type and description are required"
      });
    }

    // ✅ DEFAULT IMAGE FALLBACK
    const mediaUrl = req.file
      ? req.file.path
      : DEFAULT_IMAGE_URL;

    const incident = await Incident.create({
      caller: caller ? JSON.parse(caller) : undefined,
      type,
      description,
      peopleAffected,
      coordinates: coordinates ? JSON.parse(coordinates) : undefined,
      mediaUrl
    });

    // socket emit is now SAFE
    io.emit("new_incident", incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({
      message: "Failed to report incident",
      error: error.message
    });
  }
};



