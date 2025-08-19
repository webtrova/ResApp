/**
 * Cover Letter Data Flow Debug Script
 * 
 * This script tests the actual API endpoints and data flow to identify
 * where the workflow is breaking. It simulates the exact requests that
 * the frontend makes.
 * 
 * Run with: node debug_cover_letter_flow.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

class CoverLetterFlowDebugger {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.results = [];
    this.authToken = null; // Will need to be set if using authentication
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type}: ${message}`;
    console.log(logMessage);
    this.results.push({ timestamp, type, message });
  }

  // Make HTTP request with proper error handling
  async makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 3000),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CoverLetterDebugger/1.0',
          ...headers
        }
      };

      if (this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
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
              raw: responseData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              raw: responseData,
              parseError: error.message
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

  // Test 1: Check if server is running
  async testServerHealth() {
    this.log('Testing server health...', 'TEST');
    
    try {
      const response = await this.makeRequest('/api/health');
      
      if (response.statusCode === 200) {
        this.log('✅ Server is running and responsive', 'SUCCESS');
        return true;
      } else {
        this.log(`❌ Server responded with status ${response.statusCode}`, 'ERROR');
        this.log(`Response: ${response.raw}`, 'DEBUG');
        return false;
      }
    } catch (error) {
      this.log(`❌ Server is not running: ${error.message}`, 'ERROR');
      this.log('💡 Make sure to start the server with: npm run dev', 'INFO');
      return false;
    }
  }

  // Test 2: Test resume loading endpoint
  async testResumeLoading() {
    this.log('Testing resume loading endpoint...', 'TEST');
    
    try {
      const response = await this.makeRequest('/api/resume/load');
      
      this.log(`Resume endpoint status: ${response.statusCode}`, 'DEBUG');
      this.log(`Response data: ${JSON.stringify(response.data, null, 2)}`, 'DEBUG');
      
      if (response.statusCode === 200) {
        if (response.data && response.data.resume) {
          this.log('✅ Resume data loaded successfully', 'SUCCESS');
          this.log(`Resume ID: ${response.data.resume.id}`, 'INFO');
          return response.data.resume;
        } else {
          this.log('⚠️  Resume endpoint works but no resume data found', 'WARNING');
          this.log('💡 Create a resume first in the builder section', 'INFO');
          return null;
        }
      } else if (response.statusCode === 401) {
        this.log('❌ Authentication required for resume loading', 'ERROR');
        this.log('💡 Make sure user is logged in', 'INFO');
        return null;
      } else {
        this.log(`❌ Resume loading failed with status ${response.statusCode}`, 'ERROR');
        return null;
      }
    } catch (error) {
      this.log(`❌ Resume loading request failed: ${error.message}`, 'ERROR');
      return null;
    }
  }

  // Test 3: Test cover letter generation endpoint
  async testCoverLetterGeneration(resumeData = null) {
    this.log('Testing cover letter generation endpoint...', 'TEST');
    
    // Use test data if no resume data provided
    const testResumeData = resumeData || JSON.parse(fs.readFileSync('test_resume_data.json', 'utf8'));
    const testJobDetails = JSON.parse(fs.readFileSync('test_job_details.json', 'utf8'));
    
    const requestData = {
      resumeData: testResumeData,
      jobDetails: testJobDetails,
      tone: 'professional',
      focus: 'balanced',
      length: 'standard'
    };

    try {
      const response = await this.makeRequest('/api/cover-letter/generate', 'POST', requestData);
      
      this.log(`Cover letter generation status: ${response.statusCode}`, 'DEBUG');
      
      if (response.statusCode === 200) {
        if (response.data && response.data.coverLetter) {
          this.log('✅ Cover letter generated successfully', 'SUCCESS');
          this.log(`Generated sections: ${Object.keys(response.data.coverLetter).join(', ')}`, 'INFO');
          return response.data.coverLetter;
        } else {
          this.log('❌ Cover letter generation returned success but no data', 'ERROR');
          this.log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'DEBUG');
          return null;
        }
      } else if (response.statusCode === 401) {
        this.log('❌ Authentication required for cover letter generation', 'ERROR');
        return null;
      } else if (response.statusCode === 400) {
        this.log('❌ Bad request for cover letter generation', 'ERROR');
        this.log(`Error details: ${JSON.stringify(response.data, null, 2)}`, 'DEBUG');
        return null;
      } else {
        this.log(`❌ Cover letter generation failed with status ${response.statusCode}`, 'ERROR');
        this.log(`Response: ${response.raw}`, 'DEBUG');
        return null;
      }
    } catch (error) {
      this.log(`❌ Cover letter generation request failed: ${error.message}`, 'ERROR');
      return null;
    }
  }

  // Test 4: Test cover letter saving
  async testCoverLetterSaving(coverLetterData) {
    this.log('Testing cover letter saving endpoint...', 'TEST');
    
    if (!coverLetterData) {
      this.log('❌ No cover letter data to save', 'ERROR');
      return false;
    }

    const requestData = {
      title: 'Test Cover Letter - Google Senior Software Engineer',
      coverLetterData: coverLetterData
    };

    try {
      const response = await this.makeRequest('/api/cover-letter/save', 'POST', requestData);
      
      this.log(`Cover letter saving status: ${response.statusCode}`, 'DEBUG');
      
      if (response.statusCode === 200) {
        this.log('✅ Cover letter saved successfully', 'SUCCESS');
        return true;
      } else if (response.statusCode === 401) {
        this.log('❌ Authentication required for saving', 'ERROR');
        return false;
      } else {
        this.log(`❌ Cover letter saving failed with status ${response.statusCode}`, 'ERROR');
        this.log(`Response: ${response.raw}`, 'DEBUG');
        return false;
      }
    } catch (error) {
      this.log(`❌ Cover letter saving request failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Test 5: Test the complete workflow
  async testCompleteWorkflow() {
    this.log('Testing complete cover letter workflow...', 'TEST');
    
    // Step 1: Load resume data
    const resumeData = await this.testResumeLoading();
    
    // Step 2: Generate cover letter
    const coverLetterData = await this.testCoverLetterGeneration(resumeData);
    
    // Step 3: Save cover letter (if generation succeeded)
    if (coverLetterData) {
      await this.testCoverLetterSaving(coverLetterData);
    }
    
    return { resumeData, coverLetterData };
  }

  // Test 6: Check database connection
  async testDatabaseConnection() {
    this.log('Testing database connection...', 'TEST');
    
    try {
      // Try to hit an endpoint that requires database access
      const response = await this.makeRequest('/api/setup');
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        this.log('✅ Database connection working', 'SUCCESS');
        return true;
      } else {
        this.log(`⚠️  Database might have issues (status: ${response.statusCode})`, 'WARNING');
        return false;
      }
    } catch (error) {
      this.log(`❌ Database connection test failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Generate debug report
  generateDebugReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      results: this.results,
      summary: {
        total: this.results.length,
        errors: this.results.filter(r => r.type === 'ERROR').length,
        warnings: this.results.filter(r => r.type === 'WARNING').length,
        successes: this.results.filter(r => r.type === 'SUCCESS').length
      }
    };

    fs.writeFileSync('debug_cover_letter_report.json', JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('🐛 COVER LETTER FLOW DEBUG REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Results Summary:`);
    console.log(`   ✅ Successes: ${report.summary.successes}`);
    console.log(`   ⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`   ❌ Errors: ${report.summary.errors}`);
    console.log(`   📋 Total Tests: ${report.summary.total}`);
    
    const errors = this.results.filter(r => r.type === 'ERROR');
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach(error => {
        console.log(`   • ${error.message}`);
      });
    }

    const warnings = this.results.filter(r => r.type === 'WARNING');
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(warning => {
        console.log(`   • ${warning.message}`);
      });
    }

    console.log('\n💡 NEXT STEPS:');
    if (errors.length === 0 && warnings.length === 0) {
      console.log('   🎉 All tests passed! The workflow should be working.');
    } else {
      console.log('   1. Start the development server: npm run dev');
      console.log('   2. Create a test user account');
      console.log('   3. Build a resume in the builder section');
      console.log('   4. Test the cover letter workflow in the browser');
      console.log('   5. Check the database connection and schema');
    }
    
    console.log(`\n📄 Detailed report saved to: debug_cover_letter_report.json`);
  }

  // Main debug runner
  async runAllTests() {
    console.log('🐛 Starting Cover Letter Flow Debug Tests...');
    console.log('This will test the actual API endpoints and data flow.\n');

    // Test server health first
    const serverRunning = await this.testServerHealth();
    if (!serverRunning) {
      this.log('Cannot continue tests - server is not running', 'ERROR');
      this.generateDebugReport();
      return;
    }

    // Test database connection
    await this.testDatabaseConnection();

    // Test the complete workflow
    await this.testCompleteWorkflow();

    // Generate report
    this.generateDebugReport();
  }
}

// Run the debug tests
if (require.main === module) {
  const flowDebugger = new CoverLetterFlowDebugger();
  flowDebugger.runAllTests().catch(console.error);
}

module.exports = CoverLetterFlowDebugger;
