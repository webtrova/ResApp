#!/usr/bin/env node

const http = require('http');

class AuthFixTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.authToken = null;
    this.userId = null;
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
          'User-Agent': 'AuthFixTester/1.0',
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
      this.log('SUCCESS', '✅ Login successful');
      return true;
    } else {
      this.log('ERROR', `❌ Login failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async testCoverLetterWithAuth() {
    this.log('INFO', '💼 Testing cover letter generation WITH auth token...');
    
    const resumeData = {
      personal: { fullName: 'Test User', email: 'test@example.com', phone: '123-456-7890', location: 'Test City' },
      summary: { currentTitle: 'Developer', yearsExperience: 5, keySkills: ['JavaScript', 'React'] },
      experience: [{ id: '1', company: 'Test Corp', position: 'Developer', startDate: '2020-01', endDate: '2024-01', description: 'Built applications' }],
      education: [{ id: '1', institution: 'Test University', degree: 'Computer Science', startDate: '2016-09', endDate: '2020-05' }],
      skills: [{ id: '1', name: 'JavaScript', category: 'Programming' }]
    };

    const jobDetails = {
      companyName: 'Test Company',
      jobTitle: 'Senior Developer',
      jobDescription: 'We need a skilled developer',
      requirements: ['JavaScript', 'React'],
      contactPerson: 'Jane Doe',
      contactEmail: 'jane@testcompany.com'
    };

    const response = await this.makeRequest('/api/cover-letter/generate', 'POST', {
      resumeData,
      jobDetails,
      tone: 'professional',
      focus: 'balanced',
      length: 'standard'
    }, true);

    if (response.statusCode === 200 && response.data.success) {
      this.log('SUCCESS', '✅ Cover letter generated successfully WITH auth');
      return response.data.coverLetter;
    } else {
      this.log('ERROR', `❌ Cover letter generation failed WITH auth: ${JSON.stringify(response.data)}`);
      return null;
    }
  }

  async testCoverLetterWithoutAuth() {
    this.log('INFO', '💼 Testing cover letter generation WITHOUT auth token...');
    
    const resumeData = {
      personal: { fullName: 'Test User', email: 'test@example.com', phone: '123-456-7890', location: 'Test City' },
      summary: { currentTitle: 'Developer', yearsExperience: 5, keySkills: ['JavaScript', 'React'] },
      experience: [],
      education: [],
      skills: []
    };

    const jobDetails = {
      companyName: 'Test Company',
      jobTitle: 'Senior Developer',
      jobDescription: 'We need a skilled developer'
    };

    const response = await this.makeRequest('/api/cover-letter/generate', 'POST', {
      resumeData,
      jobDetails,
      tone: 'professional',
      focus: 'balanced',
      length: 'standard'
    }, false); // No auth

    if (response.statusCode === 401) {
      this.log('SUCCESS', '✅ Correctly rejected request WITHOUT auth (401)');
      return true;
    } else {
      this.log('WARNING', `⚠️ Expected 401 without auth, got ${response.statusCode}: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async testCoverLetterSaving(coverLetterData) {
    this.log('INFO', '💾 Testing cover letter saving WITH auth...');
    
    if (!coverLetterData) {
      this.log('ERROR', '❌ No cover letter data to save');
      return false;
    }

    const response = await this.makeRequest('/api/cover-letter/save', 'POST', {
      title: 'Test Cover Letter',
      coverLetterData
    }, true);

    if (response.statusCode === 200 && response.data.success) {
      this.log('SUCCESS', '✅ Cover letter saved successfully WITH auth');
      return true;
    } else {
      this.log('ERROR', `❌ Cover letter saving failed WITH auth: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async runAuthTests() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Cover Letter Authentication Fix Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing that auth tokens are properly included in API calls
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    let allTestsPassed = true;

    // Step 1: Login
    if (!await this.login()) {
      this.log('ERROR', '❌ Cannot proceed without login');
      return false;
    }

    // Step 2: Test cover letter generation without auth (should fail)
    if (!await this.testCoverLetterWithoutAuth()) {
      allTestsPassed = false;
    }

    // Step 3: Test cover letter generation with auth (should work)
    const coverLetterData = await this.testCoverLetterWithAuth();
    if (!coverLetterData) {
      allTestsPassed = false;
    }

    // Step 4: Test cover letter saving with auth (should work)
    if (coverLetterData) {
      if (!await this.testCoverLetterSaving(coverLetterData)) {
        allTestsPassed = false;
      }
    }

    // Results
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allTestsPassed ? '🎉 AUTHENTICATION FIX: SUCCESS!' : '❌ AUTHENTICATION FIX: ISSUES FOUND!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (allTestsPassed) {
      this.log('SUCCESS', '🎉 All authentication tests passed!');
      console.log(`
✅ Test Results:
- ✅ Requests without auth properly rejected (401)
- ✅ Cover letter generation works with auth
- ✅ Cover letter saving works with auth
- ✅ Authentication tokens are properly included

💡 The "Authorization token required" error should now be fixed!
🌐 Try the cover letter builder again in your browser.
`);
    } else {
      this.log('ERROR', '❌ Some authentication tests failed');
    }

    return allTestsPassed;
  }
}

// Run the test
const tester = new AuthFixTester();
tester.runAuthTests().catch(console.error);
