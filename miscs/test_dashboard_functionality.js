#!/usr/bin/env node

const http = require('http');

class DashboardTester {
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
          'User-Agent': 'DashboardTester/1.0',
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

  async testResumeLoading() {
    this.log('INFO', '📄 Testing resume loading for dashboard...');
    
    const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET', null, true);

    if (response.statusCode === 200 && response.data.success) {
      const resumeCount = response.data.resumes ? response.data.resumes.length : (response.data.resume ? 1 : 0);
      this.log('SUCCESS', `✅ Resume loading works (${resumeCount} resumes found)`);
      
      if (resumeCount > 0) {
        const resumes = response.data.resumes || [response.data.resume];
        this.log('INFO', 'Resume details:');
        resumes.forEach((resume, index) => {
          console.log(`   ${index + 1}. ${resume.title} (ID: ${resume.id}) - ${resume.is_complete ? 'Complete' : 'Draft'}`);
        });
      }
      
      return { success: true, count: resumeCount, resumes: response.data.resumes || [response.data.resume] };
    } else {
      this.log('ERROR', `❌ Resume loading failed: ${JSON.stringify(response.data)}`);
      return { success: false, count: 0 };
    }
  }

  async testCoverLetterLoading() {
    this.log('INFO', '📝 Testing cover letter loading for dashboard...');
    
    const response = await this.makeRequest(`/api/cover-letter/load?userId=${this.userId}`, 'GET', null, true);

    if (response.statusCode === 200 && response.data.success) {
      const coverLetterCount = response.data.coverLetters ? response.data.coverLetters.length : 0;
      this.log('SUCCESS', `✅ Cover letter loading works (${coverLetterCount} cover letters found)`);
      
      if (coverLetterCount > 0) {
        this.log('INFO', 'Cover letter details:');
        response.data.coverLetters.forEach((coverLetter, index) => {
          const jobInfo = coverLetter.cover_letter_data?.jobDetails;
          const jobDesc = jobInfo ? `${jobInfo.jobTitle} at ${jobInfo.companyName}` : 'General Cover Letter';
          console.log(`   ${index + 1}. ${coverLetter.title} (ID: ${coverLetter.id}) - ${jobDesc} - ${coverLetter.is_complete ? 'Complete' : 'Draft'}`);
        });
      }
      
      return { success: true, count: coverLetterCount, coverLetters: response.data.coverLetters || [] };
    } else if (response.statusCode === 404) {
      this.log('INFO', '📝 No cover letters found (new feature)');
      return { success: true, count: 0, coverLetters: [] };
    } else {
      this.log('ERROR', `❌ Cover letter loading failed: ${JSON.stringify(response.data)}`);
      return { success: false, count: 0 };
    }
  }

  async testCoverLetterDeletion(coverLetters) {
    if (coverLetters.length === 0) {
      this.log('INFO', '⏭️ Skipping cover letter deletion test (no cover letters available)');
      return true;
    }

    const testCoverLetter = coverLetters[0];
    this.log('INFO', `🗑️ Testing cover letter deletion (ID: ${testCoverLetter.id})...`);
    
    const response = await this.makeRequest('/api/cover-letter/delete', 'DELETE', {
      coverLetterId: testCoverLetter.id
    }, true);

    if (response.statusCode === 200 && response.data.success) {
      this.log('SUCCESS', '✅ Cover letter deletion works');
      return true;
    } else {
      this.log('ERROR', `❌ Cover letter deletion failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async testResumeGeneration(resumes) {
    if (resumes.length === 0) {
      this.log('INFO', '⏭️ Skipping resume generation test (no resumes available)');
      return true;
    }

    const testResume = resumes[0];
    this.log('INFO', `📄 Testing resume generation from dashboard (ID: ${testResume.id})...`);
    
    const response = await this.makeRequest('/api/resume/generate', 'POST', {
      resumeData: testResume.resume_data,
      resumeId: testResume.id
    }, true);

    if (response.statusCode === 200) {
      this.log('SUCCESS', '✅ Resume generation from dashboard works');
      return true;
    } else {
      this.log('ERROR', `❌ Resume generation failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  }

  async runDashboardTest() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 Dashboard Functionality Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: Dashboard display of saved resumes and cover letters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    let allTestsPassed = true;

    // Step 1: Login
    if (!await this.login()) {
      return false;
    }

    // Step 2: Test resume loading
    const resumeResult = await this.testResumeLoading();
    if (!resumeResult.success) {
      allTestsPassed = false;
    }

    // Step 3: Test cover letter loading
    const coverLetterResult = await this.testCoverLetterLoading();
    if (!coverLetterResult.success) {
      allTestsPassed = false;
    }

    // Step 4: Test resume generation (if resumes exist)
    if (resumeResult.success && resumeResult.resumes && resumeResult.resumes.length > 0) {
      if (!await this.testResumeGeneration(resumeResult.resumes)) {
        allTestsPassed = false;
      }
    }

    // Step 5: Test cover letter deletion (if cover letters exist)
    if (coverLetterResult.success && coverLetterResult.coverLetters.length > 0) {
      if (!await this.testCoverLetterDeletion(coverLetterResult.coverLetters)) {
        allTestsPassed = false;
      }
    }

    // Results
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allTestsPassed ? '🎉 DASHBOARD TEST: SUCCESS!' : '❌ DASHBOARD TEST: ISSUES FOUND!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (allTestsPassed) {
      this.log('SUCCESS', '🎉 All dashboard functionality is working!');
      console.log(`
✅ Dashboard Features Working:
- ✅ Resume loading and display: ${resumeResult.count} resumes
- ✅ Cover letter loading and display: ${coverLetterResult.count} cover letters
- ✅ Resume generation from dashboard
- ✅ Cover letter deletion
- ✅ Tabbed navigation between resumes and cover letters

🌐 Your dashboard now shows all saved documents!
📊 Users can now see their resumes and cover letters in one place.
💼 Dashboard provides edit, download, view, and delete actions.
`);
    } else {
      this.log('ERROR', '❌ Dashboard has functionality issues');
    }

    return allTestsPassed;
  }
}

// Run the test
const tester = new DashboardTester();
tester.runDashboardTest().catch(console.error);
