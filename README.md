## TODO

- [x] react 프로젝트 생성 (rn 웹뷰 프로젝트 템플릿 생성)
- [x] react native 프로젝트 생성 (rn 웹뷰 프로젝트 템플릿)
- [x] Vercel 배포 (웹)
- [x] 임시 다운로드 버튼 및 file-saver 사용 (웹)
- [x] 임시 zip 파일 다운로드 기능 (수동으로 zip 만들어서 넣어보는 것)
- [x] 템플릿 파일 생성 기능 (node 환경에서 스크립트로 생성)
- [x] 안드로이드 템플릿 테스트
- [ ] 템플릿 소스 추가 (네비게이션, 웹뷰, 등)

- react native 기능 추가 (웹뷰 등등)
- 웹 react 페이지 디자인 + 환경세팅 설명

```
[웹 페이지] (체크박스/입력값)
    ↓
[JS로 템플릿 ZIP 열기 + 수정(JSZip)]
    ↓
[커스터마이징된 ZIP 생성]
    ↓
[file-saver로 다운로드]
```

### 목표

CJ Freshway 프로젝트에서 축적한 React Native WebView 개발 경험을 템플릿 생성기로 만들어 팀 내에서 재사용 가능하게 함

### 벤치마크

**Spring Initializr** - 웹에서 옵션 선택 → 프로젝트 ZIP 다운로드

## 핵심 요구사항

### 1. 기본 기능

**웹 페이지에서 체크박스 선택 → React Native WebView 프로젝트 ZIP 생성**

### 2. 자동 설정 항목

사용자가 선택한 옵션에 따라 아래 설정이 자동으로 포함되어야 함:

#### 앱 권한 (Permissions)

- 카메라
- 사진 라이브러리
- 위치 정보
- 푸시 알림
- 파일 접근
- 등...

#### 결제 모듈

- KCP 결제
- 카카오페이
- 네이버페이

#### 보안 기능

- 탈옥/루팅 감지
- SSL Pinning

#### 환경 설정

- Development
- Staging
- Production

### 3. 생성 결과물

- **즉시 실행 가능한** React Native 프로젝트
- iOS: `Info.plist` 권한 자동 설정
- Android: `AndroidManifest.xml` 권한 자동 설정
- 필요한 Native Module 보일러플레이트 포함
- `package.json`에 dependencies 자동 추가

## 기술적 질문사항

### Q1. 서버가 필요한가?

**답변:**

- ❌ 필수 아님
- ✅ 클라이언트 사이드만으로 구현 가능
- 브라우저에서 JSZip으로 파일 생성 → 다운로드

### Q2. React Native CLI를 웹에서 실행?

**답변:**

- ❌ 불가능
- ✅ 미리 준비한 템플릿 프로젝트를 복사/수정하는 방식

### Q3. 필요한 기술 스택

```
Frontend:
- React (웹 페이지)
- JSZip (ZIP 파일 생성)
- file-saver (파일 다운로드)

Template:
- React Native 0.73+ 베이스 프로젝트
- 옵션별 추가 모듈 (사전 준비)

Hosting:
- GitHub Pages / Vercel (무료)
```

---

## 개발 난이도별 접근

### Phase 1: 최소 버전 (1-2일)

```
[웹 페이지]
  ↓
[다운로드 버튼]
  ↓
[미리 만든 기본 템플릿.zip]
```

- 옵션 선택 없음
- 고정된 템플릿 하나만 제공

### Phase 2: 옵션 선택 (1주)

```
[웹 페이지]
  ↓
[체크박스 3-5개]
- □ KCP 결제
- □ 탈옥 감지
- □ 푸시 알림
  ↓
[생성 버튼]
  ↓
[커스터마이징된 프로젝트.zip]
```

### Phase 3: 고도화 (필요시)

- 프로젝트 이름 입력
- Bundle ID 설정
- 더 많은 옵션
- 설정 미리보기
