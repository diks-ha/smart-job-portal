'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewJobPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: '',
        company: user?.profile?.company || '',
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
        if (!form.title || !form.company || !form.description) {
            setError('Title, company, and description are required.');
            return;
        }
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

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/recruiter/jobs');
            } else {
                setError(data.message || 'Failed to create job.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
                    <p className="text-slate-600">Fill in the details to attract the right candidates.</p>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title *</Label>
                                <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company *</Label>
                                <Input id="company" name="company" value={form.company} onChange={handleChange} placeholder="Your Company" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" value={form.location} onChange={handleChange} placeholder="New York, NY or Remote" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Job Type</Label>
                                <select id="type" name="type" value={form.type} onChange={handleChange} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                    {JOB_TYPES.map((t) => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experienceLevel">Experience Level</Label>
                                <select id="experienceLevel" name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                    {EXP_LEVELS.map((l) => (
                                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description *</Label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the role, responsibilities, and what you're looking for..."
                                required
                                className="w-full min-h-[150px] p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-y"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Salary */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Salary Range (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <select name="salaryCurrency" value={form.salaryCurrency} onChange={handleChange} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Min Salary (yearly)</Label>
                                <Input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="50000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Salary (yearly)</Label>
                                <Input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="100000" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Required Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-3">
                            <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. React, Node.js, Python" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(skillInput, skills, setSkills, setSkillInput); } }} />
                            <Button type="button" onClick={() => addItem(skillInput, skills, setSkills, setSkillInput)}>
                                <Plus className="h-4 w-4" />
                            </Button>
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

                {/* Requirements */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-3">
                            <Input value={reqInput} onChange={(e) => setReqInput(e.target.value)} placeholder="e.g. 3+ years of React experience" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(reqInput, requirements, setRequirements, setReqInput); } }} />
                            <Button type="button" onClick={() => addItem(reqInput, requirements, setRequirements, setReqInput)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {requirements.map((r) => (
                                <li key={r} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                                    <span>{r}</span>
                                    <button type="button" onClick={() => removeItem(r, setRequirements)}><X className="h-4 w-4 text-slate-400 hover:text-red-500" /></button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Responsibilities */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-3">
                            <Input value={respInput} onChange={(e) => setRespInput(e.target.value)} placeholder="e.g. Design and implement new features" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(respInput, responsibilities, setResponsibilities, setRespInput); } }} />
                            <Button type="button" onClick={() => addItem(respInput, responsibilities, setResponsibilities, setRespInput)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {responsibilities.map((r) => (
                                <li key={r} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                                    <span>{r}</span>
                                    <button type="button" onClick={() => removeItem(r, setResponsibilities)}><X className="h-4 w-4 text-slate-400 hover:text-red-500" /></button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Status + Submit */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Label>Status</Label>
                            <select name="status" value={form.status} onChange={handleChange} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                                <option value="active">Active (Accepting applications)</option>
                                <option value="draft">Draft (Save for later)</option>
                            </select>
                        </div>
                        <Button type="submit" size="lg" disabled={saving}>
                            {saving ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publishing...</>
                            ) : (
                                <><Save className="h-4 w-4 mr-2" />Publish Job</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
