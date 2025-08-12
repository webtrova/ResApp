# AI-Powered Resume Builder - Product Requirements Document

## 1. Executive Summary

### Vision
Create a web application that transforms users' simple, everyday language into Harvard methodology-compliant professional resume content using AI, then generates perfectly formatted Word documents. The system takes basic descriptions and elevates them to elegant, impactful professional language.

### Target Users
- Job seekers who struggle with professional writing
- People who know what they did but can't articulate it professionally
- Career counselors and resume consultants
- Non-native English speakers needing professional language assistance
- Anyone wanting to transform basic descriptions into compelling resume content

### Core Value Proposition
**Simple Input → Professional Output**: Users describe their work in plain language, and the system transforms it into Harvard methodology-compliant content with sophisticated vocabulary, strong action verbs, and quantified results.

## 2. Product Overview

### Primary Features
1. **Resume Upload & Optimization** - Upload existing resume for AI-powered Harvard method enhancement
2. **Intelligent Form Interface** - Guided data collection with AI suggestions
3. **Harvard Method Implementation** - Built-in best practices and methodology
4. **AI Content Generation** - Smart bullet point creation and optimization
5. **Professional Document Export** - High-quality Word document generation
6. **ATS Optimization** - Keyword integration and format compatibility

### Success Metrics
- Resume completion rate > 80%
- User satisfaction score > 4.5/5
- Time to complete resume < 30 minutes
- Document download success rate > 95%

## 3. Technical Architecture

### Full-Stack Framework
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Database**: MySQL with native SQL queries (NO Prisma)
- **Database Client**: mysql2 for Node.js MySQL connections

### Backend (Next.js API Routes)
- **Document Generation**: `docx` library for Word document creation
- **AI Integration**: Anthropic Claude API for language transformation
- **Database**: MySQL for user data, resume storage, and progress tracking
- **File Handling**: Temporary file storage for downloads
- **Security**: API key management, rate limiting, SQL injection prevention

### Database Requirements
- **User Management**: Account creation, authentication, session handling
- **Resume Storage**: Save progress, multiple resume versions
- **Language Transformation**: Store simple input vs. enhanced output pairs
- **Templates**: Resume template storage and versioning
- **Usage Analytics**: Track feature usage and improvement areas

## 4. Core Features Specification

### 4.1 Resume Upload & Optimization System (NEW CORE FEATURE)

#### File Upload Capabilities
**Supported Formats:**
- PDF files (.pdf)
- Microsoft Word documents (.docx, .doc)
- Plain text files (.txt)
- Google Docs (via copy/paste)

#### AI-Powered Content Extraction
**Smart Parsing Engine:**
- **Contact Information**: Automatically extract name, email, phone, LinkedIn
- **Work Experience**: Parse company names, job titles, dates, descriptions
- **Education**: Extract degrees, institutions, graduation dates, GPAs
- **Skills**: Identify and categorize technical and soft skills
- **Achievements**: Recognize bullet points and accomplishments

**Intelligent Structure Recognition:**
- Detect resume sections regardless of formatting
- Handle various resume layouts and templates
- Parse both chronological and functional resume formats
- Extract information from poorly formatted or creative layouts

#### Harvard Method Optimization Process
**Content Analysis & Enhancement:**
1. **Weak Language Detection**: Identify passive voice, weak verbs, vague descriptions
2. **Quantification Opportunities**: Find achievements that need metrics
3. **Action Verb Replacement**: Transform weak verbs into powerful Harvard-approved action words
4. **PAR Structure Implementation**: Reorganize content into Problem-Action-Result format
5. **Industry Optimization**: Enhance language with relevant keywords and terminology

**Before/After Comparison View:**
```
Original: "Responsible for managing customer service team"
Enhanced: "Led customer service team of 12 representatives, achieving 98% customer satisfaction rating and reducing response time by 35%"

Original: "Helped with sales activities"
Enhanced: "Collaborated with sales team to identify prospects, resulting in $2.3M in new business and 40% increase in quarterly revenue"
```

#### Optimization Workflow
**Step 1: Upload & Parse**
- User uploads existing resume
- AI extracts and structures content within 10 seconds
- Display parsed information in editable sections

