# Smart Job Portal - AI Resume Matching Platform

A production-ready full-stack web application that provides AI-powered job matching between job seekers and recruiters.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-4-green)
![Express](https://img.shields.io/badge/Express-4-gray)

## 🚀 Features

### For Job Seekers
- User registration and authentication (JWT)
- Profile creation with skills, experience, and education
- Resume upload and parsing (PDF)
- AI-powered job recommendations
- Job search with filters (type, location, skills)
- Apply to jobs with one click
- Application status tracking
- Match percentage display on job listings

### For Recruiters
- Company profile management
- Job posting CRUD operations
- View all applicants for each job
- AI-ranked candidate list based on resume-job match
- Filter candidates by match score
- Application status management

### AI Features
- PDF resume text extraction
- Skills extraction using OpenAI
- Semantic embeddings generation
- Cosine similarity matching
- Match percentage scoring (0-100%)
- Personalized job recommendations

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI + Radix UI
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query)
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer

### AI/ML
- **Resume Parsing:** pdf-parse
- **Embeddings:** OpenAI API (text-embedding-3-small)
- **Matching:** Cosine similarity

## 📁 Project Structure

```
smart_job_portal/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/      # Login, Register
│   │   │   ├── dashboard/   # Job seeker dashboard
│   │   │   ├── recruiter/   # Recruiter dashboard
│   │   │   ├── jobs/        # Job listings & details
│   │   │   └── api/         # API routes
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # ShadCN components
│   │   │   └── features/    # Feature components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── store/           # Zustand store
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                   # Express.js Backend
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   └── ai/          # AI services
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── .env.example
│
├── SPEC.md                   # Technical specification
├── TODO.md                   # Implementation tasks
└── README.md                 # This file
```

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key

### Environment Setup

1. **Clone the repository**

2. **Backend Setup**
```
bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

3. **Frontend Setup**
```
bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```
env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
```

**Frontend (.env.local)**
```
env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `POST /api/users/:id/resume` - Upload resume
- `GET /api/users/:id/recommendations` - Get AI recommendations

### Jobs
- `GET /api/jobs` - List jobs (with filters)
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/candidate/:id` - Get candidate applications
- `GET /api/applications/job/:id` - Get job applicants
- `PUT /api/applications/:id` - Update status

### AI
- `POST /api/ai/match` - Match resume to job
- `POST /api/ai/extract-skills` - Extract skills
- `GET /api/ai/recommendations/:userId` - Get recommendations

## 📱 Pages

### Public
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Job Seeker
- `/dashboard` - Dashboard with recommendations
- `/jobs` - Job search and listings
- `/jobs/:id` - Job details and apply
- `/profile` - Profile management
- `/applications` - Application tracking

### Recruiter
- `/recruiter/dashboard` - Recruiter dashboard
- `/recruiter/jobs` - Manage job postings
- `/recruiter/jobs/new` - Post new job
- `/recruiter/jobs/:id/applicants` - View applicants

## 🎨 UI Features

- Clean, modern design (LinkedIn/Indeed inspired)
- Fully responsive (mobile + desktop)
- Loading skeletons
- Error handling
- Smooth animations
- Dark/Light theme ready

## 📊 Database Schema

### Users
- Email, password (hashed)
- Role (jobseeker/recruiter/admin)
- Profile (name, skills, experience, education)
- Resume (url, text, extracted skills)

### Jobs
- Title, company, description
- Requirements, responsibilities
- Location, type, salary
- Skills, experience level
- Status (active/closed/draft)

### Applications
- Job reference, candidate reference
- Status (pending/reviewing/shortlisted/rejected/accepted)
- Match score (0-100%)
- Timeline

## 🤖 AI Matching Engine

1. **Resume Parsing**: Extract text from PDF using pdf-parse
2. **Skills Extraction**: Use OpenAI to identify skills from text
3. **Embedding Generation**: Convert text to vectors using OpenAI
4. **Similarity Calculation**: Compute cosine similarity
5. **Ranking**: Sort by match score

## 🧪 Testing

```
bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Deployment

### Frontend (Vercel)
```
bash
cd frontend
vercel deploy
```

### Backend (Render/Railway)
```
bash
cd backend
railway deploy
```

### Database (MongoDB Atlas)
- Create a free cluster
- Get connection string
- Add to environment variables

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [ShadCN UI](https://ui.shadcn.com)
- [OpenAI](https://openai.com)
- [MongoDB](https://www.mongodb.com)

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using Next.js, Express, MongoDB, and OpenAI
