# 오늘의 나 · Daily Self

테니스 선수를 위한 매일 **태도·성실·열정** 체크리스트 + 일지 PWA.
같은 URL을 여는 사람(부모)은 아들의 점수와 일지를 실시간으로 함께 봅니다.

## 파일 구성

```
index.html                     앱 본체 (단일 파일)
manifest.json                  PWA 매니페스트
sw.js                          서비스워커 (오프라인 캐시)
firestore.rules                Firestore 보안 규칙
icons/
  ├─ icon-192.png
  ├─ icon-512.png
  └─ icon-512-maskable.png
```

## 배포 전 딱 두 군데만 수정

`index.html` 안 `<script type="module">` 상단:

1. **`firebaseConfig`** — Firebase 콘솔에서 복사한 값 붙여넣기 (아래 설정법 참고)
2. **`FAMILY_ID`** — 지금은 `"jaea-family"`. 아무 문자열로 바꿔도 됨. 이 값이 곧 '가족 열쇠'.

---

## Firebase 설정법 (처음 1회)

### 1. 프로젝트 만들기
1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. 프로젝트 이름 입력(예: `daily-self`) → 애널리틱스는 꺼도 됨 → 생성

### 2. Firestore 데이터베이스 켜기
1. 왼쪽 메뉴 **빌드 → Firestore Database** → **데이터베이스 만들기**
2. 위치는 `asia-northeast3 (서울)` 권장
3. 모드는 아무거나 선택 후 생성 (규칙은 4단계에서 덮어씀)

### 3. 웹앱 등록 → config 복사
1. 프로젝트 개요 옆 **⚙️ → 프로젝트 설정**
2. 아래로 스크롤 → **내 앱** → **웹(`</>`)** 아이콘 클릭
3. 앱 닉네임 입력 후 등록 (호스팅 체크는 안 해도 됨)
4. 나오는 `firebaseConfig` 객체를 통째로 복사해서 `index.html`의 같은 자리에 붙여넣기

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "daily-self.firebaseapp.com",
  projectId: "daily-self",
  storageBucket: "daily-self.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234...:web:abcd..."
};
```

### 4. 보안 규칙 적용
1. **Firestore Database → 규칙** 탭
2. 이 저장소의 `firestore.rules` 내용을 붙여넣고 **게시**
3. 이러면 `families/...` 경로만 열리고 나머지는 차단됩니다.

> 참고: `apiKey`는 비밀번호가 아니라 프로젝트를 가리키는 공개 식별자입니다.
> 실제 접근 통제는 위 **규칙**이 담당합니다. 완전개방이라 'URL을 아는 사람'은
> 누구나 읽고 쓸 수 있으니, GitHub Pages 주소 관리에 유의하세요.

---

## GitHub Pages 배포

1. 새 저장소 생성 후 이 폴더의 모든 파일을 그대로 올림 (`index.html`이 루트에 있어야 함)
2. 저장소 **Settings → Pages → Branch: main / (root)** 선택 후 저장
3. 몇 분 뒤 `https://<계정>.github.io/<저장소>/` 로 접속
4. 이 주소를 아들 폰과 부모 폰에 각각 열고 **홈 화면에 추가**하면 앱처럼 실행됨

앱을 수정해 다시 올릴 때 화면이 안 바뀌면, `sw.js`의 `CACHE = 'daily-self-v1'`
버전을 `v2`, `v3`... 로 올려서 커밋하면 캐시가 갱신됩니다.

---

## Android APK (선택 · PWABuilder)

1. GitHub Pages 주소가 정상 동작하는지 확인
2. https://www.pwabuilder.com 접속 → 주소 입력 → **Package for stores → Android**
3. 생성된 패키지 안내대로 진행
4. TWA로 감쌀 경우 `assetlinks.json`은 PWABuilder가 안내해주는 값을
   저장소의 `.well-known/assetlinks.json` 에 올리면 주소창 없이 전체화면으로 실행됩니다.

---

## 사용법 요약

- **점수부여 탭**: 항목을 탭하면 즉시 저장. 태도·성실·열정 3개 점수 + 종합점수가 자동 계산됨. 상단 날짜바로 지난 날도 열람/수정 가능(미래는 잠금).
- **일지 탭**: 그날의 반성/계획 작성 후 저장.
- **캘린더 탭**: 날짜별 종합점수 색상 표시, 탭하면 그날의 3점수 + 일지 상세.
- **설정(⚙️)**: 언어(한/영/일) 전환, 체크리스트 항목 추가·수정·삭제(언어별 입력 가능).
