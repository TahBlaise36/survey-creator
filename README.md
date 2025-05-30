# survey-creator

Simple Survey Creator
A collaborative project to build a feature-rich survey/poll creation and management platform, leveraging modern web technologies and robust DevOps practices.

🚀 Overview
This application allows users to create, manage, and share surveys. It also provides functionalities for users to vote on surveys and view real-time results. The project emphasizes a strong team-based development workflow, integrating various DevOps tools to ensure code quality, efficient deployment, and seamless collaboration.

✨ Features
User Authentication: Secure sign-up, sign-in, and sign-out powered by Supabase Auth.

Survey Creation: Intuitive forms to design multi-question surveys with various options.

Survey Listing & Management: A dashboard to view and manage all created surveys.

Survey Voting: Publicly accessible pages for users to participate in surveys.

Real-time Results: Dynamic display of survey responses as they come in.

Responsive Design: Built with Tailwind CSS and shadcn/ui for a great experience on all devices.

🛠️ Tech Stack
Frontend Framework: Next.js (React)

Styling: Tailwind CSS

UI Components: shadcn/ui (built on Radix UI)

Backend & Database: Supabase (PostgreSQL, Authentication, Realtime, Storage)

Deployment: Vercel

Version Control: Git / GitHub

CI/CD Automation: GitHub Actions

Containerization (Local Dev): Docker / Docker Compose

Project Management & Issue Tracking: Jira

🏁 Getting Started
Follow these steps to set up the project locally and understand the team workflow.

For the Project Creator (Team Lead / Initial Setup)
This section outlines the initial setup of the repository, Next.js project, Docker configuration, and the foundational CI pipeline.

Create the GitHub Repository:

Go to GitHub.com and create a New repository.

Repository name: simple-survey-creator

Visibility: Public (or Private if preferred)

Initialize this repository with:

✅ Add a README file

✅ Add .gitignore (Select Node)

Click Create repository.

# Clone the Repository & Initialize dev Branch:

Open your terminal and clone the newly created repository.

Create and push the dev branch, which will be your main integration branch.

### Clone the repository (replace with your GitHub username)

git clone https://github.com/YOUR_GITHUB_USERNAME/simple-survey-creator.git
cd simple-survey-creator

### Verify you are on 'main'

git branch -a # Should show \* main

### Create the 'dev' branch locally

git checkout -b dev

### Push 'dev' to GitHub and set it as upstream

git push -u origin dev

# Initialize Next.js Project & Core Dependencies:

This sets up the Next.js application within the cloned repository, along with Tailwind CSS, ESLint, TypeScript, and the App Router.

Install Supabase SDK and initialize shadcn/ui components.

### Ensure you're on the dev branch

git checkout dev

# Initialize Next.js in the current directory (answer prompts as desired, e.g., TypeScript, ESLint, Tailwind, App Router, Src directory)

npx create-next-app@latest . --ts --eslint --tailwind --app --src

### Install Supabase SDK

npm install @supabase/supabase-js

### Initialize shadcn/ui (follow prompts, confirm global.css update, select desired components)

npx shadcn-ui@latest init

Configure Environment Variables (.env.local):

Create this file at the root of your project. DO NOT COMMIT THIS FILE TO GIT!

Replace YOUR_REMOTE_SUPABASE_URL and YOUR_REMOTE_SUPABASE_ANON_KEY with your actual Supabase project credentials (from your Supabase Dashboard -> Project Settings -> API).

The \_LOCAL variables are placeholders for CI builds to pass validation.

echo "NEXT_PUBLIC_SUPABASE_URL=YOUR_REMOTE_SUPABASE_URL" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_REMOTE_SUPABASE_ANON_KEY" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://supabase:54321" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.dc_VNlTCdKz_6z_L9m0b8xMh66_u8-m27-0lQ6_S7_c" >> .env.local

# Set up Docker & Docker Compose for Local Development:

Create Dockerfile for your Next.js application.

Create docker-compose.yml to orchestrate your Next.js app and a local Supabase instance.

## Create Dockerfile for Next.js app

cat << EOF > Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
EOF

## Create docker-compose.yml

cat << EOF > docker-compose.yml
version: '3.8'
services:
supabase:
image: supabase/cli:latest
command: start --debug
ports: - "54321:54321" # Supabase client API - "54322:54322" # Realtime - "54323:54323" # Auth - "54324:54324" # Storage - "54325:54325" # Functions - "54326:54326" # PGAnon - "54327:54327" # Vector - "54328:54328" # InfluxDB - "54329:54329" # Grafana - "8000:8000" # Deno Runtime
volumes: - ./supabase:/project # Mount your local Supabase project directory (create this folder later with 'supabase init')
environment: - SUPABASE_PROJECT_ID=local_survey_app - SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.dc_VNlTCdKz_6z_L9m0b8xMh66_u8-m27-0lQ6_S7_c
app:
build:
context: .
dockerfile: Dockerfile
ports: - "3000:3000"
volumes: - .:/app # Mount local code for hot-reloading in dev - /app/node_modules # Exclude node_modules from host mount
environment: - NEXT_PUBLIC_SUPABASE_URL=http://supabase:54321 - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.dc_VNlTCdKz_6z_L9m0b8xMh66_u8-m27-0lQ6_S7_c
depends_on: - supabase
EOF

# Set up Initial GitHub Actions CI Pipeline:

## Create the workflow file for automated checks.

mkdir -p .github/workflows
cat << EOF > .github/workflows/main.yml
name: CI/CD Pipeline

on:
push:
branches: - main - dev
pull_request:
branches: - main - dev - feature/\* # Run CI on feature branches

