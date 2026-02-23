# Smart Job Portal - Technical Specification

## 1. Project Overview

**Project Name:** Smart Job Portal
**Type:** Full-stack SaaS Web Application
**Core Functionality:** AI-powered job matching platform connecting job seekers with recruiters through intelligent resume-job matching using NLP and embeddings
**Target Users:** Job seekers, recruiters, and administrators

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **UI Components:** ShadCN UI
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query)
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcrypt

### AI/ML
- **Resume Parsing:** pdf-parse (PDF text extraction)
- **Embeddings:** OpenAI API (text-embedding-3-small)
- **Similarity:** Cosine similarity for ranking

### DevOps
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render/Railway
- **Database:** MongoDB Atlas

---

## 3. UI/UX Specification

### Color Palette
- **Primary:** #0F172A (Slate 900 - deep navy)
- **Secondary:** #3B82F6 (Blue 500 - vibrant blue)
- **Accent:** #10B981 (Emerald 500 - success green)
- **Warning:** #F59E0B (Amber 500)
- **Error:** #EF4444 (Red 500)
- **Background:** #F8FAFC (Slate 50)
- **Card Background:** #FFFFFF
- **Text Primary:** #1E293B (Slate 800)
- **Text Secondary:** #64748B (Slate 500)
- **Border:** #E2E8F0 (Slate 200)

### Typography
- **Font Family:** "Plus Jakarta Sans" (headings), "Inter" (body)
- **Headings:**
  - H1: 36px/2.25rem, font-weight: 700
  - H2: 30px/1.875rem, font-weight: 600
  - H3: 24px/1.5rem, font-weight: 600
  - H4: 20px/1.25rem, font-weight: 600
- **Body:** 16px/1rem, font-weight: 400
- **Small:** 14px/0.875rem, font-weight: 400

### Layout Structure
- **Max Width:** 1440px
- **Container Padding:** 24px (mobile), 48px (desktop)
- **Grid:** 12-column grid system
- **Spacing Scale:** 4px base (4, 8, 12, 16, 24, 32, 48, 64, 96)

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Components

#### Navigation
- Sticky navbar with blur backdrop
- Logo on left, nav links center, auth buttons right
- Mobile hamburger menu with slide-out drawer
- Active state: blue underline with smooth transition

#### Cards
- White background with subtle shadow (0 1px 3px rgba(0,0,0,0.1))
- Border radius: 12px
- Hover: slight lift effect with enhanced shadow
- Padding: 24px

#### Buttons
- Primary: Blue background, white text, rounded-lg (8px)
- Secondary: White background, blue border, blue text
- Ghost: Transparent, text only
- Hover: brightness increase, scale 1.02
- Transition: 150ms ease

#### Forms
- Input fields: 48px height, rounded-lg, slate-200 border
- Focus: blue-500 ring (2px)
- Labels: slate-700, font-medium
- Error states: red border, red text below

#### Match Percentage Badge
- Circular progress indicator
- Green (>75%), Yellow (50-75%), Red (<50%)
- Animated fill on load

### Animations
- Page transitions: fade in (200ms)
- Card hover: translateY(-2px), shadow increase
- Skeleton loaders for async content
- Staggered list animations (50ms delay between items)
- Smooth accordion expand/collapse

---

## 4. Database Schema

