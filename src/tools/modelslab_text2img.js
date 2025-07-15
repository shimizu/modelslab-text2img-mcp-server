import { ToolBase } from '../core/ToolBase.js';
import { ModelsLabClient } from '../adapters/modelslab/ModelsLabClient.js';
import { ModelsLabImageHandler } from '../utils/modelslab-image-handler.js';

class ModelsLabText2ImgTool extends ToolBase {
  constructor() {
    super();
    this.name = 'modelslab_text2img';
    this.client = new ModelsLabClient();
  }

  getSchema() {
    return {
      name: 'modelslab_text2img',
      description: 'ModelsLab APIを使用してテキストプロンプトから画像を生成し、オプションでファイルに保存します',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: '画像生成のためのテキストプロンプト（必須）',
            minLength: 1
          },
          negative_prompt: {
            type: 'string',
            description: '除外したい要素を指定するネガティブプロンプト',
            default: ''
          },
          width: {
            type: 'number',
            description: '生成画像の幅（ピクセル）',
            minimum: 128,
            maximum: 1024,
            default: 512
          },
          height: {
            type: 'number',
            description: '生成画像の高さ（ピクセル）',
            minimum: 128,
            maximum: 1024,
            default: 512
          },
          samples: {
            type: 'number',
            description: '生成する画像の枚数',
            minimum: 1,
            maximum: 4,
            default: 1
          },
          num_inference_steps: {
            type: 'number',
            description: '推論ステップ数（品質とのトレードオフ）',
            minimum: 1,
            maximum: 50,
            default: 20
          },
          guidance_scale: {
            type: 'number',
            description: 'ガイダンススケール（プロンプトへの従順度）',
            minimum: 1,
            maximum: 20,
            default: 7.5
          },
          seed: {
            type: 'number',
            description: '再現性のためのシード値（nullでランダム）',
            default: null
          },
          safety_checker: {
            type: 'boolean',
            description: 'NSFW画像チェッカーを有効にするか',
            default: false
          },
          enhance_prompt: {
            type: 'boolean',
            description: 'プロンプトの自動拡張を有効にするか',
            default: true
          },
          outputPath: {
            type: 'string',
            description: '画像保存先パス（例: ./images/my_image.jpg）。指定しない場合は保存せずURLのみ返します'
          },
          format: {
            type: 'string',
            enum: ['original', 'jpg', 'png', 'webp'],
            description: '画像保存形式（outputPath指定時のみ有効）',
            default: 'original'
          },
          namePrefix: {
            type: 'string',
            description: '複数画像生成時のファイル名プレフィックス',
            default: 'generated_image'
          },
          model_id: {
            type: 'string',
            description: '使用するモデルID（例: "flux", "midjourney"など）',
            default: 'flux'
          },
          self_attention: {
            type: 'boolean',
            description: '高品質な画像生成のためのセルフアテンション機能',
            default: false
          },
          vae: {
            type: 'string',
            description: 'VAE (Variational Autoencoder) の設定',
            default: null
          }
        },
        required: ['prompt']
      }
    };
  }

  async execute(args) {
    try {
      const {
        prompt,
        negative_prompt = '',
        width = 512,
        height = 512,
        samples = 1,
        num_inference_steps = 20,
        guidance_scale = 7.5,
        seed = null,
        safety_checker = false,
        enhance_prompt = true,
        outputPath,
        format = 'original',
        namePrefix = 'generated_image',
        model_id = 'flux',
        self_attention = false,
        vae = null
      } = args;

      // 入力検証
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('prompt is required and cannot be empty');
      }

      if (outputPath && !ModelsLabImageHandler.validateImageFilePath(outputPath)) {
        throw new Error('Invalid file path. Only image file extensions (.jpg, .png, .gif, .webp, .bmp, .tiff) are allowed.');
      }

      // 画像生成
      const generationParams = {
        prompt: prompt.trim(),
        negative_prompt,
        width,
        height,
        samples,
        num_inference_steps,
        guidance_scale,
        seed,
        safety_checker,
        enhance_prompt,
        model_id,
        self_attention,
        vae
      };

      const generationResult = await this.client.generateImage(generationParams);

      if (!generationResult.success) {
        throw new Error('Image generation failed');
      }

      const imageUrls = generationResult.imageUrls;
      const metadata = {
        generationTime: generationResult.generationTime,
        generationParams: generationParams,
        apiMetadata: generationResult.metadata
      };

      // 画像ダウンロード・保存処理
      return await ModelsLabImageHandler.handleImageDownloadWithOptionalFile({
        imageUrls,
        outputPath,
        format,
        metadata,
        toolName: this.name,
        namePrefix
      });

    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false
      }, {
        requestParams: args
      });
    }
  }

  /**
   * プロンプトの品質向上のための提案を生成
   * @param {string} prompt - 元のプロンプト
   * @returns {string} 改善されたプロンプト
   */
  _enhancePrompt(prompt) {
    // 基本的なプロンプト強化の例
    // 実際の実装では、より高度なプロンプトエンジニアリングを適用可能
    const qualityTerms = [
      'high quality',
      'detailed',
      'sharp focus',
      'professional'
    ];

    const hasQualityTerms = qualityTerms.some(term => 
      prompt.toLowerCase().includes(term)
    );

    if (!hasQualityTerms && prompt.length < 100) {
      return `${prompt}, high quality, detailed, sharp focus`;
    }

    return prompt;
  }

  /**
   * 一般的なネガティブプロンプトを生成
   * @returns {string} ネガティブプロンプト
   */
  _getDefaultNegativePrompt() {
    return 'blurry, low quality, distorted, deformed, bad anatomy, bad proportions, extra limbs, cloned face, malformed, gross proportions, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck';
  }
}

const modelsLabText2ImgTool = new ModelsLabText2ImgTool();
export const modelsLabText2ImgToolSchema = modelsLabText2ImgTool.getSchema();
export const modelsLabText2Img = async (args) => await modelsLabText2ImgTool.execute(args);