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

### AI-Powered Features
- **Language Enhancement**: Transform "I helped customers" → "Delivered exceptional customer service to 200+ clients, achieving 98% satisfaction rating"
- **Smart Defaults**: Industry-appropriate metrics when specific data is missing
- **Harvard Methodology**: Built-in best practices and professional standards
- **Context Awareness**: AI learns from previous entries to make better suggestions
- **Free AI Options**: Multiple AI services including Ollama (local), Hugging Face, and rule-based enhancement
- **Bulk Enhancement**: Enhance multiple text items simultaneously
- **Live Preview**: Real-time ATS-optimized resume preview as you build

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with native SQL queries (no Prisma)
- **AI**: Multiple AI services (Claude API, Ollama, Hugging Face, Rule-based)
- **Document Generation**: `docx` library for Word documents
- **File Processing**: PDF parsing, Word document extraction
- **Styling**: Sophisticated burnt orange color palette with Tailwind CSS
- **Deployment**: Vercel-ready with production optimizations

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
│   │   ├── health/route.ts           # Health check endpoint
│   │   ├── resume/                   # Resume management
│   │   ├── auth/                     # Authentication
│   │   └── setup/                    # Setup endpoints
│   ├── builder/                      # Resume builder interface
│   ├── dashboard/                    # User dashboard
│   ├── login/                        # Authentication pages
│   └── page.tsx                      # Landing page
├── components/
│   ├── ai/
│   │   ├── AIEnhanceButton.tsx       # Single text enhancement
│   │   └── BulkEnhancement.tsx       # Bulk enhancement
│   ├── builder/                      # Builder step components
│   │   ├── LivePreview.tsx           # Real-time preview
│   │   ├── PersonalInfoStep.tsx      # Personal info form
│   │   ├── ExperienceStep.tsx        # Work experience form
│   │   ├── EducationStep.tsx         # Education form
│   │   ├── SkillsStep.tsx            # Skills form
│   │   └── ReviewStep.tsx            # Review step
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
│   │   └── rule-based-enhancer.ts    # Rule-based enhancement
│   └── auth.ts                       # Authentication utilities
├── hooks/
│   ├── useAI.ts                      # AI enhancement hooks
│   └── useResume.ts                  # Resume management hooks
└── types/
    └── resume.ts                     # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
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
- **Project Setup**: Next.js 14+ with TypeScript and Tailwind CSS
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

### 🔄 In Progress
- **File Upload & Parsing**: PDF and Word document processing
- **Document Generation**: Word document export functionality
- **User Authentication**: Login and registration system
- **Advanced AI Features**: Enhanced language transformation algorithms

### 📋 Next Steps
1. **File Upload System**: Implement PDF/Word parsing and content extraction
2. **Document Generation**: Create Word document export with professional formatting
3. **User Authentication**: Add login/registration with session management
4. **Dashboard**: User dashboard for managing multiple resumes
5. **Advanced AI Features**: Enhanced language transformation algorithms
6. **Mobile Optimization**: Improve mobile experience and responsiveness

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

## 🔧 API Endpoints

### AI Enhancement
- `POST /api/ai/enhance` - Transform simple language to professional (Claude API)
- `POST /api/ai/enhance-free` - Free AI enhancement (multiple services)
- `POST /api/ai/enhance-rule-based` - Rule-based enhancement (no API key needed)
- `GET /api/ai/enhance-free/status` - Check AI service availability

### Health & Status
- `GET /api/health` - Application and database health check

### Resume Management
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update existing resume
- `GET /api/resumes` - Get user's resumes

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
- **users**: User accounts and authentication
- **resumes**: Resume data and metadata
- **transformations**: AI language transformations for learning
- **resume_uploads**: File uploads and parsing results
- **templates**: Resume template definitions

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

---

**Built with ❤️ for job seekers who want to transform their simple descriptions into professional excellence.**
# Force deployment update - Wed Aug 13 21:26:54 EDT 2025
