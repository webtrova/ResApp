# ResApp - AI-Powered Resume Builder

Transform simple, everyday language into Harvard methodology-compliant professional resume content using AI, then generate perfectly formatted Word documents.

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

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with native SQL queries (no Prisma)
- **AI**: Anthropic Claude API for language transformation
- **Document Generation**: `docx` library for Word documents
- **File Processing**: PDF parsing, Word document extraction

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── transform/route.ts    # AI language transformation
│   │   ├── resumes/                  # Resume management
│   │   ├── documents/                # Document generation
│   │   └── auth/                     # Authentication
│   ├── builder/                      # Resume builder interface
│   ├── dashboard/                    # User dashboard
│   ├── login/                        # Authentication pages
│   └── page.tsx                      # Landing page
├── components/
│   ├── forms/                        # Form components
│   ├── ai-enhancement/               # AI enhancement UI
│   ├── preview/                      # Resume preview
│   └── ui/                           # Reusable UI components
├── lib/
│   ├── database/
│   │   ├── connection.ts             # MySQL connection
│   │   └── schema.sql                # Database schema
│   ├── ai/
│   │   └── language-transformer.ts   # AI transformation service
│   ├── document/
│   │   └── word-generator.ts         # Word document generation
│   └── utils/                        # Utility functions
└── types/
    └── resume.ts                     # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- Anthropic Claude API key

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

   # AI Service
   ANTHROPIC_API_KEY=your-claude-api-key

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
- **AI Integration**: Claude API integration for language transformation
- **Type Safety**: Comprehensive TypeScript types for all data structures

### 🔄 In Progress
- **File Upload & Parsing**: PDF and Word document processing
- **Document Generation**: Word document export functionality
- **User Authentication**: Login and registration system
- **Resume Preview**: Real-time preview of resume as it's being built

### 📋 Next Steps
1. **File Upload System**: Implement PDF/Word parsing and content extraction
2. **Document Generation**: Create Word document export with professional formatting
3. **User Authentication**: Add login/registration with session management
4. **Resume Preview**: Build real-time preview component
5. **Enhanced AI Features**: Add more sophisticated language transformation
6. **Dashboard**: User dashboard for managing multiple resumes

## 🎨 Design Philosophy

**"Smart Defaults, Instant Enhancement, Seamless Import"**

- **Multiple entry points** - Start from scratch OR upload existing resume
- **AI-powered extraction** - Automatically parse and structure uploaded content
- **Intelligent optimization** - Transform existing content using Harvard methodology
- **No overwhelming questionnaires** - Users type naturally, AI enhances automatically
- **Real-time transformation** - See improvements as you type
- **Beautiful, modern interface** - Clean design that feels premium

## 🔧 API Endpoints

### AI Transformation
- `POST /api/ai/transform` - Transform simple language to professional
- `GET /api/ai/transform?userId=123` - Get user's recent transformations

### Resume Management
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update existing resume
- `GET /api/resumes` - Get user's resumes

### Document Generation
- `POST /api/documents/generate` - Generate Word document

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
