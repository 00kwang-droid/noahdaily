# 오늘의 나 · Daily Self

테니스 선수를 위한 매일 **태도·성실·열정** 체크리스트 + 일지 PWA.
같은 URL을 여는 사람(부모)은 아들의 점수와 일지를 실시간으로 함께 봅니다.

## 파일 구성

```
index.html                     앱 본체 (단일 파일)
manifest.json                  PWA 매니페스트
sw.js                          서비스워커 (오프라인 캐시)
firestore.rules                Firestore 보안 규칙
icon-192.png                   ★ 아이콘은 index.html과 같은 위치(루트)
icon-512.png
icon-512-maskable.png
icons/                         (예전 경로 호환용 복사본 · 없어도 동작)
  ├─ icon-192.png
  ├─ icon-512.png
  └─ icon-512-maskable.png
```

> **아이콘 경로 주의**: `manifest.json`은 `./icon-192.png` 처럼 **루트 기준**으로
> 아이콘을 가리킵니다. 아이콘을 교체할 때는 반드시 `index.html`과 **같은 폴더**에
> 같은 파일명으로 덮어쓰세요. 경로가 하나라도 404가 나면 크롬은 설치 대신
> '바로가기 만들기'만 보여줍니다.

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

앱을 수정해 다시 올릴 때 화면이 안 바뀌면, `sw.js`의 `CACHE = 'daily-self-v5'`
버전을 `v6`, `v7`... 로 올려서 커밋하면 캐시가 갱신됩니다.

---

## Android APK (선택 · PWABuilder)

1. GitHub Pages 주소가 정상 동작하는지 확인
2. https://www.pwabuilder.com 접속 → 주소 입력 → **Package for stores → Android**
3. 생성된 패키지 안내대로 진행
4. TWA로 감쌀 경우 `assetlinks.json`은 PWABuilder가 안내해주는 값을
   저장소의 `.well-known/assetlinks.json` 에 올리면 주소창 없이 전체화면으로 실행됩니다.

---

## 설치가 안 되고 '바로가기 만들기'만 나올 때

크롬은 아래 조건을 **모두** 만족해야 '설치'를 띄웁니다. 하나라도 어긋나면
조용히 '바로가기'로 내려갑니다.

| 조건 | 확인 방법 |
|---|---|
| HTTPS | GitHub Pages는 기본 충족 |
| `manifest.json` 200 응답 | 주소 뒤에 `/manifest.json` 직접 열어보기 |
| 192px + 512px PNG 아이콘이 **실제로 열림**, `purpose:"any"` 포함 | 주소 뒤에 `/icon-192.png` 직접 열어보기 |
| `display`가 standalone 등 | 이미 설정됨 |
| fetch 핸들러가 있는 서비스워커 | 이미 설정됨 |

**가장 흔한 원인 2가지**

1. **아이콘 파일 경로 불일치** — 매니페스트는 `icons/icon-192.png`를 가리키는데
   실제 파일은 루트에 올렸다(또는 그 반대). → 404 → 설치 불가.
2. **서비스워커 캐시** — 옛 `sw.js`는 `manifest.json`과 아이콘을 *캐시 우선*으로
   돌려줬습니다. 그래서 아이콘을 새로 올려도 브라우저는 **옛 매니페스트/옛 아이콘**을
   보고 계속 404 상태로 판단합니다. v5부터 매니페스트·아이콘은 네트워크 우선으로
   바뀌어 이 문제가 사라집니다.

**적용 후 반드시 할 것 (캐시 청소)**

1. 파일을 전부 다시 올리고 몇 분 대기(GitHub Pages 반영)
2. 안드로이드 크롬: `설정 → 개인정보 → 인터넷 사용 기록 삭제 → 캐시된 이미지·파일`
   또는 사이트 정보(자물쇠) → `쿠키 및 사이트 데이터 → 데이터 삭제`
3. 앱을 다시 열면 화면 하단에 **[앱 설치]** 초록 버튼이 뜹니다.
   이 버튼이 보이면 설치 조건 통과입니다. (버튼이 안 뜨면 아직 조건 미달이거나
   이미 설치된 상태)

**PC 크롬으로 원인 확인하기**
F12 → `Application` 탭 → `Manifest`. 빨간 경고가 있으면 그 문장이 곧 원인입니다.
같은 화면 아래 `Service Workers`에서 `Unregister` 후 새로고침하면 완전 초기화됩니다.

---

## 사용법 요약

- **점수부여 탭**: 항목을 탭하면 즉시 저장. 태도·성실·열정 3개 점수 + 종합점수가 자동 계산됨. 상단 날짜바로 지난 날도 열람/수정 가능(미래는 잠금).
- **일지 탭**: 그날의 반성/계획 작성 후 저장.
- **캘린더 탭**: 날짜별 종합점수 색상 표시, 탭하면 그날의 3점수 + 일지 상세.
- **설정(⚙️)**: 언어(한/영/일) 전환, 체크리스트 항목 추가·수정·삭제(언어별 입력 가능).
