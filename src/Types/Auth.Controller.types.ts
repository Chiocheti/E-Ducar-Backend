export type UserType = {
  id: string;
  username: string;
  name: string;
  isTeacher: boolean;
};

export type TokensType = {
  accessToken: string;
  refreshToken: string;
};

export type UserPlusToken = {
  user: UserType;
  tokens: TokensType;
}