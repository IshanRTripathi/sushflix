# Sushflix Feature Roadmap

This document outlines the existing features of the Sushflix application and the new features that need to be implemented, categorized by priority.

## Existing Features

-   **User Authentication:**
    -   User signup and login.
    -   Secure password handling.
-   **Content Management:**
    -   Content creation and storage.
    -   Content retrieval and display.
    -   Content upload.
-   **Subscription Management:**
    -   User subscriptions to content creators.
    -   Payment processing via Stripe.
-   **Database:**
    -   MongoDB Atlas setup.
-   **Storage:**
    -   AWS S3 storage integration.
-   **API:**
    -   Backend API serving data.
-   **Deployment:**
    -   Frontend deployment via Netlify.
    -   Backend deployment on AWS EC2.
    -   Nginx configuration for reverse proxy.
    -   PM2 for process management.
    -   SSL certificate setup with Let's Encrypt.
-   **Security:**
    -   AWS WAF integration.
    -   Regular security updates.
    -   Fail2ban for intrusion detection.
-   **Monitoring:**
    -   CloudWatch for CPU, memory, disk, network monitoring.
    -   Alerts for exceeding CPU utilization thresholds.
    -   pm2 logs and nginx error logs.
-   **Database backup:**
    -   Script to backup the database.
    -   Automatic backup via crontab.
-   **Access keys rotation:**
    -   Instructions to rotate access keys.
-   **Content and data retention:**
    -   S3 lifecycle rules.

## High Priority Features

These features are essential for the core functionality and user experience of Sushflix.

1.  **User Profiles:**
    -   Creator profiles (with description, social links, etc.).
    -   Fan profiles (with settings, payment information, etc.).
2.  **Content Browsing/Discovery:**
    -   Search functionality for content.
    -   Categorization and filtering of content.
    -   "Explore" page for discovering new content/creators.
3.  **Creator Dashboard:**
    -   Analytics for creators (views, subscribers, earnings).
    -   Content management tools.
    -   Subscription plan management.
    -   Profile customization.
4. **Creator earnings:**
    - The creators should be able to see their earnings.
    - The creators should be able to withdraw their earnings.
5.  **Content Interaction:**
    -   "Like" or "favorite" content.

## Medium Priority Features

These features enhance the user experience and provide additional functionality.

1.  **Direct Messaging:**
    -   Fans can message creators.
    -   Creators can reply to fans.
2.  **Tip/Donation System:**
    -   Fans can send tips to creators.
    -   Creators can view their tips.
3.  **Email Notifications:**
    -   New follower/subscriber notifications.
    -   Direct message notifications.
    -   Payment confirmations.
4.  **Improved error handling and logging:**
    -   The app should have a better way to handle errors and to log them.
5.   **Content Interaction:**
      -  Comments and discussions on content.
      - Content sharing.

## Low Priority Features

These features are less critical and can be implemented later to further improve the platform.

1.  **Admin Panel:**
    -   Moderation of content and users.
    -   Site configuration.
2.  **Onboarding:**
    -   Tutorial or guide for new users.
3.  **DRM (Digital Rights Management):**
    -   Secure content delivery to prevent unauthorized copying or distribution.

## Development Login

For development purposes, a temporary login using `demo` as the username and `password` as the password should be added.
This should be removed before the production release.