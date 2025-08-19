#!/usr/bin/env node

const http = require('http');

class ResumeSaveWorkflowTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.authToken = null;
    this.userId = null;
    this.resumeId = null;
  }

  log(level, message) {
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      SUCCESS: '\x1b[32m', // Green
      ERROR: '\x1b[31m',   // Red
      WARNING: '\x1b[33m', // Yellow
      RESET: '\x1b[0m'     // Reset
    };
    console.log(`${colors[level] || ''}${level}: ${message}${colors.RESET}`);
  }

  async makeRequest(path, method = 'GET', data = null, includeAuth = false) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: 3001,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ResumeSaveWorkflowTester/1.0',
        },
      };

      if (includeAuth && this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async login() {
    this.log('INFO', '🔐 Logging in...');
    
    const response = await this.makeRequest('/api/auth/login', 'POST', {
      email: 'test.e2e@resapp.com',
      password: 'TestPassword123!'
    });

    if (response.statusCode === 200 && response.data.success) {
      this.authToken = response.data.token;
      this.userId = response.data.user.id;
      this.log('SUCCESS', `✅ Login successful (UserID: ${this.userId})`);
      return true;
    } else {
      this.log('ERROR', `❌ Login failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async testResumeSave() {
    this.log('INFO', '📝 Testing resume save (simulating resume builder save)...');
    
    const resumeData = {
      personal: {
        fullName: 'Test Resume Builder User',
        email: 'testbuilder@example.com',
        phone: '(555) 999-8888',
        location: 'Test City, TC',
        linkedin: 'linkedin.com/in/testbuilder',
        portfolio: 'testbuilder.dev'
      },
      summary: {
        currentTitle: 'Test Engineer',
        yearsExperience: 6,
        keySkills: ['Testing', 'JavaScript', 'React', 'Node.js', 'Quality Assurance'],
        careerObjective: 'Experienced test engineer dedicated to ensuring high-quality software delivery through comprehensive testing strategies and automation.'
      },
      experience: [
        {
          id: '1',
          company: 'TestCorp Industries',
          position: 'Senior Test Engineer',
          startDate: '2021-03',
          endDate: '2024-01',
          description: 'Led comprehensive testing initiatives for enterprise applications',
          responsibilities: [
            'Designed and implemented automated testing frameworks',
            'Reduced bug escape rate by 75% through enhanced testing protocols',
            'Mentored junior QA team members on best practices',
            'Coordinated cross-functional testing efforts with development teams'
          ]
        },
        {
          id: '2',
          company: 'Quality Solutions Ltd',
          position: 'QA Engineer',
          startDate: '2019-01',
          endDate: '2021-02',
          description: 'Specialized in manual and automated testing for web applications',
          responsibilities: [
            'Developed comprehensive test plans and test cases',
            'Performed regression testing for multiple product releases',
            'Implemented API testing using Postman and custom scripts',
            'Collaborated with developers to resolve critical issues'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Test University',
          degree: 'Bachelor of Science in Computer Engineering',
          startDate: '2015-09',
          endDate: '2019-05',
          gpa: '3.7',
          achievements: [
            'Graduated Cum Laude',
            'Software Quality Assurance Certificate',
            'Member of Engineering Honor Society'
          ]
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', category: 'Programming', level: 'Advanced' },
        { id: '2', name: 'React', category: 'Frontend', level: 'Advanced' },
        { id: '3', name: 'Node.js', category: 'Backend', level: 'Intermediate' },
        { id: '4', name: 'Selenium', category: 'Testing', level: 'Expert' },
        { id: '5', name: 'Jest', category: 'Testing', level: 'Advanced' },
        { id: '6', name: 'Cypress', category: 'Testing', level: 'Advanced' },
        { id: '7', name: 'Postman', category: 'API Testing', level: 'Expert' },
        { id: '8', name: 'SQL', category: 'Database', level: 'Intermediate' }
      ]
    };

    try {
      const response = await this.makeRequest('/api/resume/save', 'POST', {
        userId: this.userId,
        resumeData,
        title: 'Test Resume Builder User - Resume'
      }, true);

      if (response.statusCode === 200 && response.data.success) {
        this.resumeId = response.data.resumeId;
        this.log('SUCCESS', `✅ Resume saved successfully (ID: ${this.resumeId})`);
        return { success: true, resumeData };
      } else {
        this.log('ERROR', `❌ Resume save failed: ${JSON.stringify(response.data)}`);
        return { success: false };
      }
    } catch (error) {
      this.log('ERROR', `❌ Resume save error: ${error.message}`);
      return { success: false };
    }
  }

  async testResumeGenerate(resumeData) {
    this.log('INFO', '📄 Testing resume document generation (simulating download)...');
    
    try {
      const response = await this.makeRequest('/api/resume/generate', 'POST', {
        resumeData,
        resumeId: this.resumeId
      }, true);

      if (response.statusCode === 200) {
        this.log('SUCCESS', '✅ Resume document generated successfully');
        this.log('INFO', '📁 Document would be downloaded in browser');
        return true;
      } else {
        this.log('ERROR', `❌ Resume generation failed: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `❌ Resume generation error: ${error.message}`);
      return false;
    }
  }

  async testCoverLetterCanFindResume() {
    this.log('INFO', '💼 Testing if cover letter builder can find the saved resume...');
    
    try {
      const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET', null, true);

      if (response.statusCode === 200 && response.data.success) {
        if (response.data.resume || (response.data.resumes && response.data.resumes.length > 0)) {
          const resumeCount = response.data.resumes ? response.data.resumes.length : 1;
          this.log('SUCCESS', `✅ Cover letter builder can find resume(s) (${resumeCount} found)`);
          
          // Show details of what was found
          if (response.data.resume) {
            this.log('INFO', `Resume title: ${response.data.resume.title}`);
          } else if (response.data.resumes && response.data.resumes.length > 0) {
            this.log('INFO', `Latest resume title: ${response.data.resumes[0].title}`);
            this.log('INFO', `All resumes: ${response.data.resumes.map(r => r.title).join(', ')}`);
          }
          
          return response.data.resume ? response.data.resume.resume_data : response.data.resumes[0].resume_data;
        } else {
          this.log('ERROR', '❌ Cover letter builder found no resumes');
          return null;
        }
      } else {
        this.log('ERROR', `❌ Cover letter builder resume lookup failed: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error) {
      this.log('ERROR', `❌ Cover letter builder resume lookup error: ${error.message}`);
      return null;
    }
  }

  async testCoverLetterGeneration(resumeData) {
    this.log('INFO', '🚀 Testing cover letter generation with found resume data...');
    
    if (!resumeData) {
      this.log('ERROR', '❌ No resume data available for cover letter generation');
      return false;
    }

    const jobDetails = {
      companyName: 'Test Workflow Company',
      jobTitle: 'Senior Test Engineer',
      jobDescription: 'We need an experienced test engineer to join our quality assurance team.',
      requirements: ['JavaScript', 'Selenium', 'Test Automation', '5+ years experience'],
      contactPerson: 'John Manager',
      contactEmail: 'hiring@testworkflow.com'
    };

    try {
      const response = await this.makeRequest('/api/cover-letter/generate', 'POST', {
        resumeData,
        jobDetails,
        tone: 'professional',
        focus: 'balanced',
        length: 'standard'
      }, true);

      if (response.statusCode === 200 && response.data.success) {
        this.log('SUCCESS', '✅ Cover letter generated successfully using saved resume data');
        return true;
      } else {
        this.log('ERROR', `❌ Cover letter generation failed: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `❌ Cover letter generation error: ${error.message}`);
      return false;
    }
  }

  async runWorkflowTest() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Resume Save Workflow Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: Resume Builder → Save → Generate → Cover Letter Builder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    let allTestsPassed = true;

    // Step 1: Login
    if (!await this.login()) {
      return false;
    }

    // Step 2: Save resume (simulating resume builder)
    const saveResult = await this.testResumeSave();
    if (!saveResult.success) {
      allTestsPassed = false;
      this.log('ERROR', '❌ Resume save failed - cannot proceed');
      return false;
    }

    // Step 3: Generate resume document (simulating download)
    if (!await this.testResumeGenerate(saveResult.resumeData)) {
      allTestsPassed = false;
    }

    // Step 4: Test if cover letter builder can find the resume
    const foundResumeData = await this.testCoverLetterCanFindResume();
    if (!foundResumeData) {
      allTestsPassed = false;
    }

    // Step 5: Test cover letter generation with found data
    if (foundResumeData) {
      if (!await this.testCoverLetterGeneration(foundResumeData)) {
        allTestsPassed = false;
      }
    }

    // Results
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allTestsPassed ? '🎉 WORKFLOW TEST: SUCCESS!' : '❌ WORKFLOW TEST: ISSUES FOUND!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (allTestsPassed) {
      this.log('SUCCESS', '🎉 Complete workflow is working!');
      console.log(`
✅ Test Results:
- ✅ Resume save: Works
- ✅ Resume generation/download: Works
- ✅ Cover letter finds resume: Works
- ✅ Cover letter generation: Works

💡 The resume → cover letter workflow is functional!
🌐 Resume data is properly saved and accessible to cover letter builder.
`);
    } else {
      this.log('ERROR', '❌ Workflow has issues');
      console.log(`
📋 Diagnosis:
- Resume save: ${saveResult.success ? 'OK' : 'FAILED'}
- Cover letter finds resume: ${foundResumeData ? 'OK' : 'FAILED'}

${!foundResumeData ? '💡 The issue is that cover letter builder cannot find saved resume data' : ''}
`);
    }

    return allTestsPassed;
  }
}

// Run the test
const tester = new ResumeSaveWorkflowTester();
tester.runWorkflowTest().catch(console.error);
