import { UserType } from "./UserTypes";

export type CourseType = {
  id: string;
  userType: string;
  name: string;
  isVisible: boolean;
  image: string;
  description: string;
  text: string;
  required: string;
  duration: string;
  support: number;
  price: number;
  user?: UserType;
};
