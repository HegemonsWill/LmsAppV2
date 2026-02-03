# Cloud-native Library Management System
A modern, cloud-native **Library Management System** built with **React + Vite + AWS Amplify**, featuring secure authentication, CI/CD automation, and scalable cloud architecture.

---

## Features
-  **AWS Cognito Authentication** (Amplify Authenticator UI)
-  **Fully automated CI/CD** via GitHub → Amplify Hosting  
-  **Vite + React** frontend with modular components  
-  **Global CDN Deployment** (zero downtime)  
-  **Book Request System & Notification Bell**  
-  Custom UI theme (gradient red background + white cards + brand logo)  
-  Clean folder structure & reusable UI components  

---

##  Tech Stack
**Frontend:**  
- React 19  
- Vite  
- Tailwind (optional)  
- React Router  

**Cloud Services:**  
- AWS Amplify Hosting  
- Amazon Cognito (User Pools)  
- AWS SSM Parameter Store  
- (Upcoming) DynamoDB + Lambda  

---

## CI/CD Pipeline
This project uses **Amplify Hosting** with GitHub integration:

- Every `git push` triggers:
  1. `npm ci`  
  2. `vite build`  
  3. Deploy to global AWS CDN  
- Automatic previews for feature branches (if enabled)

---

## Project Structure
/src
/components
/pages
/auth
/assets
amplify/
public/
index.html
vite.config.js
aws-exports.js

---

## Setup (Local Development)

```bash
git clone https://github.com/<your-username>/lmsappv2.git
cd lmsappv2
npm install
npm run dev
The app will run on:
➡️ http://localhost:5173/


🌍 Live Production URL

👉 https://main.d378adatvparql.amplifyapp.com
