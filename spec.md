# Color Trading Predictor

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Number input field (0-9) that triggers prediction logic
- Three VIP display cards:
  1. **Next Prediction**: shows BIG (input 0-4) or SMALL (input 5-9)
  2. **Lucky Numbers**: shows two randomly suggested numbers based on input range
  3. **Color Signal**: shows Red, Green, or Violet based on logic
- Prediction logic:
  - 0-4 → BIG, lucky numbers from 0-4 range, Color signal cycles Red/Green/Violet
  - 5-9 → SMALL, lucky numbers from 5-9 range
- VIP luxury UI: black background, gold accents, glowing borders, neon result text
- Recent predictions history table

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store prediction history (number input, prediction result, lucky numbers, color signal, timestamp)
2. Frontend: input field, three prediction cards, history table, gold/dark VIP styling with glows
