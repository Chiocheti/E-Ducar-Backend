import { CourseType } from "./CourseTypes";

export type UserType = {
  id: string;
  username: string;
  name: string;
  isTeacher: boolean;
  image: string;
  courses?: CourseType[];
};
