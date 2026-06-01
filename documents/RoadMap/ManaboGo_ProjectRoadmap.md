# 🚀 ManaboGo 実装実行ロードマップ / Project Implementation Roadmap (v1.2)

---

## 1. はじめに / Introduction

このロードマップは、既存の Manabo（学ぼ）プラットフォームを基盤として、JLPT N5 レベルの完全な日本語学習プラットフォーム **ManaboGo** をグローバルに展開するための段階的実装計画を示します。各フェーズは順番に進行し、Phase 0〜8 がリリース前、Phase 9 以降がリリース後の拡張を担います。

This roadmap defines the phased implementation plan for **ManaboGo**, a global JLPT N5 learning platform built on top of the existing Manabo foundation. Phases proceed sequentially: Phases 0 through 8 are pre-release; Phase 9 covers post-release expansion.

**v1.2 changes from v1.1:** Phase 0 task 12 updated — CI/CD pipeline now specifies **GitHub + AWS** (GitHub Actions deploying to AWS ECS for the API and AWS Amplify for the frontend, with AWS CloudWatch for monitoring). Phase 5 gains four new certification tasks (tasks 48–51) for the ManaboGo N5 Certification Exam, certificate PDF generation, the public verification portal, and Super Admin certificate management. All subsequent phase tasks renumbered accordingly. Total task count grows from 85 to 89.

**Phase ordering:**
0. Foundation, Auth & RBAC / 基盤構築・認証・RBAC
1. Kana mastery port / かなマスター移植
2. Kanji acquisition + SRS engine / 漢字学習・SRSエンジン
3. Vocabulary expansion / 語彙拡張
4. Grammar & sentence construction / 文法・文構築
5. Mock test, Readiness Report & Certification / 模試・受験準備レポート・認定試験
6. Gamification & social engine / ゲーミフィケーション・ソーシャル
7. Role-based dashboards / ロール別ダッシュボード
8. Monetization & Pro tier / 収益化・Proティア
9. 🏁 Release boundary / リリース境界線
10. AI features & expansion / AI機能・拡張

---

### Phase 0: 基盤構築・認証・RBAC / Foundation, Auth & RBAC

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ✅ | 0 | デザインシステム継承<br>Design System Inheritance | **MUST** | Manaboのカラー、タイポグラフィ、ボタン仕様を継承<br>Inherit Manabo's palette, typography, and skeuomorphic button tokens | `documents/00-DesignSystemSection/` | [00ロードマップRoadmap.md](/documents/00-DesignSystemSection/00ロードマップRoadmap.md) |
| ✅ | 1 | モノレポ構成<br>Monorepo Setup | **MUST** | apps/web + apps/api 構造を Manaboから複製<br>Clone Manabo's apps/web + apps/api workspace structure | `documents/01-MonorepoSection/` | [01ロードマップRoadmap.md](/documents/01-MonorepoSection/01ロードマップRoadmap.md) |
| ✅ | 2 | FastAPI + Postgres スタック<br>FastAPI + Postgres Stack | **MUST** | 既存のManabo接続プール・JWT認証を再利用<br>Reuse Manabo's asyncpg pool and JWT auth primitives | `documents/02-BackendStackSection/` | [02ロードマップRoadmap.md](/documents/02-BackendStackSection/02ロードマップRoadmap.md) |
| ✅ | 3 | Email + Password 登録フロー<br>Email + Password Registration Flow | **MUST** | bcryptハッシュ、強度チェック、SecListsデニーリスト<br>bcrypt hashing, strength meter, SecLists denylist | `documents/03-RegistrationSection/` | [03ロードマップRoadmap.md](/documents/03-RegistrationSection/03ロードマップRoadmap.md) |
| ✅ | 4 | メール検証フロー<br>Email Verification Flow | **MUST** | 24時間有効のマジックリンク、ソフトゲート<br>24-hour magic-link tokens; soft-gate for unverified users | `documents/04-EmailVerificationSection/` | [04ロードマップRoadmap.md](/documents/04-EmailVerificationSection/04ロードマップRoadmap.md) |
| ✅ | 5 | JWT + リフレッシュトークン ログイン<br>JWT + Refresh Token Login | **MUST** | 15分のアクセストークン + 30日のリフレッシュ + ローテーション<br>15-min access tokens, 30-day refresh tokens with rotation | `documents/05-LoginSection/` | [05ロードマップRoadmap.md](/documents/05-LoginSection/05ロードマップRoadmap.md) |
| ✅ | 6 | パスワードリセットフロー<br>Password Reset Flow | **MUST** | 列挙対策、トークン無効化、全セッション失効<br>Enumeration-safe, token invalidation, all-session revoke | `documents/06-PasswordResetSection/` | [06ロードマップRoadmap.md](/documents/06-PasswordResetSection/06ロードマップRoadmap.md) |
| ✅ | 7 | RBACエンジン — 4ロール + 権限マトリクス<br>RBAC Engine — 4 Roles + Permission Matrix | **MUST** | User / Pro User / Admin / Super Admin 権限バンドル定義<br>Permission bundles for User / Pro User / Admin / Super Admin | `documents/07-RBACEngineSection/` | [07ロードマップRoadmap.md](/documents/07-RBACEngineSection/07ロードマップRoadmap.md) |
| ✅ | 8 | アカウント設定ページ<br>Account Settings Page | **MUST** | プロフィール、パスワード、メール、GDPR エクスポート、削除<br>Profile, password, email, GDPR data export, soft-delete | `documents/08-AccountSettingsSection/` | [08ロードマップRoadmap.md](/documents/08-AccountSettingsSection/08ロードマップRoadmap.md) |
| ✅ | 9 | 2要素認証 (TOTP)<br>Two-Factor Authentication (TOTP) | **MUST** | Admin / Super Admin 必須、User 任意<br>Mandatory for Admin/Super Admin; optional for User | `documents/09-TwoFactorAuthSection/` | [09ロードマップRoadmap.md](/documents/09-TwoFactorAuthSection/09ロードマップRoadmap.md) |
| ⏳ | 10 | ソーシャルログイン<br>Social Login (Google / Apple / LINE) | DEFERRABLE | LINEは日本・タイ・台湾・インドネシアで重要<br>LINE critical for JP/TH/TW/ID markets | `documents/10-SocialLoginSection/` | [10ロードマップRoadmap.md](/documents/10-SocialLoginSection/10ロードマップRoadmap.md) |
| ✅ | 11 | 国際化 i18n スキャフォールド<br>i18n Scaffold | **MUST** | EN / JP / BN / ID / VI を i18next で対応<br>Support EN/JP/BN/ID/VI via i18next from day one | `documents/11-I18nSection/` | [11ロードマップRoadmap.md](/documents/11-I18nSection/11ロードマップRoadmap.md) |
| 🏃 | 12 | GitHub + AWS パイプライン<br>GitHub + AWS Pipeline | **MUST** | GitHub Actions → AWS ECS（API）+ AWS Amplify（FE）+ CloudWatch<br>GitHub Actions deploys API to AWS ECS, frontend to AWS Amplify, monitoring via CloudWatch | `documents/12-CICDSection/` | [12ロードマップRoadmap.md](/documents/12-CICDSection/12ロードマップRoadmap.md) |
| ⏳ | 13 | PPP価格決定システム<br>PPP Pricing System | DEFERRABLE | 地域別購買力平価による価格調整<br>Region-based purchasing-power-parity price adjustment | `documents/13-PPPPricingSection/` | [13ロードマップRoadmap.md](/documents/13-PPPPricingSection/13ロードマップRoadmap.md) |

