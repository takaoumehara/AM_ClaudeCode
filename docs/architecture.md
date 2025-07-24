# AboutMe Cards — Architecture Design【アップデート版】

## 2. データベース設計（柔軟な公開範囲管理例）

/users/{userId}
  - prompts: [
      { questionId, questionText, answerText, publicScope: { orgId1: true, all: false } }
    ]
  - …
/searchFilters in UI-sessions or user prefs:
  - selectedTags: [tagId1, tagId2, ...]
  - filterMode: "AND" | "OR"
  - includeOrganizations: [orgIdA, orgIdB]
  - …

// Cloud Functions / Next.js API
POST /api/prompts/suggest
  - input: {answerDraft, questionId}
  - output: {suggestedText}

// Cloud Function for combining tag filters across orgs