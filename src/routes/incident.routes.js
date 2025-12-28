import express from "express";
import {
  reportIncident,
  getAllIncidents,
  confirmIncident,
  reportFakeIncident,
  updateIncident
} from "../controllers/incident.controller.js";

const router = express.Router();

router.post("/", reportIncident);
router.get("/", getAllIncidents);

router.post("/:id/confirm", confirmIncident);
router.post("/:id/fake", reportFakeIncident);

router.patch("/:id", updateIncident);

export default router;
