'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Briefcase,
    UserPlus,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Building2
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'My Jobs', href: '/recruiter/jobs', icon: Briefcase },
    { name: 'Post Job', href: '/recruiter/jobs/new', icon: UserPlus },
];

export default function RecruiterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                    <SidebarContent
                        pathname={pathname}
                        user={user}
                        onLogout={handleLogout}
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
                <SidebarContent
                    pathname={pathname}
                    user={user}
                    onLogout={handleLogout}
                />
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top header */}
                <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex items-center space-x-4 ml-auto">
                            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-medium text-slate-900">
                                        {user?.profile?.firstName || 'Recruiter'}
                                    </div>
                                    <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarContent({
    pathname,
    user,
    onLogout,
    onClose
}: {
    pathname: string;
    user: any;
    onLogout: () => void;
    onClose?: () => void;
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">SmartJobs</span>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-1">
                <Link
                    href="/recruiter/profile"
                    onClick={onClose}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                </Link>
                <button
                    onClick={onLogout}
                    className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
