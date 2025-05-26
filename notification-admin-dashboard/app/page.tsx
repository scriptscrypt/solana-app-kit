'use client';

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { NotificationForm } from '@/components/dashboard/NotificationForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notificationApi } from '@/lib/api';
import { DashboardStats, BroadcastNotificationRequest, NotificationActivity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
    BellIcon,
    ChartBarIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    UserGroupIcon,
    DevicePhoneMobileIcon,
    PaperAirplaneIcon,
    BeakerIcon,
    RocketLaunchIcon,
    HandRaisedIcon,
    LinkIcon,
    InboxIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        loadDashboardData();
        checkServerHealth();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const dashboardStats = await notificationApi.getDashboardStats();
            setStats(dashboardStats);
        } catch (error: any) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkServerHealth = async () => {
        try {
            setServerStatus('checking');
            await notificationApi.healthCheck();
            setServerStatus('online');
        } catch (error) {
            setServerStatus('offline');
            toast.error('Server is offline or not responding');
        }
    };

    const handleSendNotification = async (data: BroadcastNotificationRequest) => {
        try {
            setSending(true);
            const result = await notificationApi.broadcastNotification(data);

            if (result.success) {
                toast.success(`✅ Notification sent successfully! ${result.message}`);
                // Reload stats to show updated numbers
                await loadDashboardData();
            } else {
                toast.error(`❌ Failed to send notification: ${result.message}`);
            }
        } catch (error: any) {
            console.error('Failed to send notification:', error);
            toast.error(`❌ Error: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const handleTestNotification = async (data: BroadcastNotificationRequest) => {
        try {
            setSending(true);
            const result = await notificationApi.testNotification(data);

            if (result.success) {
                toast.success(`🧪 Test notification sent! ${result.message}`);
            } else {
                toast.error(`❌ Failed to send test: ${result.message}`);
            }
        } catch (error: any) {
            console.error('Failed to send test notification:', error);
            toast.error(`❌ Test failed: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = () => {
        switch (serverStatus) {
            case 'checking':
                return (
                    <Badge variant="gray" className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        Checking...
                    </Badge>
                );
            case 'online':
                return (
                    <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        Online
                    </Badge>
                );
            case 'offline':
                return (
                    <Badge variant="error" className="flex items-center gap-1">
                        <ExclamationCircleIcon className="w-3 h-3" />
                        Offline
                    </Badge>
                );
        }
    };

    const getActivityStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="success">Success</Badge>;
            case 'partial':
                return <Badge variant="warning">Partial</Badge>;
            case 'failed':
                return <Badge variant="error">Failed</Badge>;
            default:
                return <Badge variant="gray">{status}</Badge>;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'broadcast':
                return <BellIcon className="w-5 h-5" />;
            case 'campaign':
                return <ChartBarIcon className="w-5 h-5" />;
            case 'test':
                return <BeakerIcon className="w-5 h-5" />;
            default:
                return <BellIcon className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                    },
                }}
            />

            {/* Header */}
            <header className="bg-gray-800 shadow-lg border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <BellIcon className="w-8 h-8 text-blue-400" />
                                Notification Admin Dashboard
                            </h1>
                            <p className="text-gray-300 mt-1">
                                Manage push notifications for your Solana app
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {getStatusBadge()}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    checkServerHealth();
                                    loadDashboardData();
                                }}
                                loading={loading}
                                className="flex items-center gap-2"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-blue-400" />
                            Overview
                        </h2>
                        <StatsCards stats={stats} loading={loading} />
                    </section>

                    {/* Notification Form */}
                    <section>
                        <NotificationForm
                            onSubmit={handleSendNotification}
                            onTest={handleTestNotification}
                            loading={sending}
                        />
                    </section>

                    {/* Recent Activity
                    <section>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChartBarIcon className="w-5 h-5 text-blue-400" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recentActivity.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                        {getActivityIcon(activity.type)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-white">{activity.title}</h4>
                                                        <p className="text-sm text-gray-300">
                                                            {activity.recipients.toLocaleString()} recipients • {' '}
                                                            {(activity.successRate * 100).toFixed(1)}% success rate
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {getActivityStatusBadge(activity.status)}
                                                    <span className="text-sm text-gray-400">
                                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <InboxIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No recent activity</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Send your first notification to see activity here
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section> */}

                    {/* Quick Actions */}
                    <section>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <RocketLaunchIcon className="w-5 h-5 text-blue-400" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col gap-2"
                                        onClick={() => handleTestNotification({
                                            title: 'Test Notification',
                                            body: 'This is a test notification from the admin dashboard.',
                                            targetType: 'all',
                                            priority: 'normal',
                                            sound: 'default'
                                        })}
                                        loading={sending}
                                    >
                                        <BeakerIcon className="w-6 h-6" />
                                        <span className="text-sm">Send Test</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col gap-2"
                                        onClick={() => handleSendNotification({
                                            title: 'Welcome to Solana App!',
                                            body: 'Start your journey with crypto trading and social features.',
                                            targetType: 'all',
                                            priority: 'normal',
                                            sound: 'default',
                                            data: { screen: 'MainTabs', action: 'welcome' }
                                        })}
                                        loading={sending}
                                    >
                                        <HandRaisedIcon className="w-6 h-6" />
                                        <span className="text-sm">Welcome Message</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col gap-2"
                                        onClick={() => handleSendNotification({
                                            title: 'New Feature Available!',
                                            body: 'Check out the latest updates and improvements.',
                                            targetType: 'all',
                                            priority: 'normal',
                                            sound: 'default',
                                            data: { screen: 'FeedScreen', action: 'feature_update' }
                                        })}
                                        loading={sending}
                                    >
                                        <RocketLaunchIcon className="w-6 h-6" />
                                        <span className="text-sm">Feature Update</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col gap-2"
                                        onClick={loadDashboardData}
                                        loading={loading}
                                    >
                                        <ArrowPathIcon className="w-6 h-6" />
                                        <span className="text-sm">Refresh Data</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* API Information */}
                    <section>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5 text-blue-400" />
                                    API Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-white mb-2">Broadcast Endpoint</h4>
                                        <code className="block p-3 bg-gray-700 rounded text-sm text-gray-300">
                                            POST {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/broadcast
                                        </code>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white mb-2">Stats Endpoint</h4>
                                        <code className="block p-3 bg-gray-700 rounded text-sm text-gray-300">
                                            GET {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/stats
                                        </code>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                                    <h4 className="font-medium text-blue-300 mb-2">cURL Example</h4>
                                    <code className="block text-sm text-blue-200 whitespace-pre-wrap">
                                        {`curl -X POST ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/broadcast \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Hello World!",
    "body": "This is a test notification",
    "targetType": "all",
    "priority": "normal",
    "sound": "default"
  }'`}
                                    </code>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>

            {/* Footer
            <footer className="bg-gray-800 border-t border-gray-700 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-300">
                            Solana App Notification Dashboard
                        </p>
                        <p className="text-sm text-gray-400">
                            Built with Next.js, TypeScript, and Tailwind CSS
                        </p>
                    </div>
                </div>
            </footer> */}
        </div>
    );
} 