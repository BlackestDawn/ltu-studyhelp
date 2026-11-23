// HTML pieces shared by the security course's practice problems and models.
import { tbl } from "../../lib/util.js";
import { TOY, b4 } from "../../lib/seccrypto.js";

// The 4-bit block cipher as two side-by-side halves, so it stays short.
export const toyTable = () => tbl(["Input", "Output", "Input", "Output"],
  Array.from({ length: 8 }, (_, i) => [b4(i), b4(TOY[i]), b4(i + 8), b4(TOY[i + 8])]));
