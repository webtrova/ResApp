#!/usr/bin/env node

const http = require('http');

class ResumeDeleteTester {
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
          'User-Agent': 'ResumeDeleteTester/1.0',
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
              data: parsedData,
              rawData: responseData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData,
              rawData: responseData
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

  async getResumes() {
    this.log('INFO', '📄 Getting current resumes...');
    
    const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET', null, true);

    if (response.statusCode === 200 && response.data.success) {
      const resumes = response.data.resumes || (response.data.resume ? [response.data.resume] : []);
      this.log('SUCCESS', `✅ Found ${resumes.length} resume(s)`);
      
      if (resumes.length > 0) {
        resumes.forEach((resume, index) => {
          console.log(`   ${index + 1}. ${resume.title} (ID: ${resume.id})`);
        });
      }
      
      return resumes;
    } else {
      this.log('ERROR', `❌ Failed to get resumes: ${JSON.stringify(response.data)}`);
      return [];
    }
  }

  async testResumeDelete(resumeId) {
    this.log('INFO', `🗑️ Testing resume deletion (ID: ${resumeId})...`);
    
    const response = await this.makeRequest('/api/resume/delete', 'DELETE', {
      resumeId: resumeId
    }, true);

    this.log('INFO', `Delete response status: ${response.statusCode}`);
    this.log('INFO', `Delete response data: ${JSON.stringify(response.data)}`);

    if (response.statusCode === 200 && response.data.success) {
      this.log('SUCCESS', '✅ Resume deleted successfully');
      return true;
    } else {
      this.log('ERROR', `❌ Resume deletion failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async runTest() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗑️ Resume Delete Functionality Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: Resume deletion with authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    // Step 1: Login
    if (!await this.login()) {
      return false;
    }

    // Step 2: Get resumes
    const resumes = await this.getResumes();
    if (resumes.length === 0) {
      this.log('WARNING', '⚠️ No resumes found to delete');
      return false;
    }

    // Step 3: Test delete on the first resume
    const testResume = resumes[0];
    this.log('INFO', `🎯 Selected resume for deletion: "${testResume.title}" (ID: ${testResume.id})`);
    
    const deleteSuccess = await this.testResumeDelete(testResume.id);

    // Step 4: Verify deletion
    if (deleteSuccess) {
      this.log('INFO', '🔍 Verifying deletion...');
      const remainingResumes = await this.getResumes();
      
      if (remainingResumes.length < resumes.length) {
        this.log('SUCCESS', '✅ Resume successfully removed from database');
      } else {
        this.log('ERROR', '❌ Resume still exists in database');
        return false;
      }
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${deleteSuccess ? '🎉 RESUME DELETE TEST: SUCCESS!' : '❌ RESUME DELETE TEST: FAILED!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (deleteSuccess) {
      this.log('SUCCESS', '🎉 Resume deletion functionality is working perfectly!');
      console.log(`
✅ Test Results:
- ✅ Authentication: Working
- ✅ Resume listing: Working
- ✅ Resume deletion: Working
- ✅ Database update: Working

💡 Users can now delete resumes just like cover letters!
🌐 Try it in the dashboard: http://localhost:3001/dashboard
      `);
    }

    return deleteSuccess;
  }
}

// Run the test
const tester = new ResumeDeleteTester();
tester.runTest().catch(console.error);
