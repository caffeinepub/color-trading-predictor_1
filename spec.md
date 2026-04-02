# Color Trading Predictor

## Current State
App exists with PredictionScreen.tsx (~1661 lines) and HomeScreen.tsx. Has tabs: main prediction, BDG WIN, fund, bypass. Core features are present but user reports:
1. SMALL numbers (0-4) not showing properly
2. Hack codes not always giving profit
3. User wants full working rebuild with guaranteed profit logic

## Requested Changes (Diff)

### Add
- Nothing new -- full clean rewrite of PredictionScreen.tsx to fix all bugs

### Modify
- Complete rewrite of PredictionScreen.tsx with rock-solid prediction logic
- Hack Mode: ALWAYS BIG (5-9), GREEN, 5x-9.9x profit -- zero exceptions
- SMALL (0-4): When selectedNum is 0-4, ALWAYS show two numbers from 0-4 range
- BIG (5-9): When selectedNum is 5-9, ALWAYS show two numbers from 5-9 range
- Normal mode: W W W W L pattern (4 wins, 1 loss per 5 trades)
- Loss trade: still shows correct type/color for selected number, just 0 profit
- getPrediction function: bullet-proof logic with no edge cases that flip BIG/SMALL

### Remove
- Any logic that could accidentally produce BIG numbers when SMALL is selected

## Implementation Plan
1. Rewrite getPrediction() with completely isolated BIG vs SMALL paths
2. BIG path: num1 = 5 + rand(5), num2 = 5 + rand(5), type=BIG, color=GREEN
3. SMALL path: num1 = rand(5), num2 = rand(5), type=SMALL, color=RED
4. Hack Mode check comes FIRST before anything else
5. W W W W L: tradeCount % 5 === 4 means loss, all others are win
6. Loss: isWin=false, profit=0, but keep correct type/color for the selection
7. BDG WIN section: same getPrediction logic
8. All other features (INJECT, history, BDG WIN, fund levels, bypass panel) remain same
