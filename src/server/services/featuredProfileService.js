const fs = require('fs').promises;
const path = require('path');

const getFeaturedProfiles = async () => {
  try {
    const configPath = path.join(process.cwd(), 'featured-profiles.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    return config.featuredProfiles
      .filter(profile => profile.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(profile => profile.profile);
  } catch (error) {
    console.error('Error reading featured profiles config:', error);
    return [];
  }
};

module.exports = {
  getFeaturedProfiles
};
