'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Users,
    Search,
    Loader2,
    Mail,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'];

const statusVariant: Record<string, any> = {
    pending: 'default',
    reviewing: 'warning',
    shortlisted: 'secondary',
    accepted: 'success',
    rejected: 'destructive',
};

export default function ApplicantsPage() {
    const { id } = useParams() as { id: string };
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        if (user.role !== 'recruiter' && user.role !== 'admin') { router.push('/dashboard'); return; }

        const fetchData = async () => {
            try {
                const [jobRes, appRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/job/${id}/ranked`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const jobData = await jobRes.json();
                const appData = await appRes.json();
                if (jobData.success) setJob(jobData.data);
                if (appData.success) {
                    setApplicants(appData.data || []);
                    setSummary(appData.summary);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, token, router]);

    const updateStatus = async (applicationId: string, status: string) => {
        setUpdating(applicationId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                setApplicants((prev) =>
                    prev.map((a) => (a._id === applicationId ? { ...a, status } : a))
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const filtered = applicants.filter((a) => {
        const name = `${a.candidateId?.profile?.firstName || ''} ${a.candidateId?.profile?.lastName || ''}`.toLowerCase();
        const email = (a.candidateId?.email || '').toLowerCase();
        const skills = (a.candidateId?.profile?.skills || []).join(' ').toLowerCase();
        return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || skills.includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/recruiter/jobs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {job?.title || 'Job'} – Applicants
                    </h1>
                    <p className="text-slate-600">{job?.company} · {applicants.length} total applicants</p>
                </div>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: summary.total, color: 'bg-blue-500' },
                        { label: 'Shortlisted', value: summary.byStatus?.shortlisted || 0, color: 'bg-purple-500' },
                        { label: 'Accepted', value: summary.byStatus?.accepted || 0, color: 'bg-green-500' },
                        { label: 'Avg. Match', value: `${summary.averageScore}%`, color: 'bg-orange-500' },
                    ].map((s) => (
                        <Card key={s.label} className="border-0 shadow-sm">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500">{s.label}</p>
                                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                                </div>
                                <div className={`h-10 w-10 ${s.color} rounded-lg flex items-center justify-center`}>
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name, email, or skill..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Applicants List */}
            {filtered.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No applicants yet</h3>
                        <p className="text-slate-600">Applications will appear here once candidates apply.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map((app: any) => {
                        const candidate = app.candidateId;
                        const name = `${candidate?.profile?.firstName || ''} ${candidate?.profile?.lastName || ''}`.trim() || 'Anonymous';
                        const score = app.matchScore || 0;

                        return (
                            <Card key={app._id} className="border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Avatar + Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-semibold">
                                                    {name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    {candidate?.email}
                                                </div>
                                                {candidate?.profile?.location && (
                                                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                                                        <MapPin className="h-3 w-3" />
                                                        {candidate.profile.location}
                                                    </div>
                                                )}
                                                {candidate?.profile?.skills && candidate.profile.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {candidate.profile.skills.slice(0, 5).map((s: string) => (
                                                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                                        ))}
                                                        {candidate.profile.skills.length > 5 && (
                                                            <Badge variant="outline" className="text-xs">+{candidate.profile.skills.length - 5}</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Match Score */}
                                        <div className="text-center min-w-[80px]">
                                            <div className={`text-2xl font-bold ${score >= 75 ? 'text-green-600' :
                                                    score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {score}%
                                            </div>
                                            <div className="text-xs text-slate-500">Match</div>
                                        </div>

                                        {/* Status + Actions */}
                                        <div className="flex flex-col md:items-end gap-2">
                                            <Badge variant={statusVariant[app.status] || 'default'}>
                                                {app.status}
                                            </Badge>
                                            <div className="flex gap-2 flex-wrap">
                                                {app.status !== 'shortlisted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-purple-600 hover:bg-purple-50"
                                                        disabled={updating === app._id}
                                                        onClick={() => updateStatus(app._id, 'shortlisted')}
                                                    >
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Shortlist
                                                    </Button>
                                                )}
                                                {app.status !== 'accepted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:bg-green-50"
                                                        disabled={updating === app._id}
                                                        onClick={() => updateStatus(app._id, 'accepted')}
                                                    >
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Accept
                                                    </Button>
                                                )}
                                                {app.status !== 'rejected' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50"
                                                        disabled={updating === app._id}
                                                        onClick={() => updateStatus(app._id, 'rejected')}
                                                    >
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Reject
                                                    </Button>
                                                )}
                                                {updating === app._id && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                                            </div>
                                            {app.coverLetter && (
                                                <p className="text-xs text-slate-500 max-w-xs truncate">
                                                    "{app.coverLetter}"
                                                </p>
                                            )}
                                        </div>
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
