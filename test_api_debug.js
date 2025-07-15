#!/usr/bin/env node

// ModelsLab API デバッグ用テストスクリプト

import { ModelsLabClient } from './src/adapters/modelslab/ModelsLabClient.js';

async function testAPI() {
    console.log('=== ModelsLab API Debug Test ===');
    
    try {
        const client = new ModelsLabClient();
        
        // 最小限のパラメータでテスト
        const minimalParams = {
            prompt: 'test image',
            model_id: 'flux',
            width: 512,
            height: 512,
            samples: 1,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            safety_checker: false,
            enhance_prompt: true,
            self_attention: false
        };
        
        console.log('Testing with minimal parameters...');
        const result = await client.generateImage(minimalParams);
        
        console.log('=== TEST RESULT ===');
        console.log('Success:', result.success);
        if (result.success) {
            console.log('Image URLs:', result.imageUrls);
        }
        
    } catch (error) {
        console.error('=== TEST ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAPI();