const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Ensure URL has proper protocol for browser security
function normalizeApiUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

const NORMALIZED_API_URL = normalizeApiUrl(API_BASE_URL);
const UPLOAD_TIMEOUT = 5 * 60 * 1000; // 5 minutes for file upload
const DEFAULT_TIMEOUT = 30 * 1000; // 30 seconds for other requests

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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${NORMALIZED_API_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    // Log the request details for debugging
    console.log('Making API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      hasBody: !!config.body,
      bodyType: typeof config.body
    });

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, DEFAULT_TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      // Clear timeout if request completes
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Get response as text first to see what we actually get
        const responseText = await response.text();
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseText: responseText.substring(0, 500) // First 500 chars
        });

        let errorData: ErrorResponse = {};
        try {
          errorData = JSON.parse(responseText);
        } catch {
          console.error('Failed to parse error response as JSON');
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

      // Handle timeout specifically
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          'Request timed out. Please try again.',
          408
        );
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error. Please check your connection and try again.',
          0
        );
      }

      // Check for CORS-related errors
      if (error instanceof TypeError &&
          (error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError') ||
           error.message.includes('Cross-Origin'))) {
        throw new ApiError(
          'Unable to connect to the API. This might be a CORS configuration issue. Please contact support if the problem persists.',
          0
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        0
      );
    }
  }

  async uploadDocuments(cvFile: File, projectReportFile: File): Promise<UploadResponse> {
    console.log('=== Starting File Upload ===');
    console.log('CV File:', {
      name: cvFile.name,
      size: cvFile.size,
      type: cvFile.type,
      lastModified: cvFile.lastModified
    });
    console.log('Project File:', {
      name: projectReportFile.name,
      size: projectReportFile.size,
      type: projectReportFile.type,
      lastModified: projectReportFile.lastModified
    });

    // Check file extensions and names as fallback
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

    console.log('FormData entries count:', formData.getAll('cv').length, formData.getAll('project-report').length);
    console.log('Auth headers for upload:', this.getAuthHeaders());

    const url = `${API_BASE_URL}/upload`;
    console.log('Upload URL:', url);

    try {
      console.log('Making fetch request...');

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, UPLOAD_TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: this.getAuthHeaders(),
        // Don't set Content-Type header for FormData - let browser set it with boundary
      });

      // Clear timeout if request completes
      clearTimeout(timeoutId);

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Upload failed - Full error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseText: responseText
        });

        // Check for specific known errors
        if (responseText.includes('BatchEmbedContentsRequest.requests') || responseText.includes('at most 100 requests')) {
          throw new ApiError(
            'The document is too large or complex for processing. Try uploading a smaller document or split it into multiple parts.',
            response.status
          );
        }

        throw new ApiError(`Upload failed: ${response.status} ${response.statusText}`, response.status);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
    } catch (error: unknown) {
      console.error('Upload error:', error);

      // Handle timeout specifically
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
    return this.request<EvaluationResult>(`/status/${jobId}`);
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

  // Authentication methods
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signOut(): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>('/auth/sign-out', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: User; status: string }> {
    return this.request<{ user: User; status: string }>('/auth/me');
  }

  async getUserEvaluations(): Promise<EvaluationResult[]> {
    const response = await this.request<{jobs: EvaluationResult[]}>('/jobs');
    return response.jobs;
  }

  async getEvaluationById(evaluationId: string): Promise<EvaluationResult> {
    return this.request<EvaluationResult>(`/status/${evaluationId}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;