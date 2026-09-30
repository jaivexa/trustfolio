import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader, Noto_Sans_Tamil, Noto_Serif_Tamil } from "next/font/google";

/**
 * Type system:
 *  • Latin UI/body: Geist · Latin headings: Newsreader (editorial serif)
 *  • Tamil body: Noto Sans Tamil · Tamil headings: Noto Serif Tamil
 * Tamil families follow the Latin ones in each stack, so mixed-script text
 * renders each glyph with the right face.
 */
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

const tamilSans = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil-sans",
  display: "swap",
});

const tamilSerif = Noto_Serif_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil-serif",
  display: "swap",
});

export const fontVariables = [
  GeistSans.variable,
  GeistMono.variable,
  serif.variable,
  tamilSans.variable,
  tamilSerif.variable,
].join(" ");
