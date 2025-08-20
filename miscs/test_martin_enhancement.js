const fs = require('fs');

// Sample resume text for testing enhancement - more realistic customer service experience
const sampleResumeText = `
Managed customer service operations for retail store
Led team of 5 employees in daily operations
Improved sales by 20% through better customer engagement
Handled customer complaints and resolved issues
Created weekly reports on team performance
`;

console.log('🧪 TESTING ENHANCEMENT API WITH MARTIN RESUME TEXT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testEnhancement() {
  try {
    console.log('📝 Original text:');
    console.log(sampleResumeText);
    console.log('\n🔧 Testing enhancement...\n');

    const response = await fetch('http://localhost:3000/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sampleResumeText,
        industry: 'customer-service',
        level: 'mid-level',
        type: 'enhancement'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Enhancement successful!');
    console.log('\n📊 Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result.enhanced) {
      console.log('🚀 Enhanced text:');
      console.log(result.enhanced);
    }
    
    if (result.improvements && result.improvements.length > 0) {
      console.log('\n💡 Improvements made:');
      result.improvements.forEach((improvement, index) => {
        console.log(`${index + 1}. ${improvement}`);
      });
    }
    
    if (result.suggestions && result.suggestions.actionVerbs && result.suggestions.actionVerbs.length > 0) {
      console.log('\n💭 Suggested action verbs:');
      result.suggestions.actionVerbs.forEach((verb, index) => {
        console.log(`${index + 1}. ${verb}`);
      });
    }
    
    if (result.suggestions && result.suggestions.skills && result.suggestions.skills.length > 0) {
      console.log('\n🔧 Suggested skills:');
      result.suggestions.skills.forEach((skill, index) => {
        console.log(`${index + 1}. ${skill}`);
      });
    }
    
    if (result.suggestions && result.suggestions.achievements && result.suggestions.achievements.length > 0) {
      console.log('\n📈 Suggested achievements:');
      result.suggestions.achievements.forEach((achievement, index) => {
        console.log(`${index + 1}. ${achievement}`);
      });
    }

    // Test individual bullet point enhancement
    console.log('\n🔍 Testing individual bullet point enhancement...');
    const individualResponse = await fetch('http://localhost:3000/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Handled customer complaints',
        industry: 'customer-service',
        level: 'mid-level',
        type: 'enhancement'
      })
    });

    if (individualResponse.ok) {
      const individualResult = await individualResponse.json();
      console.log('✅ Individual enhancement successful!');
      console.log('\n📝 Original: "Handled customer complaints"');
      console.log(`🚀 Enhanced: "${individualResult.enhanced}"`);
      if (individualResult.improvements && individualResult.improvements.length > 0) {
        console.log('💡 Improvements:', individualResult.improvements.join(', '));
      }
    }

    // Test keyword search
    console.log('\n🔍 Testing keyword search...');
    const searchResponse = await fetch('http://localhost:3000/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'customer service',
        industry: 'customer-service',
        type: 'search'
      })
    });

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      console.log('✅ Keyword search successful!');
      console.log('\n🔑 Keywords found:');
      if (searchResult.results && searchResult.results.length > 0) {
        searchResult.results.forEach((keyword, index) => {
          console.log(`${index + 1}. ${keyword}`);
        });
      }
    }

    // Test quantification
    console.log('\n📊 Testing quantification...');
    const quantifyResponse = await fetch('http://localhost:3000/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'improved sales',
        industry: 'customer-service',
        type: 'quantify'
      })
    });

    if (quantifyResponse.ok) {
      const quantifyResult = await quantifyResponse.json();
      console.log('✅ Quantification successful!');
      console.log('\n📈 Quantification suggestions:');
      if (quantifyResult.suggestions && quantifyResult.suggestions.length > 0) {
        quantifyResult.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error testing enhancement:', error.message);
  }
}

// Run the test
testEnhancement();
