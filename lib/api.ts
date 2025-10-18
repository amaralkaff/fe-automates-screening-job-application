// Use relative URLs for Netlify proxy, fallback to absolute for local development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

const isBrowser = typeof window !== 'undefined';
const supportsFetch = isBrowser && typeof fetch !== 'undefined';

async function enhancedFetch(url: string, options: RequestInit): Promise<Response> {
  if (!supportsFetch) {
    throw new Error('Your browser does not support fetch API. Please upgrade your browser.');
  }

  const enhancedOptions: RequestInit = {
    ...options,
    cache: 'no-cache',
    redirect: 'follow',
  };

  try {
    return await fetch(url, enhancedOptions);
  } catch {
    const minimalOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: options.body,
    };

    return await fetch(url, minimalOptions);
  }
}

// Ensure URL has proper protocol for browser security
function normalizeApiUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

// Enhanced connectivity check with fallback and better error handling
async function checkApiConnectivity(url: string): Promise<boolean> {
  if (url.includes('https://') && !url.includes('localhost')) {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return url.includes('localhost') ? false : true;
  }
}

const NORMALIZED_API_URL = API_BASE_URL ? normalizeApiUrl(API_BASE_URL) : '';
const UPLOAD_TIMEOUT = 5 * 60 * 1000;
const DEFAULT_TIMEOUT = 60 * 1000;

// Authentication types
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  sessionToken: string;
  status: string;
}

export interface UploadResponse {
  cvDocumentId: string;
  projectReportId: string;
  message: string;
}

export interface EvaluationRequest {
  jobTitle: string;
  cvDocumentId: string;
  projectReportId: string;
}

export interface EvaluationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
}

export interface EvaluationResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    cvEvaluation: {
      technicalSkillsMatch: {
        score: number;
        details: string;
      };
      experienceLevel: {
        score: number;
        details: string;
      };
      relevantAchievements: {
        score: number;
        details: string;
      };
      culturalFit: {
        score: number;
        details: string;
      };
    };
    projectEvaluation: {
      correctness: {
        score: number;
        details: string;
      };
      codeQuality: {
        score: number;
        details: string;
      };
      resilience: {
        score: number;
        details: string;
      };
      documentation: {
        score: number;
        details: string;
      };
      creativity: {
        score: number;
        details: string;
      };
    };
    overallSummary: string;
    finalScore: {
      cvScore: number;
      projectScore: number;
      overallScore: number;
    };
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
  details?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public code?: string;

  constructor(
    message: string,
    public status: number,
    public response?: ErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';

    // Set error code based on response or status
    if (response?.error) {
      if (response.error.includes('Too many evaluation requests') || response.error.includes('rate limit')) {
        this.code = 'RATE_LIMIT_EXCEEDED';
      } else if (response.error.includes('evaluation requests')) {
        this.code = 'EVALUATION_LIMIT';
      }
    }

    if (status === 429) {
      this.code = 'RATE_LIMIT_EXCEEDED';
    }
  }

  isRateLimitError(): boolean {
    return this.code === 'RATE_LIMIT_EXCEEDED' || this.code === 'EVALUATION_LIMIT';
  }

  getRateLimitInfo(): { limit: number; period: string } | null {
    if (this.isRateLimitError()) {
      const details = this.response?.details || '';
      const limitMatch = details.match(/(\d+)\s+evaluation\s+tests?\s+per\s+(\w+)/i);
      if (limitMatch) {
        return {
          limit: parseInt(limitMatch[1]),
          period: limitMatch[2].toLowerCase()
        };
      }
    }
    return null;
  }
}

class ApiClient {
  private authToken: string | null = null;
  private hasConnectivityBeenChecked = false;

