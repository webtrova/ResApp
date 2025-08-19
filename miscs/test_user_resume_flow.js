#!/usr/bin/env node

const http = require('http');

class UserResumeFlowTester {
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
          'User-Agent': 'UserFlowTester/1.0',
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

  async loginAsUser() {
    this.log('INFO', '🔐 Logging in as your test user...');
    
    // Use existing test user
    const response = await this.makeRequest('/api/auth/login', 'POST', {
      email: 'test.e2e@resapp.com',
      password: 'TestPassword123!'
    });

    if (response.statusCode === 200 && response.data.success) {
      this.authToken = response.data.token;
      this.userId = response.data.user.id;
      this.log('SUCCESS', `✅ Logged in successfully (UserID: ${this.userId})`);
      return true;
    } else {
      this.log('ERROR', `❌ Login failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async testResumeLoading() {
    this.log('INFO', '📄 Testing resume loading for your user...');
    
    const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET');

    this.log('INFO', `Resume load response status: ${response.statusCode}`);
    this.log('INFO', `Resume load response: ${JSON.stringify(response.data, null, 2)}`);

    if (response.statusCode === 200 && response.data.success) {
      if (response.data.resume) {
        this.log('SUCCESS', '✅ Found single resume');
        this.log('INFO', `Resume title: ${response.data.resume.title}`);
        this.log('INFO', `Resume ID: ${response.data.resume.id}`);
        this.resumeId = response.data.resume.id;
        return response.data.resume.resume_data;
      } else if (response.data.resumes && response.data.resumes.length > 0) {
        this.log('SUCCESS', `✅ Found ${response.data.resumes.length} resumes`);
        const latestResume = response.data.resumes[0];
        this.log('INFO', `Latest resume title: ${latestResume.title}`);
        this.log('INFO', `Latest resume ID: ${latestResume.id}`);
        this.resumeId = latestResume.id;
        return latestResume.resume_data;
      } else {
        this.log('WARNING', '⚠️ No resumes found in successful response');
        return null;
      }
    } else if (response.statusCode === 404) {
      this.log('WARNING', '⚠️ No resumes found (404)');
      return null;
    } else {
      this.log('ERROR', `❌ Resume loading failed: ${JSON.stringify(response.data)}`);
      return null;
    }
  }

  async testCoverLetterPageDataLoading() {
    this.log('INFO', '💼 Testing cover letter page data loading simulation...');
    
    // This simulates what the cover letter builder page does
    const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET');

    if (response.statusCode === 200 && response.data.success) {
      if (response.data.resume && response.data.resume.resume_data) {
        this.log('SUCCESS', '✅ Cover letter page would load single resume successfully');
        return response.data.resume.resume_data;
      } else if (response.data.resumes && response.data.resumes.length > 0) {
        this.log('SUCCESS', '✅ Cover letter page would load latest resume successfully');
        return response.data.resumes[0].resume_data;
      } else {
        this.log('ERROR', '❌ Cover letter page would show "No resume found" error');
        return null;
      }
    } else {
      this.log('ERROR', '❌ Cover letter page would fail to load resume');
      return null;
    }
  }

  async testCoverLetterGeneration(resumeData) {
    this.log('INFO', '🚀 Testing cover letter generation with loaded resume...');
    
    if (!resumeData) {
      this.log('ERROR', '❌ No resume data to generate cover letter with');
      return false;
    }

    const jobDetails = {
      companyName: 'Test Company',
      jobTitle: 'Software Engineer',
      jobDescription: 'Looking for a talented software engineer',
      requirements: ['JavaScript', 'React', 'Node.js'],
      contactPerson: 'Jane Doe',
      contactEmail: 'jane@testcompany.com'
    };

    const coverLetterOptions = {
      tone: 'professional',
      focus: 'balanced',
      length: 'standard'
    };

    const response = await this.makeRequest('/api/cover-letter/generate', 'POST', {
      resumeData,
      jobDetails,
      ...coverLetterOptions
    }, true);

    if (response.statusCode === 200 && response.data.coverLetter) {
      this.log('SUCCESS', '✅ Cover letter generated successfully');
      return true;
    } else {
      this.log('ERROR', `❌ Cover letter generation failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async runUserFlowTest() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 User Resume Flow Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing the exact flow: Build Resume → Load in Cover Letter Builder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    // Step 1: Login
    if (!await this.loginAsUser()) {
      return false;
    }

    // Step 2: Check what resumes exist for this user
    const resumeData = await this.testResumeLoading();

    // Step 3: Test cover letter page loading (simulates what happens when you visit the page)
    const coverLetterPageData = await this.testCoverLetterPageDataLoading();

    // Step 4: Test cover letter generation
    const generationSuccess = await this.testCoverLetterGeneration(coverLetterPageData);

    // Results
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${resumeData && coverLetterPageData && generationSuccess ? '🎉 USER FLOW TEST: SUCCESS!' : '❌ USER FLOW TEST: ISSUES FOUND!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (resumeData && coverLetterPageData && generationSuccess) {
      this.log('SUCCESS', '🎉 The resume → cover letter flow is working!');
      console.log(`
✅ Test Results:
- Resume data exists for user
- Cover letter page can load the resume
- Cover letter generation works with the loaded data

💡 The fix has resolved the issue!
`);
    } else {
      this.log('ERROR', '❌ Issues found in the resume → cover letter flow');
      console.log(`
❌ Test Results:
- Resume data available: ${resumeData ? 'YES' : 'NO'}
- Cover letter page loading: ${coverLetterPageData ? 'YES' : 'NO'}  
- Cover letter generation: ${generationSuccess ? 'YES' : 'NO'}

${!resumeData ? '💡 No resume found - you may need to build a resume first' : ''}
${resumeData && !coverLetterPageData ? '💡 Cover letter page loading issue - check the fix' : ''}
${coverLetterPageData && !generationSuccess ? '💡 Cover letter generation issue - check resume data format' : ''}
`);
    }

    return resumeData && coverLetterPageData && generationSuccess;
  }
}

// Run the test
const tester = new UserResumeFlowTester();
tester.runUserFlowTest().catch(console.error);
