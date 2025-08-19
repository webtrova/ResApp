#!/usr/bin/env node

const http = require('http');

class ResumeChecker {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
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

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: 3001,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ResumeChecker/1.0',
        },
      };

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

  async checkResumesForUser(email, password) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Resume Checker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Checking what resumes exist for your account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    // Step 1: Login
    this.log('INFO', `🔐 Logging in as ${email}...`);
    
    const loginResponse = await this.makeRequest('/api/auth/login', 'POST', {
      email,
      password
    });

    if (loginResponse.statusCode !== 200 || !loginResponse.data.success) {
      this.log('ERROR', `❌ Login failed: ${JSON.stringify(loginResponse.data)}`);
      return;
    }

    const { token, user } = loginResponse.data;
    this.log('SUCCESS', `✅ Login successful (UserID: ${user.id})`);

    // Step 2: Check resumes
    this.log('INFO', '📄 Checking resumes for your account...');
    
    const resumeResponse = await this.makeRequest(`/api/resume/load?userId=${user.id}`, 'GET');

    if (resumeResponse.statusCode === 200 && resumeResponse.data.success) {
      if (resumeResponse.data.resumes && resumeResponse.data.resumes.length > 0) {
        this.log('SUCCESS', `✅ Found ${resumeResponse.data.resumes.length} resume(s):`);
        
        resumeResponse.data.resumes.forEach((resume, index) => {
          console.log(`
📋 Resume #${index + 1}:
   📝 Title: ${resume.title}
   🆔 ID: ${resume.id}
   📅 Created: ${new Date(resume.created_at).toLocaleString()}
   📅 Updated: ${new Date(resume.updated_at).toLocaleString()}
   ✅ Complete: ${resume.is_complete ? 'Yes' : 'No'}
   👤 Name: ${resume.resume_data?.personal?.fullName || 'Not set'}
   💼 Title: ${resume.resume_data?.summary?.currentTitle || 'Not set'}
          `);
        });

        this.log('SUCCESS', '🎉 Your resumes are available for cover letter generation!');
        
      } else if (resumeResponse.data.resume) {
        this.log('SUCCESS', '✅ Found 1 resume:');
        const resume = resumeResponse.data.resume;
        console.log(`
📋 Resume:
   📝 Title: ${resume.title}
   🆔 ID: ${resume.id}
   📅 Created: ${new Date(resume.created_at).toLocaleString()}
   📅 Updated: ${new Date(resume.updated_at).toLocaleString()}
   ✅ Complete: ${resume.is_complete ? 'Yes' : 'No'}
   👤 Name: ${resume.resume_data?.personal?.fullName || 'Not set'}
   💼 Title: ${resume.resume_data?.summary?.currentTitle || 'Not set'}
        `);

        this.log('SUCCESS', '🎉 Your resume is available for cover letter generation!');
      } else {
        this.log('WARNING', '⚠️ No resumes found for your account');
        console.log(`
💡 To fix this:
1. Go to the Resume Builder: http://localhost:3001/builder
2. Create or edit your resume
3. Click "Generate Resume" to save it
4. Then try the Cover Letter Builder: http://localhost:3001/cover-letter-builder
        `);
      }
    } else if (resumeResponse.statusCode === 404) {
      this.log('WARNING', '⚠️ No resumes found (404)');
      console.log(`
💡 To fix this:
1. Go to the Resume Builder: http://localhost:3001/builder
2. Create or edit your resume
3. Click "Generate Resume" to save it
4. Then try the Cover Letter Builder: http://localhost:3001/cover-letter-builder
      `);
    } else {
      this.log('ERROR', `❌ Error checking resumes: ${JSON.stringify(resumeResponse.data)}`);
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${resumeResponse.data.resumes?.length > 0 || resumeResponse.data.resume ? '✅ RESULT: Resumes found!' : '❌ RESULT: No resumes found!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}

// Get credentials from command line or use defaults
const email = process.argv[2] || 'test.e2e@resapp.com';
const password = process.argv[3] || 'TestPassword123!';

console.log(`
🔍 Usage: node check_my_resumes.js [email] [password]
📧 Checking for: ${email}
`);

const checker = new ResumeChecker();
checker.checkResumesForUser(email, password).catch(console.error);
