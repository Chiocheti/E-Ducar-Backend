import { CourseType } from "./CourseTypes";

export type RegistrationType = {
  id: string;
  studentId: string;
  courseId: string;
  registerDate: string;
  conclusionDate: string;
  course?: CourseType;
};
