'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Application {
    id: string;
    jobId: string;
    job: {
        title: string;
        company: string;
        location: string;
        type: string;
        salary?: {
            min: number;
            max: number;
            currency: string;
        };
    };
    status: string;
    matchScore: number;
    appliedAt: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    reviewing: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Reviewing' },
    shortlisted: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Shortlisted' },
    accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
};

export default function ApplicationsPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'jobseeker') {
            router.push('/login');
            return;
        }

        const fetchApplications = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/applications`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    setApplications(data.data || []);
                } else {
                    setError(data.message || 'Failed to fetch applications');
                }
            } catch (err) {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        if (token && user?.id) {
            fetchApplications();
        }
    }, [user, token, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
                    <p className="text-slate-600">Track your job applications</p>
                </div>
                <Link href="/jobs">
                    <Button>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Find Jobs
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
            )}

            {applications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
                        <p className="text-slate-600 mb-4">Start applying to jobs to see them here</p>
                        <Link href="/jobs">
                            <Button>Browse Jobs</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const status = statusConfig[app.status] || statusConfig.pending;
                        const StatusIcon = status.icon;

                        return (
                            <Card key={app.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {app.job?.title || 'Job Title'}
                                                </h3>
                                                <Badge className={status.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-600 font-medium">{app.job?.company}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span>{app.job?.location}</span>
                                                <span>•</span>
                                                <span className="capitalize">{app.job?.type}</span>
                                                {app.job?.salary && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {app.job.salary.currency} {app.job.salary.min.toLocaleString()} - {app.job.salary.max.toLocaleString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-3">
                                                {app.matchScore > 0 && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <span className="text-slate-500">Match:</span>
                                                        <span className={`font-medium ${app.matchScore >= 75 ? 'text-green-600' :
                                                                app.matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                            {app.matchScore}%
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-sm text-slate-500">
                                                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Link href={`/jobs/${app.jobId}`}>
                                            <Button variant="outline" size="sm">View Job</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
