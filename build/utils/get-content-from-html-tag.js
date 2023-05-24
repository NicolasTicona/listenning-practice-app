"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceStringPortion = void 0;
function replaceStringPortion(replaced, replacing, txt) {
    // Reemplaza replaced por replacing en txt
    if (!txt.includes(replaced)) {
        return txt;
    }
    for (let i = 0; i < txt.length; i++) {
        if (txt.substring(i, i + replaced.length) == replaced) {
            txt = txt.substring(0, i) + replacing + txt.substring(i + replaced.length, txt.length);
        }
    }
    return txt;
}
exports.replaceStringPortion = replaceStringPortion;
