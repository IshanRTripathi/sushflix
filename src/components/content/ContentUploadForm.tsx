import React, { useState, useRef } from 'react';
import { Upload, X, Image, Film, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface FormData {
  title: string;
  description: string;
  isExclusive: boolean;
  mediaType: 'image' | 'video';
  thumbnailFile?: File;
  mediaFile?: File;
}

interface FormErrors {
  title?: string;
  description?: string;
  thumbnail?: string;
  media?: string;
  general?: string;
}

export function ContentUploadForm() {
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    isExclusive: false,
    mediaType: 'video'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<{
    thumbnail?: string;
    media?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.thumbnailFile) {
      newErrors.thumbnail = 'Thumbnail is required';
    }

    if (!formData.mediaFile) {
      newErrors.media = 'Media file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'media'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => ({
      ...prev,
      [type]: previewUrl
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: file
    }));

    // Clear any previous errors
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
      formDataToSend.append('isExclusive', String(formData.isExclusive));
      formDataToSend.append('mediaType', formData.mediaType);
      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }
      if (formData.mediaFile) {
        formDataToSend.append('media', formData.mediaFile);
      }

      const response = await fetch('http://localhost:5000/api/content/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Redirect to the content page
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Content</h2>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } focus:border-indigo-500 focus:ring-indigo-500`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Media Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                className={`flex items-center px-4 py-2 rounded-md ${
                  formData.mediaType === 'video'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Film className="w-5 h-5 mr-2" />
                Video
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                className={`flex items-center px-4 py-2 rounded-md ${
                  formData.mediaType === 'image'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Image className="w-5 h-5 mr-2" />
                Image
              </button>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer ${
                errors.thumbnail ? 'border-red-300' : 'border-gray-300'
              } hover:border-indigo-400`}
            >
              {previewUrls.thumbnail ? (
                <div className="relative">
                  <img
                    src={previewUrls.thumbnail}
                    alt="Thumbnail preview"
                    className="max-h-48 rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrls(prev => ({ ...prev, thumbnail: undefined }));
                      setFormData(prev => ({ ...prev, thumbnailFile: undefined }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      Upload thumbnail
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            {errors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.mediaType === 'video' ? 'Video' : 'Image'}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer ${
                errors.media ? 'border-red-300' : 'border-gray-300'
              } hover:border-indigo-400`}
            >
              {previewUrls.media ? (
                <div className="relative">
                  {formData.mediaType === 'video' ? (
                    <video
                      src={previewUrls.media}
                      className="max-h-48 rounded"
                      controls
                    />
                  ) : (
                    <img
                      src={previewUrls.media}
                      alt="Media preview"
                      className="max-h-48 rounded"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrls(prev => ({ ...prev, media: undefined }));
                      setFormData(prev => ({ ...prev, mediaFile: undefined }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      Upload {formData.mediaType}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                        onChange={(e) => handleFileChange(e, 'media')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.mediaType === 'video'
                      ? 'MP4, WebM up to 100MB'
                      : 'PNG, JPG up to 5MB'}
                  </p>
                </div>
              )}
            </div>
            {errors.media && (
              <p className="mt-1 text-sm text-red-600">{errors.media}</p>
            )}
          </div>

          {/* Visibility Settings */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isExclusive"
              checked={formData.isExclusive}
              onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isExclusive" className="ml-2 block text-sm text-gray-700">
              Make this content exclusive (subscribers only)
            </label>
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Content'}
          </button>
        </form>
      </div>
    </div>
  );
}