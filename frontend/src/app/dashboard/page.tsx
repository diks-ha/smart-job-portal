'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    FileText,
    TrendingUp,
    Clock,
    ArrowRight,
    MapPin,
    DollarSign,
    Search
} from 'lucide-react';

export default function DashboardPage() {
    const { user, token } = useAuthStore();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !user) return;

            try {
                const [recRes, appRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/recommendations`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/candidate/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const recData = await recRes.json();
                const appData = await appRes.json();

                if (recData.success) setRecommendations(recData.data || []);
                if (appData.success) setApplications(appData.data || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [token, user]);

    const stats = [
        {
            label: 'Applications',
            value: applications.length,
            icon: FileText,
            color: 'bg-blue-500'
        },
        {
            label: 'In Review',
            value: applications.filter((a: any) => a.status === 'reviewing').length,
            icon: Clock,
            color: 'bg-yellow-500'
        },
        {
            label: 'Recommended',
            value: recommendations.length,
            icon: TrendingUp,
            color: 'bg-green-500'
        },
        {
            label: 'Profile Views',
            value: 0,
            icon: Briefcase,
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, {user?.profile?.firstName || 'there'}! 👋
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Here's what's happening with your job search today.
                    </p>
                </div>
                <Link href="/jobs">
                    <Button className="w-full md:w-auto">
                        <Search className="h-4 w-4 mr-2" />
                        Find Jobs
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
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

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recommended Jobs */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Recommended Jobs</CardTitle>
                            <CardDescription>AI-matched positions for you</CardDescription>
                        </div>
                        <Link href="/jobs" className="text-sm text-blue-600 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.slice(0, 5).map((rec: any, index: number) => (
                                    <Link
                                        key={rec.job?._id || index}
                                        href={`/jobs/${rec.job?._id}`}
                                        className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900">{rec.job?.title}</h4>
                                                <p className="text-sm text-slate-600 mt-1">{rec.job?.company}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                    {rec.job?.location && (
                                                        <span className="flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {rec.job.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center">
                                                        <Briefcase className="h-3 w-3 mr-1" />
                                                        {rec.job?.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-lg font-bold ${rec.score >= 75 ? 'text-green-600' :
                                                        rec.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {rec.score}%
                                                </div>
                                                <div className="text-xs text-slate-500">Match</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No recommendations yet</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Upload your resume to get personalized job matches
                                </p>
                                <Link href="/profile">
                                    <Button variant="outline" className="mt-4">
                                        Upload Resume
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Recent Applications</CardTitle>
                            <CardDescription>Track your application status</CardDescription>
                        </div>
                        <Link href="/applications" className="text-sm text-blue-600 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {applications.length > 0 ? (
                            <div className="space-y-4">
                                {applications.slice(0, 5).map((app: any) => (
                                    <div
                                        key={app._id}
                                        className="p-4 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900">
                                                    {typeof app.jobId === 'object' ? app.jobId?.title : 'Job'}
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {typeof app.jobId === 'object' ? app.jobId?.company : ''}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Badge variant={
                                                        app.status === 'accepted' ? 'success' :
                                                            app.status === 'rejected' ? 'destructive' :
                                                                app.status === 'shortlisted' ? 'secondary' :
                                                                    app.status === 'reviewing' ? 'warning' : 'default'
                                                    }>
                                                        {app.status}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {app.matchScore > 0 && (
                                                <div className="text-center">
                                                    <div className={`text-lg font-bold ${app.matchScore >= 75 ? 'text-green-600' :
                                                            app.matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {app.matchScore}%
                                                    </div>
                                                    <div className="text-xs text-slate-500">Match</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No applications yet</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Start applying to jobs to track your progress
                                </p>
                                <Link href="/jobs">
                                    <Button variant="outline" className="mt-4">
                                        Browse Jobs
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Complete Your Profile</h3>
                            <p className="text-blue-100 mt-1">
                                Add more details to get better job matches
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/profile">
                                <Button variant="secondary" className="w-full md:w-auto">
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
