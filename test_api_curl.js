#!/usr/bin/env node

// cURL相当のテストを実行

import { modelsLabApiKeys } from './src/config/api-keys.js';

console.log('=== cURL Test with Node.js ===');

const testData = {
  "key": modelsLabApiKeys.apiKey,
  "model_id": "flux",
  "prompt": "test image",
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

console.log('Request Data:', JSON.stringify(testData, null, 2));

fetch('https://modelslab.com/api/v6/images/text2img', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ModelsLab-MCP/1.0'
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('Response Status:', response.status);
    console.log('Response Headers:', [...response.headers.entries()]);
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
    console.error('Error Code:', error.code);
    console.error('Error Type:', error.name);
});