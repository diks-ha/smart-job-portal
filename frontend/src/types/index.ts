export type UserRole = 'jobseeker' | 'recruiter' | 'admin';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    profile: UserProfile;
    resume?: Resume;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    company?: string;
    website?: string;
    skills?: string[];
    experience?: Experience[];
    education?: Education[];
}

export interface Experience {
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

export interface Education {
    institution: string;
    degree: string;
    field?: string;
    graduationDate?: string;
}

export interface Resume {
    url: string;
    text?: string;
    skills?: string[];
    uploadedAt: string;
}

export interface Job {
    _id: string;
    recruiterId: string | User;
    title: string;
    company: string;
    companyLogo?: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    location?: string;
    type: JobType;
    salary?: Salary;
    skills?: string[];
    experienceLevel?: ExperienceLevel;
    status: JobStatus;
    applicantCount: number;
    views: number;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'active' | 'closed' | 'draft';

export interface Salary {
    min?: number;
    max?: number;
    currency: string;
    period?: 'hourly' | 'monthly' | 'yearly';
}

export interface Application {
    _id: string;
    jobId: string | Job;
    candidateId: string | User;
    recruiterId: string | User;
    status: ApplicationStatus;
    matchScore: number;
    coverLetter?: string;
    resumeUrl?: string;
    notes?: string;
    timeline?: ApplicationTimeline[];
    createdAt: string;
    updatedAt: string;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';

export interface ApplicationTimeline {
    status: ApplicationStatus;
    date: string;
    note?: string;
}

export interface JobRecommendation {
    job: Job;
    score: number;
    matchedSkills?: string[];
    reason?: string;
}

export interface CandidateRanking {
    application: Application;
    candidate: User;
    matchDetails: {
        score: number;
        skillsMatch: number;
        experience: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    pagination?: Pagination;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    company?: string;
}
