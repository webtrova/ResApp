const fs = require('fs');

// Test section detection logic
function testSectionDetection() {
  try {
    // Read the test resume
    const resumeText = fs.readFileSync('test_resume.txt', 'utf8');
    console.log('✅ Test resume loaded successfully');
    
    const lines = resumeText.split('\n').map(line => line.trim()).filter(Boolean);
    console.log('✅ Resume has', lines.length, 'non-empty lines');
    
    // Test section header detection
    const headerPatterns = {
      personal: /^(name|contact|personal|information|details)$/i,
      summary: /^(summary|objective|profile|overview|career\s+objective)$/i,
      experience: /^(experience|work\s+experience|work\s+history|employment|professional\s+experience|career\s+history)$/i,
      education: /^(education|academic|qualifications|degrees)$/i,
      skills: /^(skills|technical\s+skills|competencies|expertise|proficiencies)$/i,
      certifications: /^(certifications|certificates|licenses|credentials)$/i,
      projects: /^(projects|portfolio|achievements|accomplishments)$/i
    };
    
    console.log('\n🔍 Testing section detection:');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const [sectionType, pattern] of Object.entries(headerPatterns)) {
        if (pattern.test(line)) {
          console.log(`✅ Found ${sectionType} section at line ${i + 1}: "${line}"`);
        }
      }
    }
    
    // Test experience section specifically
    console.log('\n🔍 Testing experience section detection:');
    let experienceFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(professional\s+)?experience|work\s+experience|work\s+history|employment|career/i.test(line)) {
        console.log(`✅ Experience section found at line ${i + 1}: "${line}"`);
        experienceFound = true;
        
        // Show next few lines
        console.log('Next few lines:');
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          console.log(`  ${j + 1}: "${lines[j]}"`);
        }
        break;
      }
    }
    
    if (!experienceFound) {
      console.log('❌ No experience section found');
    }
    
    console.log('\n🎉 Section detection test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSectionDetection();
