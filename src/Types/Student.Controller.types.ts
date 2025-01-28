export type StudentType = {
  id: string;
  email: string;
  name: string;
  phone: string;
  image: string,
};

export type TokensType = {
  accessToken: string;
  refreshToken: string;
};

export type StudentPlusToken = {
  student: StudentType;
  tokens: TokensType;
}