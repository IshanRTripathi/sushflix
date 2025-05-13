import React, { useState, ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import apiService from '../services/apiService';
import type { AxiosError, AxiosProgressEvent, AxiosResponse } from 'axios';

/**
 * Represents the form data structure for content upload
 */
interface FormData {
  title: string;
  description: string;
  requiredLevel: 0 | 1 | 2 | 3;
  mediaType: 'image' | 'video';
  thumbnailFile?: File;
  mediaFile?: File;
}

/**
 * Represents preview URLs for media files
 */
interface PreviewUrls {
  thumbnail?: string;
  media?: string;
}

/**
 * Represents validation errors for the form
 */
interface FormErrors {
  title?: string;
  description?: string;
  mediaType?: string;
  thumbnail?: string;
  media?: string;
  general?: string;
}

/**
 * Represents the successful upload response from the server
 */
interface UploadResponseData {
  message: string;
  contentId: string;
  content: {
    id: string;
    title: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    thumbnailUrl: string;
    requiredLevel: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Represents error response structure from the server
 */
interface UploadErrorData {
  message: string;
  errors?: Array<{
    param: keyof FormData;
    msg: string;
  }>;
}

/**
 * Type for the progress event handler
 */
type ProgressHandler = (progressEvent: AxiosProgressEvent) => void;

/**
 * Descriptions for different subscription levels
 */
const LEVEL_DESCRIPTIONS: Record<number, string> = {
  0: 'Available to all followers',
  1: 'Available to Level 1+ subscribers ($1.99/month)',
  2: 'Available to Level 2+ subscribers ($4.99/month)',
  3: 'Available to Level 3 subscribers ($9.99/month)'
} as const;

/**
 * Custom hook for handling content upload form state and submission
 * @returns {Object} Form state and handler functions
 */
export function useContentUploadForm() {
  const auth = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requiredLevel: 0,
    mediaType: 'image'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [previewUrls, setPreviewUrls] = useState<PreviewUrls>({});

  /**
   * Validates the form data
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const { title, description, mediaType, thumbnailFile, mediaFile } = formData;

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!mediaType) newErrors.mediaType = 'Media type is required';
    if (!thumbnailFile) newErrors.thumbnail = 'Thumbnail is required';
    if (!mediaFile) newErrors.media = 'Media file is required';

    // Additional validation for file types if needed
    if (thumbnailFile && !thumbnailFile.type.startsWith('image/')) {
      newErrors.thumbnail = 'Thumbnail must be an image file';
    }

    if (mediaFile) {
      if (mediaType === 'image' && !mediaFile.type.startsWith('image/')) {
        newErrors.media = 'Selected file is not a valid image';
      } else if (mediaType === 'video' && !mediaFile.type.startsWith('video/')) {
        newErrors.media = 'Selected file is not a valid video';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Creates a preview URL for a file and updates the preview URLs state
   * @param file - The file to create a preview URL for
   * @param type - The type of file ('thumbnail' or 'media')
   * @returns The created preview URL
   */
  const createPreviewUrl = useCallback((file: File, type: 'thumbnail' | 'media'): string => {
    // Revoke previous URL to avoid memory leaks
    setPreviewUrls(prev => {
      if (prev[type]) {
        URL.revokeObjectURL(prev[type]!);
      }
      return prev;
    });

    const previewUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => ({
      ...prev,
      [type]: previewUrl
    }));

    return previewUrl;
  }, []);

  /**
   * Handles file selection for both thumbnail and media files
   * @param event - The file input change event
   * @param type - The type of file being uploaded ('thumbnail' or 'media')
   */
  const handleFileChange = useCallback((
    event: ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'media'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    
    const isValidType = 
      (type === 'thumbnail' && validImageTypes.includes(file.type)) ||
      (type === 'media' && (validImageTypes.includes(file.type) || validVideoTypes.includes(file.type)));

    if (!isValidType) {
      setErrors(prev => ({
        ...prev,
        [type]: `Invalid file type. Please upload a ${type === 'thumbnail' ? 'JPEG, PNG, or GIF' : 'JPEG, PNG, GIF, MP4, or WebM'} file.`
      }));
      return;
    }

    // Create preview URL
    createPreviewUrl(file, type);

    // Update form data
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: file
    }));

    // Clear potential previous error for this field
    setErrors(prev => {
      // Create a new error object without the specified fields
      const newErrors: FormErrors = {};
      
      // Only copy over the errors that aren't the one we're removing
      (Object.entries(prev) as Array<[keyof FormErrors, string | undefined]>).forEach(([key, value]) => {
        if (key !== type && key !== 'general' && value !== undefined) {
          newErrors[key] = value;
        }
      });
      
      return newErrors;
    });
  }, [createPreviewUrl, setFormData]);

  /**
   * Handles form submission
   * @param e - The form submission event
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!auth?.user) {
      setErrors({ general: 'You must be logged in to upload content.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('requiredLevel', formData.requiredLevel.toString());
      formDataToSend.append('mediaType', formData.mediaType);

      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }

      if (formData.mediaFile) {
        formDataToSend.append('media', formData.mediaFile);
      }

      // Progress handler with proper typing
      const onUploadProgress: ProgressHandler = (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      const response: AxiosResponse<UploadResponseData> = await apiService.post('/api/content', formDataToSend, {
        onUploadProgress,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const responseData = response.data;

      // Handle successful upload
      if (responseData.contentId) {
        // Use window.location for full page reload or a navigation function if using React Router
        window.location.href = `/content/${responseData.contentId}`;
      } else {
        // Consider using a toast notification system instead of alert
        alert(responseData.message || 'Content uploaded successfully!');
      }

      return responseData;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<UploadErrorData>;
      let errorMessage = 'Failed to upload content';
      const newErrors: FormErrors = {};

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;

        if (errorData.errors?.length) {
          // Map backend validation errors to form fields
          errorData.errors.forEach(({ param, msg }) => {
            if (param in formData) {
              newErrors[param as keyof FormErrors] = msg;
            }
          });
          errorMessage = 'Please correct the errors below.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (axiosError.message) {
        errorMessage = `Network error: ${axiosError.message}`;
      }

      setErrors(prev => ({
        ...prev,
        ...newErrors,
        general: newErrors.general || errorMessage
      }));

      console.error('Upload error:', error);
      throw error; // Re-throw to allow error handling in the calling component
    } finally {
      setIsUploading(false);
    }
  }, [formData, auth?.user, validateForm]);

  // Cleanup preview URLs when component unmounts or when previewUrls changes
  useEffect(() => {
    const currentUrls = { ...previewUrls };
    return () => {
      Object.values(currentUrls).forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  // Handle drag and drop functionality
  const handleFileDrop = useCallback((
    event: React.DragEvent<HTMLDivElement>,
    type: 'thumbnail' | 'media'
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    // Create a synthetic change event
    const syntheticEvent = {
      target: { 
        files: [file],
        value: ''
      } 
    } as unknown as ChangeEvent<HTMLInputElement>;
    
    handleFileChange(syntheticEvent, type);
  }, [handleFileChange]);

  // Create reset form callback
  const resetForm = useCallback(() => {
    // Clean up any existing preview URLs
    setPreviewUrls(prev => {
      Object.values(prev).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      return {};
    });
    
    setFormData({
      title: '',
      description: '',
      requiredLevel: 0,
      mediaType: 'image'
    });
    setErrors({});
    setUploadProgress(0);
  }, []);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Form state
    formData,
    errors,
    isUploading,
    uploadProgress,
    previewUrls,
    LEVEL_DESCRIPTIONS,

    // Handlers
    setFormData,
    handleFileChange,
    handleFileDrop,
    handleSubmit,
    resetForm
  }), [formData, errors, isUploading, uploadProgress, previewUrls, 
       handleFileChange, handleFileDrop, handleSubmit, resetForm]);
}