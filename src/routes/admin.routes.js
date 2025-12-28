import express from "express";
import {
  reportIncident,
  getAllIncidents,
  confirmIncident,
  reportFakeIncident
} from "../controllers/incident.controller.js";

import { upload } from "../config/cloudinary.js";

const router = express.Router();

// MEDIA UPLOAD ENABLED
router.post("/", upload.single("media"), reportIncident);

router.get("/", getAllIncidents);
router.post("/:id/confirm", confirmIncident);
router.post("/:id/fake", reportFakeIncident);

export default router;
