import Incident from "../models/incident.model.js";
import { io } from "../server.js";
import fetch from "node-fetch";

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

    const mediaUrl = req.file ? req.file.path : null;

    const incident = await Incident.create({
      caller: caller ? JSON.parse(caller) : undefined,
      type,
      description,
      peopleAffected,
      coordinates: coordinates ? JSON.parse(coordinates) : undefined,
      mediaUrl
    });

    io.emit("new_incident", incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({
      message: "Failed to report incident",
      error: error.message
    });
  }
};


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
    const { id } = req.params;

    const incident = await Incident.findById(id);

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    const payload = {
      incident: {
        id: incident._id,
        type: incident.type,
        description: incident.description,
        coordinates: incident.coordinates,
        mediaUrl: incident.mediaUrl,
        createdAt: incident.createdAt
      }
    };

    const mlResponse = await fetch(
      "https://sampark-jqtg.onrender.com/detect-duplicate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!mlResponse.ok) {
      throw new Error("ML service failed");
    }

    const mlResult = await mlResponse.json();

    // 4️⃣ Return ML result to frontend
    res.json({
      incidentId: id,
      possibleDuplicate: mlResult.possibleDuplicate,
      confidenceScore: mlResult.confidenceScore,
      confidenceLabel: mlResult.confidenceLabel,
      matches: mlResult.matches
    });

  } catch (error) {
    res.status(500).json({
      message: "Duplicate check failed",
      error: error.message
    });
  }
};