**Step 2: Optimization Analysis**
- AI analyzes each section for improvement opportunities
- Generates Harvard method enhancements for all content
- Shows optimization score (before: 45/100, after: 92/100)

**Step 3: Review & Approve**
- Side-by-side comparison of original vs. enhanced content
- One-click approval for each enhancement
- Bulk accept/reject options for efficiency
- Inline editing for custom adjustments

**Step 4: Professional Export**
- Generate new Word document with Harvard methodology formatting
- Maintain original personal information and structure preferences
- Apply professional template with ATS optimization

### 4.2 Resume Data Collection Form (For New Resumes)
- Full Name (required)
- Email Address (required, validated)
- Phone Number (required, formatted)
- LinkedIn Profile URL (optional, validated)
- Portfolio/Website URL (optional, validated)
- Location (City, State format)

#### Professional Summary Section
- Current Title/Target Role
- Years of Experience
- Key Skills (up to 10, with AI suggestions)
- Career Objective (AI-assisted writing)

#### Work Experience Section
**For each position:**
- Company Name (required)
- Job Title (required)
- Employment Dates (month/year format)
- Location (optional)
- Job Description (free text)
- Key Achievements (up to 6 bullet points)

#### AI Enhancement Features - CORE FUNCTIONALITY
**Language Transformation Engine:**
- **Simple → Professional**: Convert "I helped customers" → "Provided comprehensive customer support and consultation"
- **Basic → Harvard Method**: Transform "Managed a team" → "Led cross-functional team of 8 members, resulting in 25% productivity increase"
- **Weak → Strong Verbs**: Change "Was responsible for" → "Orchestrated," "Facilitated," "Spearheaded"
- **Vague → Quantified**: Transform "Increased sales" → "Boosted quarterly sales revenue by 15% through strategic client relationship management"

#### Smart Enhancement Strategy - NO QUESTION OVERLOAD
**Intelligent Prompting (Behind the Scenes):**
- AI analyzes context automatically (role title, company, industry)
- Makes educated assumptions for missing metrics
- Only asks 1-2 targeted questions when absolutely necessary
- Uses industry benchmarks to fill gaps intelligently

**Enhancement Flow:**
1. **User types**: "I managed a team and increased sales"
2. **AI instantly shows**: "Led cross-functional team of 8 members, driving 23% increase in quarterly sales revenue"
3. **User sees two options**: ✓ Accept or ✏️ Edit
4. **If user clicks Edit**: Simple inline editing, no forms
5. **If metrics seem off**: Gentle hover tooltip: "Adjust team size?" with simple +/- buttons

**Smart Defaults Based on Role/Industry:**
- Entry level: Smaller team sizes, learning-focused achievements
- Mid-level: Project management, measurable improvements
- Senior level: Strategic initiatives, larger impact metrics
- Industry context: Tech (efficiency %), Sales (revenue %), Healthcare (patient outcomes)

**Industry-Specific Enhancement:**
- Tailor language sophistication to industry norms
- Use appropriate technical terminology
- Apply relevant metrics and KPIs

#### Education Section
- Institution Name
- Degree Type and Major
- Graduation Date (or expected)
- GPA (optional, only if 3.5+)
- Relevant Coursework (optional)
- Academic Achievements (optional)

#### Additional Sections (Optional)
- Technical Skills (categorized)
- Certifications
- Projects (with descriptions and results)
- Volunteer Experience
- Languages
- Awards and Honors

### 4.2 Language Transformation Engine (Core Feature)

#### Input Processing
**Simple Language Examples:**
- User Input: "I answered phones and helped customers"
- AI Output: "Delivered exceptional customer service by managing high-volume inbound communications and resolving client inquiries with 95% satisfaction rate"

- User Input: "I made schedules for my team"
- AI Output: "Optimized workforce scheduling for 12-person team, reducing overtime costs by 18% while maintaining 100% shift coverage"

#### AI Prompting Strategy for Language Enhancement
```
Transform this simple job description into Harvard methodology-compliant professional language:

Original Text: [USER_INPUT]
Industry: [TARGET_INDUSTRY]
Role Level: [ENTRY/MID/SENIOR]
Company Size: [STARTUP/SMALL/LARGE]

Requirements:
1. Start with powerful action verb from Harvard-approved list
2. Include specific, quantifiable results (prompt user if missing)
3. Use sophisticated vocabulary appropriate for professional resume
4. Follow PAR structure (Problem-Action-Result)
5. Keep to 1-2 lines maximum
6. Include industry-relevant keywords

If quantifiable data is missing, ask specific follow-up questions:
- "How many [people/customers/projects] were involved?"
- "Over what time period did this occur?"
- "What was the measurable outcome or improvement?"
- "How did you track success or measure results?"
```

