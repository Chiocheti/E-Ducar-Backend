// export type ExpectedApiResponse<T = unknown> = {
//   success: boolean;
//   type: number; // 0 - Sucesso | 1 - Erro Interno | 2 - Erro de Tipagem | 3 - Outro erro
//   data: T;
// };

export type ExpectedApiResponse = {
  success: boolean;
  type: number; // 0 - Sucesso | 1 - Erro Interno | 2 - Erro de Tipagem | 3 - Outro erro
  data: string;
};