# On-chain Tx Playbook (Sui)

_Principle: 모든 실행은 드라이런 → 명시적 실행 플래그 → 서명 순으로 진행한다._

## 환경 변수
- `SECRET_KEY` — Ed25519 private key (hex). **필수**
- `SUI_FULLNODE_URL` — 선택, 기본 mainnet.
- `EXECUTE_REAL_TX` — 기본 `false` (unset 포함). `true` 로 설정해야 실제 실행.
- Swap
  - `SWAP_INPUT_COIN_TYPE`, `SWAP_OUTPUT_COIN_TYPE`, `SWAP_AMOUNT`, `SWAP_SLIPPAGE_BPS`
- Suilend
  - `DEPOSIT_COIN_TYPE`, `DEPOSIT_AMOUNT`
- Scallop
  - `FLASH_LOAN_COIN_TYPE`, `FLASH_LOAN_AMOUNT`, `SCALLOP_PACKAGE_ID` (optional override)

`.env` 에 비밀키, `.env.public` 에 나머지 설정을 둔다.

## 공통 유틸
- `src/lib/const.ts` — 토큰 메타데이터, `normalizeCoinType`, `getReserveByCoinType`.
- `src/lib/format.ts` — `formatUnits`, `formatUsd`.
- `src/lib/simulation.ts` — `simulateOrThrow` devInspect helper.
- `src/services/suiClient.ts` — 공유 `SuiClient` 생성.
- `src/services/keypair.ts` — env 기반 signer 생성.

## 스왑 (7k MetaAg)
1) `buildSwapTx(client, sender, { amountIn, coinTypeIn, coinTypeOut, slippageBps })`
   - quote 선택, tx 구성, 프리뷰 반환.
2) `dryRunSwap` → devInspect 검증.
3) `executeSwap` — `EXECUTE_REAL_TX=true` 일 때만 서명/실행.

## Suilend Deposit
1) `buildDepositTx(client, sender, { coinType, amount })` — obligation 없으면 생성 후 deposit 작성.
2) `dryRunDeposit` → 검증.
3) `executeDeposit` — 실행 가드 동일.

## Scallop Flash Loan (실험적)
- `src/lib/scallop.ts` 커스텀 클라이언트. 패키지 ID 필요시 `SCALLOP_PACKAGE_ID` 로 교체.
- 현재 기본 패키지/수수료 오브젝트는 보수적 플레이스홀더이므로 실제 사용 전 값 검증 필요.

## 안전 가이드
- 항상 `EXECUTE_REAL_TX` unset/false 상태에서 프리뷰+드라이런 후 값을 확인.
- 소액으로 1회 실거래 후 금액을 확장.
- 서명 실패/오류 로그는 그대로 노출되므로 콘솔 캡처 후 분석.
