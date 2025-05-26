export function validateProfileForm(formData) {
  return {
    displayName: !formData.displayName.trim() ? 'Display name is required' : '',
    bio: formData.bio.length > 500 ? 'Bio must be less than 500 characters' : '',
    website: formData.website && !/^https?:\/\//i.test(formData.website) ? 'Invalid URL' : '',
    twitter: formData.twitter && !/^https?:\/\//i.test(formData.twitter) ? 'Invalid URL' : '',
    youtube: formData.youtube && !/^https?:\/\//i.test(formData.youtube) ? 'Invalid URL' : ''
  };
}

export function isFormValid(errors) {
  return Object.values(errors).every((e) => !e);
}
