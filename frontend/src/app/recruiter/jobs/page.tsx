'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Briefcase,
    Plus,
    Users,
    Clock,
    Search,
    Pencil,
    Trash2,
    Loader2,
    Eye,
} from 'lucide-react';

export default function RecruiterJobsPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.role !== 'recruiter' && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchJobs();
    }, [user]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/recruiter/my-jobs?limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setJobs(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm('Delete this job and all its applications?')) return;
        setDeleting(jobId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setJobs((prev) => prev.filter((j) => j._id !== jobId));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    const filtered = jobs.filter(
        (j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Job Postings</h1>
                    <p className="text-slate-600">{jobs.length} total positions</p>
                </div>
                <Link href="/recruiter/jobs/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Job
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filtered.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {search ? 'No jobs match your search' : 'No jobs posted yet'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {search ? 'Try a different search term.' : 'Post your first job to start receiving applications.'}
                        </p>
                        {!search && (
                            <Link href="/recruiter/jobs/new">
                                <Button>Post a Job</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map((job: any) => (
                        <Card key={job._id} className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                                            <Badge variant={
                                                job.status === 'active' ? 'success' :
                                                    job.status === 'draft' ? 'warning' : 'default'
                                            }>
                                                {job.status}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-600">{job.company}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center capitalize">
                                                <Briefcase className="h-3 w-3 mr-1" />
                                                {job.type}
                                            </span>
                                            <span className="flex items-center">
                                                <Users className="h-3 w-3 mr-1" />
                                                {job.applicantCount} applicants
                                            </span>
                                            <span className="flex items-center">
                                                <Eye className="h-3 w-3 mr-1" />
                                                {job.views} views
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/recruiter/jobs/${job._id}/applicants`}>
                                            <Button variant="outline" size="sm">
                                                <Users className="h-4 w-4 mr-1" />
                                                Applicants
                                            </Button>
                                        </Link>
                                        <Link href={`/recruiter/jobs/${job._id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 hover:border-red-300"
                                            onClick={() => handleDelete(job._id)}
                                            disabled={deleting === job._id}
                                        >
                                            {deleting === job._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
