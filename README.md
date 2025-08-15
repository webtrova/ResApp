# resApp - AI-Powered Resume Builder

Transform simple, everyday language into Harvard methodology-compliant professional resume content using AI, then generate perfectly formatted Word documents.

> **🎨 Now featuring a sophisticated burnt orange color palette and enhanced branding!**

## 🚀 Features

### Core Functionality
- **Dual Entry Point**: Upload existing resume OR start from scratch
- **AI Language Transformation**: Convert simple descriptions into professional Harvard methodology
- **Smart Enhancement**: Industry-specific defaults and intelligent prompting
- **Real-time Preview**: See changes as you build
- **Professional Export**: Generate Word documents with perfect formatting
- **ATS Optimization**: Keyword integration and format compatibility
- **Complete Authentication**: User registration, login, and password reset system
- **Mobile Responsive**: Beautiful experience across all devices

### AI-Powered Features
- **Language Enhancement**: Transform "I helped customers" → "Delivered exceptional customer service to 200+ clients, achieving 98% satisfaction rating"
- **Smart Defaults**: Industry-appropriate metrics when specific data is missing
- **Harvard Methodology**: Built-in best practices and professional standards
- **Context Awareness**: AI learns from previous entries to make better suggestions
- **Free AI Options**: Multiple AI services including Ollama (local), Hugging Face, and rule-based enhancement
- **Bulk Enhancement**: Enhance multiple text items simultaneously
- **Live Preview**: Real-time ATS-optimized resume preview as you build

### User Experience
- **Modern Navigation**: Consistent, responsive navigation across all pages
- **Beautiful Notifications**: Custom modal notifications with modern design
- **Smooth Transitions**: Optimized page transitions and loading states
- **Password Reset**: Complete email-based password reset system
- **Mobile Optimized**: Fully responsive design for all screen sizes

## 🛠 Tech Stack

- **Frontend**: Next.js 15+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with native SQL queries (no Prisma)
- **AI**: Multiple AI services (Claude API, Ollama, Hugging Face, Rule-based)
- **Document Generation**: `docx` library for Word documents
- **File Processing**: PDF parsing, Word document extraction
- **Styling**: Sophisticated burnt orange color palette with Tailwind CSS
- **Deployment**: Vercel with production optimizations
- **Email**: Nodemailer with Gmail SMTP for password reset

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── enhance/route.ts      # AI language transformation
│   │   │   ├── enhance-free/route.ts # Free AI options
│   │   │   ├── enhance-rule-based/   # Rule-based enhancement
│   │   │   └── enhance-quantify/     # Smart quantification
│   │   ├── auth/
│   │   │   ├── login/route.ts        # User authentication
│   │   │   ├── register/route.ts     # User registration
│   │   │   ├── forgot-password/      # Password reset request
│   │   │   └── reset-password/       # Password reset
│   │   ├── health/route.ts           # Health check endpoint
│   │   ├── resume/                   # Resume management
│   │   └── setup/                    # Setup endpoints
│   ├── builder/                      # Resume builder interface
│   ├── dashboard/                    # User dashboard
│   ├── login/                        # Authentication pages
│   ├── register/                     # Registration page
│   ├── forgot-password/              # Password reset request page
│   ├── reset-password/               # Password reset page
│   └── page.tsx                      # Landing page
├── components/
│   ├── ai/
│   │   ├── AIEnhanceButton.tsx       # Single text enhancement
│   │   ├── AISkillsSuggestions.tsx   # Skills suggestions
│   │   ├── BulkEnhancement.tsx       # Bulk enhancement
│   │   └── ParsingResultsDisplay.tsx # Upload results display
│   ├── builder/                      # Builder step components
│   │   ├── LivePreview.tsx           # Real-time preview
│   │   ├── PersonalInfoStep.tsx      # Personal info form
│   │   ├── ExperienceStep.tsx        # Work experience form
│   │   ├── EducationStep.tsx         # Education form
│   │   ├── SkillsStep.tsx            # Skills form
│   │   └── ReviewStep.tsx            # Review step
│   ├── ui/
│   │   ├── Navigation.tsx            # Consistent navigation
│   │   ├── Notification.tsx          # Custom notifications
│   │   ├── ConfirmationModal.tsx     # Confirmation dialogs
│   │   └── ModalPortal.tsx           # Modal portal system
│   └── contexts/
│       └── AuthContext.tsx           # Authentication context
├── lib/
│   ├── database/
│   │   ├── connection.ts             # MySQL connection
│   │   └── schema.sql                # Database schema
│   ├── ai/
│   │   ├── ai-service-manager.ts     # AI service orchestration
│   │   ├── ollama-service.ts         # Local Ollama integration
│   │   ├── huggingface-service.ts    # Hugging Face API
│   │   ├── enhanced-templates.ts     # Advanced templates
│   │   ├── rule-based-enhancer.ts    # Rule-based enhancement
│   │   ├── enhanced-parser.ts        # Resume parsing
│   │   └── smart-resume-parser.ts    # Smart parsing
│   ├── email-service.ts              # Email functionality
│   └── auth.ts                       # Authentication utilities
├── hooks/
│   ├── useAI.ts                      # AI enhancement hooks
│   ├── useResume.ts                  # Resume management hooks
│   └── useSmoothNavigation.ts        # Navigation hooks
└── types/
    └── resume.ts                     # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- Gmail account for email functionality
