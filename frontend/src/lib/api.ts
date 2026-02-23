const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders(options: FetchOptions = {}): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (options.token) {
            headers['Authorization'] = `Bearer ${options.token}`;
        }

        return headers;
    }

    async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this.getHeaders(options);

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.request<{ success: boolean; data: { user: unknown; token: string } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(data: {
        email: string;
        password: string;
        role: string;
        firstName?: string;
        lastName?: string;
        company?: string;
    }) {
        return this.request<{ success: boolean; data: { user: unknown; token: string } }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMe(token: string) {
        return this.request<{ success: boolean; data: unknown }>('/auth/me', { token });
    }

    // User endpoints
    async getUser(id: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/users/${id}`, { token });
    }

    async updateUser(id: string, data: unknown, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    async uploadResume(userId: string, file: File, token: string) {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch(`${this.baseUrl}/users/${userId}/resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload resume');
        }
        return data;
    }

    async getUserApplications(userId: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/users/${userId}/applications`, { token });
    }

    async getRecommendations(userId: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/users/${userId}/recommendations`, { token });
    }

    // Job endpoints
    async getJobs(params: Record<string, unknown> = {}, token?: string) {
        const queryString = new URLSearchParams(params as Record<string, string>).toString();
        return this.request<{ success: boolean; data: unknown; pagination?: unknown }>(
            `/jobs${queryString ? `?${queryString}` : ''}`,
            { token }
        );
    }

    async getJob(id: string) {
        return this.request<{ success: boolean; data: unknown }>(`/jobs/${id}`);
    }

    async createJob(data: unknown, token: string) {
        return this.request<{ success: boolean; data: unknown }>('/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async updateJob(id: string, data: unknown, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    async deleteJob(id: string, token: string) {
        return this.request<{ success: boolean; message: string }>(`/jobs/${id}`, {
            method: 'DELETE',
            token,
        });
    }

    async getRecruiterJobs(token: string, params: Record<string, unknown> = {}) {
        const queryString = new URLSearchParams(params as Record<string, string>).toString();
        return this.request<{ success: boolean; data: unknown; pagination?: unknown }>(
            `/jobs/recruiter/my-jobs${queryString ? `?${queryString}` : ''}`,
            { token }
        );
    }

    // Application endpoints
    async applyToJob(data: { jobId: string; coverLetter?: string }, token: string) {
        return this.request<{ success: boolean; data: unknown }>('/applications', {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async getCandidateApplications(candidateId: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/applications/candidate/${candidateId}`, { token });
    }

    async getJobApplicants(jobId: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/applications/job/${jobId}`, { token });
    }

    async getRankedCandidates(jobId: string, token: string, params: Record<string, unknown> = {}) {
        const queryString = new URLSearchParams(params as Record<string, string>).toString();
        return this.request<{ success: boolean; data: unknown }>(
            `/applications/job/${jobId}/ranked${queryString ? `?${queryString}` : ''}`,
            { token }
        );
    }

    async updateApplication(id: string, data: unknown, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    // AI endpoints
    async matchResume(data: { resumeText: string; jobDescription: string; resumeSkills?: string[]; jobSkills?: string[] }, token: string) {
        return this.request<{ success: boolean; data: unknown }>('/ai/match', {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async extractSkills(text: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>('/ai/extract-skills', {
            method: 'POST',
            body: JSON.stringify({ text }),
            token,
        });
    }

    async getAIRecommendations(userId: string, token: string) {
        return this.request<{ success: boolean; data: unknown }>(`/ai/recommendations/${userId}`, { token });
    }
}

export const api = new ApiClient(API_URL);
export default api;
