import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
    APP_SCREENS,
    NOTIFICATION_ACTIONS,
    NOTIFICATION_TEMPLATES,
    SOUND_OPTIONS,
    PRIORITY_OPTIONS,
    TARGET_TYPE_OPTIONS,
    NOTIFICATION_CATEGORIES,
    SCREEN_CATEGORIES
} from '@/lib/constants';
import { BroadcastNotificationRequest } from '@/types';
import {
    PaperAirplaneIcon,
    BeakerIcon,
    DocumentTextIcon,
    UserGroupIcon,
    DevicePhoneMobileIcon,
    BoltIcon,
    SpeakerWaveIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CogIcon,
    EyeIcon,
    TrashIcon,
    PlusIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

interface NotificationFormProps {
    onSubmit: (data: BroadcastNotificationRequest) => Promise<void>;
    onTest: (data: BroadcastNotificationRequest) => Promise<void>;
    loading?: boolean;
}

interface FormData {
    title: string;
    body: string;
    targetType: 'all' | 'ios' | 'android';
    sound: 'default' | 'none';
    priority: 'default' | 'normal' | 'high';
    badge?: number;
    template?: string;
    screen?: string;
    action?: string;
    customData?: string;
}

export function NotificationForm({ onSubmit, onTest, loading }: NotificationFormProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedScreen, setSelectedScreen] = useState<string>('');
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [customDataFields, setCustomDataFields] = useState<string[]>([]);

    const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            targetType: 'all',
            sound: 'default',
            priority: 'normal',
        }
    });

    const watchedAction = watch('action');
    const watchedTemplate = watch('template');

    // Update custom data fields when action changes
    useEffect(() => {
        if (watchedAction) {
            const action = NOTIFICATION_ACTIONS.find(a => a.id === watchedAction);
            if (action?.dataFields) {
                setCustomDataFields(action.dataFields);
            } else {
                setCustomDataFields([]);
            }
        }
    }, [watchedAction]);

    // Load template data when template changes
    useEffect(() => {
        if (watchedTemplate) {
            const template = NOTIFICATION_TEMPLATES.find(t => t.id === watchedTemplate);
            if (template) {
                setValue('title', template.title);
                setValue('body', template.body);
                setValue('targetType', template.targetType);
                setValue('priority', template.priority);

                if (template.data?.screen) {
                    setValue('screen', template.data.screen);
                    setSelectedScreen(template.data.screen);
                }
                if (template.data?.action) {
                    setValue('action', template.data.action);
                    setSelectedAction(template.data.action);
                }
            }
        }
    }, [watchedTemplate, setValue]);

    const handleFormSubmit = async (data: FormData) => {
        console.log('Form data being submitted:', data); // Debug log
        const notificationData: BroadcastNotificationRequest = {
            title: data.title,
            body: data.body,
            targetType: data.targetType,
            sound: data.sound === 'none' ? null : data.sound as 'default',
            priority: data.priority,
            badge: data.badge,
            data: buildNotificationData(data),
        };

        await onSubmit(notificationData);
    };

    const handleTestSubmit = async (data: FormData) => {
        console.log('Test form data being submitted:', data); // Debug log
        const notificationData: BroadcastNotificationRequest = {
            title: data.title,
            body: data.body,
            targetType: data.targetType,
            sound: data.sound === 'none' ? null : data.sound as 'default',
            priority: data.priority,
            badge: data.badge,
            data: buildNotificationData(data),
        };

        await onTest(notificationData);
    };

    const buildNotificationData = (data: FormData) => {
        const notificationData: Record<string, any> = {};

        if (data.screen) {
            notificationData.screen = data.screen;
        }

        if (data.action) {
            notificationData.action = data.action;
        }

        // Add custom data if provided
        if (data.customData) {
            try {
                const customData = JSON.parse(data.customData);
                Object.assign(notificationData, customData);
            } catch (error) {
                console.warn('Invalid JSON in custom data:', error);
            }
        }

        return Object.keys(notificationData).length > 0 ? notificationData : undefined;
    };

    const clearForm = () => {
        reset();
        setSelectedTemplate('');
        setSelectedScreen('');
        setSelectedAction('');
        setCustomDataFields([]);
    };

    const templateOptions = NOTIFICATION_TEMPLATES.map(template => ({
        value: template.id,
        label: template.name,
    }));

    const screenOptions = APP_SCREENS.map(screen => ({
        value: screen.id,
        label: screen.name,
    }));

    const actionOptions = NOTIFICATION_ACTIONS.map(action => ({
        value: action.id,
        label: action.name,
    }));

    const selectedScreenData = APP_SCREENS.find(s => s.id === selectedScreen);
    const selectedActionData = NOTIFICATION_ACTIONS.find(a => a.id === selectedAction);
    const selectedTemplateData = NOTIFICATION_TEMPLATES.find(t => t.id === selectedTemplate);

    // Convert SOUND_OPTIONS to work with Select component (string values only)
    const FORM_SOUND_OPTIONS = [
        { value: 'default', label: 'Default Sound' },
        { value: 'none', label: 'No Sound' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <PaperAirplaneIcon className="w-5 h-5 text-blue-400" />
                        Send Notification
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2"
                        >
                            <CogIcon className="w-4 h-4" />
                            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearForm}
                            className="flex items-center gap-2"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Clear Form
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Template Selection */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <Controller
                                name="template"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Use Template (Optional)"
                                        placeholder="Select a pre-made template..."
                                        options={[
                                            { value: '', label: 'Custom notification' },
                                            ...templateOptions
                                        ]}
                                        value={selectedTemplate}
                                        onChange={(value) => {
                                            setSelectedTemplate(value as string);
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                            {selectedTemplateData && (
                                <div className="mt-2">
                                    <Badge variant={
                                        selectedTemplateData.category === 'marketing' ? 'info' :
                                            selectedTemplateData.category === 'transactional' ? 'success' :
                                                selectedTemplateData.category === 'system' ? 'warning' : 'gray'
                                    }>
                                        {selectedTemplateData.category}
                                    </Badge>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedTemplateData.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Controller
                                name="targetType"
                                control={control}
                                rules={{ required: 'Target type is required' }}
                                render={({ field, fieldState }) => (
                                    <Select
                                        label="Target Audience"
                                        options={TARGET_TYPE_OPTIONS}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={fieldState.error?.message}
                                        required
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Basic Notification Content */}
                    <div className="space-y-4">
                        <Input
                            label="Notification Title"
                            placeholder="Enter notification title..."
                            {...register('title', {
                                required: 'Title is required',
                                maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                            })}
                            error={errors.title?.message}
                            required
                        />

                        <Textarea
                            label="Notification Body"
                            placeholder="Enter notification message..."
                            rows={3}
                            {...register('body', {
                                required: 'Body is required',
                                maxLength: { value: 500, message: 'Body must be less than 500 characters' }
                            })}
                            error={errors.body?.message}
                            required
                        />
                    </div>

                    {/* Navigation & Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <Controller
                                name="screen"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Navigate to Screen (Optional)"
                                        placeholder="Select destination screen..."
                                        options={[
                                            { value: '', label: 'No navigation' },
                                            ...screenOptions
                                        ]}
                                        value={selectedScreen}
                                        onChange={(value) => {
                                            setSelectedScreen(value as string);
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                            {selectedScreenData && (
                                <div className="mt-2">
                                    <Badge variant={
                                        selectedScreenData.category === 'main' ? 'info' :
                                            selectedScreenData.category === 'profile' ? 'success' :
                                                selectedScreenData.category === 'trading' ? 'warning' :
                                                    selectedScreenData.category === 'social' ? 'gray' : 'gray'
                                    }>
                                        {selectedScreenData.category}
                                    </Badge>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedScreenData.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Controller
                                name="action"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Action (Optional)"
                                        placeholder="Select notification action..."
                                        options={[
                                            { value: '', label: 'No specific action' },
                                            ...actionOptions
                                        ]}
                                        value={selectedAction}
                                        onChange={(value) => {
                                            setSelectedAction(value as string);
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                            {selectedActionData && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-400">
                                        {selectedActionData.description}
                                    </p>
                                    {selectedActionData.requiresData && (
                                        <Badge variant="warning" size="sm" className="mt-1">
                                            Requires custom data
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advanced Options */}
                    {showAdvanced && (
                        <div className="border-t border-gray-700 pt-6 space-y-4">
                            <h4 className="text-lg font-medium text-white flex items-center gap-2">
                                <CogIcon className="w-5 h-5 text-blue-400" />
                                Advanced Options
                            </h4>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <Controller
                                    name="sound"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Sound"
                                            options={FORM_SOUND_OPTIONS}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />

                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Priority"
                                            options={PRIORITY_OPTIONS}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />

                                <Input
                                    label="Badge Count (iOS)"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    {...register('badge', {
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Badge count must be 0 or greater' }
                                    })}
                                    error={errors.badge?.message}
                                />
                            </div>

                            {/* Custom Data Fields */}
                            {(customDataFields.length > 0 || selectedAction) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Custom Data (JSON)
                                    </label>
                                    {customDataFields.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-sm text-gray-400">Required fields for this action:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {customDataFields.map(field => (
                                                    <Badge key={field} variant="info" size="sm">
                                                        {field}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <Textarea
                                        placeholder={`{\n  "transactionId": "abc123",\n  "amount": "100 SOL"\n}`}
                                        rows={4}
                                        {...register('customData')}
                                        helperText="Enter valid JSON for custom notification data"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            Send to All Users
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleSubmit(handleTestSubmit)}
                            loading={loading}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <BeakerIcon className="w-5 h-5" />
                            Send Test Notification
                        </Button>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                            <EyeIcon className="w-4 h-4" />
                            Preview
                        </h4>
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-600 max-w-sm">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">S</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {watch('title') || 'Notification Title'}
                                    </p>
                                    <p className="text-sm text-gray-300 line-clamp-2">
                                        {watch('body') || 'Notification body text will appear here...'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">now</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Debug Info (remove in production) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
                                <InformationCircleIcon className="w-4 h-4" />
                                Debug Info
                            </h4>
                            <pre className="text-xs text-yellow-200 overflow-auto">
                                {JSON.stringify(watch(), null, 2)}
                            </pre>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
} 