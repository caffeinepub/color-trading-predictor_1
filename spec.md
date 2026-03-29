# Color Trading Predictor

## Current State
App has HomeScreen + PredictionScreen with hack mode, BDG WIN section, jackpot numbers, INJECT button, etc. User reports hack code is not working properly -- losses still occurring.

## Requested Changes (Diff)

### Add
- Brand new clean design (fresh UI)
- Fully working hack codes that ALWAYS give profit (zero loss guaranteed)
- Improved prediction logic -- hack mode = 100% BIG (5-9) + GREEN + high profit always
- New hack codes: ELITE999, VIPWIN, MASTER7, GODMODE, PROFIT777

### Modify
- Complete UI redesign -- same black/neon theme but cleaner layout
- Hack mode prediction logic: must be enforced at every single prediction call -- no fallback to random
- BIG/SMALL: BIG=5-9 (green/orange), SMALL=0-4 (red) -- enforced
- Period number auto-generation -- correct BDG WIN format

### Remove
- Old buggy prediction logic
- Any code path that allows loss in hack mode

## Implementation Plan
1. Rewrite PredictionScreen.tsx completely from scratch
2. Rewrite HomeScreen.tsx with fresh design
3. All prediction logic centralized in one function with clear hack mode check
4. Hack mode: ALWAYS returns BIG number (5-9), green color, 5x-9.9x profit
5. Normal mode: W W W W L pattern (4 wins, 1 loss per 5 trades)
6. BDG WIN section with correct period format
