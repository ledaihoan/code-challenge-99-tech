# Problem 4: Three ways to sum to N (TypeScript)

## Problem
Calculate the summation from 1 to n: `sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15`

## Solutions

### sum_to_n_a: For Loop
- **Complexity:** O(n) time, O(1) space
- **Performance (n=100M):** ~46ms

### sum_to_n_b: Array Reduce
- **Complexity:** O(n) time, O(n) space
- **Performance (n=100M):** ~5.2s
- **Note:** Slowest due to array allocation

### sum_to_n_c: Mathematical Formula
- **Formula:** `n × (n + 1) / 2`
- **Complexity:** O(1) time, O(1) space
- **Performance (n=100M):** ~0.04ms
- **Recommended:** Most efficient solution

## Important Notes
- **Recursive approach:** Not implemented - exceeds maximum call stack for large n (e.g., n=100M)
- **Input constraint:** n must produce result < `Number.MAX_SAFE_INTEGER`

## Running sample
```bash
# recommended: node 20 installed
npm install
npm run start # can use ts-node solution.ts
```