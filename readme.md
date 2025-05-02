# Sushflix

## Project Description

Sushflix is a content sharing and subscription platform designed to connect creators with their fans. Creators can upload various types of content and manage their subscriptions, while fans can subscribe to their favorite creators and enjoy exclusive content. The platform uses a modern tech stack, including React for the frontend, Node.js/Express for the backend, MongoDB Atlas for the database, and AWS S3 for storage.

## Features

### Existing Features

*   **User Authentication:**
    *   User signup and login.
    *   Secure password handling.
*   **Content Management:**
    *   Content creation and storage.
    *   Content retrieval and display.
    *   Content upload.
*   **Subscription Management:**
    *   User subscriptions to content creators.
    *   Payment processing via Stripe.
*   **Database:**
    *   MongoDB Atlas setup.
*   **Storage:**
    *   AWS S3 storage integration.
*   **API:**
    *   Backend API serving data.
*   **Deployment:**
    *   Frontend deployment via Netlify.
    *   Backend deployment on AWS EC2.
    *   Nginx configuration for reverse proxy.
    *   PM2 for process management.
    *   SSL certificate setup with Let's Encrypt.
*   **Security:**
    *   AWS WAF integration.
    *   Regular security updates.
    *   Fail2ban for intrusion detection.
*   **Monitoring:**
    *   CloudWatch for CPU, memory, disk, network monitoring.
    *   Alerts for exceeding CPU utilization thresholds.
    *   pm2 logs and nginx error logs.
*   **Database backup:**
    *   Script to backup the database.
    *   Automatic backup via crontab.
*   **Access keys rotation:**
    *   Instructions to rotate access keys.
*   **Content and data retention:**
    *   S3 lifecycle rules.

### Planned Features

#### High Priority

1.  **User Profiles:**
    *   Creator profiles (with description, social links, etc.).
    *   Fan profiles (with settings, payment information, etc.).
2.  **Content Browsing/Discovery:**
    *   Search functionality for content.
    *   Categorization and filtering of content.
    *   "Explore" page for discovering new content/creators.
3.  **Creator Dashboard:**
    *   Analytics for creators (views, subscribers, earnings).
    *   Content management tools.
    *   Subscription plan management.
    *   Profile customization.
4.  **Creator earnings:**
    *   The creators should be able to see their earnings.
    *   The creators should be able to withdraw their earnings.
5. **Content interaction:**
    *   "Like" or "favorite" content.

#### Medium Priority

1.  **Direct Messaging:**
    *   Fans can message creators.
    *   Creators can reply to fans.
2.  **Tip/Donation System:**
    *   Fans can send tips to creators.
    *   Creators can view their tips.
3.  **Email Notifications:**
    *   New follower/subscriber notifications.
    *   Direct message notifications.
    *   Payment confirmations.
4.  **Improved error handling and logging:**
    *   The app should have a better way to handle errors and to log them.
5. **Content Interaction:**
    *   Comments and discussions on content.
    *   Content sharing.

#### Low Priority

1.  **Admin Panel:**
    *   Moderation of content and users.
    *   Site configuration.
2.  **Onboarding:**
    *   Tutorial or guide for new users.
3.  **DRM (Digital Rights Management):**
    *   Secure content delivery to prevent unauthorized copying or distribution.

## Issues

### High Urgency

1.  **Lack of Robust Error Handling:**
    *   The application lacks comprehensive error handling and logging, making it difficult to debug issues.
2.  **Inconsistent Button Colors:**
    *   In some places of the application, the buttons have different colors.
    *   **Location:** `src/components/pages/HomePage.tsx`
3.  **Development Login in Auth Middleware:**
    *   The development login bypass is implemented directly in the authentication middleware, which is not ideal.
    *   **Location:** `src/server/middlewares/auth.js`

### Medium Urgency

1.  **Missing Features from the Roadmap:**
    *   Many features from the `features.md` file are not yet implemented, such as user profiles, content browsing/discovery, content interaction, direct messaging, tipping, creator dashboard, email notifications.
2.  **Lack of validation:**
    *   The requests dont have any validation.
    *   **Location:** `src/server/routes`
3.  **Hardcoded Data/Placeholders:**
    *   The UI often uses hardcoded data or placeholder images.
    *   **Location:** `src/components`
4. **Unclear project structure:**
    * The project has some files in not clear locations.

### Low Urgency

1.  **Lack of Admin Panel:**
    *   There's no admin panel for content/user moderation or site configuration.
2.  **Missing Onboarding Tutorial:**
    *   New users lack an onboarding experience or tutorial.
3.  **No Digital Rights Management:**
    *   There is no DRM implemented.

## File Structure

### Root

*   Configuration files (`.nix`, `cypress.config.ts`, `eslint.config.js`, `jest.config.js`, `postcss.config.js`, `tailwind.config.js`, `tsconfig.*.json`, `vite.config.ts`, `webpack.config.js`)
*   Deployment (`Dockerfile`, `cloudbuild.yaml`, `nginx.conf`)
*   Documentation (`features.md`, `issues.md`, `readme.md`, `docs/api.md`)
*   Packages(`package.json`)
* Other (`index.html`, `prisma/schema.prisma`)

### `src/`