jobs:
build-and-test:
runs-on: ubuntu-latest
steps: - name: Checkout code
uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Build Next.js app
        run: npm run build
        env:
          # Dummy local env vars for CI build to pass validation
          NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.NEXT_PUBLIC_SUPABASE_URL_LOCAL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL }}

      # Add 'npm test' step here once you start writing tests
      # - name: Run Tests
      #   run: npm test -- --coverage

EOF

Important: You'll need to add NEXT_PUBLIC_SUPABASE_URL_LOCAL and NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL as GitHub Secrets in your repository settings (Settings -> Secrets and variables -> Actions -> New repository secret). Use the dummy values provided in the .env.local setup.

Update package.json Scripts for Formatting:

npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."

# Commit All Initial Setup & Push to dev:

git add .
git commit -m "feat: Initial project setup with Next.js, Tailwind, shadcn, Supabase, Docker, and CI pipeline"
git push origin dev

# Merge dev to main (Initial Production Release):

This step pushes your initial, working (even if minimal) application to the main branch, representing your first "production" release.

### Ensure you're on the main branch

git checkout main

### Ensure main is up-to-date

git pull origin main

### Merge dev into main

git merge dev

### Push main to GitHub

git push origin main

# For Other Developers (Team Members)

This section guides team members on how to get started, work on features, and contribute following the established DevOps workflow.

### 1. Open VS-code in your machine and open a new terminal

### 2. Change the current working directory to the Desktop

` cd desktop

## Clone the Repository:

### 3. Get the project code from GitHub.

` git clone https://github.com/TahBlaise36/survey-creator.git

### 4. Change the current working directory to the survey-creator

cd survey-creator

## Switch to the dev Branch:

All development work starts from dev.

### 5. Switch to the dev Branch

` git checkout dev

### 6. Ensure you have the latest dev branch

` git pull origin dev

# Set up Your Local Environment (.env.local):

Create your local environment file. DO NOT COMMIT THIS FILE!

Replace YOUR_REMOTE_SUPABASE_URL and YOUR_REMOTE_SUPABASE_ANON_KEY with your actual Supabase project credentials.

echo "NEXT_PUBLIC_SUPABASE_URL=YOUR_REMOTE_SUPABASE_URL" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_REMOTE_SUPABASE_ANON_KEY" >> .env.local

# These are for CI build consistency, not typically used in local dev directly

echo "NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://supabase:54321" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.dc_VNlTCdKz_6z_L9m0b8xMh66_u8-m27-0lQ6_S7_c" >> .env.local

# Install Dependencies:

` npm install

# Run the Project Locally (Recommended: Docker Compose):

Ensure Docker Desktop (or equivalent) is running on your machine.

This command will start both the local Supabase services and your Next.js application in isolated containers.

` docker-compose up --build

# Access your app at http://localhost:3000

# Access local Supabase Studio at http://localhost:54323

(Optional: If you prefer to run Next.js directly on Node.js without Docker for the app container, you can use npm run dev after docker-compose up supabase to start only the local Supabase.)

# Feature Development Workflow (for each task):

Step 6.1: Pick a Jira Task:

- Go to the Jira board for the Survey Creator project (Key: SC).

- Find an unassigned task (e.g., SC-3: Implement fetching and displaying survey analytics on Dashboard).

- Assign it to yourself.

- Drag the task from "To Do" to "In Progress" on the Jira board.

- DevOps Utilization: Provides visibility on what you're working on and updates the project's progress.

Step 6.2: Create a Feature Branch:

- Always create a new branch from the latest dev.

CRITICAL: Include the Jira issue key (SC-X) in your branch name.

### Ensure your on the dev Branch

` git checkout dev

### Always pull latest before branching

` git pull origin dev

### Example branch name for SC-3

` git checkout -b feature/SC-3-analytics-fetch

DevOps Utilization: Ensures isolated development, prevents conflicts, and enables automatic linking to Jira.

Step 6.3: Implement the Functionality:

Write your code as per the Jira task description.

For SC-3, this would involve re-enabling fetchAnalytics in app/dashboard/page.tsx and ensuring SurveyStats receives and displays the data.

<!-- Write Tests: Add or re-enable unit/integration tests (_.test.ts or _.test.tsx files) for the functionality you are implementing.

Code Style: Run "npm run lint" and npm run format regularly to ensure your code adheres to project standards. -->

Step 6.4: Commit Your Changes:

Commit frequently with clear, concise messages.

CRITICAL: Include the Jira issue key (SC-X) in your commit message.

git add . 
git commit -m "SC-3: Re-enable analytics fetching and display on dashboard"

### Example for another commit:

` git commit -m "SC-3: Add unit tests for fetchAnalytics function"

DevOps Utilization: Provides granular history, links commits directly to Jira issues, and supports traceability.

Step 6.5: Push Your Feature Branch:

` git push -u origin feature/SC-3-analytics-fetch

Step 6.6: Create a Pull Request (PR):

Go to your GitHub repository in your browser. GitHub will usually prompt you to create a PR for your newly pushed branch.

CRITICAL:

Target branch: Ensure the PR targets the dev branch.

Title: Start with the Jira issue key, followed by a clear summary (e.g., SC-2: Re-implement Survey Analytics Dashboard).

Description: Provide a detailed explanation of your changes, how to test them, and reference the Jira issue (e.g., Closes SC-2).

Assign Reviewers: Assign the designated code reviewers (e.g., @YourTeamLeadUsername, @OtherReviewerUsername).

DevOps Utilization:

Continuous Integration: PR creation triggers the GitHub Actions CI pipeline, running linting, formatting, build, and your tests.

\*\*Automated Pre
