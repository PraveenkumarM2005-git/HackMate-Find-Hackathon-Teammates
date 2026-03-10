# 🚀 HackMate – Find Your Elite Hackathon Squad

**HackMate** is a high-performance, premium platform designed to solve the biggest problem in hackathons: **finding the right teammates.** No more messy Discord threads or unbalanced teams. Use data-driven matching to build your winning squad.

![HackMate Cover](https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200)

## ✨ Key Features

- **🎯 Smart Skill Matching**: Our algorithm calculates a "Compatibility Score" between developers' skills and project needs instantly.
- **⚡ Real-time Collaboration**: Dedicated secure chat channels for accepted team members using Supabase Realtime logic.
- **� Realtime Notifications**: Realtime notifications leveraging Supabase Realtime for new requests, acceptances, and messages.
- **�🛡️ Secure Auth**: One-click login via GitHub OAuth for a seamless developer experience.
- **💎 Premium UI**: A state-of-the-art "Glassmorphism" interface with a dark theme and neon accents.
- **📁 Squad Management**: Project owners can review join requests, see skill profiles, and approve/reject members with a single click.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS + Custom Design System
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL
- **Real-time**: Supabase Postgres Changes (Websockets)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HackMate.git
   cd HackMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 💾 Database Schema

Run the following SQL in your Supabase SQL Editor to set up the architecture:

```sql
-- Profiles: Link to auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  skills TEXT[] DEFAULT '{}',
  github_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'Developer'
);

-- Projects: Team listings
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  team_size INTEGER DEFAULT 2
);

-- Join Requests: Application flow
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for hackers by **[Praveen]**
