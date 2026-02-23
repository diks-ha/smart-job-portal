'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    FileText,
    Zap,
    Users,
    Briefcase,
    TrendingUp,
    ArrowRight,
    CheckCircle
} from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: 'AI Resume Parsing',
        description: 'Our AI automatically extracts skills and experience from your resume to find the perfect match.'
    },
    {
        icon: Search,
        title: 'Smart Job Search',
        description: 'Find jobs that match your skills with our intelligent search and filtering system.'
    },
    {
        icon: Zap,
        title: 'Instant Matching',
        description: 'Get match scores showing how well you fit each job based on your resume and profile.'
    },
    {
        icon: Users,
        title: 'Top Candidates',
        description: 'Recruiters receive AI-ranked candidate lists to find the best talent quickly.'
    },
    {
        icon: Briefcase,
        title: 'Easy Applications',
        description: 'One-click applications with your stored resume and profile information.'
    },
    {
        icon: TrendingUp,
        title: 'Track Progress',
        description: 'Monitor your application status and get insights on your job search performance.'
    }
];

const stats = [
    { value: '50K+', label: 'Active Jobs' },
    { value: '120K+', label: 'Job Seekers' },
    { value: '5K+', label: 'Companies' },
    { value: '85%', label: 'Match Rate' }
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">SmartJobs</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/jobs" className="text-slate-600 hover:text-slate-900 transition-colors">
                                Find Jobs
                            </Link>
                            <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
                                Features
                            </Link>
                            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">
                                How It Works
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/login">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                                <Zap className="w-4 h-4 mr-2" />
                                AI-Powered Job Matching
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                                Find Your Dream Job with{' '}
                                <span className="gradient-text">AI Intelligence</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                                Smart Job Portal uses advanced AI to match your resume with the perfect jobs.
                                Get personalized recommendations and increase your chances of landing your dream role.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/register?role=jobseeker">
                                    <Button size="lg" className="w-full sm:w-auto text-base px-8">
                                        Find Jobs Now
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/register?role=recruiter">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                                        Post Jobs
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Background decorations */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -z-10" />
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-slate-200 bg-white/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                                <div className="text-slate-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Powerful AI Features
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Our intelligent platform helps you find the perfect job match faster than ever before.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                            <feature.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                        <p className="text-slate-600">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Get started in minutes and find your perfect job match.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '01', title: 'Create Profile', desc: 'Sign up and create your profile with your skills and experience.' },
                            { step: '02', title: 'Upload Resume', desc: 'Upload your resume and our AI will extract your skills automatically.' },
                            { step: '03', title: 'Get Matched', desc: 'Receive personalized job recommendations with AI match scores.' }
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="text-center"
                            >
                                <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Find Your Dream Job?
                    </h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of job seekers who found their perfect match with our AI-powered platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register?role=jobseeker">
                            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">SmartJobs</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                AI-powered job matching platform connecting talent with opportunity.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
                            <ul className="space-y-2">
                                <li><Link href="/jobs" className="text-slate-400 hover:text-white transition-colors">Browse Jobs</Link></li>
                                <li><Link href="/register" className="text-slate-400 hover:text-white transition-colors">Create Profile</Link></li>
                                <li><Link href="/register" className="text-slate-400 hover:text-white transition-colors">Upload Resume</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">For Employers</h4>
                            <ul className="space-y-2">
                                <li><Link href="/register?role=recruiter" className="text-slate-400 hover:text-white transition-colors">Post a Job</Link></li>
                                <li><Link href="/register?role=recruiter" className="text-slate-400 hover:text-white transition-colors">Find Candidates</Link></li>
                                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
                        © 2024 SmartJobs. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
