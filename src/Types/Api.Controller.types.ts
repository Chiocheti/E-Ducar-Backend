export type ExpectedApiResponse<T = unknown> = {
  success: boolean;
  data: T;
  error: string | null;
};