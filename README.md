# Golf Outing Manager

A fun, interactive, and visually appealing web app for managing golf outings. Built with:

- **HTML, CSS, and JavaScript** for the frontend
- **AWS S3, Lambda, API Gateway, and DynamoDB** for hosting and persistence
- **Terraform** for infrastructure as code
- **GitHub Actions** for automated deployment

## Features

- Real-time drafting with mock draft and reset capabilities
- Handicaps displayed everywhere alongside player names
- Funny bios, predictions, and pictures for each golfer
- Tabs for managing foursomes, round results, and outing summaries

## Setup

1. Run the following commands to set up the project locally:
   zsh setup.sh
2. Deploy the infrastructure and app using Terraform and GitHub Actions.
3. Update the golfer data, bios, and predictions in the src/data/players.json file.
4. Update the courses data in the src/data/courses.json file.

## Deployment

1. Push your repository to GitHub.
2. GitHub Actions will handle deployment to AWS.
3. The app will be hosted on an S3 static website, with backend data stored in DynamoDB.

## Mock Draft and Reset Instructions

- Perform a mock draft using the "Draft" tab in the app.
- Reset teams with the "Reset" button on the draft page.

## Update Handicaps

- Update player handicaps in the UI under the "Foursomes" tab.
- Handicaps are displayed everywhere alongside player names.

## Infrastructure

Terraform scripts are included in the  directory to provision:
- S3 bucket for static hosting
- DynamoDB table for persistence
- Lambda functions and API Gateway for backend

## GitHub Actions

Automates deployment with a workflow defined in .github/workflows/deploy.yml.

