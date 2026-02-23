'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    DollarSign,
    Filter,
    X
} from 'lucide-react';

const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

function JobsContent() {
    const searchParams = useSearchParams();
    const { token, user } = useAuthStore();

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        location: searchParams.get('location') || '',
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.type) params.append('type', filters.type);
                if (filters.location) params.append('location', filters.location);
                params.append('status', 'active');

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/jobs?${params.toString()}`
                );
                const data = await res.json();

                if (data.success) {
                    setJobs(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: '', type: '', location: '' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Find Jobs</h1>
                    <p className="text-slate-600 mt-1">
                        Browse {jobs.length} available positions
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search jobs by title, company, or keywords..."
                            value={filters.search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:w-auto"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {(filters.type || filters.location) && (
                            <Badge variant="secondary" className="ml-2">
                                {(filters.type ? 1 : 0) + (filters.location ? 1 : 0)}
                            </Badge>
                        )}
                    </Button>
                </div>

                {showFilters && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Job Type
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('type', e.target.value)}
                                        className="w-full h-10 rounded-lg border border-input bg-background px-3"
                                    >
                                        <option value="">All Types</option>
                                        {jobTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Location
                                    </label>
                                    <Input
                                        placeholder="City or region"
                                        value={filters.location}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('location', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button variant="ghost" onClick={clearFilters} className="w-full">
                                        <X className="h-4 w-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Jobs List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : jobs.length > 0 ? (
                <div className="space-y-4">
                    {jobs.map((job: any) => (
                        <Link key={job._id} href={`/jobs/${job._id}`}>
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all job-card cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-slate-600">{job.company}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                                                {job.location && (
                                                    <span className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {job.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <Briefcase className="h-4 w-4 mr-1" />
                                                    {job.type}
                                                </span>
                                                {job.salary?.min && job.salary?.max && (
                                                    <span className="flex items-center">
                                                        <DollarSign className="h-4 w-4 mr-1" />
                                                        {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {job.skills && job.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {job.skills.slice(0, 5).map((skill: string) => (
                                                        <Badge key={skill} variant="secondary">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {job.skills.length > 5 && (
                                                        <Badge variant="outline">
                                                            +{job.skills.length - 5} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                                                {job.status}
                                            </Badge>
                                            <p className="text-sm text-slate-500">
                                                {job.applicantCount} applicants
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
                        <p className="text-slate-600 mb-4">
                            Try adjusting your search or filters to find more opportunities.
                        </p>
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function JobsLoading() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<JobsLoading />}>
            <JobsContent />
        </Suspense>
    );
}
