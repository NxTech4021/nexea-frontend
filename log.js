/* eslint-disable no-plusplus */
const n = 7;

// eslint-disable-next-line no-plusplus
for (let i = 1; i < n + 1; i++) {
  for (let x = i; x < n + 1; x++) {
    console.log(`*`.repeat(i).padStart(n));
  }
}
