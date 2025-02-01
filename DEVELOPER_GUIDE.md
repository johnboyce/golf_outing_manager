# Developer Guide for Golf Outing Manager

## Overview
The **Golf Outing Manager** is a full-stack application designed to facilitate golf event management, including player drafts, team formations, foursome scheduling, and course management. The project leverages AWS services, Terraform for infrastructure as code, and a dynamic frontend using Bootstrap and jQuery.

## Tech Stack
### Backend:
- **AWS Lambda** - Serves API endpoints for players, courses, and drafts.
- **Amazon DynamoDB** - NoSQL database for storing players, courses, and drafts.
- **AWS API Gateway** - Provides RESTful API access to the Lambda function.
- **Amazon S3** - Stores static frontend assets and Lambda deployment packages.
- **Terraform** - Infrastructure as Code (IaC) for managing AWS resources.

### Frontend:
- **HTML, CSS (Bootstrap & Font Awesome)** - Provides a clean, mobile-friendly UI.
- **JavaScript (jQuery)** - Handles UI interactions and API requests.
- **StateManager.js** - Manages client-side state across UI interactions.

## Key Features
1. **Player Draft System** - Allows users to select team captains and assign players.
2. **Team Management** - Assigns players to teams dynamically.
3. **Foursome Generator** - Randomly distributes players across courses while ensuring diverse team pairings.
4. **Course Management** - Courses are dynamically loaded from DynamoDB and can be managed via API.
5. **Deployment Automation** - Uses GitHub Actions and Terraform to manage cloud resources.

## Deployment Process
The deployment is fully automated using Terraform and GitHub Actions.

### 1. **Terraform Infrastructure**
- Defines and provisions AWS resources, including:
    - S3 buckets for static assets and Lambda deployments.
    - DynamoDB tables for players and courses.
    - API Gateway for exposing the Lambda function.
    - CloudFront distribution for frontend delivery.

Run Terraform with:
```sh
terraform init
terraform apply -auto-approve
```

### 2. **GitHub Actions Workflow**
- **Triggers:** Runs on `push` to the main branch.
- **Steps:**
    1. **Setup Terraform & AWS Credentials**
    2. **Build and Package Lambda Code**
    3. **Upload to S3**
    4. **Deploy with Terraform**
    5. **Invalidate CloudFront Cache**

### 3. **Lambda Deployment**
- The function is automatically deployed via S3 when `lambda/index.js` changes.
- Uses:
```hcl
lambda_src_hash = filemd5("../lambda/index.js")
```
- To force an update:
```sh
terraform taint aws_lambda_function.golf_outing_lambda
terraform apply
```

## API Endpoints
| Method | Endpoint          | Description |
|--------|------------------|-------------|
| GET    | `/players`       | List all players |
| POST   | `/players`       | Add a new player |
| GET    | `/courses`       | List all courses |
| POST   | `/courses`       | Add a new course |

Example API request:
```sh
curl -i -H "Accept: application/json" https://<API_GATEWAY_URL>/players
```

## Local Development
To test the frontend locally:
```sh
cd src
python3 -m http.server
```
To test the Lambda function locally:
```sh
cd lambda
node index.js
```

## Troubleshooting
1. **Lambda Not Updating**
    - Ensure S3 bucket contains the latest `lambda.zip`
    - Run `terraform taint aws_lambda_function.golf_outing_lambda && terraform apply`

2. **API Gateway Returning 500 Errors**
    - Check AWS Lambda logs in **CloudWatch**.
    - Verify that `node_modules` is included in Lambda package.

3. **CloudFront Not Serving Updated Assets**
    - Run `aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"`

## Future Enhancements
- Implement user authentication with Cognito.
- Expand statistics tracking for players.
- Add UI themes for better customization.

---
_This document serves as a guide for developers working on the Golf Outing Manager project._

