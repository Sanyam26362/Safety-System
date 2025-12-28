import express from "express";
import {
  reportIncident,
  getAllIncidents,
  confirmIncident,
  reportFakeIncident,
  updateIncident,
  getRecentIncidents
} from "../controllers/incident.controller.js";

import { upload } from "../config/cloudinary.js"; // ✅ ADD THIS

const router = express.Router();

// MEDIA UPLOAD ENABLED
router.post("/", upload.single("media"), reportIncident);

router.get("/", getAllIncidents);
router.get("/recent", getRecentIncidents);

router.post("/:id/confirm", confirmIncident);
router.post("/:id/fake", reportFakeIncident);
router.patch("/:id", updateIncident);

export default router;