- AI API key (optional - free options available)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=resume_builder

   # AI Services (optional - free options available)
   ANTHROPIC_API_KEY=your-claude-api-key
   HUGGINGFACE_API_KEY=your-huggingface-key
   OLLAMA_BASE_URL=http://localhost:11434

   # Authentication
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000

   # Email (Gmail)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-app-password
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # File Storage
   TEMP_FILE_DIR=/tmp/resumes
   ```

3. **Set up database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE resume_builder;"
   
   # Run schema
   mysql -u root -p resume_builder < src/lib/database/schema.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Current Progress

### ✅ Completed Features
- **Project Setup**: Next.js 15+ with TypeScript and Tailwind CSS
- **Database Schema**: MySQL tables for users, resumes, transformations, and uploads
- **Landing Page**: Beautiful dual entry point design with upload and start from scratch options
- **Resume Builder**: Multi-step form with AI enhancement capabilities
- **AI Integration**: Multiple AI services (Claude API, Ollama, Hugging Face, Rule-based)
- **Type Safety**: Comprehensive TypeScript types for all data structures
- **Color Palette**: Sophisticated burnt orange design system
- **Live Preview**: Real-time ATS-optimized resume preview
- **Free AI Options**: No API key required for basic functionality
- **Enhanced UI**: Improved layout and spacing for AI components
- **Production Ready**: Health checks and deployment configuration
- **User Authentication**: Complete login/registration system
- **Password Reset**: Email-based password reset functionality
- **Modern Navigation**: Consistent, responsive navigation component
- **Mobile Responsive**: Fully optimized for all screen sizes
- **Custom Notifications**: Beautiful modal notification system
- **File Upload & Parsing**: PDF and Word document processing
- **Document Generation**: Word document export functionality
- **Production Deployment**: Successfully deployed to Vercel

### 🔄 In Progress
- **Advanced AI Features**: Enhanced language transformation algorithms
- **User Dashboard**: Enhanced dashboard with resume management
- **Analytics**: User behavior tracking and improvement suggestions

### 📋 Next Steps
1. **Advanced AI Features**: Enhanced language transformation algorithms
2. **User Dashboard**: Enhanced dashboard with resume management
3. **Analytics**: User behavior tracking and improvement suggestions
4. **Performance Optimization**: Further optimization for large-scale usage
5. **Additional Templates**: More resume template options

## 🎨 Design Philosophy

**"Smart Defaults, Instant Enhancement, Seamless Import"**

- **Multiple entry points** - Start from scratch OR upload existing resume
- **AI-powered extraction** - Automatically parse and structure uploaded content
- **Intelligent optimization** - Transform existing content using Harvard methodology
- **No overwhelming questionnaires** - Users type naturally, AI enhances automatically
- **Real-time transformation** - See improvements as you type
- **Beautiful, modern interface** - Sophisticated burnt orange design that feels premium
- **Free AI options** - No API key required for basic functionality
- **Live preview** - Real-time ATS-optimized resume preview
- **Mobile-first design** - Optimized experience across all devices

## 🔧 API Endpoints

### AI Enhancement
- `POST /api/ai/enhance` - Transform simple language to professional (Claude API)
- `POST /api/ai/enhance-free` - Free AI enhancement (multiple services)
- `POST /api/ai/enhance-rule-based` - Rule-based enhancement (no API key needed)
- `GET /api/ai/enhance-free/status` - Check AI service availability

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/logout` - User logout

### Health & Status
- `GET /api/health` - Application and database health check

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume files
- `POST /api/resume/save` - Save resume data
- `GET /api/resume/load` - Load saved resume
- `POST /api/resume/generate` - Generate Word document
- `DELETE /api/resume/delete` - Delete resume

### Document Generation
- `POST /api/documents/generate` - Generate Word document

## 🤖 Free AI Options

resApp now supports multiple AI services, including free options that don't require API keys:

### Available AI Services
1. **Ollama (Local)** - Run AI models locally on your machine
2. **Hugging Face** - Free-tier cloud-based AI models
3. **Rule-based Enhancement** - Sophisticated template-based enhancement
4. **Claude API** - Premium AI service (requires API key)

### Setup Instructions
See [FREE_AI_SETUP.md](./FREE_AI_SETUP.md) for detailed setup instructions for all free AI options.

## 📊 Database Schema

### Core Tables
- **users**: User accounts and authentication (with password reset support)
- **resumes**: Resume data and metadata
- **transformations**: AI language transformations for learning
- **resume_uploads**: File uploads and parsing results
- **templates**: Resume template definitions

## 🚀 Production Deployment

### Vercel Deployment
- **Production URL**: https://res-jzt8a9z72-pmartinez-webtrovacoms-projects.vercel.app
- **Environment Variables**: Configured for production
- **Database**: Production MySQL instance
- **Email Service**: Gmail SMTP for password reset functionality

### Environment Setup
All environment variables are configured in Vercel dashboard:
- Database connection
- Gmail SMTP credentials
- AI service API keys
- Application URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Harvard Business School** for methodology inspiration
- **Anthropic** for Claude AI capabilities
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first styling approach
- **Vercel** for seamless deployment

---

**Built with ❤️ for job seekers who want to transform their simple descriptions into professional excellence.**

## 📝 Recent Updates

### Latest Achievements (August 2025)
- ✅ **Complete Authentication System**: User registration, login, and password reset
- ✅ **Production Deployment**: Successfully deployed to Vercel with all features working
- ✅ **Mobile Responsiveness**: Fully optimized for all screen sizes
- ✅ **Modern Navigation**: Consistent, responsive navigation across all pages
- ✅ **Custom Notifications**: Beautiful modal notification system
- ✅ **Email Integration**: Gmail SMTP for password reset functionality
- ✅ **File Upload & Parsing**: PDF and Word document processing
- ✅ **Document Generation**: Word document export functionality
- ✅ **Enhanced UI/UX**: Improved user experience with smooth transitions
- ✅ **Type Safety**: Comprehensive TypeScript implementation
- ✅ **Database Optimization**: Production-ready MySQL setup
