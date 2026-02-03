

# ResearchVault: Secure Research Paper Management System

ResearchVault is a secure web application designed for universities to manage the submission, review, and publication of research papers. It adheres to NIST security guidelines, implementing hybrid encryption for data privacy, multi-factor authentication (MFA) for access control, and digital signatures for administrative integrity.

## Project Overview

The system facilitates a secure workflow between three key stakeholders: Students, Faculty, and Administrators. It addresses the critical need for confidentiality in the peer-review process and integrity in the final publication decision.

### Key Security Features

* **Hybrid Cryptography:** Research papers are encrypted client-side using AES-256. The AES keys are encrypted using RSA before being stored, ensuring that even database administrators cannot access raw documents without the private key.
* **NIST-Compliant Authentication:** Implementation of Two-Factor Authentication (2FA) using passwords and email-based One-Time Passwords (OTP).
* **Role-Based Access Control (RBAC):** Strict separation of duties between Students (uploaders), Faculty (reviewers), and Admins (decision makers).
* **Digital Signatures:** Admin decisions (Accept/Reject) are cryptographically signed using SHA-256 and RSA to ensure non-repudiation and integrity.

## User Roles and Workflow

1. **Student**
* Register and Log in via MFA.
* Upload research papers (PDFs are automatically encrypted).
* View the status of their submissions.
* Decrypt and download their own papers.


2. **Faculty**
* Log in via MFA.
* View papers assigned for review.
* Decrypt and download papers for evaluation.
* Submit reviews consisting of a numerical score and qualitative comments.


3. **Administrator**
* Log in via MFA.
* View all submitted papers and their respective status.
* Read reviews submitted by Faculty members.
* Publish final decisions (Accept/Reject), which generates a verifiable digital signature.



## Technology Stack

* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth + Custom Node.js MFA Logic
* **Cryptography:** Node.js Crypto Module (AES-256-CBC, RSA-2048, SHA-256)

## Installation and Setup

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* A Supabase account

### 1. Database Setup

Create a new project in Supabase and run the following SQL query in the SQL Editor to set up the necessary tables and Row Level Security (RLS) policies:

```sql
-- Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin'))
);

-- Create Papers Table
CREATE TABLE public.papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  file_url TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reviews Table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id),
  reviewer_id UUID REFERENCES auth.users(id),
  score INTEGER,
  comments TEXT,
  decision_text TEXT,
  digital_signature TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Secrets Table (for MFA)
CREATE TABLE public.user_secrets (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  otp_hash TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, COALESCE(new.raw_user_meta_data->>'role', 'student'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

```

### 2. Backend Configuration

1. Navigate to the `backend` directory.
2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `backend` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

```


4. Start the server:
```bash
node server.js

```



### 3. Frontend Configuration

1. Navigate to the `frontend` directory.
2. Install dependencies:
```bash
npm install

```


3. Start the development server:
```bash
npm run dev

```



## Usage Guide

### Creating Admin and Faculty Accounts

By default, all new registrations are assigned the **Student** role. To create privileged accounts:

1. Register a new user via the Frontend (e.g., `admin@univ.edu`).
2. Go to the Supabase Dashboard > Table Editor > `profiles`.
3. Locate the user and manually change the `role` column to `admin` or `faculty`.

### How to Test

1. **Student:** Login and upload a PDF. Verify it appears on the dashboard.
2. **Faculty:** Login (after promoting the user). Click "Submit Review" on a paper. Fill out the score and comments.
3. **Admin:** Login (after promoting the user). Click "Read Reviews" to see the faculty feedback. Click "Accept" or "Reject" to finalize the paper.

## License

This project is open-source and available for educational purposes.
