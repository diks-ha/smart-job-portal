'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    ArrowLeft,
    CheckCircle,
    Users,
    Send,
    Loader2,
    Building2,
    Calendar,
} from 'lucide-react';

export default function JobDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [showCoverLetterForm, setShowCoverLetterForm] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`);
                const data = await res.json();
                if (data.success) {
                    setJob(data.data);
                } else {
                    router.push('/jobs');
                }
            } catch {
                router.push('/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, router]);

    const handleApply = async () => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        if (user.role !== 'jobseeker') {
            setMessage({ type: 'error', text: 'Only job seekers can apply to jobs.' });
            return;
        }
        setApplying(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ jobId: id, coverLetter }),
            });
            const data = await res.json();
            if (data.success) {
                setApplied(true);
                setShowCoverLetterForm(false);
                setMessage({ type: 'success', text: 'Application submitted successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to apply.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!job) return null;

    const recruiter = typeof job.recruiterId === 'object' ? job.recruiterId : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/jobs" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                                        <p className="text-lg text-slate-600 mt-1">{job.company}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                                            {job.location && (
                                                <span className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {job.location}
                                                </span>
                                            )}
                                            <span className="flex items-center capitalize">
                                                <Briefcase className="h-4 w-4 mr-1" />
                                                {job.type}
                                            </span>
                                            {job.salary?.min && job.salary?.max && (
                                                <span className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    {job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                Posted {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {job.applicantCount} applicants
                                            </span>
                                        </div>
                                        {job.skills && job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {job.skills.map((skill: string) => (
                                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Job Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Requirements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {job.requirements.map((req: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-700">
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Responsibilities */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Responsibilities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {job.responsibilities.map((r: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-700">
                                                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Apply Card */}
                        <Card className="border-0 shadow-sm sticky top-4">
                            <CardContent className="p-6">
                                {message.text && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}

                                {applied ? (
                                    <div className="text-center py-4">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <p className="font-semibold text-slate-900">Applied!</p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Track your application in{' '}
                                            <Link href="/applications" className="text-blue-600 hover:underline">
                                                My Applications
                                            </Link>
                                        </p>
                                    </div>
                                ) : job.status === 'closed' ? (
                                    <p className="text-center text-slate-500 py-4">This job is no longer accepting applications.</p>
                                ) : (
                                    <>
                                        {showCoverLetterForm ? (
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-slate-700">
                                                    Cover Letter (optional)
                                                </label>
                                                <textarea
                                                    value={coverLetter}
                                                    onChange={(e) => setCoverLetter(e.target.value)}
                                                    placeholder="Tell the recruiter why you're a great fit..."
                                                    className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        className="flex-1"
                                                        onClick={handleApply}
                                                        disabled={applying}
                                                    >
                                                        {applying ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Send className="h-4 w-4 mr-2" />
                                                        )}
                                                        Submit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowCoverLetterForm(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full"
                                                size="lg"
                                                onClick={() => {
                                                    if (!user) {
                                                        router.push('/login');
                                                    } else {
                                                        setShowCoverLetterForm(true);
                                                    }
                                                }}
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Apply Now
                                            </Button>
                                        )}
                                        {!user && (
                                            <p className="text-xs text-center text-slate-500 mt-2">
                                                <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link> to apply
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Job Details Card */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Job Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Job Type</span>
                                    <span className="font-medium capitalize">{job.type}</span>
                                </div>
                                {job.experienceLevel && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Experience</span>
                                        <span className="font-medium capitalize">{job.experienceLevel}</span>
                                    </div>
                                )}
                                {job.salary?.min && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Salary</span>
                                        <span className="font-medium">
                                            {job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max?.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status</span>
                                    <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                                        {job.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Posted</span>
                                    <span className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
