import { ProfileFormData, ProfileErrors, EditProfileProps } from '../types';
import { ProfileFormValidator } from './ProfileFormValidator';

/**
 * Manages the state and logic for the profile form
 */
export class ProfileFormState {
  private formData: ProfileFormData;
  private errors: ProfileErrors;
  private loading: boolean;

  constructor(initialData: EditProfileProps['user']) {
    this.formData = {
      displayName: initialData.displayName || '',
      bio: initialData.bio || '',
      website: initialData.socialLinks?.website || '',
      twitter: initialData.socialLinks?.twitter || '',
      youtube: initialData.socialLinks?.youtube || '',
      isCreator: initialData.isCreator || false
    };
    this.errors = {
      displayName: '',
      bio: '',
      website: '',
      twitter: '',
      youtube: ''
    };
    this.loading = false;
  }

  getFormData(): ProfileFormData {
    return { ...this.formData };
  }

  getErrors(): ProfileErrors {
    return { ...this.errors };
  }

  isLoading(): boolean {
    return this.loading;
  }

  setLoading(isLoading: boolean): void {
    this.loading = isLoading;
  }

  updateField(name: keyof ProfileFormData, value: string | boolean): void {
    if (typeof value === 'boolean') {
      this.formData = { ...this.formData, isCreator: value };
    } else {
      this.formData = { ...this.formData, [name]: value };
    }
  }

  validate(): boolean {
    this.errors = ProfileFormValidator.validate(this.formData);
    return ProfileFormValidator.isValid(this.errors);
  }
}
