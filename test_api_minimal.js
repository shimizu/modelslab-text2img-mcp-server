#!/usr/bin/env node

// 最小限のパラメータでのテスト

import { modelsLabApiKeys } from './src/config/api-keys.js';

console.log('=== Minimal Parameter Test ===');

// サンプルコードと全く同じ構造でテスト
const testData = {
  "key": modelsLabApiKeys.apiKey,
  "model_id": "flux",
  "prompt": "actual 8K portrait photo of gareth person, portrait, happy colors, bright eyes, clear eyes, warm smile, smooth soft  skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting, detailed face, by makoto   shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
  "width": "512",
  "height": "512",
  "samples": "1",
  "num_inference_steps": "30",
  "safety_checker": "no",
  "enhance_prompt": "yes",
  "seed": null,
  "guidance_scale": 7.5,
  "self_attention": "no",
  "vae": null,
  "webhook": null,
  "track_id": null
};

console.log('Testing with exact sample code parameters...');

fetch('https://modelslab.com/api/v6/images/text2img', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('Response Status:', response.status);
    return response.text();
})
.then(responseText => {
    console.log('Response Body:', responseText);
    
    try {
        const responseJson = JSON.parse(responseText);
        console.log('Parsed Response:', JSON.stringify(responseJson, null, 2));
    } catch (e) {
        console.log('Response is not valid JSON');
    }
})
.catch(error => {
    console.error('Fetch Error:', error.message);
});