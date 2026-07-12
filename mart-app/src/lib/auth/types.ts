export type AuthError =
  | "EMAIL_EXISTS"
  | "EMAIL_NOT_FOUND"
  | "PASSWORD_WEAK"
  | "PASSWORD_MISMATCH"
  | "INVALID"
  | "CREATE_FAILED"
  | "CODE_INVALID";

export interface AuthResult {
  success: boolean;
  error?: string;
}
