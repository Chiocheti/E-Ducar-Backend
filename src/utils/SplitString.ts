export default function SplitString(string: string) {
  if (string.length <= 30) return [string];

  const firstPart = string.slice(0, 15);
  const lastSpaceIndex = firstPart.lastIndexOf(' ');

  let line1: string = '';
  let line2: string = '';

  if (lastSpaceIndex > -1) {
    line1 = string.slice(0, lastSpaceIndex).trim();
    line2 = string.slice(lastSpaceIndex).trim();
  } else {
    line1 = firstPart;
    line2 = string.slice(30).trim();
  }

  return [line1, line2];
}
