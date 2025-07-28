// Simple script to run the demo data generator
require('dotenv').config({ path: '.env.local' });

async function run() {
  console.log('Loading demo data generator...');
  
  // Check if environment variables are loaded
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('❌ Firebase environment variables not found!');
    console.error('Make sure .env.local file exists with Firebase config');
    process.exit(1);
  }

  try {
    // Import and run the generator
    const { generateDemoData } = require('./generateDemoData.ts');
    const credentials = await generateDemoData();
    
    // Save credentials to file
    const fs = require('fs');
    fs.writeFileSync(
      'demo-credentials.json',
      JSON.stringify(credentials, null, 2)
    );
    
    console.log('\n✅ Demo credentials saved to demo-credentials.json');
    
  } catch (error) {
    console.error('Failed to generate demo data:', error);
    process.exit(1);
  }
}

run();