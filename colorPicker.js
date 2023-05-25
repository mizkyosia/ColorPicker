var container, rangeR, rangeG, rangeB, rangeH, rangeA, stringHEX, cctx, colorRect, cursor;
var randomizeAlpha, selectingColor, HEX = '', R = 0, G = 0, B = 0, A = 1, H = 0, Sv = 0, V = 0, Sl = 0, L = 0, min, max;
document.addEventListener('DOMContentLoaded', () => {
    container = document.getElementById('pickContainer')
    rangeR = document.getElementById('rangeR');
    rangeG = document.getElementById('rangeG');
    rangeB = document.getElementById('rangeB');
    rangeA = document.getElementById('rangeA');
    rangeH = document.getElementById('hueRange');
    stringHEX = document.getElementById('stringHEX');
    cursor = document.getElementById('colorCursor');
    cctx = document.getElementById('colorPreview').getContext('2d');
    colorRect = document.getElementById('colorRect');
    colorRect.addEventListener('contextmenu', (e) => e.preventDefault())
    colorRect.addEventListener('mousedown', (e) => {
        selectingColor = true;
        return setPointer(e);
    });
    document.addEventListener('mousemove', setPointer);
    document.addEventListener('mouseup', (e) => selectingColor = false);
    changeHEX('000000');
    drawColor();
});

function setPointer(e) {
    if (!selectingColor) return;
    e.preventDefault();
    var o = offset(colorRect);
    var left = Math.max(Math.min(e.pageX,o.right),o.left) - o.left;
    var top = Math.max(Math.min(e.pageY,o.bottom),o.top) - o.top;
    changeSv(left / 400);
    changeV((200 - top) / 200);
    cursor.style.left = `${left}px`;
    cursor.style.top = `${top}px`;
    drawColor();
    return false;
}

function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.scrollX || document.documentElement.scrollLeft,
        scrollTop = window.scrollY || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, right: rect.right + scrollLeft, bottom: rect.bottom + scrollTop }
}

function copy(s) {
    switch (s) {
        case 'HEX': return navigator.clipboard.writeText('#' + HEX);
        case 'HSV': return navigator.clipboard.writeText(`${H}°,${Sv * 100}%,${V * 100}%`);
        case 'RGB': return navigator.clipboard.writeText(`${R},${G},${B}`);
    }
}

function randomBetween(max, min = 0) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const hexDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
function randomColor() {
    let s = '';
    for (let i = 0; i < (randomizeAlpha ? 8 : 6); i++) s += hexDigits[randomBetween(15)];
    changeHEX(s);
    toHSV();
}

function drawColor() {
    cctx.fillStyle = '#' + HEX;
    cctx.clearRect(0, 0, cctx.canvas.width, cctx.canvas.height);
    cctx.fillRect(0, 0, cctx.canvas.width, cctx.canvas.height);
    cursor.style.boxShadow = `inset 0 0 0 5px #${HEX}`;
    colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${A}), transparent), linear-gradient(to right, rgba(255,255,255,${A}), hsla(${H},100%,50%,${A})), url(transparent-bg.png)`;
}

function showPicker() {
    container.style.display = 'flex';
}

function hidePicker() {
    container.style.display = 'none';
}

function changeHEX(h, e = false) {
    HEX = h;
    if (!fromHEX()) return;
    stringHEX.value = h;
    if (e) return;
    rangeR.style.background = `linear-gradient(to right, rgba(0,${G},${B},${A}), rgba(255,${G},${B},${A}))`;
    rangeG.style.background = `linear-gradient(to right, rgba(${R},0,${B},${A}), rgba(${R},255,${B},${A}))`;
    rangeB.style.background = `linear-gradient(to right, rgba(${R},${G},0,${A}), rgba(${R},${G},255,${A}))`;
    rangeA.style.background = `linear-gradient(to right, rgba(${R},${G},${B},0), rgba(${R},${G},${B},1))`;
    drawColor();
}

function changeR(r, e = false) {
    R = parseInt(r);
    document.getElementById('intR').value = r;
    rangeR.value = r;
    if (e) return;
    toHEX();
    toHSV();
    stringHEX.value = HEX;
    rangeG.style.background = `linear-gradient(to right, rgba(${R},0,${B},${A}), rgba(${R},255,${B},${A}))`;
    rangeB.style.background = `linear-gradient(to right, rgba(${R},${G},0,${A}), rgba(${R},${G},255,${A}))`;
    rangeA.style.background = `linear-gradient(to right, rgba(${R},${G},${B},0), rgba(${R},${G},${B},255))`;
    colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${A}), transparent), linear-gradient(to right, rgba(255,255,255,${A}), hsla(${H},100%,50%,${A})), url(transparent-bg.png)`;
    drawColor();
}

