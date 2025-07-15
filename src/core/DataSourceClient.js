// DataSourceClient.js
// データソースクライアントの基底クラス

import axios from 'axios';

export class DataSourceClient {
  constructor(config = {}) {
    this.config = config;
    
    // HTTPクライアントの初期化
    this.httpClient = axios.create({
      timeout: config.timeout || 30000,
      headers: config.headers || {}
    });
  }
  
  /**
   * データソースへの接続をテスト（サブクラスで実装必須）
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by subclass');
  }
  
  /**
   * クエリの実行（サブクラスで実装必須）
   */
  async query(params, options = {}) {
    throw new Error('query() must be implemented by subclass');
  }
  
  /**
   * HTTPリクエストの実行（共通処理）
   */
  async httpRequest(options) {
    try {
      const response = await this.httpClient.request(options);
      return response.data;
    } catch (error) {
      // HTTPエラーの詳細情報を抽出
      if (error.response) {
        // サーバーからエラーレスポンスを受信
        const errorData = error.response.data;
        const status = error.response.status;
        const statusText = error.response.statusText;
        
        // エラーメッセージの抽出
        let message = `HTTP ${status} ${statusText}`;
        if (errorData) {
          if (typeof errorData === 'string') {
            message += `: ${errorData}`;
          } else if (errorData.message) {
            message += `: ${errorData.message}`;
          } else if (errorData.error) {
            message += `: ${errorData.error}`;
          }
        }
        
        throw new Error(message);
      } else if (error.request) {
        // リクエストが送信されたが、レスポンスを受信できない（ネットワークエラー）
        throw new Error(`Network error: ${error.message}`);
      } else {
        // その他のエラー
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
}