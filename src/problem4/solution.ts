// Implementation 1: For loop
// Time: O(n), Space: O(1)
function sum_to_n_a(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// Implementation 2: Array reduce
// Time: O(n), Space: O(n) - creates array
function sum_to_n_b(n: number): number {
    return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, curr) => acc + curr, 0);
}

// Implementation 3: Mathematical formula
// Time: O(1), Space: O(1) - most efficient
function sum_to_n_c(n: number): number {
    return (n * (n + 1)) / 2;
}

function main() {
    const n = 100_000_000;
    console.time("sum_to_n_a");
    const sumA = sum_to_n_a(n);
    console.timeEnd("sum_to_n_a");

    console.time("sum_to_n_b");
    const sumB = sum_to_n_b(n);
    console.timeEnd("sum_to_n_b");

    console.time("sum_to_n_c");
    const sumC = sum_to_n_c(n);
    console.timeEnd("sum_to_n_c");

    console.log(sumA, sumB, sumC);
}

main();