export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  template_id: number;
  resume_data: ResumeData;
  is_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: ProfessionalSummary;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  additional?: AdditionalSection[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  location: string;
}

export interface ProfessionalSummary {
  currentTitle: string;
  yearsExperience: number;
  keySkills: string[];
  careerObjective: string;
}

export interface WorkExperience {
  id?: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  location?: string;
  jobDescription: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  major: string;
  graduationDate: string;
  gpa?: number;
  relevantCoursework?: string[];
  achievements?: string[];
}

export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'industry';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface AdditionalSection {
  type: 'certifications' | 'projects' | 'volunteer' | 'languages' | 'awards';
  title: string;
  items: AdditionalItem[];
}

export interface AdditionalItem {
  title: string;
  description?: string;
  date?: string;
  url?: string;
}

export interface Transformation {
  id: number;
  user_id?: number;
  original_text: string;
  transformed_text: string;
  industry?: string;
  role_level?: 'entry' | 'mid' | 'senior';
  feedback_rating?: number;
  created_at: Date;
}

export interface ResumeUpload {
  id: number;
  user_id: number;
  original_filename: string;
  file_type: 'pdf' | 'docx' | 'doc' | 'txt';
  extracted_text?: string;
  parsed_data: ResumeData;
  optimization_results?: any;
  confidence_score?: number;
  created_at: Date;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  template_data: any;
  is_active: boolean;
  created_at: Date;
}

// Cover Letter Types
export interface CoverLetter {
  id: number;
  user_id: number;
  resume_id?: number;
  title: string;
  cover_letter_data: CoverLetterData;
  is_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CoverLetterData {
  jobDetails: JobDetails;
  personalInfo: PersonalInfo;
  opening: string;
  body: CoverLetterBody[];
  closing: string;
  signature: string;
}

export interface JobDetails {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  requirements?: string[];
  applicationDate?: string;
  contactPerson?: string;
  contactEmail?: string;
  companyAddress?: string;
}

export interface CoverLetterBody {
  id: string;
  type: 'experience' | 'skills' | 'achievement' | 'motivation' | 'custom';
  content: string;
  order: number;
}

export interface CoverLetterTemplate {
  id: number;
  name: string;
  description: string;
  template_data: any;
  is_active: boolean;
  created_at: Date;
}

export interface CoverLetterGenerationRequest {
  resumeData: ResumeData;
  jobDetails: JobDetails;
  tone?: 'professional' | 'enthusiastic' | 'confident' | 'formal';
  focus?: 'experience' | 'skills' | 'achievements' | 'motivation' | 'balanced';
  length?: 'brief' | 'standard' | 'detailed';
}


