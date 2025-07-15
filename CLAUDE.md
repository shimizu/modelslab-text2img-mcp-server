# CLAUDE.md

このファイルは、ModelsLab Text2Image MCP ServerでClaude Code (claude.ai/code)が作業を行う際のガイダンスを提供します。

## プロジェクト概要

ModelsLab APIを使用してText2Image画像生成を行うMCP (Model Context Protocol)サーバーです。**Claude Codeに最適化された設計**により、AIエージェントが効率的に高品質な画像生成を行えるよう工夫されています。

### サーバーの特徴
- **Fluxモデル標準**: デフォルトで最新のFluxモデルを使用
- **高品質画像生成**: ModelsLab APIによる業界最高水準の画像品質
- **セキュアな設計**: APIキーの安全な管理機能内蔵
- **実行権限設定済み**: `src/index.js`に実行権限が付与済み

## クイックスタート

### 1. APIキー設定
```bash
# APIキー設定ファイルを作成
cp src/config/api-keys.example.js src/config/api-keys.js

# 作成したファイルを編集して実際のAPIキーを設定
# ModelsLab API Key: https://modelslab.com/ から取得
```

⚠️ **重要**: `src/config/api-keys.js`は実際のAPIキーを含むため、絶対にGitにコミットしないでください。

### 2. 基本動作確認
```bash
# 依存関係をインストール
npm install

# MCPサーバーを起動
npm start

# MCP Inspectorで開発・テスト
npm run dev
```

### 3. Claude CodeでMCP登録
```bash
# プロジェクトディレクトリで実行
claude mcp add modelslab-text2img node src/index.js

# または絶対パスで登録
claude mcp add modelslab-text2img node /path/to/modelslab-text2img-mcp-server/src/index.js
```

**接続確認**: `/mcp`コマンドでMCPサーバーの接続状態を確認してください。

## 含まれるツール

### 🎨 modelslab_text2img
ModelsLab APIを使用した高品質画像生成ツール

**主な機能:**
- デフォルトでFluxモデルを使用
- 複数モデル対応（Flux, Stable Diffusion, Midjourney等）
- ローカルファイル保存機能
- 豊富なパラメータ調整オプション

**基本的な使用方法:**
```javascript
modelslab_text2img({
  prompt: "beautiful landscape at sunset",
  width: 1024,
  height: 512,
  outputPath: "./my_image.jpg"
})
```

### 🔧 その他のツール
- **hello**: Hello Worldレスポンス（MCP動作確認用）
- **test_connection**: HTTP接続テスト

## Claude Code使用ガイドライン

### 画像生成の基本パターン

#### 1. シンプルな画像生成
```
美しい夕焼けの山景色の画像を生成してください
```

#### 2. 特定のモデルを指定
```
midjourney モデルを使用して、アニメスタイルのキャラクターポートレートを生成してください
```

#### 3. 詳細パラメータ指定
```
以下の設定で画像を生成してください：
- プロンプト: "cyberpunk city at night, neon lights, rain"
- サイズ: 1024x768
- 品質: 高品質
- ネガティブプロンプト: "blurry, low quality"
- 保存先: "./cyberpunk_city.jpg"
```

#### 4. 複数画像生成
```
「未来都市」をテーマに、2枚の画像を生成して保存してください
```

### 効率的な開発のコツ

#### 画像生成時の注意点
1. **プロンプトの明確化**: 具体的で詳細な説明を心がける
2. **適切なサイズ設定**: 最大1024x768または768x1024を推奨
3. **ネガティブプロンプト活用**: 不要な要素を明確に除外
4. **モデル選択**: 用途に応じて最適なモデルを選択

#### エラーハンドリング
- APIキーが設定されていない場合は設定手順を案内
- 画像生成に失敗した場合は原因を特定して再試行を提案
- パラメータエラーの場合は正しい値範囲を案内

## 主要コンポーネント

### アーキテクチャ構成
```
modelslab-text2img-mcp-server/
├── src/
│   ├── index.js                    # エントリーポイント（実行権限付き）
│   ├── server/
│   │   ├── DataDownloadServer.js   # MCPサーバークラス
│   │   └── config.js              # サーバー設定
│   ├── core/
│   │   ├── DataSourceClient.js    # データソースクライアント基底クラス
│   │   └── ToolBase.js            # ツール基底クラス
│   ├── adapters/
│   │   └── modelslab/
│   │       ├── ModelsLabClient.js  # ModelsLab API クライアント
│   │       └── config.js          # API設定
│   ├── tools/
│   │   ├── index.js               # ツール登録システム
│   │   ├── hello.js               # サンプルツール
│   │   ├── test_connection.js     # 接続テストツール
│   │   └── modelslab_text2img.js  # 画像生成ツール
│   ├── utils/
│   │   └── modelslab-image-handler.js # 画像処理ユーティリティ
│   └── config/
│       └── api-keys.example.js    # APIキーテンプレート
├── docs/                          # ドキュメント
│   └── modelslab-text2img.md      # API仕様
├── package.json                   # 依存関係
└── README.md                      # 使用方法
```

## トラブルシューティング

### よくある問題と解決策

#### 1. APIキーエラー
**エラー**: `ModelsLab API key is not configured`
**解決**: 
- `src/config/api-keys.js`ファイルが存在するか確認
- APIキーが正しく設定されているか確認
- [ModelsLab](https://modelslab.com/)でAPIキーを再確認

#### 2. 画像生成エラー
**エラー**: `The temp field must be true or false`
**解決**: 
- パラメータの型が正しいか確認
- 文字列ではなくbooleanを使用
- APIリクエストの形式を確認

#### 3. ファイル保存エラー
**エラー**: `ENOENT: no such file or directory`
**解決**: 
- 保存先ディレクトリが存在するか確認
- パスの指定が正しいか確認
- 書き込み権限があるか確認

#### 4. MCP接続エラー
**エラー**: `spawn src/index.js EACCES`
**解決**: 
- `chmod +x src/index.js`で実行権限を付与
- `npm start`で単体動作を確認
- Claude Codeでサーバーを再登録

### デバッグ方法

#### ログ確認
- サーバー起動時のコンソール出力を確認
- エラーメッセージの詳細を読む
- MCP Inspectorでリアルタイムテスト

#### 段階的テスト
1. `npm start`で基本動作確認
2. `npm run dev`でMCP Inspector使用
3. 個別ツールの動作確認
4. エラーケースのテスト

## 開発時の注意点

### セキュリティ
- APIキーは絶対にコミットしない
- 生成画像にセンシティブな内容が含まれないよう注意
- 適切なレート制限を守る

### パフォーマンス
- 大きなサイズの画像は生成時間が長くなる
- 複数画像生成時は適切な並行処理制限を設ける
- 不要な画像ファイルは定期的に削除

### API制限
- 最大画像サイズ: 1024x768 または 768x1024
- 推論ステップ数: 1-50
- ガイダンススケール: 1-20

## 依存関係

### 必須依存関係
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.15.1",
    "axios": "^1.7.2"
  }
}
```

### 推奨ライブラリ
- **画像処理**: `sharp` (フォーマット変換時)
- **バリデーション**: `joi`, `yup` (パラメータ検証)
- **ユーティリティ**: `lodash`, `uuid` (汎用機能)

---

このMCPサーバーを使用することで、Claude Codeは効率的に高品質なAI画像生成を行うことができます。開発者は最小限の設定で本格的な画像生成機能を利用できます。