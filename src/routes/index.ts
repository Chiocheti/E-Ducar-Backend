import { Router } from "express";
import authAdmRoutes from "./auth.adm.router";
import authStudentRoutes from "./auth.student.router";
import collaboratorRoutes from "./collaborator.router";
import courseRoutes from "./course.router";
import registrationRoutes from "./registration.router";
import studentRoutes from "./student.router";
import ticketRoutes from "./ticket.router";
import userRoutes from "./user.router";

const router = Router();

router.use("/authAdm", authAdmRoutes);
router.use("/authStudent", authStudentRoutes);
router.use("/courses", courseRoutes);
router.use("/collaborators", collaboratorRoutes);
router.use("/registrations", registrationRoutes);
router.use("/students", studentRoutes);
router.use("/tickets", ticketRoutes);
router.use("/users", userRoutes);

export default router;
