# 消えるアイデア帳 - プロジェクト構造

このガイドでは、「消えるアイデア帳」アプリケーションの完全なプロジェクト構造と各ファイルの配置について説明します。

## ディレクトリ構造

```
IdeaSprint/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── functions/
│   ├── index.js
│   └── package.json
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── DeadIdeasScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── IdeaDetailScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── Navigation.jsx
│   │   ├── NewIdeaScreen.jsx
│   │   └── ProfileScreen.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useIdeas.js
│   ├── services/
│   │   ├── auth.js
│   │   ├── db.js
│   │   └── firebase.js
│   ├── utils/
│   │   └── dateUtils.js
│   ├── index.jsx
│   └── styles.css
├── .firebaserc
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── README.md
└── tailwind.config.js
```

## ファイルの配置手順

1. まず、上記の階層構造に従ってフォルダを作成します

2. すでに生成された各ファイルを適切な場所に配置します:

**トップレベルファイル:**
- `package.json` → `IdeaSprint/package.json`
- `firebase.json` → `IdeaSprint/firebase.json`
- `firestore.rules` → `IdeaSprint/firestore.rules`
- `README.md` → `IdeaSprint/README.md`
- `tailwind.config.js` → `IdeaSprint/tailwind.config.js`

**GitHub Actions:**
- `.github/workflows/deploy.yml` → `IdeaSprint/.github/workflows/deploy.yml`

**Reactコンポーネント:**
- `App.jsx` → `IdeaSprint/src/components/App.jsx`
- `LoginScreen.jsx` → `IdeaSprint/src/components/LoginScreen.jsx`
- `HomeScreen.jsx` → `IdeaSprint/src/components/HomeScreen.jsx`
- `IdeaDetailScreen.jsx` → `IdeaSprint/src/components/IdeaDetailScreen.jsx`
- `NewIdeaScreen.jsx` → `IdeaSprint/src/components/NewIdeaScreen.jsx` 
- `DeadIdeasScreen.jsx` → `IdeaSprint/src/components/DeadIdeasScreen.jsx`
- `ProfileScreen.jsx` → `IdeaSprint/src/components/ProfileScreen.jsx`
- `Navigation.jsx` → `IdeaSprint/src/components/Navigation.jsx`

**カスタムフック:**
- `useAuth.js` → `IdeaSprint/src/hooks/useAuth.js`
- `useIdeas.js` → `IdeaSprint/src/hooks/useIdeas.js`

**サービス:**
- `firebase.js` → `IdeaSprint/src/services/firebase.js`
- `auth.js` → `IdeaSprint/src/services/auth.js`
- `db.js` → `IdeaSprint/src/services/db.js`

**ユーティリティ:**
- `dateUtils.js` → `IdeaSprint/src/utils/dateUtils.js`

**その他:**
- `index.jsx` → `IdeaSprint/src/index.jsx`
- `styles.css` → `IdeaSprint/src/styles.css`
- `public/index.html` → `IdeaSprint/public/index.html`
- `functions/index.js` → `IdeaSprint/functions/index.js`

3. 実際にリポジトリを作成する前に以下の追加ファイルも必要です:

**Firebase設定:**
`.firebaserc` ファイルをルートディレクトリに作成:
```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

**Firestore indexes:**
`firestore.indexes.json` ファイルをルートディレクトリに作成:
```json
{
  "indexes": [
    {
      "collectionGroup": "ideas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "ideas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "deadline",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Cloud Functions package.json:**
`functions/package.json` ファイルを作成:
```json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "16"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1"
  },
  "devDependencies": {
    "eslint": "^8.15.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
```

**Public assets:**
`public` ディレクトリにはロゴやアイコンなども必要です:
- `favicon.ico` (16x16, 32x32サイズのファビコン)
- `logo192.png` (192x192サイズのロゴ)
- `logo512.png` (512x512サイズのロゴ)
- `manifest.json` (PWAマニフェストファイル)

## Firebaseプロジェクト設定

実際のデプロイの前に、以下の設定を行う必要があります:

1. Firebase Consoleでプロジェクトを作成
2. Authentication: Google・GitHub認証を有効化
3. Firestore: データベースを作成
4. Storage: ファイルストレージの設定（必要な場合）
5. Hosting: ホスティングの設定
6. Functions: Cloud Functionsの設定（Blaze有料プランが必要）

## 初期デプロイ

```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトディレクトリに移動
cd IdeaSprint

# 依存関係をインストール
npm install

# ビルド
npm run build

# デプロイ
firebase deploy
```

## Firebase SDKの設定

実際のプロジェクトでは、`src/services/firebase.js` ファイルのFirebase設定情報を実際のプロジェクトの情報に置き換える必要があります。Firebase Consoleから取得できる設定情報を使用してください。

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

以上の手順に従うことで、「消えるアイデア帳」プロジェクトを正しく構成し、GitHubリポジトリにアップロードする準備が整います。