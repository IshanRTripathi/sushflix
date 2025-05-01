import { useState, ChangeEvent } from 'react';
import { useAuth } from '../components/auth/AuthContext';

interface FormData {
    title: string;
    description: string;
    requiredLevel: 0 | 1 | 2 | 3;
    mediaType: 'image' | 'video';
    thumbnailFile?: File;
    mediaFile?: File;
}

interface FormErrors {
    title?: string;
    description?: string;
    mediaType?: string;
    thumbnail?: string;
    media?: string;
    general?: string;
}

const LEVEL_DESCRIPTIONS = {
    0: 'Available to all followers',
    1: 'Available to Level 1+ subscribers ($1.99/month)',
    2: 'Available to Level 2+ subscribers ($4.99/month)',
    3: 'Available to Level 3 subscribers ($9.99/month)'
};

export function useContentUploadForm() {
    const { token } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        requiredLevel: 0,
        mediaType: 'image'
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrls, setPreviewUrls] = useState<{
        thumbnail?: string;
        media?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.mediaType.trim()) newErrors.mediaType = 'Media type is required';
        if (!formData.thumbnailFile) newErrors.thumbnail = 'Thumbnail is required';
        if (!formData.mediaFile) newErrors.media = 'Media file is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
        type: 'thumbnail' | 'media'
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setPreviewUrls(prev => ({
            ...prev,
            [type]: previewUrl
        }));

        setFormData(prev => ({
            ...prev,
            [`${type}File`]: file
        }));

        setErrors(prev => ({
            ...prev,
            [type]: undefined
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsUploading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('requiredLevel', formData.requiredLevel.toString());
            formDataToSend.append('mediaType', formData.mediaType);
            if (formData.thumbnailFile) formDataToSend.append('thumbnail', formData.thumbnailFile);
            if (formData.mediaFile) formDataToSend.append('media', formData.mediaFile);

            const response = await fetch('/api/content/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const { contentId } = await response.json();
            window.location.href = `/content/${contentId}`;
        } catch (error) {
            setErrors({
                general: error instanceof Error ? error.message : 'Failed to upload content'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        isUploading,
        setIsUploading,
        uploadProgress,
        setUploadProgress,
        previewUrls,
        setPreviewUrls,
        validateForm,
        handleFileChange,
        handleSubmit,
        LEVEL_DESCRIPTIONS
    };
}