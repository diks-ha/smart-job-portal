'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    Users,
    Plus,
    TrendingUp,
    Clock,
    CheckCircle,
    ArrowRight,
    Loader2,
} from 'lucide-react';

export default function RecruiterDashboardPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.role !== 'recruiter' && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchJobs = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/jobs/recruiter/my-jobs?limit=5`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                if (data.success) setJobs(data.data || []);
            } catch (err) {
                console.error('Error fetching recruiter jobs', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user, token, router]);

    const totalApplicants = jobs.reduce((sum: number, j: any) => sum + (j.applicantCount || 0), 0);
    const activeJobs = jobs.filter((j: any) => j.status === 'active').length;

    const stats = [
        { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'bg-blue-500' },
        { label: 'Active Jobs', value: activeJobs, icon: CheckCircle, color: 'bg-green-500' },
        { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'bg-purple-500' },
        { label: 'Avg. Applicants', value: jobs.length ? Math.round(totalApplicants / jobs.length) : 0, icon: TrendingUp, color: 'bg-orange-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, {user?.profile?.firstName || 'Recruiter'}! 👋
                    </h1>
                    <p className="text-slate-600 mt-1">Here's an overview of your recruitment activity.</p>
                </div>
                <Link href="/recruiter/jobs/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Job
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`h-12 w-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Jobs */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg">Recent Job Postings</CardTitle>
                        <CardDescription>Your latest posted positions</CardDescription>
                    </div>
                    <Link href="/recruiter/jobs" className="text-sm text-blue-600 hover:underline flex items-center">
                        View all <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {jobs.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
                            <p className="text-slate-600 mb-4">Start attracting candidates by posting your first job.</p>
                            <Link href="/recruiter/jobs/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Post First Job
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job: any) => (
                                <div
                                    key={job._id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    <div>
                                        <h4 className="font-medium text-slate-900">{job.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center">
                                                <Users className="h-3 w-3 mr-1" />
                                                {job.applicantCount} applicants
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={job.status === 'active' ? 'success' : job.status === 'draft' ? 'warning' : 'default'}>
                                            {job.status}
                                        </Badge>
                                        <Link href={`/recruiter/jobs/${job._id}/applicants`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
