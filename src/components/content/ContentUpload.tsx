import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Film, AlertCircle } from 'lucide-react';
import { useContentUploadForm } from '../../hooks/useContentUploadForm';

// File input types are now defined inline where used

interface ContentFormData {
  title: string;
  description: string;
  requiredLevel: 0 | 1 | 2 | 3;
  mediaType: 'image' | 'video';
  thumbnailFile?: File;
  mediaFile?: File;
}

interface PreviewUrls {
  thumbnail?: string;
  media?: string;
}

// ContentUploadProps is not used in this component, so it's removed

interface FormErrors {
  general?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  media?: string;
  [key: string]: string | undefined;
}

interface ContentUploadFormProps {
  formData: ContentFormData;
  setFormData: (data: ContentFormData) => void;
  errors: FormErrors;
  isUploading: boolean;
  uploadProgress: number;
  previewUrls: PreviewUrls;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'media') => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  LEVEL_DESCRIPTIONS: string[];
}

interface ContentUploadComponentProps {
  onError?: (message: string) => void;
}

export function ContentUpload({ onError }: ContentUploadComponentProps) {
  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Get form state and handlers from custom hook
  const { 
    formData, 
    setFormData, 
    errors, 
    isUploading, 
    uploadProgress, 
    previewUrls = {}, 
    handleSubmit, 
    LEVEL_DESCRIPTIONS = []
  } = useContentUploadForm() as unknown as ContentUploadFormProps;
  
  // Local state for preview URLs
  const [localPreviewUrls, setLocalPreviewUrls] = useState<PreviewUrls>({});

  // Type-safe form data update
  const updateFormData = useCallback(<K extends keyof ContentFormData>(
    key: K, 
    value: ContentFormData[K] | undefined
  ) => {
    setFormData({
      ...formData,
      [key]: value
    });
  }, [formData, setFormData]);



  // Handle file removal
  const handleRemoveFile = useCallback((fileType: 'thumbnail' | 'media') => {
    const formKey = `${fileType}File` as keyof ContentFormData;
    updateFormData(formKey, undefined);
    
    setLocalPreviewUrls((prev: PreviewUrls) => {
      const newUrls = { ...prev };
      delete newUrls[fileType];
      return newUrls;
    });
    
    // Clear file input
    const input = fileType === 'thumbnail' ? thumbnailInputRef.current : fileInputRef.current;
    if (input) input.value = '';
  }, [updateFormData]);
  
  // Handle file input change with proper typing
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'media') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type before proceeding
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const isValidType = 
      (type === 'thumbnail' && validImageTypes.includes(file.type)) ||
      (type === 'media' && (validImageTypes.includes(file.type) || validVideoTypes.includes(file.type)));

    if (!isValidType) {
      const errorMessage = `Invalid file type. Please upload a ${type === 'thumbnail' ? 'JPEG, PNG, or GIF' : 'JPEG, PNG, GIF, MP4, or WebM'} file.`;
      onError?.(errorMessage);
      return;
    }
    
    // Update form data with the new file
    const formKey = `${type}File` as keyof ContentFormData;
    updateFormData(formKey, file as File);
    
    // Create and set preview URL
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrls(prev => ({
      ...prev,
      [type]: previewUrl
    }));
  }, [updateFormData, onError]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, type: 'thumbnail' | 'media') => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    const event = { 
      target: { 
        files: [file],
        value: ''
      } 
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileInputChange(event, type);
  }, [handleFileInputChange]);
  
  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    const currentUrls = { ...localPreviewUrls };
    return () => {
      Object.values(currentUrls).forEach((url: string | undefined) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [localPreviewUrls]);

  // Combine preview URLs from props and local state
  const displayPreviewUrls: PreviewUrls = React.useMemo(() => ({
    ...previewUrls,
    ...localPreviewUrls
  }), [previewUrls, localPreviewUrls]);



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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Enter a title for your content"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Describe your content"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Required Subscription Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Subscription Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`p-4 border rounded-md cursor-pointer ${
                    formData.requiredLevel === level
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => updateFormData('requiredLevel', level as 0 | 1 | 2 | 3)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                        formData.requiredLevel === level
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {formData.requiredLevel === level && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-medium">Level {level}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {LEVEL_DESCRIPTIONS[level]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Media Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => updateFormData('mediaType', 'image')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  formData.mediaType === 'image'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Image
              </button>
              <button
                type="button"
                onClick={() => updateFormData('mediaType', 'video')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  formData.mediaType === 'video'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Film className="w-5 h-5 mr-2" />
                Video
              </button>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
              onDragOver={handleDragOver}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer ${
                errors.thumbnail ? 'border-red-300' : 'border-gray-300'
              } hover:border-indigo-400`}
            >
              {displayPreviewUrls.thumbnail ? (
                <div className="relative">
                  <img
                    src={displayPreviewUrls.thumbnail}
                    alt="Thumbnail preview"
                    className="max-h-48 rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile('thumbnail');
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
                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                      Upload a file
                    </span>{' '}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInputChange(e, 'thumbnail')}
              />
            </div>
            {errors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.mediaType === 'image' ? 'Image' : 'Video'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => handleDrop(e, 'media')}
              onDragOver={handleDragOver}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer ${
                errors.media ? 'border-red-300' : 'border-gray-300'
              } hover:border-indigo-400`}
            >
              {displayPreviewUrls.media ? (
                <div className="relative">
                  {formData.mediaType === 'video' ? (
                    <video
                      src={displayPreviewUrls.media}
                      className="max-h-48 rounded"
                      controls
                    />
                  ) : (
                    <img
                      src={displayPreviewUrls.media}
                      alt="Media preview"
                      className="max-h-48 rounded"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile('media');
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
                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                      Upload a file
                    </span>{' '}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.mediaType === 'video'
                      ? 'MP4, WebM up to 100MB'
                      : 'PNG, JPG up to 5MB'}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => handleFileInputChange(e, 'media')}
              />
            </div>
            {errors.media && (
              <p className="mt-1 text-sm text-red-600">{errors.media}</p>
            )}
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