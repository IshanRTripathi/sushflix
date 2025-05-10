/**
 * Validates profile form data and returns error messages
 */
import { ProfileFormData, ProfileErrors } from '../types';

export class ProfileFormValidator {
  static validate(formData: ProfileFormData): ProfileErrors {
    const errors: ProfileErrors = {
      displayName: formData.displayName.trim() ? '' : 'Display name is required',
      bio: formData.bio.length > 500 ? 'Bio must be less than 500 characters' : '',
      website: formData.website && !/^https?:\/\/.+/i.test(formData.website) ? 'Invalid website URL' : '',
      twitter: formData.twitter && !/^https?:\/\/.+/i.test(formData.twitter) ? 'Invalid Twitter URL' : '',
      youtube: formData.youtube && !/^https?:\/\/.+/i.test(formData.youtube) ? 'Invalid YouTube URL' : ''
    };
    return errors;
  }

  static isValid(errors: ProfileErrors): boolean {
    return Object.values(errors).every(error => !error);
  }
}
