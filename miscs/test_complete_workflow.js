/**
 * Complete Cover Letter Workflow Test
 * 
 * This script will:
 * 1. Create/login a test user
 * 2. Load their resume data
 * 3. Generate a cover letter
 * 4. Save the cover letter
 * 
 * Run with: node test_complete_workflow.js
 */

const http = require('http');

class WorkflowTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.authToken = null;
    this.userId = null;
    this.testUser = {
      email: 'test@coverletterflow.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };
  }

  log(message, type = 'INFO') {
    const colors = {
      'INFO': '\x1b[36m',
      'SUCCESS': '\x1b[32m',
      'ERROR': '\x1b[31m',
      'WARNING': '\x1b[33m',
      'RESET': '\x1b[0m'
    };
    console.log(`${colors[type]}${type}: ${message}${colors.RESET}`);
  }

  async makeRequest(path, method = 'GET', data = null, includeAuth = false) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: 3001,
        path: url.pathname,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WorkflowTester/1.0',
        }
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
              data: parsedData,
              raw: responseData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: null,
              raw: responseData,
              parseError: error.message
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async setupTestUser() {
    this.log('Setting up test user...', 'INFO');

    // Try to login first
    let response = await this.makeRequest('/api/auth/login', 'POST', {
      email: this.testUser.email,
      password: this.testUser.password
    });

    if (response.statusCode === 200 && response.data.success) {
      this.authToken = response.data.token;
      this.userId = response.data.user.id;
      this.log('✅ Logged in with existing test user', 'SUCCESS');
      return true;
    }

    // If login failed, try a different email
    this.testUser.email = `test${Date.now()}@coverletterflow.com`;
    this.log(`Login failed, trying with new email: ${this.testUser.email}`, 'INFO');

    // Create new user if login failed
    this.log('Creating new test user...', 'INFO');
    response = await this.makeRequest('/api/auth/register', 'POST', {
      firstName: this.testUser.firstName,
      lastName: this.testUser.lastName,
      email: this.testUser.email,
      password: this.testUser.password
    });

    if ((response.statusCode === 201 || response.statusCode === 200) && response.data.success) {
      this.log('✅ Test user created successfully', 'SUCCESS');
      
      // Now login
      response = await this.makeRequest('/api/auth/login', 'POST', {
        email: this.testUser.email,
        password: this.testUser.password
      });

      if (response.statusCode === 200 && response.data.success) {
        this.authToken = response.data.token;
        this.userId = response.data.user.id;
        this.log('✅ Logged in with new test user', 'SUCCESS');
        return true;
      }
    }

    this.log('❌ Failed to setup test user', 'ERROR');
    if (response.data) {
      this.log(`Error: ${JSON.stringify(response.data)}`, 'ERROR');
    }
    return false;
  }

  async testResumeLoading() {
    this.log('Testing resume loading...', 'INFO');
    this.log(`Making request to: /api/resume/load?userId=${this.userId}`, 'INFO');
    this.log(`Auth token: ${this.authToken ? 'Present' : 'Missing'}`, 'INFO');

    const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET', null, true);
    
    if (response.statusCode === 200) {
      if (response.data.resume) {
        // Single resume response
        this.log('✅ Resume loaded successfully', 'SUCCESS');
        this.log(`Resume ID: ${response.data.resume.id}`, 'INFO');
        return response.data.resume.resume_data;
      } else if (response.data.resumes && response.data.resumes.length > 0) {
        // Multiple resumes response, take the first one
        const resume = response.data.resumes[0];
        this.log('✅ Resume loaded successfully', 'SUCCESS');
        this.log(`Resume ID: ${resume.id}`, 'INFO');
        return resume.resume_data;
      }
    }
    
    this.log(`❌ Resume loading failed (${response.statusCode})`, 'ERROR');
    if (response.data) {
      this.log(`Error: ${JSON.stringify(response.data)}`, 'ERROR');
    }
    return null;
  }

  async testCoverLetterGeneration(resumeData) {
    this.log('Testing cover letter generation...', 'INFO');

    const testJobDetails = {
      companyName: 'Google',
      jobTitle: 'Senior Software Engineer',
      jobDescription: 'We are looking for a senior software engineer to join our team.',
      requirements: ['5+ years experience', 'React expertise', 'Node.js knowledge'],
      contactPerson: 'Jane Smith',
      contactEmail: 'hiring@google.com'
    };

    const requestData = {
      resumeData: resumeData,
      jobDetails: testJobDetails,
      tone: 'professional',
      focus: 'balanced',
      length: 'standard'
    };

    const response = await this.makeRequest('/api/cover-letter/generate', 'POST', requestData, true);
    
    if (response.statusCode === 200 && response.data.success) {
      this.log('✅ Cover letter generated successfully', 'SUCCESS');
      this.log(`Generated content sections: ${Object.keys(response.data.coverLetter).join(', ')}`, 'INFO');
      return response.data.coverLetter;
    } else {
      this.log(`❌ Cover letter generation failed (${response.statusCode})`, 'ERROR');
      if (response.data) {
        this.log(`Error: ${JSON.stringify(response.data)}`, 'ERROR');
      }
      return null;
    }
  }

  async testCoverLetterSaving(coverLetterData) {
    this.log('Testing cover letter saving...', 'INFO');

    const response = await this.makeRequest('/api/cover-letter/save', 'POST', {
      title: 'Test Cover Letter - Google Senior Engineer',
      coverLetterData: coverLetterData
    }, true);
    
    if (response.statusCode === 200 && response.data.success) {
      this.log('✅ Cover letter saved successfully', 'SUCCESS');
      this.log(`Cover Letter ID: ${response.data.coverLetterId}`, 'INFO');
      return true;
    } else {
      this.log(`❌ Cover letter saving failed (${response.statusCode})`, 'ERROR');
      if (response.data) {
        this.log(`Error: ${JSON.stringify(response.data)}`, 'ERROR');
      }
      return false;
    }
  }

  async runCompleteWorkflow() {
    this.log('🚀 Starting Complete Cover Letter Workflow Test', 'INFO');
    console.log('='.repeat(60));

    // Step 1: Setup test user and authentication
    const userSetup = await this.setupTestUser();
    if (!userSetup) {
      this.log('❌ Cannot continue without authentication', 'ERROR');
      return false;
    }

    // Step 2: Load resume data
    let resumeData = await this.testResumeLoading();
    if (!resumeData) {
      this.log('⚠️  No resume data found. Creating test resume data...', 'WARNING');
      // Use test resume data from our test files
      const fs = require('fs');
      try {
        const testResumeData = JSON.parse(fs.readFileSync('test_resume_data.json', 'utf8'));
        this.log('✅ Using test resume data', 'SUCCESS');
        resumeData = testResumeData;
      } catch (error) {
        this.log('❌ No test resume data available', 'ERROR');
        return false;
      }
    }

    // Step 3: Generate cover letter
    const coverLetterData = await this.testCoverLetterGeneration(resumeData);
    if (!coverLetterData) {
      this.log('❌ Cover letter generation failed', 'ERROR');
      return false;
    }

    // Step 4: Save cover letter
    const saved = await this.testCoverLetterSaving(coverLetterData);
    if (!saved) {
      this.log('❌ Cover letter saving failed', 'ERROR');
      return false;
    }

    console.log('='.repeat(60));
    this.log('🎉 Complete workflow test PASSED!', 'SUCCESS');
    this.log('The cover letter workflow is working correctly!', 'SUCCESS');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Try the workflow in your browser at http://localhost:3000/cover-letter-builder');
    console.log('2. Login with your test user: test@coverletterflow.com / TestPassword123!');
    console.log('3. The workflow should now work end-to-end');
    
    return true;
  }
}

// Run the test
if (require.main === module) {
  const tester = new WorkflowTester();
  tester.runCompleteWorkflow().catch(console.error);
}

module.exports = WorkflowTester;
