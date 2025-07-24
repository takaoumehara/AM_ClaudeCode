# AboutMe Cards — Architecture Design【完全最新版】


## 1. システム全体像
- フロント：Next.js (React/TypeScript)
- バックエンド：Firebase Functions or Next.js API
- 認証：Firebase Auth（Email/Google対応）
- データベース：Firestore (NoSQL, 柔軟プロファイル)
- ストレージ：Firebase Storage
- ホスティング：Firebase Hosting
- AI/外部API：Cloud Functionsでサジェスト・同義語・多言語拡張


## 2. データベース設計（柔軟な公開範囲管理例）


/users/{userId}
  - core: { name, photoUrl, mainTitle, teamIds, mainSkills }
  - personal: {
      hobbies, favorites, learning, motto, activities, customFields,
      show: { hobbies: { org1: true, org2: false, all: true }, ... }
    }
  - profiles: { orgId1: { ... }, orgId2: { ... } }


/organizations/{orgId}
  - name, admins, members, orgProfileTemplate: {
      fields: [{ key, type, required, publicDefault }]
    }, teams, projects, inviteLinks, tags


/skills/{skillId}
  - name, synonyms, orgIds


/teams, /projects, 他


## 3. API設計例
- /auth/signup, /auth/login
- /users/{userId}, /users/{userId}/profiles/{orgId}
- /organizations, /organizations/{orgId}
- /skills?search=xxx
- /organizations/{orgId}/skills, /teams, /projects


## 4. セキュリティ・認可設計
- Firestoreルールで「自分自身or許可された組織のみ」編集可
- Field Level Ruleでパーソナル項目ごとに公開/非公開
- 管理者/一般ユーザー/外部ゲストの3権限レベル


## 5. 拡張方針
- AI/多言語/サジェストはCloud Functionsで段階拡張
- データ量増加や複雑分析はBigQuery/Supabaseも検討可


---


