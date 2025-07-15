# 🎨 ModelsLab Text2Image MCP Server [DRAFT VERSION]

> ⚠️ **注意**: このプロジェクトは現在ドラフト版です。本番環境での使用前に十分なテストを行ってください。

ModelsLab APIを使用したText2Image画像生成専用のModel Context Protocol (MCP)サーバーです。Claude Codeから高品質なAI画像生成を簡単に実行できます。

## 🚀 主要機能

- 🎭 **Fluxモデル標準搭載** - デフォルトで最新のFluxモデルを使用
- 🌈 **複数モデル対応** - Flux、Stable Diffusion、Midjourney等をサポート
- 📁 **ローカル保存** - 生成した画像をローカルファイルに自動保存
- 🔧 **豊富な設定** - 画像サイズ、品質、スタイル等を細かく調整
- 🔒 **セキュア** - APIキーの安全な管理機能内蔵

## 📦 インストールと設定

### 1. リポジトリのクローン
```bash
git clone https://github.com/shimizu/modelslab-text2img-mcp-server.git
cd modelslab-text2img-mcp-server
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. ModelsLab API設定 🔑
1. 📝 [ModelsLab](https://modelslab.com/)でアカウント作成
2. 🆔 APIキーを取得
3. 🔧 APIキーを設定:

```bash
# APIキー設定ファイルを作成
cp src/config/api-keys.example.js src/config/api-keys.js

# api-keys.jsを編集してAPIキーを設定
# apiKey: 'your_modelslab_api_key_here' を実際のキーに変更
```

**重要**: `src/config/api-keys.js` はGitHubにpushされません（.gitignoreで保護）

### 4. サーバー起動 ⚡
```bash
# MCPサーバーを起動
npm start

# MCP Inspectorで開発・テスト
npm run dev
```

## Claude Code での使用

Claude Code では `claude mcp add` コマンドでMCPサーバーを登録します：

```bash
# プロジェクトに移動
cd /path/to/modelslab-text2img-mcp-server

# 実行権限を付与（初回のみ必要）
chmod +x src/index.js

# MCPサーバーを登録（ローカルスコープ）
claude mcp add modelslab-text2img node src/index.js

