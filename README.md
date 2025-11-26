## TODO

- [x] react 프로젝트 생성 (rn 웹뷰 프로젝트 템플릿 생성)
- [x] react native 프로젝트 생성 (rn 웹뷰 프로젝트 템플릿)
- [x] Vercel 배포 (웹)
- [x] 임시 다운로드 버튼 및 file-saver 사용 (웹)
- [x] 임시 zip 파일 다운로드 기능 (수동으로 zip 만들어서 넣어보는 것)
- [x] 템플릿 파일 생성 기능 (node 환경에서 스크립트로 생성)
- [x] 안드로이드 템플릿 테스트

RN 템플릿 쪽 작업 진행 (네비게이션, 웹뷰, 등)

- 웹뷰 관련 옵션 추가
- [x] 웹뷰쉘, 웹뷰 로딩,에러처리, 네비게이션 제어
  - [x] WebView 크래시 시 리로드/리마운트 패턴 추가
  - [x] 로딩/에러 오버레이 공통 처리
  - [x] 전화/SMS/메일 스킴은 외부 앱으로 열기. 허용되지 않은 호스트는 Linking.openURL 로 브라우저로 보내기.
- [x] 웹뷰 치환 config

  - [x] 웹뷰 URL
  - [x] 추가 허용 도메인 (ALLOW_HOSTS + SENTINEL 치환)
  - [x] 디버깅 여부 (WEBVIEW_DEBUGGING_ENABLED 플레이스홀더 + 체크박스)

- 앱 권한 관련 옵션 추가
  - [x] 최초 진입 앱권한 화면보여주기 여부
    - [x] PermissionGuide.tsx + AsyncStorage 플래그 저장
    - [x] Stack.with-permission / Stack.without-permission 두 버전 분리
    - [x] USE_PERMISSION_GUIDE 플래그 제거 (버전 선택 방식으로 대체)

웹 제너레이터 작업

- [x] 빌드 산출물 폴더 ignore 해서 용량 폭발 및 2GB 초과 에러 해결
- [x] 경로 처리 버그 수정
- [x] ZIP 치환 로직

  - [x] arrayBuffer 로 읽고, JSZip.loadAsync 로 오픈
  - [x] 파일을 찾고, 문자열로 읽기

- 웹뷰 관련 옵션 추가
- [x] 웹뷰 설정 카드 (카테고리화), 공통 폼 스타일
- [x] WEBVIEW_URI 치환
- [x] ALLOW_HOSTS 치환 (추가 허용 도메인 SENTINEL 기반 삽입)

- 앱 권한 관련 옵션 추가
- [x] 네비게이션 Stack 파일 치환
  - [x] Stack.with-permission.tsx / Stack.without-permission.tsx 중 선택
  - [x] 최종 ZIP 에서는 두 템플릿 파일 제거, Stack.tsx 만 남기기
- [x] package.json 파일 수정
  - [x] 권한안내 화면 옵션 ON 시 AsyncStorage 의존성 보장
  - [x] 권한안내 화면 옵션 OFF 시 AsyncStorage 의존성 제거 (버전 분리 기반으로 안전하게)
- [x] 앱 최초 실행 시 권한 안내 화면 옵션 UI (체크박스) 및 상태(usePermissionGuide) 연동

---

### 해야할 것 일단 작성

- react native 기능 추가 (웹뷰 등등)
- 웹 react 페이지 디자인 + 환경세팅 설명

---

#### 이슈 생각 정리

이슈 1: package.json 파일 치환

문제: 권한 옵션에 따라 의존성을 어떻게 추가/제거?
해결: JSON 파싱 → 수정 → 덮어쓰기

이슈 2: 네비게이션 파일 치환

문제: Stack.tsx 파일을 옵션에 따라 어떻게 교체?
해결: Stack.with-permission.tsx와 Stack.without-permission.tsx 두 버전을 미리 준비하고, 제너레이터에서 선택된 버전으로 Stack.tsx 생성 후 템플릿 파일 제거

이슈 3: 소스코드 에러 방지

문제: 파일 제거 시 소스코드 에러 발생 우려
해결: 버전을 파일로 분리하고 제너레이터가 선택만 하는 구조로 설계

---

### 템플릿 생성 프로세스

```
[웹 페이지] (체크박스/입력값)
      ↓
  [JSZip으로 템플릿 ZIP 열기]
      ↓
  [플레이스홀더 치환]
    - WEBVIEW_URI → 사용자 입력 URL
    - ALLOW_HOSTS → 추가 허용 도메인 배열
    - WEBVIEW_DEBUGGING_ENABLED → true/false
    - Stack.tsx → with-permission 또는 without-permission 버전 선택
      ↓
  [커스터마이징된 ZIP 생성]
      ↓
  [file-saver로 다운로드]
```

### 프로세스 설명

“템플릿에서 코드를 다 만들어두고, 제너레이터는 그 코드 안의 플레이스홀더를 치환만 하는 구조”

- WEBVIEW_URI 외에 나중에 옵션화하고 싶은 것들도 전부 플레이스홀더 상수/파일로 정리해두기
  (“변경될 가능성이 있는 값은 하드코딩하지 말고 전부 플레이스홀더 상수로 몰아두기”)
- 제너레이터는 “파일 시스템 대신 ZIP 안의 파일을 편집하는 에디터” 역할만 하면 되고, 앱의 구조/로직은 전부 rnBaseTemplate 쪽에서 관리

---

`2025.11.24 ~ `
목표:
웹에서 옵션을 선택하면, React Native WebView 템플릿 프로젝트 ZIP 을 생성해 내려주는 “템플릿 제너레이터”를 만들고,
그 안에서 웹뷰 URL / 허용 도메인 / WebView 기본 패턴을 재사용 가능하게 정리.

---

`2025.11.20 ~ `

# 🚀 React Native WebView Template Generator

> CJ Freshway 프로젝트에서 축적한 React Native WebView 개발 경험을 재사용 가능한 템플릿 생성기로 구현

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.82.1-blue)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

## 프로젝트 소개

**Spring Initializr**처럼 웹에서 옵션을 선택하면 커스터마이징된 React Native WebView 프로젝트 ZIP을 생성해주는 템플릿 제너레이터입니다.

### 핵심 가치

- ✅ **웹에서 옵션 선택** → React Native WebView 프로젝트 ZIP 다운로드
- ✅ **즉시 실행 가능** → 다운로드 후 `npm install && npm run ios/android` 만으로 실행
- ✅ **팀 내 재사용** → 검증된 WebView 패턴을 템플릿화하여 생산성 향상

---

## 주요 기능

### 1. WebView 핵심 기능 (완료)

- **WebView Shell** - 크래시 시 자동 리로드/리마운트
- **로딩/에러 처리** - 공통 오버레이 UI
- **네비게이션 제어** - 전화/SMS/메일 스킴 외부 앱 연동
- **보안** - 허용되지 않은 호스트는 외부 브라우저로 이동

### 2. 설정 자동화 (완료)

- **WebView URL 치환** - `WEBVIEW_URI` 플레이스홀더
- **허용 도메인 관리** - `ALLOW_HOSTS` 배열 자동 생성
- **디버깅 모드** - `WEBVIEW_DEBUGGING_ENABLED` 옵션
- **권한 안내 화면** - 선택적 초기 권한 가이드 (`PermissionGuide.tsx`)

### 3. 제너레이터 기능 (완료)

- **ZIP 생성** - JSZip으로 클라이언트 사이드에서 프로젝트 생성
- **플레이스홀더 치환** - 템플릿 내 설정값 자동 교체
- **의존성 관리** - 권한 옵션에 따라 `package.json` 자동 수정
- **파일 선택** - Stack.with-permission / Stack.without-permission 중 자동 선택

---

### 고도화 (필요시)

- 프로젝트 이름 입력
- Bundle ID 설정
- 더 많은 옵션
- 설정 미리보기
