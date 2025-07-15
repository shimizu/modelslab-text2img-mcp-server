import { modelsLabText2Img } from './src/tools/modelslab_text2img.js';

async function testRebrandedServer() {
  console.log('Testing rebranded ModelsLab Text2Image MCP Server...');
  
  try {
    // Test 1: Default Flux model
    console.log('\n=== Test 1: Default Flux Model ===');
    const result1 = await modelsLabText2Img({
      prompt: 'beautiful mountain landscape at sunset',
      width: 512,
      height: 512,
      samples: 1,
      outputPath: './test_images/rebranded_test_1.jpg',
      format: 'jpg'
    });
    
    console.log('Result 1:', JSON.stringify(result1, null, 2));
    
    // Test 2: Specific model selection
    console.log('\n=== Test 2: Specific Model Selection ===');
    const result2 = await modelsLabText2Img({
      prompt: 'anime character portrait, colorful, detailed',
      model_id: 'midjourney',
      width: 512,
      height: 512,
      samples: 1,
      outputPath: './test_images/rebranded_test_2.jpg',
      format: 'jpg'
    });
    
    console.log('Result 2:', JSON.stringify(result2, null, 2));
    
    // Test 3: No file output (just URLs)
    console.log('\n=== Test 3: No File Output (URLs Only) ===');
    const result3 = await modelsLabText2Img({
      prompt: 'abstract digital art, vibrant colors',
      width: 512,
      height: 512,
      samples: 1
    });
    
    console.log('Result 3:', JSON.stringify(result3, null, 2));
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRebrandedServer();