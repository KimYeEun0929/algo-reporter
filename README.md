# AlgoReporter – 알고리즘 풀이 자동 리포트 생성기 (CLI)

## 프로젝트 개요

**AlgoReporter**는 알고리즘 문제 풀이 과정을 자동으로 문서화해주는 CLI 도구입니다.  
사용자는 백준(BOJ) 또는 LeetCode 문제 URL과 풀이 코드를 입력하면, LLM(OpenAI GPT 모델)을 활용해 다음을 자동 생성합니다:

- 문제 요약
- 풀이 접근 아이디어
- 시간/공간 복잡도 분석
- 대안 접근 방법
- 주석 강화 버전 코드
- 회고 섹션

생성된 리포트는 Markdown 파일(`reports/YYYY-MM-DD_<문제ID>.md`)로 저장되며, 옵션에 따라 GitHub 저장소에 자동 커밋할 수도 있습니다.

## 주요 기능

- CLI 명령어 기반:
  ```bash
  pnpm tsx src/index.ts report --url <문제URL> --code <풀이코드> --lang <언어> [--commit]
  ```
- OpenAI API(gpt-5.1-mini 등) 기반 자동 분석
- 길이가 긴 코드의 경우 핵심 함수만 발췌하여 주석 강화
- GitHub 브랜치 생성 및 자동 커밋 옵션 지원

## 설치 및 실행

1. 저장소 클론:

```
git clone https://github.com/<username>/algo-reporter.git
cd algo-reporter
```

2. 의존성 설치

```
pnpm install
```

3. 환경변수 설정:

```
cp .env.example .env
# .env 파일에 OPENAI_API_KEY 입력
```

4. 실행 예시

```
pnpm tsx src/index.ts report --url "https://www.acmicpc.net/problem/10817" --code ".\examples\10817.py" --lang python
```

## 산출물 예시

- `reports/2025-09-16_10817.md` 자동 생성
- 내부 구조:
  - 문제 요약
  - 접근 아이디어
  - 시간·공간 복잡도
  - 대안 접근
  - 주석 강화 코드
  - 회고

## 개선 방향

- 더 많은 플랫폼 지원(Programmers, Codeforces 등)
- HTML/PDF 리포트 변환 기능 추가
- 코드 실행/테스트 결과 자동 포함
