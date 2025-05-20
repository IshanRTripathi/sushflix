export interface FormData {
  username: string;
  email: string;
  password: string;
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}