import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

/**
 * ModelsLab生成画像をダウンロード・保存するユーティリティ
 */
export class ModelsLabImageHandler {
  
  /**
   * 画像URLから画像をダウンロードしてファイルに保存
   * @param {string} imageUrl - 画像URL
   * @param {string} outputPath - 出力ファイルパス
   * @param {Object} options - オプション設定
   * @returns {Object} 保存結果
   */
  static async downloadAndSaveImage(imageUrl, outputPath, options = {}) {
    try {
      const { timeout = 30000, format = 'original' } = options;
      
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      // 画像をダウンロード
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        timeout: timeout,
        headers: {
          'User-Agent': 'ModelsLab-MCP/1.0',
          'Accept': 'image/*'
        }
      });
      
      if (!response.data) {
        throw new Error('Empty response data');
      }
      
      // ファイル形式の検証と変換
      const finalPath = await this._processAndSaveImage(
        response.data, 
        outputPath, 
        format,
        response.headers['content-type']
      );
      
      const stats = await fs.stat(finalPath);
      
      return {
        success: true,
        path: finalPath,
        size: this.formatFileSize(stats.size),
        bytes: stats.size,
        contentType: response.headers['content-type'] || 'image/jpeg',
        originalUrl: imageUrl,
        downloadTime: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }
  
  /**
   * 複数の画像を一括ダウンロード
   * @param {Array} imageUrls - 画像URLの配列
   * @param {string} basePath - ベースパス
   * @param {Object} options - オプション設定
   * @returns {Object} ダウンロード結果
   */
  static async downloadMultipleImages(imageUrls, basePath, options = {}) {
    const { 
      namePrefix = 'image', 
      format = 'original',
      concurrent = 3 
    } = options;
    
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('imageUrls must be a non-empty array');
    }
    
    const results = [];
    const errors = [];
    
    // 並行ダウンロード数を制限
    for (let i = 0; i < imageUrls.length; i += concurrent) {
      const batch = imageUrls.slice(i, i + concurrent);
      const promises = batch.map(async (url, batchIndex) => {
        const index = i + batchIndex;
        const extension = this._getExtensionFromFormat(format) || '.jpg';
        const fileName = `${namePrefix}_${index + 1}${extension}`;
        const outputPath = path.join(basePath, fileName);
        
        try {
          const result = await this.downloadAndSaveImage(url, outputPath, { format });
          return { index, ...result };
        } catch (error) {
          const errorInfo = { index, url, error: error.message };
          errors.push(errorInfo);
          return null;
        }
      });
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter(r => r !== null));
    }
    
    return {
      success: results.length > 0,
      downloaded: results.length,
      failed: errors.length,
      total: imageUrls.length,
      results: results,
      errors: errors
    };
  }
  
  /**
   * 画像データを処理して保存
   * @private
   */
  static async _processAndSaveImage(imageData, outputPath, format, contentType) {
    // 元の拡張子を取得
    const originalExt = this._getExtensionFromContentType(contentType);
    const requestedExt = path.extname(outputPath).toLowerCase();
    
    let finalPath = outputPath;
    let dataToSave = imageData;
    
    // フォーマット変換の処理
    if (format === 'original') {
      // 元の形式を保持、拡張子が指定されていない場合は推定して追加
      if (!requestedExt && originalExt) {
        finalPath = outputPath + originalExt;
      }
    } else {
      // 指定されたフォーマットに変換（実際の変換は簡略化、必要に応じて画像処理ライブラリを使用）
      const targetExt = this._getExtensionFromFormat(format);
      if (targetExt) {
        finalPath = outputPath.replace(/\.[^.]*$/, '') + targetExt;
      }
      // 注意: 実際の画像形式変換はここでは実装せず、元データをそのまま保存
      // 必要に応じてSharp等の画像処理ライブラリを使用
    }
    
    // ファイルパス検証
    if (!this.validateImageFilePath(finalPath)) {
      throw new Error('Invalid image file path');
    }
    
    // ファイルに保存
    await fs.writeFile(finalPath, dataToSave);
    
    return finalPath;
  }
  
  /**
   * Content-Typeから拡張子を推定
   * @private
   */
  static _getExtensionFromContentType(contentType) {
    if (!contentType) return '.jpg';
    
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    };
    
    return mimeToExt[contentType.toLowerCase()] || '.jpg';
  }
  
  /**
   * フォーマット指定から拡張子を取得
   * @private
   */
  static _getExtensionFromFormat(format) {
    const formatToExt = {
      'jpg': '.jpg',
      'jpeg': '.jpg',
      'png': '.png',
      'gif': '.gif',
      'webp': '.webp',
      'bmp': '.bmp',
      'tiff': '.tiff',
      'original': null
    };
    
    return formatToExt[format.toLowerCase()];
  }
  
  /**
   * 画像ファイルパスの妥当性をチェック
   * @param {string} filePath - ファイルパス
   * @returns {boolean} 妥当性
   */
  static validateImageFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    
    // 危険なパスをチェック
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return false;
    }
    
    // 拡張子チェック
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    
    return allowedExtensions.includes(ext);
  }
  
  /**
   * ファイルサイズを人間が読みやすい形式に変換
   * @param {number} bytes - バイト数
   * @returns {string} フォーマットされたサイズ
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * 統合的な画像処理（MCP応答付き）
   * @param {Object} params - パラメータ
   * @returns {Object} MCP形式のレスポンス
   */
  static async handleImageDownloadWithOptionalFile(params) {
    const {
      imageUrls,
      outputPath,
      format = 'original',
      metadata = {},
      toolName,
      namePrefix = 'generated_image'
    } = params;
    
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('imageUrls must be a non-empty array');
    }
    
    // ファイル出力が指定されている場合
    if (outputPath) {
      let result;
      
      if (imageUrls.length === 1) {
        // 単一画像の場合
        result = await this.downloadAndSaveImage(imageUrls[0], outputPath, { format });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: '画像をファイルに保存しました',
              file: result.path,
              size: result.size,
              contentType: result.contentType,
              format: format,
              ...metadata
            }, null, 2)
          }]
        };
      } else {
        // 複数画像の場合
        const basePath = path.dirname(outputPath);
        result = await this.downloadMultipleImages(imageUrls, basePath, { 
          namePrefix, 
          format 
        });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: `${result.downloaded}枚の画像をファイルに保存しました`,
              downloaded: result.downloaded,
              failed: result.failed,
              total: result.total,
              files: result.results.map(r => ({ path: r.path, size: r.size })),
              errors: result.errors,
              format: format,
              ...metadata
            }, null, 2)
          }]
        };
      }
    }
    
    // ファイル出力が指定されていない場合は通常のMCP応答
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          imageUrls: imageUrls,
          metadata: {
            tool: toolName,
            timestamp: new Date().toISOString(),
            imageCount: imageUrls.length,
            ...metadata
          }
        }, null, 2)
      }]
    };
  }
}