### Users Collection
```
javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed),
  role: Enum ['jobseeker', 'recruiter', 'admin'],
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    location: String,
    bio: String,
    avatar: String (url),
    skills: [String],
    experience: [{
      company: String,
      title: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      graduationDate: Date
    }]
  },
  resume: {
    url: String,
    text: String (parsed content),
    skills: [String] (extracted),
    uploadedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Jobs Collection
```
javascript
{
  _id: ObjectId,
  recruiterId: ObjectId (ref: Users),
  title: String (required),
  company: String (required),
  description: String (required),
  requirements: [String],
  location: String,
  type: Enum ['full-time', 'part-time', 'contract', 'internship'],
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  skills: [String],
  status: Enum ['active', 'closed', 'draft'],
  applicants: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```
javascript
{
  _id: ObjectId,
  jobId: ObjectId (ref: Jobs),
  candidateId: ObjectId (ref: Users),
  recruiterId: ObjectId (ref: Users),
  status: Enum ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
  matchScore: Number (0-100),
  coverLetter: String,
  appliedAt: Date,
  updatedAt: Date
}
```

---

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/resume` - Upload resume
- `GET /api/users/:id/recommendations` - Get AI job recommendations

### Jobs
- `GET /api/jobs` - List jobs (with filters)
- `POST /api/jobs` - Create job (recruiter)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/recruiter/:id` - Get recruiter's jobs

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/candidate/:id` - Get candidate's applications
- `GET /api/applications/job/:id` - Get job applicants
- `PUT /api/applications/:id` - Update application status
- `GET /api/applications/job/:id/ranked` - Get ranked candidates

### AI Matching
- `POST /api/ai/match` - Match resume to job
- `POST /api/ai/extract-skills` - Extract skills from text
- `GET /api/ai/recommendations/:userId` - Get personalized recommendations

---

## 6. Page Structure

### Public Pages
1. **Landing Page** (`/`)
   - Hero section with CTA
   - Features showcase
   - Statistics/numbers
   - Testimonials
   - Footer

2. **Login** (`/login`)
3. **Register** (`/register`)

### Job Seeker Pages
4. **Dashboard** (`/dashboard`)
   - Stats overview
   - Recommended jobs
   - Recent applications

5. **Job Search** (`/jobs`)
   - Search & filters
   - Job listings grid

6. **Job Details** (`/jobs/:id`)
   - Job info
   - Apply button
   - Match score

7. **Profile** (`/profile`)
   - Edit profile form
   - Resume upload
   - Skills management

8. **Applications** (`/applications`)
   - Application list
   - Status tracking

### Recruiter Pages
9. **Dashboard** (`/recruiter/dashboard`)
   - Stats overview
   - Recent postings
   - Pending reviews

10. **Post Job** (`/recruiter/jobs/new`)
    - Job creation form

11. **Manage Jobs** (`/recruiter/jobs`)
    - Job listings with stats

12. **Job Applicants** (`/recruiter/jobs/:id/applicants`)
    - Ranked candidates list
    - Filter & search

13. **Company Profile** (`/recruiter/profile`)
    - Company info

---

## 7. AI Matching Engine

### Process Flow
1. **Resume Parsing**
   - Extract text from PDF using pdf-parse
   - Clean and normalize text

2. **Skill Extraction**
   - Use OpenAI to extract skills from resume text
   - Compare with job requirements

3. **Embedding Generation**
   - Convert resume text to embedding vector
   - Convert job description to embedding vector

4. **Similarity Calculation**
   - Compute cosine similarity between vectors
   - Score: 0-100%

5. **Ranking**
   - Sort by match score descending
   - Factor in: skills match, experience, location

---

## 8. Acceptance Criteria

### Authentication
- [ ] Users can register with email/password
- [ ] Users can login and receive JWT
- [ ] Role-based routing works correctly
- [ ] Password is securely hashed

### Job Seeker
- [ ] Can create and edit profile
- [ ] Can upload and parse resume (PDF)
- [ ] Can search and filter jobs
- [ ] Can apply to jobs
- [ ] Sees AI match percentage on job cards
- [ ] Gets personalized job recommendations

### Recruiter
- [ ] Can create, edit, delete job postings
- [ ] Can view all applicants for a job
- [ ] Sees AI-ranked candidate list
- [ ] Can filter candidates by score

### AI Features
- [ ] Resume text extraction works
- [ ] Skills are extracted automatically
- [ ] Match percentage is accurate
- [ ] Recommendations are relevant

### UI/UX
- [ ] Responsive on all devices
- [ ] Loading states shown
- [ ] Error handling in place
- [ ] Smooth animations

---

## 9. Project Structure

```
smart_job_portal/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── (auth)/      # Auth pages
│   │   │   ├── (dashboard)/ # Protected pages
│   │   │   └── api/         # API routes
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/          # ShadCN components
│   │   │   └── features/   # Feature components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   ├── store/          # Zustand store
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   │   └── ai/        # AI services
│   │   └── utils/         # Utilities
│   ├── package.json
│   └── .env.example
│
├── SPEC.md
└── README.md
```

---

## 10. Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
