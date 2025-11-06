// api-keys.example.js
// APIキー設定テンプレート

/**
 * APIキー設定手順
 * 1. このファイルをapi-keys.jsとしてコピー: cp api-keys.example.js api-keys.js
 * 2. api-keys.jsを編集して実際のAPIキーを設定
 * 3. api-keys.jsはGitにコミットされません（.gitignoreで除外）
 * 
 * セキュリティ注意事項：
 * - api-keys.jsには実際のAPIキーが含まれるため、絶対にGitHubにコミットしないでください
 * - APIキーは秘密情報として厳重に管理してください
 * - 本番環境では環境変数の使用を推奨します
 */



// ModelsLab API設定
export const modelsLabApiKeys = {
  // ModelsLab API Key
  // 取得方法: https://modelslab.com/
  apiKey: 'your_modelslab_api_key_here'
};

// 環境変数からAPIキーを取得する場合の例
// export const modelsLabApiKeys = {
//   apiKey: process.env.MODELSLAB_API_KEY || 'your_modelslab_api_key_here'
// };