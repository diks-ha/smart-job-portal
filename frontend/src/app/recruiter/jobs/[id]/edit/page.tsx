'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Loader2, Save } from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

export default function EditJobPage() {
    const { id } = useParams() as { id: string };
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: '',
        company: '',
        description: '',
        location: '',
        type: 'full-time',
        experienceLevel: 'mid',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD',
        status: 'active',
    });

    const [requirements, setRequirements] = useState<string[]>([]);
    const [responsibilities, setResponsibilities] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [reqInput, setReqInput] = useState('');
    const [respInput, setRespInput] = useState('');
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (!user) { router.push('/login'); return; }

        const fetchJob = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`);
                const data = await res.json();
                if (data.success) {
                    const j = data.data;
                    setForm({
                        title: j.title || '',
                        company: j.company || '',
                        description: j.description || '',
                        location: j.location || '',
                        type: j.type || 'full-time',
                        experienceLevel: j.experienceLevel || 'mid',
                        salaryMin: j.salary?.min?.toString() || '',
                        salaryMax: j.salary?.max?.toString() || '',
                        salaryCurrency: j.salary?.currency || 'USD',
                        status: j.status || 'active',
                    });
                    setRequirements(j.requirements || []);
                    setResponsibilities(j.responsibilities || []);
                    setSkills(j.skills || []);
                }
            } catch { } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const addItem = (
        input: string,
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>,
        setInput: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const trimmed = input.trim();
        if (trimmed && !list.includes(trimmed)) {
            setList((prev) => [...prev, trimmed]);
            setInput('');
        }
    };

    const removeItem = (item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList((prev) => prev.filter((i) => i !== item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const body: any = {
                title: form.title,
                company: form.company,
                description: form.description,
                location: form.location,
                type: form.type,
                experienceLevel: form.experienceLevel,
                status: form.status,
                requirements,
                responsibilities,
                skills,
            };
            if (form.salaryMin && form.salaryMax) {
                body.salary = {
                    min: Number(form.salaryMin),
                    max: Number(form.salaryMax),
                    currency: form.salaryCurrency,
                    period: 'yearly',
                };
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/recruiter/jobs');
            } else {
                setError(data.message || 'Update failed.');
            }
        } catch {
            setError('Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

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
                    <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Edit Job</h1>
                    <p className="text-slate-600">Update the job posting details.</p>
                </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-0 shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Job Title *</Label>
                                <Input name="title" value={form.title} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Company *</Label>
                                <Input name="company" value={form.company} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input name="location" value={form.location} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Job Type</Label>
                                <select name="type" value={form.type} onChange={handleChange} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                    {EXP_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <textarea name="description" value={form.description} onChange={handleChange} required className="w-full min-h-[150px] p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-y" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-3">
                            <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(skillInput, skills, setSkills, setSkillInput); } }} />
                            <Button type="button" onClick={() => addItem(skillInput, skills, setSkills, setSkillInput)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s) => (
                                <Badge key={s} className="flex items-center gap-1 px-3 py-1">
                                    {s}
                                    <button type="button" onClick={() => removeItem(s, setSkills)}><X className="h-3 w-3" /></button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Label>Status</Label>
                            <select name="status" value={form.status} onChange={handleChange} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <Button type="submit" size="lg" disabled={saving}>
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
