import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardStats } from '@/types';
import {
    UserGroupIcon,
    DevicePhoneMobileIcon,
    PaperAirplaneIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface StatsCardsProps {
    stats: DashboardStats | null;
    loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent>
                            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-600 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent>
                        <p className="text-gray-400">No data available</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            icon: UserGroupIcon,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Active Tokens',
            value: stats.activeTokens.toLocaleString(),
            icon: DevicePhoneMobileIcon,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Notifications Sent',
            value: stats.totalNotificationsSent.toLocaleString(),
            icon: PaperAirplaneIcon,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Success Rate',
            value: `${(stats.successRate * 100).toFixed(1)}%`,
            icon: CheckCircleIcon,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                        <IconComponent className={`w-6 h-6 ${card.color}`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-400">{card.title}</p>
                                        <p className="text-2xl font-bold text-white">{card.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Platform Distribution */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Platform Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-600 rounded-lg mr-3">
                                    <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-white">iOS</p>
                                    <p className="text-sm text-gray-400">Active devices</p>
                                </div>
                            </div>
                            <Badge variant="info" size="lg">
                                {stats.platformDistribution.ios.toLocaleString()}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-600 rounded-lg mr-3">
                                    <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zM20.5 8c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zM15.53 2.16l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-white">Android</p>
                                    <p className="text-sm text-gray-400">Active devices</p>
                                </div>
                            </div>
                            <Badge variant="success" size="lg">
                                {stats.platformDistribution.android.toLocaleString()}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-600 rounded-lg mr-3">
                                    <UserGroupIcon className="w-6 h-6 text-gray-300" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Total</p>
                                    <p className="text-sm text-gray-400">All platforms</p>
                                </div>
                            </div>
                            <Badge variant="gray" size="lg">
                                {(stats.platformDistribution.ios + stats.platformDistribution.android).toLocaleString()}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 