rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のプロフィールのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ユーザーは自分のアイデアのみ作成・更新可能
    match /ideas/{ideaId} {
      allow read: if true; // すべてのユーザーが読み取り可能
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.user_id == request.auth.uid;
    }
    
    // 墓場のアイデアはすべてのユーザーが読み取り可能、引き継ぎのために更新・削除可能
    match /deadIdeas/{deadIdeaId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}