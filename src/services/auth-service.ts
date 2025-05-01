/**
 * Represents user authentication information.
 */
export interface AuthInfo {
  /**
   * The authentication token.
   */
  token: string;
}

/**
 * Represents user credentials for login.
 */
export interface LoginCredentials {
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's password.
   */
  password: string;
}

/**
 * Asynchronously logs in a user with the provided credentials.
 *
 * @param credentials The user's login credentials.
 * @returns A promise that resolves to authentication information upon successful login.
 */
export async function login(credentials: LoginCredentials): Promise<AuthInfo> {
  // TODO: Implement this by calling an API.

  return {
    token: 'test-token',
  };
}

/**
 * Represents user registration information.
 */
export interface RegisterInfo {
  /**
   * The user's name.
   */
  name: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's password.
   */
  password: string;
}

/**
 * Asynchronously registers a new user with the provided information.
 *
 * @param registerInfo The user's registration information.
 * @returns A promise that resolves to authentication information upon successful registration.
 */
export async function register(registerInfo: RegisterInfo): Promise<AuthInfo> {
  // TODO: Implement this by calling an API.

  return {
    token: 'test-token',
  };
}