---

### Phase 1: かなマスター移植 / Kana Mastery Port

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ✅ | 14 | ひらがな46文字データセット<br>Hiragana 46-Character Dataset | **MUST** | Manaboの完成したデータセットを移植<br>Port Manabo's complete and tested hiragana dataset | `documents/14-HiraganaSection/` | [14ロードマップRoadmap.md](/documents/14-HiraganaSection/14ロードマップRoadmap.md) |
| ✅ | 15 | カタカナ46文字データセット<br>Katakana 46-Character Dataset | **MUST** | Manaboの完成したカタカナ移植<br>Port Manabo's complete and tested katakana dataset | `documents/15-KatakanaSection/` | [15ロードマップRoadmap.md](/documents/15-KatakanaSection/15ロードマップRoadmap.md) |
| ✅ | 16 | タイピング練習モード<br>Typing Practice Mode | **MUST** | ローマ字入力・即時フィードバック<br>Romaji input with instant feedback | `documents/16-TypingPracticeSection/` | [16ロードマップRoadmap.md](/documents/16-TypingPracticeSection/16ロードマップRoadmap.md) |
| ✅ | 17 | 多肢選択モード<br>Multiple Choice Mode | **MUST** | 認識練習用4択選択肢<br>4-option recognition practice | `documents/17-MultipleChoiceSection/` | [17ロードマップRoadmap.md](/documents/17-MultipleChoiceSection/17ロードマップRoadmap.md) |
| ✅ | 18 | かなチャートビュー<br>Kana Chart View | **MUST** | 五十音表の参照ページ<br>Gojuon reference chart page | `documents/18-KanaChartSection/` | [18ロードマップRoadmap.md](/documents/18-KanaChartSection/18ロードマップRoadmap.md) |
| ✅ | 19 | 筆順アニメーション<br>Stroke-Order Animation | DEFERRABLE | 各かなの正しい書き順を表示<br>Display correct stroke order for each kana | `documents/19-StrokeOrderSection/` | [19ロードマップRoadmap.md](/documents/19-StrokeOrderSection/19ロードマップRoadmap.md) |
| ✅ | 20 | 音声再生<br>Audio Playback | **MUST** | Web Speech API + MP3フォールバック<br>Web Speech API with MP3 fallback | `documents/20-AudioPlaybackSection/` | [20ロードマップRoadmap.md](/documents/20-AudioPlaybackSection/20ロードマップRoadmap.md) |

