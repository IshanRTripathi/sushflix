import { useState, ChangeEvent } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { uploadContent } from '../services/apiService'; // Import uploadContent
import type { AxiosError } from 'axios'; // Import AxiosError

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

// Define structure for the response data from content upload
interface UploadResponseData {
    message?: string;
    contentId?: string; // Assuming the backend returns the ID of the created content
    content?: any; // Or a more specific type for the created content
}

// Define structure for potential error data from content upload
interface UploadErrorData {
  message?: string;
  errors?: Array<{ param: string; msg: string }>;
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

        // Clear potential previous error for this field
        setErrors(prev => ({
            ...prev,
            [type]: undefined
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!token) {
            setErrors({ general: 'Authentication token is missing. Please log in again.' });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setErrors({}); // Clear previous errors

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('requiredLevel', formData.requiredLevel.toString());
            formDataToSend.append('mediaType', formData.mediaType);
            if (formData.thumbnailFile) formDataToSend.append('thumbnail', formData.thumbnailFile);
            if (formData.mediaFile) formDataToSend.append('media', formData.mediaFile);

            // Define progress handler
            const onUploadProgress = (progressEvent: any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            };

            // Call the uploadContent function from apiService
            const response = await uploadContent(formDataToSend, token, onUploadProgress);

            const responseData = response.data as UploadResponseData;

            // Handle success - redirect or show message
            console.log('Upload successful:', responseData);
            if (responseData.contentId) {
                 window.location.href = `/content/${responseData.contentId}`; // Redirect to content page
            } else {
                // Handle success case where maybe only a message is returned
                alert(responseData.message || 'Content uploaded successfully!');
                // Optionally reset the form or redirect differently
            }

        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            let errorMessage = 'Failed to upload content';

            if (axiosError.response?.data) {
                const errorData = axiosError.response.data as UploadErrorData;
                if (errorData.errors && errorData.errors.length > 0) {
                    // Handle specific validation errors if backend sends them
                    const specificErrors: FormErrors = {};
                    errorData.errors.forEach(err => {
                        specificErrors[err.param as keyof FormErrors] = err.msg;
                    });
                    setErrors(specificErrors);
                    errorMessage = 'Please correct the errors above.'; // Set a general message
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                     errorMessage = axiosError.message || 'Upload failed due to server error';
                }
            } else {
                 errorMessage = axiosError.message || 'Network error or unable to reach server';
            }
            console.error("Upload error:", error);
            setErrors(prev => ({ ...prev, general: errorMessage }));
        } finally {
            setIsUploading(false);
            // Keep uploadProgress at 100 or reset based on UX preference
            // setUploadProgress(0); // Reset progress after completion/error
        }
    };

    return {
        formData,
        setFormData,
        errors,
        // Removed setErrors, setIsUploading, setUploadProgress from return if not needed externally
        isUploading,
        uploadProgress,
        previewUrls,
        setPreviewUrls,
        // Removed validateForm from return if only used internally
        handleFileChange,
        handleSubmit,
        LEVEL_DESCRIPTIONS
    };
}