# または絶対パスで登録
claude mcp add modelslab-text2img node /path/to/modelslab-text2img-mcp-server/src/index.js
```

詳細は [Claude Code MCP ドキュメント](https://docs.anthropic.com/ja/docs/claude-code/mcp) を参照してください。

### 使用開始

claudeを起動後`/mcp`コマンドを実行しMCPが正しく接続できているか確認してください。

`✔ connected`が表示されていれば正常に動作しています。

## 💬 Claudeでの使用例

### 🎨 基本的な画像生成
```
美しい夕焼けの山景色の画像を生成してください
```

### 🎭 特定のモデルを指定
```
midjourney モデルを使用して、アニメスタイルのキャラクターポートレートを生成してください
```

### 🖼️ 複数画像の生成
```
「未来都市」をテーマに、2枚の画像を生成して保存してください
```

### 🔧 詳細設定での生成
```
以下の設定で画像を生成してください：
- プロンプト: "cyberpunk city at night, neon lights, rain"
- サイズ: 1024x768
- 品質: 高品質
- ネガティブプロンプト: "blurry, low quality"
```

## 🛠️ 利用可能なツール

### 🎨 modelslab_text2img
テキストプロンプトから高品質な画像を生成します

**パラメータ:**
- `prompt` (string, required): 画像生成用のテキストプロンプト
- `model_id` (string, optional): 使用するモデル（デフォルト: "flux"）
- `width` (number, optional): 画像の幅（デフォルト: 512）
- `height` (number, optional): 画像の高さ（デフォルト: 512）
- `samples` (number, optional): 生成する画像数（デフォルト: 1）
- `negative_prompt` (string, optional): ネガティブプロンプト
- `num_inference_steps` (number, optional): 推論ステップ数（デフォルト: 20）
- `guidance_scale` (number, optional): ガイダンススケール（デフォルト: 7.5）
- `outputPath` (string, optional): 保存先ファイルパス
- `format` (string, optional): 画像形式（jpg, png, webp等）

**使用例:**
```json
{
  "prompt": "beautiful landscape at sunset",
  "model_id": "flux",
  "width": 1024,
  "height": 512,
  "samples": 1,
  "outputPath": "./generated_landscape.jpg"
}
```

### 👋 hello
動作確認用のシンプルなツール

### 🔗 test_connection
HTTP接続テスト用ツール

## 📋 レスポンス形式

### 🎨 画像生成結果（ファイル保存あり）
```json
{
  "status": "success",
  "message": "画像をファイルに保存しました",
  "file": "./generated_image.jpg",
  "size": "245.67 KB",
  "contentType": "image/jpeg",
  "format": "jpg",
  "model": "flux",
  "prompt": "beautiful landscape at sunset",
  "dimensions": "1024x512",
  "samples": 1
}
```

### 🌐 画像生成結果（URLのみ）
```json
{
  "success": true,
  "imageUrls": [
    "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/image1.jpg"
  ],
  "metadata": {
    "tool": "modelslab_text2img",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "imageCount": 1,
    "model": "flux"
  }
}
```

## 🗂️ プロジェクト構造

```
📁 modelslab-text2img-mcp-server/
├── 📄 src/
│   ├── 🎯 index.js                    # エントリーポイント
│   ├── 🔌 adapters/                   # APIアダプター
│   │   └── 🎨 modelslab/
│   │       ├── ModelsLabClient.js     # ModelsLab APIクライアント
│   │       └── config.js              # API設定
│   ├── 🖥️ server/                     # MCPサーバー実装
│   │   ├── DataDownloadServer.js
│   │   └── config.js
│   ├── ⚙️ core/                       # 基底クラス
│   │   ├── DataSourceClient.js
│   │   └── ToolBase.js
│   ├── 🛠️ tools/                      # MCPツール
│   │   ├── index.js
│   │   ├── modelslab_text2img.js      # 画像生成ツール
│   │   ├── hello.js
│   │   └── test_connection.js
│   ├── 🔧 utils/                      # ユーティリティ
│   │   └── modelslab-image-handler.js # 画像処理
│   └── 📁 config/                     # 設定ファイル
│       └── api-keys.example.js        # APIキーテンプレート
├── 📖 docs/                           # ドキュメント
│   └── modelslab-text2img.md
├── 📦 package.json
├── 📖 README.md
└── 📝 CLAUDE.md
```

## 🌟 対応モデル

- **Flux** - 最新の高品質画像生成モデル（デフォルト）
- **Stable Diffusion** - 汎用的な画像生成モデル
- **Midjourney** - アーティスティックな画像生成
- **その他** - ModelsLabでサポートされている全モデル

## 🚨 注意事項

- 🆔 **APIキー必須**: ModelsLab APIキーが必要です
- 🖼️ **画像制限**: 最大サイズは1024x768または768x1024（メモリ制限）
- 📊 **レート制限**: APIの利用規約に従って適切な間隔でリクエストしてください
- 🔒 **セキュリティ**: `src/config/api-keys.js`は絶対にコミットしないでください（.gitignoreで保護済み）

## 🆘 トラブルシューティング

### APIキーエラー
```
ModelsLab API key is not configured
```
→ `src/config/api-keys.js`ファイルを確認してAPIキーが正しく設定されているか確認

### 画像生成エラー
```
The temp field must be true or false
```
→ パラメータの型が正しいかチェック。文字列ではなくbooleanを使用

### 接続エラー
```
timeout of 30000ms exceeded
```
→ ネットワーク接続とModelsLab APIサービス状況を確認

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issues、Pull Requests大歓迎です！

---

Made with ❤️ for AI-powered Image Generation