---

### Phase 2: 漢字学習・SRSエンジン / Kanji Acquisition & SRS Engine

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 21 | SM-2 SRSアルゴリズム<br>SM-2 SRS Algorithm | **MUST** | 長期記憶定着のための間隔反復<br>Spaced repetition for long-term retention | `documents/21-SRSAlgorithmSection/` | [21ロードマップRoadmap.md](/documents/21-SRSAlgorithmSection/21ロードマップRoadmap.md) |
| ⏳ | 22 | srs_cards テーブル設計<br>srs_cards Table Schema | **MUST** | ユーザー別・項目別のSRS状態を永続化<br>Persist per-user per-item SRS state | `documents/22-SRSSchemaSection/` | [22ロードマップRoadmap.md](/documents/22-SRSSchemaSection/22ロードマップRoadmap.md) |
| ⏳ | 23 | N5漢字103字データセット<br>N5 Kanji 103-Character Dataset | **MUST** | JLPT N5 全漢字、読み、語彙クラスター<br>All N5 Kanji with readings and vocabulary clusters | `documents/23-N5KanjiSection/` | [23ロードマップRoadmap.md](/documents/23-N5KanjiSection/23ロードマップRoadmap.md) |
| ⏳ | 24 | 漢字筆順アニメーション<br>Kanji Stroke-Order Animation | **MUST** | SVGベースの筆順アニメ<br>SVG-based stroke-order animations | `documents/24-KanjiStrokeSection/` | [24ロードマップRoadmap.md](/documents/24-KanjiStrokeSection/24ロードマップRoadmap.md) |
| ⏳ | 25 | ニーモニック画像<br>Mnemonic Imagery | DEFERRABLE | 各漢字の記憶補助イラスト<br>Memory-aid illustrations per Kanji | `documents/25-MnemonicSection/` | [25ロードマップRoadmap.md](/documents/25-MnemonicSection/25ロードマップRoadmap.md) |
| ⏳ | 26 | 日次レッスンコンポーザー<br>Daily Lesson Composer | **MUST** | 40%復習・30%新規・20%弱点・10%リスニング配分<br>40% review / 30% new / 20% weak / 10% listening | `documents/26-LessonComposerSection/` | [26ロードマップRoadmap.md](/documents/26-LessonComposerSection/26ロードマップRoadmap.md) |
| ⏳ | 27 | 漢字進捗トラッキング<br>Kanji Progress Tracking | **MUST** | 103字の習得状況を可視化<br>Visualize mastery state across 103 Kanji | `documents/27-KanjiProgressSection/` | [27ロードマップRoadmap.md](/documents/27-KanjiProgressSection/27ロードマップRoadmap.md) |

---

### Phase 3: 語彙拡張 / Vocabulary Expansion

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 28 | N5語彙800語データセット<br>N5 Vocabulary 800-Word Dataset | **MUST** | JLPT N5 必須語彙とサンプル文<br>JLPT N5 core vocabulary with example sentences | `documents/28-N5VocabSection/` | [28ロードマップRoadmap.md](/documents/28-N5VocabSection/28ロードマップRoadmap.md) |
| ⏳ | 29 | 語彙カードフォーマット<br>Vocabulary Card Format | **MUST** | 単語・読み・意味・例文・画像<br>Word, reading, meaning, example, image per card | `documents/29-VocabCardSection/` | [29ロードマップRoadmap.md](/documents/29-VocabCardSection/29ロードマップRoadmap.md) |
| ⏳ | 30 | 語彙SRS統合<br>Vocabulary SRS Integration | **MUST** | 語彙アイテムをsrs_cardsに登録<br>Register vocabulary items as srs_cards | `documents/30-VocabSRSSection/` | [30ロードマップRoadmap.md](/documents/30-VocabSRSSection/30ロードマップRoadmap.md) |
| ⏳ | 31 | 画像アセット管理<br>Image Asset Management | **MUST** | Cloudflare R2による低コスト配信<br>Cloudflare R2 for low-cost asset delivery | `documents/31-AssetMgmtSection/` | [31ロードマップRoadmap.md](/documents/31-AssetMgmtSection/31ロードマップRoadmap.md) |
| ⏳ | 32 | 語彙リスニング練習<br>Vocabulary Listening Practice | **MUST** | 音声を聞いて単語を選択<br>Audio-to-word selection drills | `documents/32-VocabListeningSection/` | [32ロードマップRoadmap.md](/documents/32-VocabListeningSection/32ロードマップRoadmap.md) |

---

