# 消えるアイデア帳 (Vanishing Idea Tracker)

「消えるアイデア帳」は、アイデアを記録し、期限内に次のステップに進めないと自動的に消滅するサービスです。これにより「先延ばし」を防ぎ、アイデアを形にするモチベーションを高めます。

## 機能概要

- **アイデア管理システム**: アイデアの提出から実現までを4つのステップで管理
- **期限設定**: 各ステップには24時間の期限があり、超過するとアイデアは消滅
- **アイデア墓場**: 消滅したアイデアは「墓場」に移動し、他のユーザーが引き継ぎ可能
- **ポイントシステム**: ステップ達成やアイデア成功でポイント獲得
- **バッジ**: 特定の条件を達成することでバッジが付与される
- **OAuth認証**: GoogleとGitHubアカウントでのログインに対応

## 技術スタック

- **フロントエンド**: React, Tailwind CSS
- **バックエンド**: Firebase (Authentication, Firestore, Cloud Functions)
- **デプロイ**: Firebase Hosting

## セットアップ方法

### 前提条件

- Node.js (v14以上)
- npm または yarn
- Firebase アカウント

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/vanishing-idea-tracker.git
cd vanishing-idea-tracker
```

2. 依存関係をインストール
```bash
npm install
# または
yarn install
```

3. Firebaseプロジェクトを作成
   - [Firebase Console](https://console.firebase.google.com/)にアクセス
   - 新しいプロジェクトを作成
   - Authentication, Firestore, Cloud Functionsを有効化
   - OAuth認証プロバイダー（Google, GitHub）を設定

4. Firebase設定をプロジェクトに追加
   - `src/services/firebase.js`ファイルにFirebase設定情報を追加

5. ローカル開発サーバーを起動
```bash
npm start
# または
yarn start
```

### デプロイ

```bash
npm run deploy
# または
yarn deploy
```

## ディレクトリ構造

```
vanishing-idea-tracker/
├── public/                    # 静的ファイル
├── src/                       # ソースコード
│   ├── components/            # UIコンポーネント
│   ├── hooks/                 # カスタムフック
│   ├── services/              # Firebase連携
│   ├── utils/                 # ユーティリティ関数
│   ├── index.jsx              # エントリーポイント
│   └── styles.css             # グローバルスタイル
├── firebase.json              # Firebase設定
├── firestore.rules            # Firestoreセキュリティルール
└── functions/                 # Cloud Functions
```

## ライセンス

MIT

## 作者

[Your Name](https://github.com/yourusername)
