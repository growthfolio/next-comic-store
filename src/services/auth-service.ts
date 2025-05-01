
// User Interface (for frontend context/state)
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Auth Response Interface from API
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Represents user credentials for login.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Asynchronously logs in a user by calling the API.
 *
 * @param credentials The user's login credentials.
 * @returns A promise that resolves to authentication information upon successful login.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Calling login API...');
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        // Use message from API response if available, otherwise default
        throw new Error(data.message || `Login failed: ${response.statusText}`);
    }

    // Validate the structure of the response
    if (!data.token || !data.user) {
        throw new Error('Invalid response received from login API.');
    }

    return data as AuthResponse;
}

/**
 * Represents user registration information.
 */
export interface RegisterInfo {
  name: string;
  email: string;
  password: string;
}

/**
 * Asynchronously registers a new user by calling the API.
 *
 * @param registerInfo The user's registration information.
 * @returns A promise that resolves to authentication information upon successful registration.
 */
export async function register(registerInfo: RegisterInfo): Promise<AuthResponse> {
    console.log('Calling register API...');
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerInfo),
    });

    const data = await response.json();

    if (!response.ok) {
         // Use message from API response if available, otherwise default
        throw new Error(data.message || `Registration failed: ${response.statusText}`);
    }

    // Validate the structure of the response
    if (!data.token || !data.user) {
        throw new Error('Invalid response received from registration API.');
    }

    return data as AuthResponse;
}
