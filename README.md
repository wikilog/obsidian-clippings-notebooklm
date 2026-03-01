# Clippings NotebookLM

Obsidian 플러그인 - Clippings 폴더의 마크다운 파일을 NotebookLM AI로 분석하여 요약 + PPT를 자동 생성합니다.

## 기능

- Clippings 폴더의 md 파일에 **"NotebookLM으로 PPT 만들기"** 버튼 자동 표시
- 3가지 리포트 모드 선택:
  - 📋 **자세한 리포트** - 전문가 대상, 8-12 슬라이드
  - ⚡ **핵심 리포트** - C-레벨 임원 대상, 5-8 슬라이드
  - 🌱 **쉬운 리포트** - 비전문가 대상, 5-8 슬라이드
- AI 요약을 md 파일 상단에 callout으로 삽입
- PPTX 파일 자동 생성 및 링크 삽입

## 전제 조건

### notebooklm-mcp-cli 설치

```bash
uv tool install notebooklm-mcp-cli
```

### Google 계정 로그인

```bash
nlm login
```

브라우저에서 Google 계정으로 로그인하면 인증이 완료됩니다.

## 설치

### 수동 설치

1. 이 저장소를 클론합니다:
   ```bash
   git clone https://github.com/wikilog/obsidian-clippings-notebooklm.git
   cd obsidian-clippings-notebooklm
   ```

2. 의존성을 설치하고 빌드합니다:
   ```bash
   npm install
   npm run build
   ```

3. `main.js`, `manifest.json`, `styles.css`를 Obsidian vault의 `.obsidian/plugins/clippings-notebooklm/` 폴더에 복사합니다.

4. Obsidian 설정 → Community plugins에서 **Clippings NotebookLM**을 활성화합니다.

## 사용법

1. **설정** → **Clippings NotebookLM** → **NotebookLM 로그인** 버튼으로 인증
2. Clippings 폴더의 md 파일을 열면 상단에 버튼이 표시됨
3. 버튼 클릭 → 리포트 모드 선택 → AI가 요약 및 PPT 자동 생성

### 결과물 예시

```markdown
---
title: "Cross-functional 조직에서 일 잘하는 법"
source: "https://brunch.co.kr/..."
tags: [clippings]
---

> [!summary] AI 요약
> Cross-functional 조직에서의 협업 핵심은...
> 주요 포인트: 1) ... 2) ... 3) ...
>
> 📎 **PPT:** [[Clippings/PDF/Cross-functional 조직에서 일 잘하는 법.pptx]]

# Cross-functional 조직에서 일 잘하는 법
(원본 내용...)
```

## 설정 옵션

| 설정 | 기본값 | 설명 |
|------|--------|------|
| nlm CLI 경로 | `nlm` | notebooklm-mcp-cli 실행 경로 |
| Clippings 폴더 | `Clippings` | 버튼을 표시할 폴더 |
| 출력 서브폴더 | `PDF` | PPT 파일 저장 서브폴더 |

## 개발

```bash
npm install
npm run dev    # 개발 모드 (watch)
npm run build  # 프로덕션 빌드
npm run deploy # 빌드 + Obsidian vault에 복사
```

## 기술 스택

- TypeScript + esbuild
- [pptxgenjs](https://github.com/gitbrent/PptxGenJS) - PPTX 생성
- [notebooklm-mcp-cli](https://github.com/nicholasgasior/notebooklm-mcp) - NotebookLM 연동

## 라이선스

MIT
