# My Ledger (나의 가계부)

MongoDB를 활용한 수입·지출 가계부 웹 서비스.
Node.js + Express 5 + **express-ejs-layouts** + Mongoose + JWT 로그인. (교재 `myBlog` 구조 기반)

## 빠른 시작

```bash
npm install
```

프로젝트 루트에 `.env` 작성:

```
DB_CONNECT = mongodb://127.0.0.1:27017/myLedger
JWT_SECRET = 임의의_비밀키
```

실행:

```bash
npm start      # node app.js
npm run dev    # nodemon (개발용)
```

→ http://localhost:3000 → 우측 상단 **로그인** → 회원가입 후 로그인하여 사용.

## 주요 URL

| 경로 | 설명 |
|------|------|
| `/`, `/home` | 공개 홈(소개) |
| `/about` | 서비스 소개 |
| `/admin` | 로그인 / 회원가입 |
| `/allTransactions` | 내역 목록 + 수입·지출·잔액 집계 (로그인 필요) |
| `/add` | 내역 추가 |
| `/edit/:id` | 내역 수정 (PUT) |
| `/delete/:id` | 내역 삭제 (DELETE) |
| `/logout` | 로그아웃 |

## 주요 기능

- 회원가입 / 로그인 / 로그아웃 (bcrypt 해시 + JWT 쿠키)
- 수입·지출 내역 추가 / 목록 / 수정 / 삭제 (CRUD)
- 수입·지출·잔액 자동 집계
- 사용자별 데이터 격리

## 배포

GitHub → Render(Web Service) → MongoDB Atlas. 자세한 절차는 [문서화.md](문서화.md) 참고.
Render 환경변수에 `DB_CONNECT`(Atlas `mongodb+srv://...`), `JWT_SECRET`을 등록한다.