*   `App.tsx`, `main.tsx`, `index.css`: Main frontend files
*   `vite-env.d.ts`: Vite environment definitions
*   `hooks/`: Custom React hooks (`useApi.ts`, `useContentUploadForm.ts`, `useForm.ts`, `useLoading.ts`)
*   `images/`: Image assets
* `services/`: services to consume the API (`apiService.ts`)
*   `types/`: TypeScript types (`auth.ts`, `index.ts`)
*   `components/`: React components organized by function (auth, common, content, creator, layout, pages, subscription)

### `src/server/`

*   `config/`: Server configuration files (database, email, logger, S3, socket, stripe)
*   `middlewares/`: Express middleware (auth, errorHandler, requestLogger, security, upload)
*   `models/`: Mongoose models (Content, Subscription, User)
* `requests/`: Rest client requests (`new_user_request.rest`)
*   `routes/`: Express routes (auth, content, subscriptions, upload)
* `services/`: Services used by the app (`analytics.js`, `drm.js`, `search.js`)
* `Dockerfile`, `devLogin.js`, `package.json`, `server.js`

## Dependencies

Dependencies can be found in `package.json` and `src/server/package.json`.

## Setup Instructions

### Prerequisites

*   Node.js (v18 or higher)
*   npm (or yarn)
*   Git
*   MongoDB Atlas account
*   AWS account (for S3 and EC2)
*   Stripe account
*   Netlify account

### Installation
   1. Clone the repository:


   2. Navigate to the root directory of the project.

   3. Install frontend dependencies:

   ```bash
   npm run build
   ```

2. The build output will be in the `dist` directory.

3. Deploy to Netlify:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Set environment variables:
     ```
     VITE_API_URL=your_backend_url
     ``` 

### Backend Deployment (AWS)

1. Set up an EC2 instance:
   - Choose Ubuntu Server 20.04 LTS
   - Configure security groups to allow HTTP/HTTPS traffic
   - Set up SSH access

2. Install dependencies:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. Clone your repository and install dependencies:
   ```bash
   git clone your_repository_url
   cd your_project
   npm install
   ```

4. Set up environment variables:
   ```bash
   sudo nano /etc/environment
   ```
   Add:
   ```
   DATABASE_URL="your_database_url"
   JWT_SECRET="your_jwt_secret"
   STRIPE_SECRET_KEY="your_stripe_secret"
   STRIPE_WEBHOOK_SECRET="your_webhook_secret"
   ```

5. Set up PM2 for process management:
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "api" -- start
   pm2 startup
   ```

6. Configure Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   Add:
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your_domain.com
   ```

8. Restart Nginx:
   ```bash
   sudo systemctl restart nginx```
   ```

9. Set up database backups:
   ```bash
   # Create backup script
   sudo nano /usr/local/bin/backup-db.sh
   ```
   Add:
   ```bash
   #!/bin/bash
   DATE=$(date +%Y-%m-%d)
   pg_dump your_database > /backups/db-$DATE.sql
   ```
   ```bash
   # Make executable
   sudo chmod +x /usr/local/bin/backup-db.sh
   
   # Add to crontab
   sudo crontab -e
   ```
   Add:
   ```
   0 0 * * * /usr/local/bin/backup-db.sh
   ```

10. Monitor logs:
    ```bash
    pm2 logs
    sudo tail -f /var/log/nginx/error.log
    ```

### Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Configure network access and database user
3. Get connection string and update environment variables
4. Set up database indexes:
   ```javascript
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "username": 1 }, { unique: true })
   db.content.createIndex({ "creatorId": 1 })
   db.subscriptions.createIndex({ "userId": 1, "creatorId": 1 })
   ```

### Storage Setup (AWS S3)

1. Create S3 bucket:
   - Enable versioning
   - Configure CORS
   - Set up lifecycle rules for old content

2. Create IAM user with S3 access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

3. Update environment variables with S3 credentials:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_BUCKET_NAME=your_bucket_name
   ```

### Monitoring and Maintenance

1. Set up monitoring with CloudWatch:
   - CPU utilization
   - Memory usage
   - Disk space
   - Network traffic

2. Configure alerts:
   ```bash
   aws cloudwatch put-metric-alarm \
     --alarm-name cpu-utilization \
     --alarm-description "CPU utilization exceeded 80%" \
     --metric-name CPUUtilization \
     --namespace AWS/EC2 \
     --statistic Average \
     --period 300 \
     --threshold 80 \
     --comparison-operator GreaterThanThreshold \
     --evaluation-periods 2 \
     --alarm-actions arn:aws:sns:region:account-id:topic-name
   ```

3. Regular maintenance tasks:
   - Update dependencies monthly
   - Rotate SSL certificates
   - Review and rotate access keys
   - Check and optimize database indexes
   - Monitor storage usage and clean up unused files

### Security Considerations

1. Enable AWS WAF:
   - Rate limiting
   - IP blacklisting
   - SQL injection protection
   - XSS protection

2. Regular security updates:
   ```bash
   sudo apt update
   sudo apt upgrade
   ```

3. Configure backup retention:
   ```bash
   # Set up S3 lifecycle rules
   aws s3api put-bucket-lifecycle-configuration \
     --bucket your-bucket-name \
     --lifecycle-configuration file://lifecycle.json
   ```

4. Set up logging and monitoring:
   ```bash
   # Install and configure fail2ban
   sudo apt install fail2ban
   sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
   ```

Remember to:
- Regularly update SSL certificates
- Monitor server resources
- Keep dependencies up to date
- Review security logs
- Test backup restoration procedures
- Monitor API performance and errors