### Phase 4: 文法・文構築 / Grammar & Sentence Construction

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 33 | N5文法50パターン<br>N5 Grammar 50 Patterns | **MUST** | JLPT N5 文法項目とテンプレート<br>JLPT N5 grammar items as templates | `documents/33-N5GrammarSection/` | [33ロードマップRoadmap.md](/documents/33-N5GrammarSection/33ロードマップRoadmap.md) |
| ⏳ | 34 | 文構築練習エンジン<br>Sentence Builder Engine | **MUST** | トークン並べ替えによる文法練習<br>Drag-to-order token grammar drills | `documents/34-SentenceBuilderSection/` | [34ロードマップRoadmap.md](/documents/34-SentenceBuilderSection/34ロードマップRoadmap.md) |
| ⏳ | 35 | 助詞ドリル<br>Particle Drills | **MUST** | は・が・を・に・で・へ・と の集中練習<br>Focused drills on は/が/を/に/で/へ/と | `documents/35-ParticleDrillSection/` | [35ロードマップRoadmap.md](/documents/35-ParticleDrillSection/35ロードマップRoadmap.md) |
| ⏳ | 36 | 文法SRS統合<br>Grammar SRS Integration | **MUST** | 文法パターンをSRSで管理<br>Grammar patterns governed by SRS | `documents/36-GrammarSRSSection/` | [36ロードマップRoadmap.md](/documents/36-GrammarSRSSection/36ロードマップRoadmap.md) |
| ⏳ | 37 | 動詞活用練習<br>Verb Conjugation Practice | **MUST** | ます形・て形・ない形の練習<br>Practice for ます-form, て-form, ない-form | `documents/37-VerbConjugationSection/` | [37ロードマップRoadmap.md](/documents/37-VerbConjugationSection/37ロードマップRoadmap.md) |

---

### Phase 5: 模試・受験準備レポート・認定試験 / Mock Test, Readiness Report & Certification

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 38 | 模試問題バンク<br>Mock Test Question Bank | **MUST** | 2000問以上、難易度タグ付き<br>2000+ questions tagged by difficulty and skill | `documents/38-MockTestBankSection/` | [38ロードマップRoadmap.md](/documents/38-MockTestBankSection/38ロードマップRoadmap.md) |
| ⏳ | 39 | クイック模試（15分）<br>Quick Mock (15 min) | **MUST** | 20問の日次ウォームアップ<br>20-question proportional daily warm-up | `documents/39-QuickMockSection/` | [39ロードマップRoadmap.md](/documents/39-QuickMockSection/39ロードマップRoadmap.md) |
| ⏳ | 40 | フル模試（105分）<br>Full Mock (105 min) | **MUST** | 本試験完全シミュレーション（Pro限定）<br>Full JLPT exam simulation — Pro only | `documents/40-FullMockSection/` | [40ロードマップRoadmap.md](/documents/40-FullMockSection/40ロードマップRoadmap.md) |
| ⏳ | 41 | セクション別ドリル<br>Section Drill | **MUST** | 単一セクション集中練習<br>Single-section focused practice | `documents/41-SectionDrillSection/` | [41ロードマップRoadmap.md](/documents/41-SectionDrillSection/41ロードマップRoadmap.md) |
| ⏳ | 42 | リスニング音源システム<br>Listening Audio System | **MUST** | 2回再生制限付き音声プレイヤー<br>Audio player with 2-play limit per item | `documents/42-ListeningAudioSection/` | [42ロードマップRoadmap.md](/documents/42-ListeningAudioSection/42ロードマップRoadmap.md) |
| ⏳ | 43 | 受験準備レポート — セクション習熟度<br>Readiness Report — Section Mastery | **MUST** | 4セクション別の30日トレンド<br>30-day accuracy trend across 4 JLPT sections | `documents/43-ReadinessSectionSection/` | [43ロードマップRoadmap.md](/documents/43-ReadinessSectionSection/43ロードマップRoadmap.md) |
| ⏳ | 44 | 受験準備レポート — 漢字カバレッジ<br>Readiness Report — Kanji Coverage | **MUST** | 103字の習得ヒートマップ<br>Mastery heatmap for all 103 Kanji | `documents/44-ReadinessKanjiSection/` | [44ロードマップRoadmap.md](/documents/44-ReadinessKanjiSection/44ロードマップRoadmap.md) |
| ⏳ | 45 | 受験準備レポート — 定着曲線<br>Readiness Report — Retention Curve | **MUST** | Matureカード比率の経時推移<br>Mature card % over time | `documents/45-ReadinessRetentionSection/` | [45ロードマップRoadmap.md](/documents/45-ReadinessRetentionSection/45ロードマップRoadmap.md) |
| ⏳ | 46 | 合格確率予測モデル<br>Pass Probability Prediction | **MUST** | ロジスティック回帰による合格予測<br>Logistic regression for pass prediction | `documents/46-PassPredictionSection/` | [46ロードマップRoadmap.md](/documents/46-PassPredictionSection/46ロードマップRoadmap.md) |
| ⏳ | 47 | 推奨フォーカス生成<br>Recommended Focus Generator | **MUST** | 弱点に基づく週次推奨項目<br>Weekly prioritised recommendations from weak areas | `documents/47-RecommendedFocusSection/` | [47ロードマップRoadmap.md](/documents/47-RecommendedFocusSection/47ロードマップRoadmap.md) |
| ⏳ | 48 | ManaboGo N5 認定試験エンジン<br>ManaboGo N5 Certification Exam Engine | **MUST** | 模試とは独立した専用問題バンク。105分・3セクション・30日に1回受験可能（Pro限定）。Readiness Score 70%以上が受験資格。<br>Separate question bank from mocks. 105 min / 3 sections / 1 attempt per 30 days. Requires Readiness ≥ 70%. Pro only. | `documents/48-CertExamEngineSection/` | [48ロードマップRoadmap.md](/documents/48-CertExamEngineSection/48ロードマップRoadmap.md) |
| ⏳ | 49 | 認定証 PDF 生成<br>Certificate PDF Generation | **MUST** | サーバーサイドPDF生成。氏名・証明書番号（UUID）・スコア・発行日・ManaboGoシール。ダウンロード可能。<br>Server-side PDF with full name, certificate UUID, score, issue date, ManaboGo seal. Downloadable. | `documents/49-CertPDFSection/` | [49ロードマップRoadmap.md](/documents/49-CertPDFSection/49ロードマップRoadmap.md) |
| ⏳ | 50 | 認定証 公開検証ポータル<br>Certificate Verification Portal | **MUST** | ログイン不要の公開URL。雇用主・学校が証明書の真正性を確認可能。<br>Public URL (no login): manabogo.app/verify/{certId}. Employers and schools can verify authenticity. | `documents/50-CertVerifySection/` | [50ロードマップRoadmap.md](/documents/50-CertVerifySection/50ロードマップRoadmap.md) |
| ⏳ | 51 | 認定証 管理機能（Super Admin）<br>Certificate Management (Super Admin) | **MUST** | 発行済み証明書の一覧・検索・失効（監査証跡付き）。<br>List, search, and revoke issued certificates with full audit trail and reason. | `documents/51-CertMgmtSection/` | [51ロードマップRoadmap.md](/documents/51-CertMgmtSection/51ロードマップRoadmap.md) |

