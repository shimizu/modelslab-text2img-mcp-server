// index.js
// ツール統合・エクスポート

import { helloToolSchema, hello } from './hello.js';
import { testConnectionToolSchema, testConnection } from './test_connection.js';
import { modelsLabText2ImgToolSchema, modelsLabText2Img } from './modelslab_text2img.js';

// すべてのツールスキーマをエクスポート
export const toolSchemas = [
  helloToolSchema,
  testConnectionToolSchema,
  modelsLabText2ImgToolSchema
];

// ツール実行関数のマッピング
export const toolHandlers = {
  'hello': hello,
  'test_connection': testConnection,
  'modelslab_text2img': modelsLabText2Img
};

// ツール実行のディスパッチャー
export async function executeTool(toolName, args) {
  const handler = toolHandlers[toolName];
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  return await handler(args);
}