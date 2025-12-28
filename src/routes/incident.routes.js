import express from "express";
import {
  reportIncident,
  getAllIncidents,
  confirmIncident,
  reportFakeIncident,
  updateIncident,
  getRecentIncidents,
  checkDuplicateIncident
} from "../controllers/incident.controller.js";

import { upload } from "../config/cloudinary.js"; 

const router = express.Router();

router.post("/", upload.single("media"), reportIncident);

router.get("/", getAllIncidents);
router.get("/recent", getRecentIncidents);

router.post("/:id/confirm", confirmIncident);
router.post("/:id/fake", reportFakeIncident);
router.patch("/:id", updateIncident);
router.post("/:id/check-duplicate", checkDuplicateIncident);

export default router;
