export function replaceStringPortion(replaced: string, replacing: string, txt: string) {
  // Reemplaza replaced por replacing en txt

  if (!txt.includes('replaced')) {
    return txt;
  }

  for (var i = 0; i < txt.length; i++) {
    if (txt.substring(i, i + replaced.length) == replaced) {
      txt = txt.substring(0, i) + replacing + txt.substring(i + replaced.length, txt.length);
    }
  }
  return txt;
}