---

### Phase 6: ゲーミフィケーション・ソーシャル / Gamification & Social Engine

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ✅ | 52 | XP・レベル・連続記録システム<br>XP, Levels, Streak System | **MUST** | Manaboの既存システムを継承<br>Inherit Manabo's existing system | `documents/52-XPSystemSection/` | [52ロードマップRoadmap.md](/documents/52-XPSystemSection/52ロードマップRoadmap.md) |
| ✅ | 53 | バッジ・実績システム<br>Badge & Achievement System | **MUST** | Manaboの9バッジ + ManaboGo用3バッジ追加<br>Extend Manabo's 9-badge system with 3 ManaboGo badges | `documents/53-BadgeSystemSection/` | [53ロードマップRoadmap.md](/documents/53-BadgeSystemSection/53ロードマップRoadmap.md) |
| ⏳ | 54 | 桜コイン仮想通貨<br>Sakura Coins Virtual Currency | **MUST** | 連続記録・レッスン・勝利で獲得。実購入不可の閉鎖型<br>Earned via streaks/lessons/wins. Closed economy — no real-money purchase. | `documents/54-SakuraCoinsSection/` | [54ロードマップRoadmap.md](/documents/54-SakuraCoinsSection/54ロードマップRoadmap.md) |
| ⏳ | 55 | 非同期友達バトル<br>Asynchronous Friend Battles | **MUST** | 共有リンクで非同期に同じ20問対戦<br>Share-link async same-20-question duel | `documents/55-AsyncBattleSection/` | [55ロードマップRoadmap.md](/documents/55-AsyncBattleSection/55ロードマップRoadmap.md) |
| ⏳ | 56 | 同期友達バトル（Pro限定）<br>Sync Friend Battles (Pro only) | DEFERRABLE | リアルタイムWebSocketマッチ<br>Real-time WebSocket-based matches | `documents/56-SyncBattleSection/` | [56ロードマップRoadmap.md](/documents/56-SyncBattleSection/56ロードマップRoadmap.md) |
| ⏳ | 57 | ゲーム1: センテンス・スクランブル<br>Game 1: Sentence Scramble | **MUST** | 助詞・語順を訓練する最重要ミニゲーム<br>Highest pedagogy mini-game — trains particles and word order | `documents/57-SentenceScrambleSection/` | [57ロードマップRoadmap.md](/documents/57-SentenceScrambleSection/57ロードマップRoadmap.md) |
| ⏳ | 58 | ゲーム2: リーディング・ラッシュ<br>Game 2: Reading Rush | **MUST** | 自動認識を高速で訓練<br>Trains rapid automatic recognition | `documents/58-ReadingRushSection/` | [58ロードマップRoadmap.md](/documents/58-ReadingRushSection/58ロードマップRoadmap.md) |
| ⏳ | 59 | ゲーム3: 漢字バトルアリーナ<br>Game 3: Kanji Battle Arena | **MUST** | HP制対人バトル、ソーシャルの目玉<br>HP-based PvP duel — the social headline feature | `documents/59-KanjiArenaSection/` | [59ロードマップRoadmap.md](/documents/59-KanjiArenaSection/59ロードマップRoadmap.md) |
| ⏳ | 60 | フレンドシステム<br>Friend System | **MUST** | 招待・対戦履歴・リーダーボード<br>Invites, head-to-head history, leaderboards | `documents/60-FriendSystemSection/` | [60ロードマップRoadmap.md](/documents/60-FriendSystemSection/60ロードマップRoadmap.md) |
| ⏳ | 61 | ストリーク・フリーズ機能<br>Streak Freeze Feature | DEFERRABLE | コインで連続記録を保護<br>Protect streak with coin purchase | `documents/61-StreakFreezeSection/` | [61ロードマップRoadmap.md](/documents/61-StreakFreezeSection/61ロードマップRoadmap.md) |