  constructor(authToken: string | null = null) {
    this.authToken = authToken;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${NORMALIZED_API_URL}${endpoint}`;
    const maxRetries = 2; // Allow up to 2 retries

    // Skip connectivity check for production APIs to avoid CORS issues
    const isProductionApi = !NORMALIZED_API_URL.includes('localhost') &&
      (typeof window !== 'undefined' ?
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1') :
        false);
    const isAuthRequest = endpoint.includes('/auth/');
    const shouldCheckConnectivity = isAuthRequest && !this.hasConnectivityBeenChecked && !isProductionApi;

    if (shouldCheckConnectivity) {
      const isReachable = await checkApiConnectivity(NORMALIZED_API_URL);
      if (!isReachable) {
        console.error('🚫 API server is unreachable:', NORMALIZED_API_URL);
        throw new ApiError(
          'Unable to connect to the server. Please check your internet connection and try again. If the problem persists, please contact support.',
          0
        );
      }
      this.hasConnectivityBeenChecked = true;
    }

    let config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    if (isProductionApi) {
      config = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        body: options.body,
        mode: 'cors',
        credentials: 'omit',
      };
      
      if (config.method === 'GET') {
        delete config.body;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await enhancedFetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseText = await response.text();
        let errorData: ErrorResponse = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {
          // Failed to parse error response as JSON
        }

        throw new ApiError(
          errorData.error || errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timed out. Please try again.', 408);
      }

      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        if (isProductionApi) {
          try {
            const minimalResponse = await fetch(url, {
              method: options.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: options.body,
            });

            if (!minimalResponse.ok) {
              const responseText = await minimalResponse.text();
              let errorData: ErrorResponse = {};
              try {
                errorData = JSON.parse(responseText);
              } catch {
                // Failed to parse error response as JSON
              }

              throw new ApiError(
                errorData.error || errorData.message || `HTTP error! status: ${minimalResponse.status}`,
                minimalResponse.status,
                errorData
              );
            }

            return await minimalResponse.json();
          } catch {
            throw new ApiError(
              'Unable to connect to the server. This appears to be a browser security restriction. Please try:\n1. Refresh the page\n2. Check if your browser is blocking cross-origin requests\n3. Contact support if the problem persists',
              0
            );
          }
        } else {
          throw new ApiError(
            'Network error. Please check your internet connection and ensure the server is running.',
            0
          );
        }
      }

      if (error instanceof TypeError &&
          (error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError') ||
           error.message.includes('Cross-Origin') ||
           error.message.includes('blocked by CORS policy'))) {
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        if (isProductionApi) {
          throw new ApiError(
            'Unable to connect to the server. This appears to be a network connectivity issue. Please:\n1. Check your internet connection\n2. Try refreshing the page\n3. If the problem persists, contact support',
            0
          );
        } else {
          throw new ApiError(
            'Network connection issue detected. This could be due to CORS configuration. Please:\n1. Ensure the backend server is running\n2. Check CORS configuration on the server\n3. Verify the API URL is correct',
            0
          );
        }
      }

      if (retryCount < maxRetries && (
        error instanceof TypeError && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('fetch')
        )
      )) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        0
      );
    }
  }

  async uploadDocuments(cvFile: File, projectReportFile: File): Promise<UploadResponse> {
    const cvName = cvFile.name.toLowerCase();
    const projectName = projectReportFile.name.toLowerCase();

    if (!cvName.endsWith('.pdf')) {
      throw new Error(`CV file must have .pdf extension, got: ${cvFile.name}`);
    }
    if (!projectName.endsWith('.pdf')) {
      throw new Error(`Project file must have .pdf extension, got: ${projectReportFile.name}`);
    }

    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('project-report', projectReportFile);

    const url = `${API_BASE_URL}/upload`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: this.getAuthHeaders(),
        mode: 'cors',
        credentials: 'same-origin',
        referrerPolicy: 'no-referrer-when-downgrade',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseText = await response.text();

        if (responseText.includes('BatchEmbedContentsRequest.requests') || responseText.includes('at most 100 requests')) {
          throw new ApiError(
            'The document is too large or complex for processing. Try uploading a smaller document or split it into multiple parts.',
            response.status
          );
        }

        throw new ApiError(`Upload failed: ${response.status} ${response.statusText}`, response.status);
      }

      const result = await response.json();
      return result;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          'Upload is taking too long. The document may be too large or complex. Try uploading a smaller document.',
          408
        );
      }

      throw error;
    }
  }

  async triggerEvaluation(data: EvaluationRequest): Promise<EvaluationResponse> {
    return this.request<EvaluationResponse>('/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJobStatus(jobId: string): Promise<EvaluationResult> {
    return this.request<EvaluationResult>(`/api/status/${jobId}`);
  }

  async pollJobStatus(
    jobId: string,
    onUpdate: (result: EvaluationResult) => void,
    interval: number = 2000
  ): Promise<EvaluationResult> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await this.getJobStatus(jobId);
          onUpdate(result);

          if (result.status === 'completed') {
            resolve(result);
          } else if (result.status === 'failed') {
            reject(new ApiError('Evaluation failed', 500, { error: result.error || 'Evaluation failed' }));
          } else {
            setTimeout(poll, interval);
          }
        } catch (error: unknown) {
          reject(error);
        }
      };

      poll();
    });
  }

  // Authentication methods (Backend API compatible)
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signOut(): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>('/api/auth/sign-out', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: User; status: string }> {
    return this.request<{ user: User; status: string }>('/api/auth/me');
  }

  async getUserEvaluations(): Promise<EvaluationResult[]> {
    const response = await this.request<{jobs: EvaluationResult[]}>('/api/jobs');
    return response.jobs;
  }

  async getEvaluationById(evaluationId: string): Promise<EvaluationResult> {
    return this.request<EvaluationResult>(`/api/status/${evaluationId}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;