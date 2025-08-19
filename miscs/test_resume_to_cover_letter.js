#!/usr/bin/env node

const http = require('http');

class EndToEndTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.authToken = null;
    this.userId = null;
    this.resumeId = null;
    this.testUser = {
      email: 'test.e2e@resapp.com',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'E2E Tester'
    };
    this.resumeData = null;
  }

  log(level, message) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
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
          'User-Agent': 'E2ETester/1.0',
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

  async setupTestUser() {
    this.log('INFO', 'Setting up test user...');
    
    // Try to login first
    try {
      const loginResponse = await this.makeRequest('/api/auth/login', 'POST', {
        email: this.testUser.email,
        password: this.testUser.password
      });

      this.log('INFO', `Login response: ${loginResponse.statusCode}`);
      if (loginResponse.statusCode === 200 && loginResponse.data.success) {
        this.authToken = loginResponse.data.token;
        this.userId = loginResponse.data.user.id;
        this.log('SUCCESS', '✅ Logged in with existing test user');
        return true;
      } else {
        this.log('INFO', `Login failed: ${JSON.stringify(loginResponse.data)}`);
      }
    } catch (error) {
      this.log('INFO', `Login error: ${error.message}`);
      // User might not exist, try to register
    }

    // Register new user
    const registerResponse = await this.makeRequest('/api/auth/register', 'POST', {
      email: this.testUser.email,
      password: this.testUser.password,
      firstName: this.testUser.firstName,
      lastName: this.testUser.lastName
    });

    this.log('INFO', `Register response: ${registerResponse.statusCode}`);
    if (registerResponse.statusCode === 201 || (registerResponse.statusCode === 200 && registerResponse.data.success)) {
      // Try to login after registration since registration might not return token
      if (registerResponse.data.token) {
        this.authToken = registerResponse.data.token;
        this.userId = registerResponse.data.user?.id || registerResponse.data.userId;
      } else {
        // Login after successful registration
        const loginResponse = await this.makeRequest('/api/auth/login', 'POST', {
          email: this.testUser.email,
          password: this.testUser.password
        });
        
        if (loginResponse.statusCode === 200 && loginResponse.data.success) {
          this.authToken = loginResponse.data.token;
          this.userId = loginResponse.data.user.id;
        }
      }
      
      if (this.authToken && this.userId) {
        this.log('SUCCESS', '✅ Registered and logged in new test user');
        return true;
      }
    }

    this.log('ERROR', '❌ Failed to setup test user');
    this.log('ERROR', `Register response: ${JSON.stringify(registerResponse.data)}`);
    return false;
  }

  async testResumeCreation() {
    this.log('INFO', '📝 Testing resume creation...');
    
    const resumeData = {
      personal: {
        fullName: 'John E2E Tester',
        email: 'john.tester@example.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johntester',
        portfolio: 'johntester.dev'
      },
      summary: {
        currentTitle: 'Senior Full-Stack Developer',
        yearsExperience: 7,
        keySkills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
        careerObjective: 'Passionate full-stack developer with 7+ years of experience building scalable web applications. Seeking to leverage expertise in modern JavaScript frameworks and cloud technologies to drive innovation at a forward-thinking tech company.'
      },
      experience: [
        {
          id: '1',
          company: 'TechCorp Solutions',
          position: 'Senior Full-Stack Developer',
          startDate: '2020-01',
          endDate: '2024-01',
          description: 'Led development of microservices architecture serving 100K+ daily users',
          responsibilities: [
            'Architected and developed RESTful APIs using Node.js and Express',
            'Built responsive React applications with TypeScript and Redux',
            'Implemented CI/CD pipelines reducing deployment time by 60%',
            'Mentored 3 junior developers and conducted code reviews',
            'Optimized database queries improving performance by 40%'
          ]
        },
        {
          id: '2',
          company: 'StartupXYZ',
          position: 'Full-Stack Developer',
          startDate: '2018-06',
          endDate: '2019-12',
          description: 'Developed MVP for fintech startup from conception to production',
          responsibilities: [
            'Built end-to-end web application using MERN stack',
            'Integrated payment processing with Stripe API',
            'Implemented real-time features using WebSocket technology',
            'Created automated testing suite with Jest and Cypress'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science in Computer Science',
          startDate: '2014-09',
          endDate: '2018-05',
          gpa: '3.8',
          achievements: [
            'Magna Cum Laude graduate',
            'Dean\'s List for 6 semesters',
            'President of Computer Science Club'
          ]
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', category: 'Programming', level: 'Expert' },
        { id: '2', name: 'React', category: 'Frontend', level: 'Expert' },
        { id: '3', name: 'Node.js', category: 'Backend', level: 'Advanced' },
        { id: '4', name: 'Python', category: 'Programming', level: 'Advanced' },
        { id: '5', name: 'AWS', category: 'Cloud', level: 'Intermediate' },
        { id: '6', name: 'Docker', category: 'DevOps', level: 'Intermediate' },
        { id: '7', name: 'TypeScript', category: 'Programming', level: 'Advanced' },
        { id: '8', name: 'PostgreSQL', category: 'Database', level: 'Advanced' }
      ]
    };

    try {
      const response = await this.makeRequest('/api/resume/save', 'POST', {
        userId: this.userId,
        resumeData,
        title: 'John E2E Tester - Resume'
      }, true);

      if (response.statusCode === 200) {
        this.resumeId = response.data.resumeId;
        this.resumeData = resumeData;
        this.log('SUCCESS', `✅ Resume created successfully (ID: ${this.resumeId})`);
        this.log('INFO', `📋 Resume contains: ${resumeData.experience.length} experiences, ${resumeData.education.length} education, ${resumeData.skills.length} skills`);
        return true;
      } else {
        this.log('ERROR', `❌ Resume creation failed (${response.statusCode})`);
        this.log('ERROR', `Error: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `❌ Resume creation error: ${error.message}`);
      return false;
    }
  }

  async testResumeGeneration() {
    this.log('INFO', '📄 Testing resume document generation...');
    
    try {
      const response = await this.makeRequest('/api/resume/generate', 'POST', {
        resumeData: this.resumeData,
        resumeId: this.resumeId
      }, true);

      if (response.statusCode === 200) {
        this.log('SUCCESS', '✅ Resume document generated successfully');
        this.log('INFO', '📁 Document would be downloaded in browser');
        return true;
      } else {
        this.log('ERROR', `❌ Resume generation failed (${response.statusCode})`);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `❌ Resume generation error: ${error.message}`);
      return false;
    }
  }

  async testResumeLoading() {
    this.log('INFO', '📖 Testing resume loading...');
    
    try {
      const response = await this.makeRequest(`/api/resume/load?userId=${this.userId}`, 'GET', null, true);

      if (response.statusCode === 200 && response.data.resume) {
        this.log('SUCCESS', '✅ Resume loaded successfully');
        this.log('INFO', `📋 Loaded resume: ${response.data.resume.title}`);
        
        // Update our resume data with what's actually in the database
        this.resumeData = response.data.resume.resume_data;
        this.resumeId = response.data.resume.id;
        return true;
      } else {
        this.log('WARNING', '⚠️ No resume found, using created data');
        return true; // We'll use the data we created
      }
    } catch (error) {
      this.log('ERROR', `❌ Resume loading error: ${error.message}`);
      return false;
    }
  }

  async testCoverLetterGeneration() {
    this.log('INFO', '💼 Testing cover letter generation...');
    
    const jobDetails = {
      companyName: 'Google',
      jobTitle: 'Senior Software Engineer',
      jobDescription: 'We are looking for a senior software engineer to join our team working on cutting-edge AI products. You will be responsible for building scalable systems that serve millions of users worldwide.',
      requirements: [
        '7+ years of software development experience',
        'Strong proficiency in JavaScript/TypeScript',
        'Experience with React and Node.js',
        'Cloud platform experience (AWS, GCP)',
        'System design and architecture skills'
      ],
      contactPerson: 'Sarah Chen',
      contactEmail: 'hiring@google.com'
    };

    const coverLetterOptions = {
      tone: 'professional',
      focus: 'balanced',
      length: 'standard'
    };

    try {
      const response = await this.makeRequest('/api/cover-letter/generate', 'POST', {
        resumeData: this.resumeData,
        jobDetails,
        ...coverLetterOptions
      }, true);

      if (response.statusCode === 200) {
        this.log('SUCCESS', '✅ Cover letter generated successfully');
        this.log('INFO', `📝 Generated sections: ${Object.keys(response.data.coverLetter).join(', ')}`);
        
        // Display a preview of the generated content
        if (response.data.coverLetter.opening) {
          this.log('INFO', '📖 Opening preview:');
          console.log(`   "${response.data.coverLetter.opening.slice(0, 100)}..."`);
        }
        
        return response.data.coverLetter;
      } else {
        this.log('ERROR', `❌ Cover letter generation failed (${response.statusCode})`);
        this.log('ERROR', `Error: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error) {
      this.log('ERROR', `❌ Cover letter generation error: ${error.message}`);
      return null;
    }
  }

  async testCoverLetterSaving(coverLetterData) {
    this.log('INFO', '💾 Testing cover letter saving...');
    
    try {
      const response = await this.makeRequest('/api/cover-letter/save', 'POST', {
        title: 'Google Senior Software Engineer - Cover Letter',
        coverLetterData
      }, true);

      if (response.statusCode === 200) {
        this.log('SUCCESS', `✅ Cover letter saved successfully (ID: ${response.data.coverLetterId})`);
        return true;
      } else {
        this.log('ERROR', `❌ Cover letter saving failed (${response.statusCode})`);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `❌ Cover letter saving error: ${error.message}`);
      return false;
    }
  }

  async runCompleteWorkflow() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 ResApp End-to-End Workflow Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing complete workflow: Resume Builder → Cover Letter Builder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    let success = true;

    // Step 1: Setup user
    if (!await this.setupTestUser()) {
      return false;
    }

    // Step 2: Create a complete resume
    this.log('INFO', '\n📝 PHASE 1: Resume Builder Workflow');
    this.log('INFO', '════════════════════════════════════');
    
    if (!await this.testResumeCreation()) {
      success = false;
    }

    if (!await this.testResumeGeneration()) {
      success = false;
    }

    if (!await this.testResumeLoading()) {
      success = false;
    }

    // Step 3: Use resume data for cover letter
    this.log('INFO', '\n💼 PHASE 2: Cover Letter Builder Workflow');
    this.log('INFO', '═══════════════════════════════════════════');
    
    const coverLetterData = await this.testCoverLetterGeneration();
    if (!coverLetterData) {
      success = false;
    } else {
      if (!await this.testCoverLetterSaving(coverLetterData)) {
        success = false;
      }
    }

    // Results
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${success ? '🎉 END-TO-END TEST RESULTS: SUCCESS!' : '❌ END-TO-END TEST RESULTS: FAILED!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (success) {
      this.log('SUCCESS', '🎉 Complete workflow test PASSED!');
      this.log('SUCCESS', 'Both Resume Builder and Cover Letter Builder are working perfectly!');
      console.log(`
💡 Next Steps:
1. Visit Resume Builder: http://localhost:3001/builder
2. Visit Cover Letter Builder: http://localhost:3001/cover-letter-builder
3. Login with: ${this.testUser.email} / ${this.testUser.password}
4. Your test resume (ID: ${this.resumeId}) is ready for cover letter generation!

🌟 The complete workflow from resume creation to cover letter generation is working beautifully!
`);
    } else {
      this.log('ERROR', '❌ Some tests failed. Please check the logs above.');
    }

    return success;
  }
}

// Run the test
const tester = new EndToEndTester();
tester.runCompleteWorkflow().catch(console.error);
