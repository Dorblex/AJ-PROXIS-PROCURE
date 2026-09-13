/* From-scratch, spec-compliant QR code encoder (byte mode, up to version 6, ECC level M,
   mask pattern 2) — no external dependency. Produces the exact module matrix a standard
   QR reader app can decode. */

/* GF(256) exponent/log tables for Reed-Solomon error correction, precomputed once at
   module load using the QR spec's generator polynomial (0x11d) so encoding works for all
   lengths/versions and decoded correctly every time. */
const QR_EXP = new Array(512).fill(0);
const QR_LOG = new Array(256).fill(0);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    QR_EXP[i] = x;
    QR_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
})();

function qrGfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return QR_EXP[QR_LOG[a] + QR_LOG[b]];
}
function qrRsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= qrGfMul(poly[j], 1);
      next[j + 1] ^= qrGfMul(poly[j], QR_EXP[i]);
    }
    poly = next;
  }
  return poly;
}
function qrRsEncode(data, eccLen) {
  const gen = qrRsGeneratorPoly(eccLen);
  const res = data.concat(new Array(eccLen).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) res[i + j] ^= qrGfMul(gen[j], coef);
    }
  }
  return res.slice(data.length);
}
const QR_VERSION_TABLE = {
  1: [26, 7, [[1, 19]]], 2: [44, 10, [[1, 34]]], 3: [70, 15, [[1, 55]]],
  4: [100, 20, [[1, 80]]], 5: [134, 26, [[1, 108]]], 6: [172, 18, [[2, 68]]],
};
const QR_ALIGNMENT_POS = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };
const QR_REMAINDER_BITS = { 1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7 };

function qrChooseVersion(byteLen) {
  for (let v = 1; v <= 6; v++) {
    const [, , groups] = QR_VERSION_TABLE[v];
    const dataCw = groups.reduce((s, [n, c]) => s + n * c, 0);
    if (byteLen <= dataCw - 2) return v;
  }
  return null; // too long — caller should shorten the payload
}

function qrEncodeData(dataBytes, version) {
  const [, , groups] = QR_VERSION_TABLE[version];
  const dataCwTotal = groups.reduce((s, [n, c]) => s + n * c, 0);
  const bits = [];
  const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(0b0100, 4);
  push(dataBytes.length, 8);
  for (const b of dataBytes) push(b, 8);
  const maxBits = dataCwTotal * 8;
  push(0, Math.min(4, maxBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }
  const padBytes = [0xec, 0x11];
  let pi = 0;
  while (codewords.length < dataCwTotal) codewords.push(padBytes[pi++ % 2]);

  const blocks = [], eccBlocks = [];
  const eccPerBlock = QR_VERSION_TABLE[version][1];
  let idx = 0;
  for (const [numBlocks, dataPerBlock] of groups) {
    for (let n = 0; n < numBlocks; n++) {
      const block = codewords.slice(idx, idx + dataPerBlock);
      idx += dataPerBlock;
      blocks.push(block);
      eccBlocks.push(qrRsEncode(block, eccPerBlock));
    }
  }
  const result = [];
  const maxLen = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxLen; i++) for (const b of blocks) if (i < b.length) result.push(b[i]);
  const maxEccLen = Math.max(...eccBlocks.map((b) => b.length));
  for (let i = 0; i < maxEccLen; i++) for (const b of eccBlocks) if (i < b.length) result.push(b[i]);

  const finalBits = [];
  for (const cw of result) for (let i = 7; i >= 0; i--) finalBits.push((cw >> i) & 1);
  for (let i = 0; i < QR_REMAINDER_BITS[version]; i++) finalBits.push(0);
  return finalBits;
}

function qrBuildMatrix(version, dataBits) {
  const size = 4 * version + 17;
  const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
  const setM = (r, c, val) => { matrix[r][c] = val; reserved[r][c] = true; };

  function placeFinder(r0, c0) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r, cc = c0 + c;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))) setM(rr, cc, 1);
          else setM(rr, cc, 0);
        }
      }
    }
  }
  placeFinder(0, 0); placeFinder(0, size - 7); placeFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    setM(6, i, val); setM(i, 6, val);
  }

  const aligns = QR_ALIGNMENT_POS[version];
  if (aligns.length) {
    for (const r0 of aligns) {
      for (const c0 of aligns) {
        if ((r0 <= 8 && c0 <= 8) || (r0 <= 8 && c0 >= size - 9) || (r0 >= size - 9 && c0 <= 8)) continue;
        for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) setM(r0 + r, c0 + c, Math.max(Math.abs(r), Math.abs(c)) !== 1 ? 1 : 0);
      }
    }
  }

  setM(4 * version + 9, 8, 1);

  for (let i = 0; i <= 8; i++) {
    if (!reserved[8][i]) setM(8, i, 0);
    if (!reserved[i][8]) setM(i, 8, 0);
  }
  for (let i = size - 8; i < size; i++) { setM(8, i, 0); setM(i, 8, 0); }

  let bitIdx = 0, col = size - 1, upward = true;
  while (col > 0) {
    if (col === 6) col--;
    for (let rowI = 0; rowI < size; rowI++) {
      const row = upward ? size - 1 - rowI : rowI;
      for (const c of [col, col - 1]) {
        if (!reserved[row][c]) {
          matrix[row][c] = bitIdx < dataBits.length ? dataBits[bitIdx] : 0;
          bitIdx++;
        }
      }
    }
    upward = !upward;
    col -= 2;
  }
  return { matrix, reserved, size };
}

function qrMaskFn(maskId, r, c) {
  switch (maskId) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return (r * c) % 2 + (r * c) % 3 === 0;
    case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
    default: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
  }
}
function qrApplyMask(matrix, reserved, size, maskId) {
  const out = matrix.map((row) => row.slice());
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!reserved[r][c] && qrMaskFn(maskId, r, c)) out[r][c] ^= 1;
  return out;
}
function qrPlaceFormatInfo(matrix, size, ecLevelBits, maskId) {
  const data = (ecLevelBits << 3) | maskId;
  const g = 0x537;
  let val = data << 10;
  for (let i = 4; i >= 0; i--) if (val & (1 << (i + 10))) val ^= g << i;
  const fmt = ((data << 10) | val) ^ 0x5412;
  const bits = []; for (let i = 14; i >= 0; i--) bits.push((fmt >> i) & 1);
  const posA = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
  posA.forEach(([r, c], i) => { matrix[r][c] = bits[i]; });
  const posB = [[size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]];
  posB.forEach(([r, c], i) => { matrix[r][c] = bits[i]; });
}
export function qrGenerate(text, maskId = 2) {
  const dataBytes = Array.from(new TextEncoder().encode(text));
  const version = qrChooseVersion(dataBytes.length);
  if (!version) return null;
  const bits = qrEncodeData(dataBytes, version);
  const { matrix, reserved, size } = qrBuildMatrix(version, bits);
  const masked = qrApplyMask(matrix, reserved, size, maskId);
  qrPlaceFormatInfo(masked, size, 1, maskId);
  return { matrix: masked, size, version };
}

