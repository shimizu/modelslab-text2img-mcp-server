import { modelsLabApiKeys } from '../../config/api-keys.js';

export const modelsLabConfig = {
  // ModelsLab API設定
  baseUrl: 'https://modelslab.com/api/v6',
  endpoints: {
    text2img: 'realtime/text2img',
    communityText2img: 'images/text2img'
  },
  
  // API認証情報
  apiKey: modelsLabApiKeys.apiKey,
  
  // HTTPクライアント設定
  timeout: 60000, // 60秒（画像生成時間を考慮）
  
  // デフォルトパラメータ
  defaults: {
    width: 512,
    height: 512,
    samples: 1,
    num_inference_steps: 30, // Flux推奨値
    guidance_scale: 7.5,
    safety_checker: false, // ブール値で管理（ModelsLabClient.jsで文字列に変換）
    enhance_prompt: true, // ブール値で管理（ModelsLabClient.jsで文字列に変換）
    self_attention: false, // ブール値で管理（ModelsLabClient.jsで文字列に変換）
    vae: null,
    model_id: 'flux' // デフォルトモデルをFluxに設定
  },
  
  // 制限値
  limits: {
    maxWidth: 1024,
    maxHeight: 1024,
    maxSamples: 4,
    minInferenceSteps: 1,
    maxInferenceSteps: 50,
    minGuidanceScale: 1,
    maxGuidanceScale: 20
  }
};