---

### Phase 7: ロール別ダッシュボード / Role-Based Dashboards

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 62 | ユーザーダッシュボード<br>User Dashboard (`/dashboard`) | **MUST** | 無料学習者向け・アップグレード導線付き<br>Free learner view with strategic upgrade prompts | `documents/62-UserDashboardSection/` | [62ロードマップRoadmap.md](/documents/62-UserDashboardSection/62ロードマップRoadmap.md) |
| ⏳ | 63 | Pro Userダッシュボード<br>Pro User Dashboard (`/pro-dashboard`) | **MUST** | Readiness Report完全展開・試験準備モード・オフライン<br>Full Readiness Report inline + Exam Prep Mode + offline toggle | `documents/63-ProDashboardSection/` | [63ロードマップRoadmap.md](/documents/63-ProDashboardSection/63ロードマップRoadmap.md) |
| ⏳ | 64 | Adminダッシュボード（ManaboGo拡張）<br>Admin Dashboard (`/admin`, extended) | **MUST** | Manaboの管理UI継承 + 課金状況 + モデレーション + サポート<br>Manabo admin UI + subscription status + moderation + support tickets | `documents/64-AdminDashboardSection/` | [64ロードマップRoadmap.md](/documents/64-AdminDashboardSection/64ロードマップRoadmap.md) |
| ⏳ | 65 | Super Adminダッシュボード<br>Super Admin Dashboard (`/super-admin`) | **MUST** | KPI概要・Admin管理・システム設定・コンテンツCRUD・監査<br>System KPIs, admin management, system config, content CRUD, audit/compliance | `documents/65-SuperAdminDashboardSection/` | [65ロードマップRoadmap.md](/documents/65-SuperAdminDashboardSection/65ロードマップRoadmap.md) |
| ⏳ | 66 | ロール別ルートガード（FE）<br>Role-Based Route Guards (Frontend) | **MUST** | wouter `<RoleGuard>` コンポーネント<br>wouter `<RoleGuard>` wrapper redirects to role's home on unauthorized access | `documents/66-RouteGuardSection/` | [66ロードマップRoadmap.md](/documents/66-RouteGuardSection/66ロードマップRoadmap.md) |
| ⏳ | 67 | 権限ゲートUI コンポーネント<br>Permission-Gated UI Components | **MUST** | 権限に応じてボタン・セクションの表示を制御<br>Buttons and sections shown/hidden based on JWT permission claims | `documents/67-PermissionGatedUISection/` | [67ロードマップRoadmap.md](/documents/67-PermissionGatedUISection/67ロードマップRoadmap.md) |
| ⏳ | 68 | "View As" 機能（Super Admin）<br>"View As" Feature (Super Admin) | DEFERRABLE | 一時的に低ロールトークンを発行してQA<br>Temporary lower-role token for cross-role QA without test accounts | `documents/68-ViewAsSection/` | [68ロードマップRoadmap.md](/documents/68-ViewAsSection/68ロードマップRoadmap.md) |
| ⏳ | 69 | アプリ内通知センター<br>In-App Notification Center | **MUST** | 全ロール共通の通知ハブ<br>Unified notification hub across all roles | `documents/69-NotificationCenterSection/` | [69ロードマップRoadmap.md](/documents/69-NotificationCenterSection/69ロードマップRoadmap.md) |
| ⏳ | 70 | 特権アクション監査ログ<br>Audit Trail for Privileged Actions | **MUST** | Admin / Super Adminの全操作を記録・検索可能に<br>Log and query every admin/super admin action | `documents/70-AuditTrailSection/` | [70ロードマップRoadmap.md](/documents/70-AuditTrailSection/70ロードマップRoadmap.md) |
| ⏳ | 71 | システムヘルス監視（Super Admin限定）<br>System Health Monitoring (Super Admin only) | DEFERRABLE | AWS CloudWatchメトリクスのSuperAdmin内表示<br>Surface AWS CloudWatch metrics inside Super Admin dashboard | `documents/71-SystemHealthSection/` | [71ロードマップRoadmap.md](/documents/71-SystemHealthSection/71ロードマップRoadmap.md) |