function changeG(g, e = false) {
    G = parseInt(g);
    document.getElementById('intG').value = g;
    rangeG.value = g;
    if (e) return;
    toHEX();
    toHSV();
    stringHEX.value = HEX;
    rangeR.style.background = `linear-gradient(to right, rgba(0,${G},${B},${A}), rgba(255,${G},${B},${A}))`;
    rangeB.style.background = `linear-gradient(to right, rgba(${R},${G},0,${A}), rgba(${R},${G},255,${A}))`;
    rangeA.style.background = `linear-gradient(to right, rgba(${R},${G},${B},0), rgba(${R},${G},${B},255))`;
    colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${A}), transparent), linear-gradient(to right, rgba(255,255,255,${A}), hsla(${H},100%,50%,${A})), url(transparent-bg.png)`;
    drawColor();
}

function changeB(b, e = false) {
    B = parseInt(b);
    document.getElementById('intB').value = b;
    rangeB.value = b;
    if (e) return;
    toHEX();
    toHSV();
    stringHEX.value = HEX;
    rangeR.style.background = `linear-gradient(to right, rgba(0,${G},${B},${A}), rgba(255,${G},${B},${A}))`;
    rangeG.style.background = `linear-gradient(to right, rgba(${R},0,${B},${A}), rgba(${R},255,${B},${A}))`;
    rangeA.style.background = `linear-gradient(to right, rgba(${R},${G},${B},0), rgba(${R},${G},${B},255))`;
    colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${A}), transparent), linear-gradient(to right, rgba(255,255,255,${A}), hsla(${H},100%,50%,${A})), url(transparent-bg.png)`;
    drawColor();
}

function changeA(a, e = false) {
    A = parseFloat(a);
    document.getElementById('floatA').value = a;
    rangeA.value = a
    if (e) return;
    toHEX();
    toHSV();
    stringHEX.value = HEX;
    rangeR.style.background = `linear-gradient(to right, rgba(0,${G},${B},${A}), rgba(255,${G},${B},${A}))`;
    rangeG.style.background = `linear-gradient(to right, rgba(${R},0,${B},${A}), rgba(${R},255,${B},${A}))`;
    rangeB.style.background = `linear-gradient(to right, rgba(${R},${G},0,${A}), rgba(${R},${G},255,${A}))`;
    colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${A}), transparent), linear-gradient(to right, rgba(255,255,255,${A}), hsla(${H},100%,50%,${A})), url(transparent-bg.png)`;
    drawColor();
}

function changeH(h, e = false) {
    H = parseInt(h);
    rangeH.value = h;
    if (e) return;
    fromHSV();
    toHEX();
    colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${A}), transparent), linear-gradient(to right, rgba(255,255,255,${A}), hsla(${H},100%,50%,${A})), url(transparent-bg.png)`;
    drawColor();
}

function changeSv(s, e = false) {
    Sv = parseFloat(s);
    if (e) return;
    fromHSV();
    toHEX();
    drawColor();
}

function changeV(v, e = false) {
    V = parseFloat(v);
    if (e) return;
    fromHSV();
    toHEX();
    drawColor();
}

function fromHEX() {
    if (HEX.length == 6 || HEX.length == 8) {
        changeR(parseInt(HEX.substring(0, 2), 16), true);
        changeG(parseInt(HEX.substring(2, 4), 16), true);
        changeB(parseInt(HEX.substring(4, 6), 16), true);
        changeA(HEX.length == 8 ? parseInt(HEX.substring(6, 8), 16) / 255 : 1, true);
        return true;
    } else if (HEX.length == 3 || HEX.length == 4) {
        changeR(parseInt(HEX.substring(0, 1).repeat(2), 16), true);
        changeG(parseInt(HEX.substring(1, 2).repeat(2), 16), true);
        changeB(parseInt(HEX.substring(2, 3).repeat(2), 16), true);
        changeA(HEX.length == 4 ? parseInt(HEX.substring(3, 4).repeat(2), 16) / 255 : 1, true);
        return true;
    }
    return false;
}

function toHEX() {
    var r = R.toString(16).toUpperCase();
    if (r.length == 1) r = '0' + r;
    var g = G.toString(16).toUpperCase();
    if (g.length == 1) g = '0' + g;
    var b = B.toString(16).toUpperCase();
    if (b.length == 1) b = '0' + b;
    HEX = r + g + b;
    if (A != 1) {
        var a = Math.round(A * 255).toString(16).toUpperCase();
        if (a.length == 1) a = '0' + a;
        HEX += a;
    }
    changeHEX(HEX);
}

function fromHSV() {
    let hi = Math.floor(H / 60) % 6, f = H / 60 - hi, p = V * (1 - Sv), q = V * (1 - f * Sv), t = V * (1 - (1 - f) * Sv), r, g, b;
    if (hi == 0) [r, g, b] = [V, t, p];
    else if (hi == 1) [r, g, b] = [q, V, p];
    else if (hi == 2) [r, g, b] = [p, V, t];
    else if (hi == 3) [r, g, b] = [p, q, V];
    else if (hi == 4) [r, g, b] = [t, p, V];
    else[r, g, b] = [V, p, q];
    changeR(Math.round(255 * r), true);
    changeG(Math.round(255 * g), true);
    changeB(Math.round(255 * b), true);
}

function toHSV() {
    max = Math.max(R, G, B);
    min = Math.min(R, G, B);
    if (max == min) changeH(0,true);
    else if (max == R) changeH(60 * (G - B) / (max - min) + (G < B ? 360 : 0),true);
    else if (max == G) changeH(60 * (B - R) / (max - min) + 120,true);
    else if (max == B) changeH(60 * (R - G) / (max - min) + 240,true);
    changeSv((max == 0) ? 0 : 1 - min / max);
    changeV(max / 255);
    cursor.style.left = `${Sv * 400}px`;
    cursor.style.top = `${200-V * 200}px`
}

function toHSL() {

}

class ColorPicker {
    constructor() {

    }
}