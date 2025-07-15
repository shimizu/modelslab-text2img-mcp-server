import { DataSourceClient } from '../../core/DataSourceClient.js';
import { modelsLabConfig } from './config.js';

export class ModelsLabClient extends DataSourceClient {
  constructor(config = {}) {
    super({
      timeout: modelsLabConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ModelsLab-MCP/1.0'
      },
      ...config
    });
    
    this.apiKey = config.apiKey || modelsLabConfig.apiKey;
    this.baseUrl = config.baseUrl || modelsLabConfig.baseUrl;
    
    if (!this.apiKey) {
      throw new Error('ModelsLab API key is required. Please set up src/config/api-keys.js');
    }
  }
  
  /**
   * API接続テスト
   */
  async testConnection() {
    try {
      // 簡単なプロンプトで接続テスト
      const testResponse = await this.generateImage({
        prompt: 'test image',
        width: '256',
        height: '256',
        samples: 1
      });
      
      return {
        status: 'connected',
        message: 'ModelsLab API connection successful',
        timestamp: new Date().toISOString(),
        testResult: testResponse ? 'Image generation working' : 'Response received'
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Text2Image画像生成
   * @param {Object} params - 生成パラメータ
   * @returns {Object} 生成結果
   */
  async generateImage(params = {}) {
    const requestData = this._buildImageRequest(params);
    
    // model_idが指定されている場合はコミュニティモデルエンドポイントを使用
    const endpoint = params.model_id ? 
      modelsLabConfig.endpoints.communityText2img : 
      modelsLabConfig.endpoints.text2img;
    
    const url = `${this.baseUrl}/${endpoint}`;
    
    // デバッグログ出力
    console.log('=== ModelsLab API Request Debug ===');
    console.log('URL:', url);
    console.log('Request Data:', JSON.stringify(requestData, null, 2));
    console.log('=====================================');
    
    try {
      const response = await this.httpRequest({
        method: 'POST',
        url,
        data: requestData
      });
      
      console.log('=== ModelsLab API Response Debug ===');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('=====================================');
      
      return this._processImageResponse(response, params);
    } catch (error) {
      console.error('=== ModelsLab API Error Debug ===');
      console.error('Error:', error.message);
      console.error('===================================');
      throw new Error(`ModelsLab API Error: ${error.message}`);
    }
  }
  
  /**
   * リクエストパラメータを構築
   * @private
   */
  _buildImageRequest(params) {
    const {
      prompt,
      negative_prompt = '',
      width = modelsLabConfig.defaults.width,
      height = modelsLabConfig.defaults.height,
      samples = modelsLabConfig.defaults.samples,
      num_inference_steps = modelsLabConfig.defaults.num_inference_steps,
      guidance_scale = modelsLabConfig.defaults.guidance_scale,
      seed = null,
      safety_checker = modelsLabConfig.defaults.safety_checker,
      enhance_prompt = modelsLabConfig.defaults.enhance_prompt,
      webhook = null,
      track_id = null,
      model_id = null,
      self_attention = modelsLabConfig.defaults.self_attention,
      vae = null
    } = params;
    
    // パラメータ検証
    this._validateImageParams(params);
    
    const requestBody = {
      key: this.apiKey,
      prompt: prompt || 'a beautiful landscape',
      width: String(width),
      height: String(height),
      samples: String(samples), // APIは文字列を期待
      num_inference_steps: String(num_inference_steps), // APIは文字列を期待
      safety_checker: safety_checker ? "yes" : "no", // APIは"yes"/"no"を期待
      enhance_prompt: enhance_prompt ? "yes" : "no", // APIは"yes"/"no"を期待
      seed,
      guidance_scale: Number(guidance_scale),
      self_attention: self_attention ? "yes" : "no", // APIは"yes"/"no"を期待
      vae,
      webhook,
      track_id
    };
    
    // オプションパラメータを追加（nullや空文字列でない場合のみ）
    if (negative_prompt) {
      requestBody.negative_prompt = negative_prompt;
    }
    
    // model_idが指定されている場合は追加
    if (model_id) {
      requestBody.model_id = model_id;
    }
    
    return requestBody;
  }
  
  /**
   * パラメータ検証
   * @private
   */
  _validateImageParams(params) {
    const { limits } = modelsLabConfig;
    
    if (params.width && (params.width < 1 || params.width > limits.maxWidth)) {
      throw new Error(`Width must be between 1 and ${limits.maxWidth}`);
    }
    
    if (params.height && (params.height < 1 || params.height > limits.maxHeight)) {
      throw new Error(`Height must be between 1 and ${limits.maxHeight}`);
    }
    
    if (params.samples && (params.samples < 1 || params.samples > limits.maxSamples)) {
      throw new Error(`Samples must be between 1 and ${limits.maxSamples}`);
    }
    
    if (params.num_inference_steps && 
        (params.num_inference_steps < limits.minInferenceSteps || 
         params.num_inference_steps > limits.maxInferenceSteps)) {
      throw new Error(`Inference steps must be between ${limits.minInferenceSteps} and ${limits.maxInferenceSteps}`);
    }
    
    if (params.guidance_scale && 
        (params.guidance_scale < limits.minGuidanceScale || 
         params.guidance_scale > limits.maxGuidanceScale)) {
      throw new Error(`Guidance scale must be between ${limits.minGuidanceScale} and ${limits.maxGuidanceScale}`);
    }
  }
  
  /**
   * API応答を処理
   * @private
   */
  _processImageResponse(response, originalParams) {
    if (!response) {
      throw new Error('Empty response from ModelsLab API');
    }
    
    // エラーレスポンスの処理
    if (response.status === 'error') {
      throw new Error(response.message || response.messege || 'API returned error status');
    }
    
    // 成功レスポンスの処理
    if (response.status === 'success') {
      const imageUrls = response.output || [];
      const proxyUrls = response.proxy_links || [];
      
      if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        throw new Error('No images generated by the API');
      }
      
      return {
        success: true,
        generationTime: response.generationTime,
        imageUrls: imageUrls,
        proxyUrls: proxyUrls,
        metadata: {
          id: response.id,
          prompt: originalParams.prompt,
          negative_prompt: originalParams.negative_prompt,
          width: Number(originalParams.width || modelsLabConfig.defaults.width),
          height: Number(originalParams.height || modelsLabConfig.defaults.height),
          samples: Number(originalParams.samples || modelsLabConfig.defaults.samples),
          seed: response.meta?.seed,
          guidance_scale: response.meta?.guidance_scale,
          steps: response.meta?.steps || response.meta?.num_inference_steps,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw new Error('Unexpected response format from ModelsLab API');
  }
  
  /**
   * クエリの実行（DataSourceClient基底クラスの実装）
   */
  async query(params, options = {}) {
    return await this.generateImage(params);
  }
}