#!/usr/bin/env node

const http = require('http');

async function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3001');
    const options = {
      hostname: url.hostname,
      port: 3001,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DebugTester/1.0',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
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

async function test() {
  console.log('🔍 Debugging Cover Letter Deletion');
  
  // Step 1: Login
  console.log('\n1. Logging in...');
  const loginResponse = await makeRequest('/api/auth/login', 'POST', {
    email: 'test.e2e@resapp.com',
    password: 'TestPassword123!'
  });
  
  if (loginResponse.statusCode !== 200) {
    console.log('❌ Login failed');
    return;
  }
  
  const { token, user } = loginResponse.data;
  console.log(`✅ Login successful (UserID: ${user.id})`);

  // Step 2: Get cover letters
  console.log('\n2. Getting cover letters...');
  const loadResponse = await makeRequest(`/api/cover-letter/load?userId=${user.id}`, 'GET', null, token);
  
  console.log(`Status: ${loadResponse.statusCode}`);
  console.log(`Raw response: ${loadResponse.rawData}`);
  
  if (loadResponse.statusCode !== 200 || !loadResponse.data.coverLetters || loadResponse.data.coverLetters.length === 0) {
    console.log('❌ No cover letters found to delete');
    return;
  }
  
  const testCoverLetter = loadResponse.data.coverLetters[0];
  console.log(`✅ Found cover letter to test: ID ${testCoverLetter.id}, Title: "${testCoverLetter.title}"`);

  // Step 3: Delete cover letter
  console.log('\n3. Deleting cover letter...');
  const deleteResponse = await makeRequest('/api/cover-letter/delete', 'DELETE', {
    coverLetterId: testCoverLetter.id
  }, token);
  
  console.log(`Status: ${deleteResponse.statusCode}`);
  console.log(`Headers: ${JSON.stringify(deleteResponse.headers)}`);
  console.log(`Raw response: "${deleteResponse.rawData}"`);
  console.log(`Parsed data: ${JSON.stringify(deleteResponse.data)}`);
  
  if (deleteResponse.statusCode === 200) {
    console.log('✅ Deletion successful');
    
    // Step 4: Verify deletion
    console.log('\n4. Verifying deletion...');
    const verifyResponse = await makeRequest(`/api/cover-letter/load?userId=${user.id}`, 'GET', null, token);
    
    const remainingCount = verifyResponse.data.coverLetters ? verifyResponse.data.coverLetters.length : 0;
    console.log(`Remaining cover letters: ${remainingCount}`);
    
    if (remainingCount < loadResponse.data.coverLetters.length) {
      console.log('✅ Cover letter successfully deleted');
    } else {
      console.log('❌ Cover letter not actually deleted');
    }
  } else {
    console.log('❌ Deletion failed');
  }
}

test().catch(console.error);
