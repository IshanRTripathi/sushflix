## Deployment Instructions

### Frontend Deployment (Netlify)

1. Build the frontend:
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