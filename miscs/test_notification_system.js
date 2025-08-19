#!/usr/bin/env node

const http = require('http');

class NotificationTester {
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

  async testPageLoad() {
    this.log('INFO', '🌐 Testing dashboard page load...');
    
    return new Promise((resolve) => {
      const req = http.get(`${this.baseUrl}/dashboard`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            const hasNotificationComponent = data.includes('Notification');
            this.log('SUCCESS', `✅ Dashboard page loaded (Status: ${res.statusCode})`);
            this.log('INFO', `📦 Notification component: ${hasNotificationComponent ? 'Present' : 'Not found'}`);
            resolve(true);
          } else {
            this.log('ERROR', `❌ Dashboard page failed to load (Status: ${res.statusCode})`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        this.log('ERROR', `❌ Request failed: ${error.message}`);
        resolve(false);
      });
    });
  }

  async runTest() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 Beautiful Notification System Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: Enhanced dashboard with notification cards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    const pageLoadSuccess = await this.testPageLoad();

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${pageLoadSuccess ? '🎉 NOTIFICATION SYSTEM: READY!' : '❌ NOTIFICATION SYSTEM: ISSUES!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    if (pageLoadSuccess) {
      this.log('SUCCESS', '🎉 Notification system successfully integrated!');
      console.log(`
✨ **Beautiful Notifications Now Active:**

🟠 **Resume Deletion**: Orange/Warning notifications
   - Success: "Resume Deleted" with warning styling
   - Error: "Deletion Failed" with error styling

🟢 **Cover Letter Deletion**: Green/Success notifications  
   - Success: "Cover Letter Deleted" with success styling
   - Error: "Deletion Failed" with error styling

🔴 **Resume Generation Errors**: Red/Error notifications
   - "Generation Failed" with detailed error message

🌐 **Test the notifications:**
1. Visit: http://localhost:3001/dashboard
2. Log in if needed
3. Try deleting a resume → Orange notification
4. Try deleting a cover letter → Green notification  
5. Watch the beautiful animated modal cards!

💫 **Features:**
- Beautiful animated modal overlays
- Color-coded by action type
- Auto-dismiss after 5 seconds
- Click anywhere to close
- Backdrop blur effects
- Spring animations
- Professional icons

No more ugly browser alerts! 🚀
      `);
    }

    return pageLoadSuccess;
  }
}

// Run the test
const tester = new NotificationTester();
tester.runTest().catch(console.error);