#### Vocabulary Enhancement Database
**Simple → Professional Transformations:**
- "helped" → "facilitated," "supported," "enabled," "empowered"
- "worked with" → "collaborated with," "partnered with," "coordinated with"
- "in charge of" → "supervised," "managed," "oversaw," "directed"
- "made better" → "optimized," "enhanced," "improved," "streamlined"
- "sold" → "generated revenue," "secured contracts," "drove sales"

### 4.3 Document Generation

#### Word Document Specifications
- **Format**: .docx (Microsoft Word compatible)
- **Layout**: Clean, ATS-friendly single-column design
- **Typography**: Professional fonts (Calibri, Arial, or Times New Roman)
- **Spacing**: Consistent margins and line spacing
- **Sections**: Clear section headers and organization
- **Length**: Optimize for 1-2 pages based on experience level

#### Template Options
1. **Classic Professional** - Traditional format
2. **Modern Clean** - Contemporary design with subtle styling
3. **ATS-Optimized** - Maximum compatibility with applicant tracking systems

### 4.4 User Experience Flow - INTUITIVE & SEAMLESS

#### Design Philosophy: "Smart Defaults, Instant Enhancement, Seamless Import"
- **Multiple entry points** - Start from scratch OR upload existing resume
- **AI-powered extraction** - Automatically parse and structure uploaded content
- **Intelligent optimization** - Transform existing content using Harvard methodology
- **No overwhelming questionnaires** - Users type naturally, AI enhances automatically
- **Real-time transformation** - See improvements as you type
- **Beautiful, modern interface** - Clean design that feels premium
- **One-click enhancements** - Accept/reject AI suggestions with single clicks
- **Smart context awareness** - AI learns from previous entries to make better suggestions

#### Streamlined Flow:

**Step 1: Choose Your Path (30 seconds)**
Option A: **Upload Existing Resume**
- Drag & drop or click to upload (PDF, Word, or text file)
- AI automatically extracts and structures all content
- Instant preview of parsed information
- One-click "Optimize My Resume" to start Harvard method enhancement

Option B: **Start From Scratch**
- Name, email, target role
- Industry auto-detected from role
- Template auto-selected based on industry
- One-click "Start Building" button

**Step 2: Smart Form Experience**
- **One section at a time** - No overwhelming multi-section forms
- **Type naturally** - Users describe work in their own words
- **Instant AI enhancement** - Real-time transformation appears alongside original text
- **Accept/Edit/Skip** - Simple buttons for each suggestion
- **Auto-save everything** - Never lose progress

**Step 3: Live Preview Magic**
- **Side-by-side view** - Form on left, live resume preview on right
- **Instant updates** - Changes appear immediately in preview
- **Beautiful typography** - Professional formatting in real-time
- **Drag-and-drop reordering** - Easy section management

**Step 4: One-Click Export**
- **Perfect formatting guaranteed** - No manual adjustments needed
- **Instant download** - Word document ready in seconds
- **Share options** - Email, link sharing, PDF conversion

## 5. Technical Implementation Details

### 5.1 Next.js Application Architecture

#### Project Structure
```
resume-builder/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── resumes/
│   │   ├── ai/
│   │   │   ├── enhance/route.ts
│   │   │   ├── transform/route.ts
│   │   │   └── quantify/route.ts
│   │   └── documents/
│   ├── dashboard/
│   ├── builder/
│   ├── login/
│   └── page.tsx
├── components/
│   ├── forms/
│   ├── ai-enhancement/
│   ├── preview/
│   └── ui/
├── lib/
│   ├── database/
│   │   ├── connection.ts
│   │   ├── queries.ts
│   │   └── schema.sql
│   ├── ai/
│   │   ├── claude-service.ts
│   │   └── language-transformer.ts
│   ├── document/
│   │   └── word-generator.ts
│   └── utils/
└── types/
    └── resume.ts
```

