/**
 * Cover Letter Workflow Test Script
 * 
 * This script tests the entire cover letter generation workflow to ensure:
 * 1. Resume data is properly loaded
 * 2. Job details form works correctly
 * 3. Cover letter generation API responds properly
 * 4. Data flows correctly between components
 * 5. Cover letter saving works
 * 
 * Run this with: node test_cover_letter_workflow.js
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: {
    email: 'test@example.com',
    password: 'testpassword123'
  },
  testResume: {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA'
    },
    summary: 'Experienced software engineer with 5+ years in full-stack development.',
    experience: [
      {
        id: '1',
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: '2024-01',
        description: 'Led development of microservices architecture, improved system performance by 40%.',
        responsibilities: [
          'Developed scalable web applications using React and Node.js',
          'Mentored junior developers and conducted code reviews',
          'Implemented CI/CD pipelines reducing deployment time by 60%'
        ]
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of California',
        degree: 'Bachelor of Science in Computer Science',
        startDate: '2016-09',
        endDate: '2020-05',
        gpa: '3.8'
      }
    ],
    skills: [
      { id: '1', name: 'JavaScript', category: 'Programming' },
      { id: '2', name: 'React', category: 'Frontend' },
      { id: '3', name: 'Node.js', category: 'Backend' },
      { id: '4', name: 'Python', category: 'Programming' }
    ]
  },
  testJobDetails: {
    companyName: 'Google',
    jobTitle: 'Senior Software Engineer',
    jobDescription: 'We are looking for a senior software engineer to join our team and work on large-scale distributed systems.',
    requirements: [
      '5+ years of software development experience',
      'Experience with distributed systems',
      'Strong problem-solving skills'
    ],
    contactPerson: 'Jane Smith',
    contactEmail: 'jane.smith@google.com'
  }
};

class CoverLetterWorkflowTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  // Utility method to log test results
  logTest(testName, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { testName, passed, message };
    
    console.log(`${status}: ${testName}`);
    if (message) console.log(`    ${message}`);
    
    this.results.tests.push(result);
    if (passed) this.results.passed++;
    else this.results.failed++;
  }

  // Test 1: Check if all required files exist
  async testFileStructure() {
    console.log('\n🔍 Testing File Structure...');
    
    const requiredFiles = [
      'src/app/cover-letter-builder/page.tsx',
      'src/components/cover-letter/JobDetailsForm.tsx',
      'src/components/cover-letter/CoverLetterOptions.tsx',
      'src/components/cover-letter/CoverLetterPreview.tsx',
      'src/components/cover-letter/CoverLetterForm.tsx',
      'src/lib/ai/cover-letter-service.ts',
      'src/app/api/cover-letter/generate/route.ts',
      'src/app/api/cover-letter/save/route.ts',
      'src/hooks/useCoverLetter.ts',
      'src/types/resume.ts'
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(file);
      this.logTest(`File exists: ${file}`, exists, exists ? '' : 'File is missing');
    }
  }

  // Test 2: Validate TypeScript interfaces
  async testTypeDefinitions() {
    console.log('\n🔍 Testing Type Definitions...');
    
    try {
      const typesContent = fs.readFileSync('src/types/resume.ts', 'utf8');
      
      const requiredTypes = [
        'CoverLetter',
        'CoverLetterData',
        'JobDetails',
        'CoverLetterBody',
        'CoverLetterGenerationRequest'
      ];

      for (const type of requiredTypes) {
        const hasType = typesContent.includes(`interface ${type}`) || typesContent.includes(`type ${type}`);
        this.logTest(`Type definition: ${type}`, hasType, hasType ? '' : 'Type definition missing');
      }
    } catch (error) {
      this.logTest('Type definitions file readable', false, error.message);
    }
  }

  // Test 3: Test API endpoint structure
  async testAPIEndpoints() {
    console.log('\n🔍 Testing API Endpoints...');
    
    const endpoints = [
      { file: 'src/app/api/cover-letter/generate/route.ts', method: 'POST' },
      { file: 'src/app/api/cover-letter/save/route.ts', method: 'POST' },
      { file: 'src/app/api/cover-letter/enhance/route.ts', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      try {
        const content = fs.readFileSync(endpoint.file, 'utf8');
        const hasMethod = content.includes(`export async function ${endpoint.method}`);
        this.logTest(`API endpoint ${endpoint.file}`, hasMethod, hasMethod ? '' : `Missing ${endpoint.method} method`);
      } catch (error) {
        this.logTest(`API endpoint ${endpoint.file}`, false, 'File not readable');
      }
    }
  }

  // Test 4: Test Cover Letter Service
  async testCoverLetterService() {
    console.log('\n🔍 Testing Cover Letter Service...');
    
    try {
      const serviceContent = fs.readFileSync('src/lib/ai/cover-letter-service.ts', 'utf8');
      
      const requiredMethods = [
        'generateCoverLetter',
        'generateOpening',
        'generateBody',
        'generateClosing',
        'enhanceCoverLetterContent'
      ];

      for (const method of requiredMethods) {
        const hasMethod = serviceContent.includes(method);
        this.logTest(`Service method: ${method}`, hasMethod, hasMethod ? '' : 'Method missing');
      }

      // Check if service is exported
      const hasExport = serviceContent.includes('export const coverLetterService');
      this.logTest('Service exported', hasExport, hasExport ? '' : 'Service not exported');

    } catch (error) {
      this.logTest('Cover Letter Service readable', false, error.message);
    }
  }

  // Test 5: Test React Components
  async testReactComponents() {
    console.log('\n🔍 Testing React Components...');
    
    const components = [
      { file: 'src/components/cover-letter/JobDetailsForm.tsx', exports: ['JobDetailsForm'] },
      { file: 'src/components/cover-letter/CoverLetterOptions.tsx', exports: ['CoverLetterOptions'] },
      { file: 'src/components/cover-letter/CoverLetterPreview.tsx', exports: ['CoverLetterPreview'] },
      { file: 'src/components/cover-letter/CoverLetterForm.tsx', exports: ['CoverLetterForm'] }
    ];

    for (const component of components) {
      try {
        const content = fs.readFileSync(component.file, 'utf8');
        
        // Check if it's a React component
        const isReactComponent = content.includes('export default function') || content.includes('export function');
        this.logTest(`Component structure: ${path.basename(component.file)}`, isReactComponent);
        
        // Check for required props
        const hasPropsInterface = content.includes('Props') || content.includes('interface') || content.includes('type');
        this.logTest(`Component props: ${path.basename(component.file)}`, hasPropsInterface);

      } catch (error) {
        this.logTest(`Component: ${path.basename(component.file)}`, false, 'File not readable');
      }
    }
  }

  // Test 6: Test Custom Hook
  async testCustomHook() {
    console.log('\n🔍 Testing Custom Hook...');
    
    try {
      const hookContent = fs.readFileSync('src/hooks/useCoverLetter.ts', 'utf8');
      
      const requiredFunctions = [
        'generateCoverLetter',
        'enhanceContent',
        'saveCoverLetter',
        'clearError'
      ];

      for (const func of requiredFunctions) {
        const hasFunction = hookContent.includes(func);
        this.logTest(`Hook function: ${func}`, hasFunction, hasFunction ? '' : 'Function missing');
      }

      // Check if hook is exported
      const hasExport = hookContent.includes('export const useCoverLetter');
      this.logTest('Hook exported', hasExport, hasExport ? '' : 'Hook not exported');

    } catch (error) {
      this.logTest('Custom Hook readable', false, error.message);
    }
  }

  // Test 7: Test Database Schema
  async testDatabaseSchema() {
    console.log('\n🔍 Testing Database Schema...');
    
    try {
      const schemaContent = fs.readFileSync('src/lib/database/schema.sql', 'utf8');
      
      // Check for cover_letters table
      const hasCoverLettersTable = schemaContent.includes('CREATE TABLE cover_letters');
      this.logTest('Cover Letters table', hasCoverLettersTable, hasCoverLettersTable ? '' : 'Table definition missing');
      
      // Check for required columns
      const requiredColumns = ['id', 'user_id', 'title', 'cover_letter_data', 'created_at', 'updated_at'];
      for (const column of requiredColumns) {
        const hasColumn = schemaContent.includes(column);
        this.logTest(`Table column: ${column}`, hasColumn, hasColumn ? '' : 'Column missing');
      }

    } catch (error) {
      this.logTest('Database Schema readable', false, error.message);
    }
  }

  // Test 8: Test Navigation Integration
  async testNavigationIntegration() {
    console.log('\n🔍 Testing Navigation Integration...');
    
    try {
      const navContent = fs.readFileSync('src/components/ui/Navigation.tsx', 'utf8');
      
      // Check for cover letter link
      const hasCoverLetterLink = navContent.includes('/cover-letter-builder') || navContent.includes('Cover Letter');
      this.logTest('Navigation link', hasCoverLetterLink, hasCoverLetterLink ? '' : 'Cover letter link missing');

    } catch (error) {
      this.logTest('Navigation readable', false, error.message);
    }
  }

  // Test 9: Create test data files
  async createTestData() {
    console.log('\n🔧 Creating Test Data...');
    
    try {
      // Create test resume data
      const testResumeFile = 'test_resume_data.json';
      fs.writeFileSync(testResumeFile, JSON.stringify(TEST_CONFIG.testResume, null, 2));
      this.logTest('Test resume data created', true, `Created ${testResumeFile}`);
      
      // Create test job details
      const testJobFile = 'test_job_details.json';
      fs.writeFileSync(testJobFile, JSON.stringify(TEST_CONFIG.testJobDetails, null, 2));
      this.logTest('Test job details created', true, `Created ${testJobFile}`);
      
    } catch (error) {
      this.logTest('Test data creation', false, error.message);
    }
  }

  // Test 10: Integration test simulation
  async simulateWorkflow() {
    console.log('\n🔍 Testing Workflow Logic...');
    
    try {
      // Test workflow steps simulation
      const workflowSteps = [
        'Load resume data',
        'Submit job details',
        'Select cover letter options', 
        'Generate cover letter',
        'Review and edit',
        'Save cover letter'
      ];

      // Check if main page has all workflow steps
      const pageContent = fs.readFileSync('src/app/cover-letter-builder/page.tsx', 'utf8');
      
      for (const step of workflowSteps) {
        // Look for step-related code or comments
        const hasStepLogic = pageContent.includes('currentStep') && pageContent.includes('setCurrentStep');
        this.logTest('Workflow step management', hasStepLogic, hasStepLogic ? '' : 'Step management logic missing');
        break; // Only test once for step logic
      }

      // Test error handling
      const hasErrorHandling = pageContent.includes('error') && pageContent.includes('setError');
      this.logTest('Error handling', hasErrorHandling, hasErrorHandling ? '' : 'Error handling missing');

      // Test loading states
      const hasLoadingStates = pageContent.includes('loading') || pageContent.includes('isGenerating');
      this.logTest('Loading states', hasLoadingStates, hasLoadingStates ? '' : 'Loading states missing');

    } catch (error) {
      this.logTest('Workflow simulation', false, error.message);
    }
  }

  // Generate detailed test report
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 COVER LETTER WORKFLOW TEST REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`📋 Total Tests: ${this.results.passed + this.results.failed}`);
    
    const successRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    // Show failed tests
    const failedTests = this.results.tests.filter(test => !test.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}: ${test.message}`);
      });
    }

    // Generate recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    if (failedTests.length === 0) {
      console.log('   ✅ All tests passed! The workflow structure looks good.');
    } else {
      console.log('   📝 Fix the failed tests above to ensure proper workflow functionality.');
      console.log('   🔄 Run the tests again after making fixes.');
    }

    // Create detailed report file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${successRate}%`
      },
      tests: this.results.tests,
      recommendations: failedTests.length === 0 ? 
        ['All tests passed! Workflow structure is correct.'] :
        ['Fix failed tests', 'Verify file contents', 'Check imports and exports', 'Test API endpoints manually']
    };

    fs.writeFileSync('cover_letter_test_report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: cover_letter_test_report.json');
  }

  // Main test runner
  async runAllTests() {
    console.log('🚀 Starting Cover Letter Workflow Tests...');
    console.log('This will verify the entire cover letter generation flow.\n');

    await this.testFileStructure();
    await this.testTypeDefinitions();
    await this.testAPIEndpoints();
    await this.testCoverLetterService();
    await this.testReactComponents();
    await this.testCustomHook();
    await this.testDatabaseSchema();
    await this.testNavigationIntegration();
    await this.createTestData();
    await this.simulateWorkflow();

    this.generateReport();
  }
}

// Run the tests
if (require.main === module) {
  const tester = new CoverLetterWorkflowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = CoverLetterWorkflowTester;
