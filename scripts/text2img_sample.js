import axios from 'axios';

const main = async () => {
  const options = {
    method: 'POST',
    url: 'https://modelslab.com/api/v6/realtime/text2img',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
        "key": 'hf6MmAamkVp4BVtZkU8YllB8VPNsQIj95XdJoptJVi9VjONk2OdUY3ov7meb',
        "model_id": "flux",
        "prompt": "actual 8K portrait photo of gareth person, portrait, happy colors, bright eyes, clear eyes, warm smile, smooth soft  skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting, detailed face, by makoto   shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
        "width": "512",
        "height": "512",
        "samples": "1",
        "num_inference_steps": "30",
        "safety_checker": true,
        "enhance_prompt": true,
        "seed": null,
        "guidance_scale": 7.5,
        "self_attention": false,
        "vae": null,
        "webhook": null,
        "track_id": null
    }
  };

  try {
    const response = await axios(options);
    console.log('Success:', response.data);
    
    // 画像URLがある場合は表示
    if (response.data && response.data.output) {
      console.log('Generated images:', response.data.output);
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

main();