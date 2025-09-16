# algo-reporter

Node.js + TypeScript 기반 알고리즘 풀이 리포트 생성 CLI.

## 설치

```bash
# PNPM 권장
pnpm install
# 또는 npm
npm install
```

환경 변수 설정:

- `.env` 파일에 `OPENAI_API_KEY` 추가 또는 `algo-reporter config set openaiKey <키>` 사용

## 사용법

예시:

```bash
pnpm tsx src/index.ts report \
  --url https://www.acmicpc.net/problem/2750 \
  --code examples/2750.py \
  --lang python
```

- `--commit` 옵션을 추가하면 새 브랜치(`algo/report-<id>`)를 생성하고 커밋 후 origin으로 푸시합니다.

환경 설정:

```bash
pnpm tsx src/index.ts config set openaiKey sk-...
```

Windows/macOS 환경 변수 팁은 명령 실행 후 안내문이 출력됩니다.

## 출력

- `reports/YYYY-MM-DD_<문제ID>.md` 형식의 마크다운 파일이 생성됩니다.
- 섹션: 문제 요약, 접근, 시간·공간 복잡도, 대안 접근, 주석 강화 코드, 회고.

## 스크린샷 가이드

- 생성된 파일을 에디터에서 열고 상단 타이틀/목차가 보이도록 캡처하세요.
- 경로: `reports/` 폴더 아래 최신 파일.

## 개발

테스트 실행:

```bash
pnpm test
```

린트/포매팅:

```bash
pnpm lint
pnpm format
```

로컬 데모:

```bash
pnpm demo
```

## 제약 및 주의사항

- LLM 응답이 JSON 형식이 아닐 경우 보정 로직이 적용됩니다.
- 코드가 길면 핵심 함수만 발췌하여 주석 강화가 진행됩니다.
- Git 저장소/원격이 없거나 인증 실패 시 친절한 가이드 메시지가 출력됩니다.

## 개선 아이디어

- 플랫폼별 메타데이터(문제 제목 자동 수집)
- 템플릿 커스터마이징 옵션
- 추가 플랫폼 지원 (Programmers 등)