---

### Phase 8: 収益化・Proティア / Monetization & Pro Tier

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 72 | 決済システム統合<br>Payment System Integration | **MUST** | Stripe + 地域別ゲートウェイ（bKash、Paytm、GoPay等）<br>Stripe + region-specific gateways (bKash/Paytm/GoPay) | `documents/72-PaymentSection/` | [72ロードマップRoadmap.md](/documents/72-PaymentSection/72ロードマップRoadmap.md) |
| ⏳ | 73 | Free / Pro ティア管理<br>Free / Pro Tier Management | **MUST** | 機能ゲーティング・アップグレード導線<br>Feature gating and upgrade funnels | `documents/73-TierMgmtSection/` | [73ロードマップRoadmap.md](/documents/73-TierMgmtSection/73ロードマップRoadmap.md) |
| ⏳ | 74 | サブスクリプション管理<br>Subscription Management | **MUST** | 月額・年額・更新・解約・支払い失敗回復<br>Monthly, annual, renewal, cancellation, dunning | `documents/74-SubscriptionSection/` | [74ロードマップRoadmap.md](/documents/74-SubscriptionSection/74ロードマップRoadmap.md) |
| ⏳ | 75 | 試験準備モード<br>Exam Prep Mode | **MUST** | 試験4週間前の弱点集中強化<br>Reshapes lesson composer to weak areas 4 weeks before exam | `documents/75-ExamPrepModeSection/` | [75ロードマップRoadmap.md](/documents/75-ExamPrepModeSection/75ロードマップRoadmap.md) |
| ⏳ | 76 | オフラインモード<br>Offline Mode | DEFERRABLE | 7日分のSRSをIndexedDBにキャッシュ<br>Cache 7 days of SRS reviews in IndexedDB | `documents/76-OfflineModeSection/` | [76ロードマップRoadmap.md](/documents/76-OfflineModeSection/76ロードマップRoadmap.md) |
| ⏳ | 77 | プレミアムテーマ・アバター<br>Premium Themes & Avatars | DEFERRABLE | 季節限定スキンと装飾品<br>Seasonal skins and cosmetic items | `documents/77-PremiumThemeSection/` | [77ロードマップRoadmap.md](/documents/77-PremiumThemeSection/77ロードマップRoadmap.md) |
| ⏳ | 78 | 広告統合（Free限定）<br>Ad Integration (Free only) | DEFERRABLE | ダッシュボード・セッション間広告<br>Dashboard and between-session ads | `documents/78-AdIntegrationSection/` | [78ロードマップRoadmap.md](/documents/78-AdIntegrationSection/78ロードマップRoadmap.md) |
| ⏳ | 79 | 財務ダッシュボード（Super Admin）<br>Financial Dashboard (Super Admin) | **MUST** | MRR・解約率・地域別収益・コホート分析<br>MRR, churn, revenue by region, LTV, cohort analysis | `documents/79-FinancialDashboardSection/` | [79ロードマップRoadmap.md](/documents/79-FinancialDashboardSection/79ロードマップRoadmap.md) |
| ⏳ | 80 | 第三者セキュリティ監査<br>Third-Party Security Audit | **MUST** | RBAC・課金・PII・認定試験の脆弱性検査。ローンチ前必須。<br>RBAC, billing, PII, cert exam pen test — required before launch | `documents/80-SecurityAuditSection/` | [80ロードマップRoadmap.md](/documents/80-SecurityAuditSection/80ロードマップRoadmap.md) |

---

**🏁 リリース境界線 / Release Boundary**

---

### Phase 9: AI機能・拡張 / AI Features & Expansion

