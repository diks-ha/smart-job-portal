'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Save, Loader2 } from 'lucide-react';

export default function RecruiterProfilePage() {
    const { user, token, updateUser } = useAuthStore();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        location: '',
        bio: '',
        company: '',
        website: '',
    });

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        setForm({
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            phone: user.profile?.phone || '',
            location: user.profile?.location || '',
            bio: user.profile?.bio || '',
            company: user.profile?.company || '',
            website: user.profile?.website || '',
        });
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ profile: form }),
            });
            const data = await res.json();
            if (data.success) {
                updateUser(data.data);
                setMessage({ type: 'success', text: 'Profile updated!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Update failed.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong.' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
                <p className="text-slate-600">Manage your recruiter information</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Building2 className="h-5 w-5 mr-2" />
                            Company & Personal Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input name="location" value={form.location} onChange={handleChange} placeholder="San Francisco, CA" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Website</Label>
                            <Input name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Bio / About the Company</Label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell candidates about your company..."
                                className="w-full min-h-[100px] p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={saving}>
                        {saving ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                        ) : (
                            <><Save className="h-4 w-4 mr-2" />Save Changes</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