#### Database Schema (MySQL)
```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  template_id INT DEFAULT 1,
  resume_data JSON NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Language transformations (for learning and improvement)
CREATE TABLE transformations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  original_text TEXT NOT NULL,
  transformed_text TEXT NOT NULL,
  industry VARCHAR(100),
  role_level ENUM('entry', 'mid', 'senior'),
  feedback_rating INT CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Resume uploads and optimizations
CREATE TABLE resume_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type ENUM('pdf', 'docx', 'doc', 'txt') NOT NULL,
  extracted_text LONGTEXT,
  parsed_data JSON NOT NULL,
  optimization_results JSON,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5.3 API Routes (Next.js App Router)

#### Language Transformation API (app/api/ai/transform/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { transformLanguage } from '@/lib/ai/language-transformer';
import { executeQuery, transformationQueries } from '@/lib/database/queries';

export async function POST(request: NextRequest) {
  try {
    const { originalText, industry, roleLevel, context, userId } = await request.json();
    
    // Transform simple language to professional
    const transformedText = await transformLanguage({
      originalText,
      industry,
      roleLevel,
      context
    });
    
    // Save transformation for learning
    if (userId) {
      await executeQuery(transformationQueries.save, [
        userId, originalText, transformedText, industry, roleLevel
      ]);
    }
    
    return NextResponse.json({
      originalText,
      transformedText,
      improvements: {
        actionVerb: extractActionVerb(transformedText),
        quantification: extractQuantification(transformedText),
        professionalTerms: extractProfessionalTerms(transformedText)
      }
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Transformation failed' }, { status: 500 });
  }
}
```

#### Resume Management API (app/api/resumes/route.ts)
```typescript
export async function POST(request: NextRequest) {
  // Create new resume
}

export async function PUT(request: NextRequest) {
  // Update existing resume (auto-save functionality)
}

export async function GET(request: NextRequest) {
  // Get user's resumes
}
```

#### Document Generation API (app/api/documents/generate/route.ts)
```typescript
export async function POST(request: NextRequest) {
  // Generate Word document from resume data
  // Return downloadable file
}
```

### 5.4 AI Language Transformation Service

#### Core Language Transformer (lib/ai/language-transformer.ts)
```typescript
interface TransformationRequest {
  originalText: string;
  industry: string;
  roleLevel: 'entry' | 'mid' | 'senior';
  context: string;
}

export async function transformLanguage(request: TransformationRequest): Promise<string> {
  const prompt = `
Transform this simple job description into Harvard methodology-compliant professional language:

Original: "${request.originalText}"
Industry: ${request.industry}
Level: ${request.roleLevel}
Context: ${request.context}

Requirements:
1. Start with a powerful action verb (Led, Developed, Optimized, etc.)
2. Use sophisticated professional vocabulary
3. Include quantifiable metrics (ask follow-up questions if needed)
4. Follow PAR structure: Problem-Action-Result
5. Keep to 1-2 lines maximum
6. Make it sound accomplished and impactful

Examples of good transformations:
- "I answered phones" → "Managed high-volume customer communications, resolving 95% of inquiries on first contact"
- "I helped train new people" → "Mentored and onboarded 12 new team members, reducing training time by 30%"
- "I made the process better" → "Streamlined operational procedures, resulting in 25% efficiency improvement"

Transform the text above following these guidelines. If the original lacks specific numbers or outcomes, create realistic professional metrics that would be typical for this type of role.
  `;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  return data.content[0].text.trim();
}

```typescript
// Follow-up questions - ONLY when absolutely necessary
export async function generateSmartEnhancement(text: string, context: any): Promise<EnhancementResult> {
  // First, try to enhance with intelligent defaults
  const enhancedWithDefaults = await enhanceWithSmartDefaults(text, context);
  
  // Only ask questions if the enhancement feels incomplete
  const needsQuantification = assessQuantificationNeeds(enhancedWithDefaults);
  
  if (needsQuantification.confidence > 0.8) {
    // Don't ask - use industry-appropriate defaults
    return enhancedWithDefaults;
  }
  
  // If we must ask, ask only ONE targeted question
  const targetedQuestion = generateSingleTargetedQuestion(text, context);
  
  return {
    enhancedText: enhancedWithDefaults,
    optionalQuestion: targetedQuestion, // Shown as optional tooltip
    confidenceScore: needsQuantification.confidence
  };
}