| Status | No. | 開発ドメイン / Domain | 優先度 / Priority | 目的・理由 / Purpose & Rationale | 仕様書フォルダ / Docs Path | ロードマップ / Roadmap Link |
|:---:|:---:|:---|:---:|:---|:---:|:---:|
| ⏳ | 81 | Gemini AI 発音評価<br>Gemini AI Pronunciation Evaluation | DEFERRABLE | 話す練習のAI採点<br>AI scoring for speaking practice | `documents/81-AIPronunciationSection/` | [81ロードマップRoadmap.md](/documents/81-AIPronunciationSection/81ロードマップRoadmap.md) |
| ⏳ | 82 | AI適応型練習<br>AI Adaptive Practice | DEFERRABLE | 誤答履歴に基づく動的難易度調整<br>Dynamic difficulty from error history | `documents/82-AIAdaptiveSection/` | [82ロードマップRoadmap.md](/documents/82-AIAdaptiveSection/82ロードマップRoadmap.md) |
| ⏳ | 83 | AI会話パートナー<br>AI Conversation Partner | DEFERRABLE | 文法レベル合わせのチャット相手<br>Grammar-level-matched chat partner | `documents/83-AIConversationSection/` | [83ロードマップRoadmap.md](/documents/83-AIConversationSection/83ロードマップRoadmap.md) |
| ⏳ | 84 | 高度なアナリティクス<br>Advanced Analytics | DEFERRABLE | コホート横断トレンド分析<br>Cross-cohort trend analysis | `documents/84-AdvAnalyticsSection/` | [84ロードマップRoadmap.md](/documents/84-AdvAnalyticsSection/84ロードマップRoadmap.md) |
| ⏳ | 85 | N4レベル拡張<br>N4 Level Expansion | DEFERRABLE | 次レベルへの自然な進路<br>Natural next-level progression path | `documents/85-N4ExpansionSection/` | [85ロードマップRoadmap.md](/documents/85-N4ExpansionSection/85ロードマップRoadmap.md) |
| ⏳ | 86 | B2B ライセンスポータル<br>B2B Licensing Portal | DEFERRABLE | 語学学校・企業向けホワイトラベル<br>White-label for schools and corporate clients | `documents/86-B2BPortalSection/` | [86ロードマップRoadmap.md](/documents/86-B2BPortalSection/86ロードマップRoadmap.md) |
| ⏳ | 87 | カメラ監視（不正防止）<br>Camera Proctoring (Anti-cheat) | DEFERRABLE | WebRTC による試験監督<br>WebRTC-based exam invigilation | `documents/87-ProctoringSection/` | [87ロードマップRoadmap.md](/documents/87-ProctoringSection/87ロードマップRoadmap.md) |
| ⏳ | 88 | ベンガル語UI<br>Bengali UI Localization | DEFERRABLE | バングラデシュ市場の主要言語<br>Primary language for Bangladesh market | `documents/88-BengaliL10nSection/` | [88ロードマップRoadmap.md](/documents/88-BengaliL10nSection/88ロードマップRoadmap.md) |

---

## 4. エンジニア向け：実装ステータスの更新方法 / How to Update Status

各タスクのステータス絵文字を更新する際は、以下の凡例に従ってください。コミット時には `COMMIT_SKILL.md` ワークフローに沿って対応する行を更新してください。

* ⛔️ : **Not** (未設計 / Not yet designed)
* ⏳ : **To-Do** (未着手 / Not Started)
* 🏃 : **In-Progress** (実装中 / Implementing)
* ✅ : **Completed** (エンジニア完了・テスト済 / Engineer Finished & Tested)

---

## 5. バージョン管理 / Version Control

| 日付 / Date | バージョン / Ver | 内容 / Details | 担当 / Author |
|:---:|:---:|:---|:---:|
| 2026-05-26 | v1.0 | 初版作成。Manabo基盤を継承する66タスク、9フェーズ構成。<br>Initial version. 66 tasks across 9 phases, inheriting the Manabo foundation. | Yousuf |
| 2026-05-26 | v1.1 | Quick AuthをフルAuth + RBACフローに置換（14タスク）。4ロールRBAC導入。Phase 7（ロール別ダッシュボード）新設。計85タスク・10フェーズ。<br>Replaced Quick Auth with full auth/RBAC flow, inserted Phase 7 (Role-Based Dashboards). 85 tasks / 10 phases. | Yousuf |
| 2026-05-26 | v1.2 | Phase 0 task 12をGitHub + AWSパイプラインに変更。Phase 5にManaboGo N5認定試験エンジン（#48）・証明書PDF生成（#49）・公開検証ポータル（#50）・SuperAdmin証明書管理（#51）を追加。計89タスク・10フェーズ。<br>Phase 0 CI/CD updated to GitHub + AWS. Phase 5 gains 4 certification tasks (#48–51): cert exam engine, PDF generation, verification portal, Super Admin management. 89 tasks / 10 phases. | Yousuf |
| 2026-06-01 | v1.3 | ステータス更新。Phase 0: タスク3–9・11を✅に更新（認証・RBAC・設定・2FA・i18n完了）、タスク12を🏃（CI/CDパイプライン実装済み・PAT scopeブロック中）。Phase 1: タスク19・20を✅に更新（筆順アニメーション・音声再生完了）。<br>Status update. Phase 0: tasks 3–9 & 11 marked ✅ (auth, RBAC, settings, 2FA, i18n complete), task 12 marked 🏃 (CI/CD implemented, PAT scope pending). Phase 1: tasks 19 & 20 marked ✅ (stroke-order animation & audio playback complete). | Yousuf |

---

*このロードマップの更新時は、上記の表に新しい行を追加し、変更内容を要約してください。*
*When updating this roadmap, append a new row to the table above summarizing the changes.*