// Smart defaults by industry/role
const INDUSTRY_DEFAULTS = {
  'software_engineer': {
    teamSize: '5-8 members',
    improvements: '15-25% efficiency',
    projectScope: 'multiple features',
    timeframe: 'quarterly'
  },
  'sales': {
    clientBase: '50+ clients',
    revenue: '20-30% increase',
    targets: 'exceeded quotas',
    timeframe: 'monthly/quarterly'
  },
  'customer_service': {
    volume: '100+ daily interactions',
    satisfaction: '95%+ rating',
    resolution: 'first-call resolution',
    timeframe: 'daily/weekly'
  }
};
```
```

## 6. Harvard Methodology Implementation

### Action Verb Categories
- **Leadership**: Led, Directed, Managed, Supervised, Coordinated
- **Achievement**: Achieved, Exceeded, Improved, Increased, Reduced
- **Communication**: Presented, Collaborated, Negotiated, Influenced
- **Analysis**: Analyzed, Evaluated, Researched, Assessed, Investigated
- **Creation**: Developed, Created, Designed, Built, Implemented

### Content Guidelines
1. **Quantification Prompts**: 
   - "How much money did you save/generate?"
   - "What percentage improvement did you achieve?"
   - "How many people/projects did you manage?"
   - "What was the timeline/scope of your work?"

2. **PAR Structure Templates**:
   - Problem: "Faced with [challenge]..."
   - Action: "I [action verb] by [specific approach]..."
   - Result: "Resulting in [quantified outcome]..."

### Keyword Strategy
- Industry-specific keyword database
- ATS-friendly formatting rules
- Skill categorization (Technical, Soft, Industry-specific)

## 8. Development Phases

### Phase 1: Core Features with Upload Capability (MVP)
**Duration: 2-3 weeks**

**Features:**
- Dual entry point: Upload existing resume OR start from scratch
- AI-powered resume parsing (PDF, Word, text files)
- Basic language transformation engine
- Harvard methodology optimization
- Simple Word document generation
- User authentication and resume saving

**Database Tables:**
- users, resumes, transformations, resume_uploads

**Key Components:**
- File upload and parsing system
- Language transformation API
- Resume optimization engine
- Document export functionality

### Phase 2: Enhanced User Experience
**Duration: 2-3 weeks**

**Features:**
- Complete resume builder with all sections
- Real-time preview
- Multiple resume templates
- Enhanced AI prompting for quantification
- User dashboard with saved resumes

**Additional Features:**
- Auto-save functionality
- Resume version history
- Template selection

### Phase 3: Advanced Features
**Duration: 2-3 weeks**

**Features:**
- Industry-specific vocabulary enhancement
- Advanced quantification assistance
- Bulk enhancement tools
- Analytics and improvement suggestions
- Export options (PDF, different formats)

## 9. Environment Variables

```env
# Database
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=resume_builder

# AI Service
ANTHROPIC_API_KEY=your-claude-api-key

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# File Storage
TEMP_FILE_DIR=/tmp/resumes
```

## 10. Getting Started Commands

```bash
# Initialize Next.js project
npx create-next-app@latest resume-builder --typescript --tailwind --app

# Install additional dependencies for file processing
npm install pdf-parse mammoth multer

# For PDF parsing
npm install pdf2pic sharp

# Set up database schema
mysql -u username -p database_name < lib/database/schema.sql

# Run development server
npm run dev
```

## 11. Success Metrics & Analytics

### Key Performance Indicators
- **Transformation Quality**: User satisfaction with AI-enhanced content (target: 4.5/5)
- **Completion Rate**: Percentage of users who finish their resume (target: 75%)
- **Time to Complete**: Average time from start to finished resume (target: <30 minutes)
- **Language Improvement**: Before/after professional score (target: 300% improvement)
- **User Retention**: Users who create multiple resumes (target: 40%)

### Analytics Tracking
- Transformation success rate by industry
- Most common simple phrases and their professional alternatives
- User feedback on AI suggestions
- Document download and sharing rates

This PRD provides Claude Code with a comprehensive blueprint for building your AI-powered resume builder that transforms simple language into Harvard methodology-compliant professional content using Next.js and MySQL.