const hexDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

/** Returns offset of the given Element's `top`, `bottom`, `right` and `left` values compared to the top-left corner of the page (not the viewport)
 * @param {HTMLElement} e 
 */
function rect(e) {
    var rect = e.getBoundingClientRect(),
        scrollLeft = window.scrollX || document.documentElement.scrollLeft,
        scrollTop = window.scrollY || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, right: rect.right + scrollLeft, bottom: rect.bottom + scrollTop, width: rect.right - rect.left, height: rect.bottom - rect.top }
}

/** Clamps value `v` in interval [`min`,`max`]
 * @param {number} v 
 * @param {number} min 
 * @param {number} max 
 */
function clamp(v, min, max) {
    return Math.min(max, Math.max(v, min));
}

/** Outputs random floating number in range [`min`,`max`[
 * @param {number} max 
 * @param {number} min 
 */
function randomBetween(max, min = 0) {
    return Math.random() * (max - min) + min;
}

class ColorPicker {
    // HTML Elements properties
    container;
    rangeR;
    rangeG;
    rangeB;
    rangeH;
    rangeA;
    stringHEX;
    ctx;
    colorRect;
    cursor;

    // Values properties
    randomizeAlpha;
    selectingColor = false;
    HEX = '';
    R = 0;
    G = 0;
    B = 0;
    A = 1;
    H = 0;
    Sv = 0;
    V = 0;
    Sl = 0;
    L = 0;

    lastHEXColor = '000000';

    constructor() {
        if (document.getElementById('colorPickerMainContainer')) return console.log('Request aborted : color picker already present in document');
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/colorPicker.html", true);
        xhr.responseType = "text";
        var CSS = false;
        xhr.onload = () => {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                if (!CSS) {
                    document.body.innerHTML += xhr.responseText;
                    CSS = true;
                    xhr.open('GET', '/colorPicker.css', true);
                    xhr.send(null);
                } else {
                    document.head.innerHTML += `<style>${xhr.responseText}</style>`;
                    this.start();
                }
            }
        };
        xhr.onabort = () => console.log('aborted');
        xhr.onerror = () => console.log('error');
        xhr.ontimeout = () => console.log('timeout');
        xhr.send(null);
    }

    // Methods
    /** Inits the ColorPicker. Only useful when it is constructed */
    start() {
        this.container = document.getElementById('colorPickerMainContainer')
        this.rangeR = document.getElementById('rangeR');
        this.rangeG = document.getElementById('rangeG');
        this.rangeB = document.getElementById('rangeB');
        this.rangeA = document.getElementById('rangeA');
        this.rangeH = document.getElementById('hueRange');
        this.stringHEX = document.getElementById('stringHEX');
        this.cursor = document.getElementById('colorCursor');
        this.ctx = document.getElementById('colorPreview').getContext('2d');
        this.colorRect = document.getElementById('colorRect');
        this.colorRect.addEventListener('contextmenu', (e) => e.preventDefault())
        this.colorRect.addEventListener('mousedown', (e) => {
            this.selectingColor = true;
            return this.setPointer(e);
        });
        this.rangeR.oninput = (e) => this.changeR(e.target.value);
        this.rangeG.oninput = (e) => this.changeG(e.target.value);
        this.rangeB.oninput = (e) => this.changeB(e.target.value);
        this.rangeA.oninput = (e) => this.changeA(e.target.value);
        this.rangeH.oninput = (e) => this.changeH(e.target.value);
        this.stringHEX.oninput = (e) => this.changeHEX(e.target.value);
        document.getElementById('copyHSL').onclick = navigator.clipboard.writeText(this.colorToText('HSL'));
        document.getElementById('copyHSV').onclick = navigator.clipboard.writeText(this.colorToText('HSV'));
        document.getElementById('copyHEX').onclick = navigator.clipboard.writeText(this.colorToText('HEX'));
        document.getElementById('copyRGB').onclick = navigator.clipboard.writeText(this.colorToText('RGB'));
        document.getElementById('intR').oninput = (e) => this.changeR(e.target.value);
        document.getElementById('intG').oninput = (e) => this.changeG(e.target.value);
        document.getElementById('intB').oninput = (e) => this.changeB(e.target.value);
        document.getElementById('floatA').oninput = (e) => this.changeA(e.target.value);
        document.getElementById('randomA').onclick = (e) => this.randomizeAlpha = e.target.checked;
        document.getElementById('randomColor').onchange = (e) => this.randomColor();
        document.getElementById('cancelButton').onclick = (e) => this.cancel();
        document.getElementById('applyButton').onclick = (e) => this.apply();
        document.addEventListener('mousemove', (e) => this.setPointer(e));
        document.addEventListener('mouseup', (e) => this.selectingColor = false);
        this.changeHEX('000000');
        this.drawColor();
    }

    /** Changes the HSL and HSV values according to the given `MouseEvent`, and updates visuals and color conversion
     * @param {MouseEvent} e Pointer translation event
     */
    setPointer(e) {
        if (!this.selectingColor) return false;
        e.preventDefault();
        var o = rect(this.colorRect);
        var left = clamp(e.pageX, o.left, o.right) - o.left;
        var top = clamp(e.pageY, o.top, o.bottom) - o.top;
        this.changeV((200 - top) / 200);
        this.changeSv(left / 400, true);
        this.fromHSV();
        this.toHEX();
        this.toHSL();
        this.cursor.style.left = `${left}px`;
        this.cursor.style.top = `${top}px`;
        this.drawColor();
        return false;
    }

    // Utility methods

    /** Returns the currrent color formatted to the given color system, with the alpha channel
     * @param {string} s `HSV` | `HSL` | `RGB` | `HEX`
     */
    colorToText(s) {
        switch (s) {
            case 'HSV': return `${this.H}°,${Math.round(this.Sv * 100)}%,${Math.round(this.V * 100)}%,${Math.round(this.A * 100)}%`;
            case 'HSL': return `${this.H}°,${Math.round(this.Sl * 100)}%,${Math.round(this.L * 100)}%,${Math.round(this.A * 100)}%`;
            case 'RGB': return `${this.R},${this.G},${this.B},${Math.round(this.A * 100)}%`;
            case 'HEX':
            default: return '#' + this.HEX;
        }
    }

    /** Outputs the current color under the given color system directly into the form of a usable CSS color string.
     * Only gives CSS-supported color system, so excluding `HSV`
     * @param {string} s `HSL` | `RGB` | `HEX`
     */
    getCSSColor(s) {
        switch (s.toUpperCase()) {
            case 'HSL': return `hsla(${this.H},${Math.round(this.Sl * 100)}%,${Math.round(this.L * 100)}%,${this.A})`;
            case 'RGB': return `rgba(${this.R},${this.G},${this.B},${this.A})`;
            case 'HEX':
            default: return '#' + this.HEX;
        }
    }

    /** Sets a random color to the color picker */
    randomColor() {
        let s = '';
        for (let i = 0; i < (this.randomizeAlpha ? 8 : 6); i++) s += hexDigits[Math.floor(randomBetween(15))];
        this.changeHEX(s);
        this.toHSV();
        this.toHEX();
    }

    /** Draws the color preview and the color cursor */
    drawColor() {
        this.ctx.fillStyle = '#' + this.HEX;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.cursor.style.boxShadow = `inset 0 0 0 5px #${this.HEX}`;
        this.colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${this.A}), transparent), linear-gradient(to right, rgba(255,255,255,${this.A}), hsla(${this.H},100%,50%,${this.A})), url(transparent-bg.png)`;
    }

    /** Make the colorPicker visible */
    show() {
        this.container.className = 'visible';
    }

    /** Hides the colorPicker */
    hide() {
        this.container.className = 'hidden';
    }

    /** Equivalent to clicking the `apply` button of the colorPicker */
    apply() {
        this.hide();
        this.toHEX();
        this.toHSL();
        this.toHSV();
        this.lastHEXColor = this.HEX;
        this.drawColor();
        this.onApply();
    }

    /** Equivalent to clicking the `cancel` button of the colorPicker */
    cancel() {
        this.hide();
        this.HEX = this.lastHEXColor;
        this.fromHEX();
        this.toHSL();
        this.toHSV();
        this.drawColor();
        this.onCancel();
    }

    // Change color values

    /** Updates the `HEX` value for hexadecimal notation
     * @param {number} h 
     * @param {boolean} updateColor 
     */
    changeHEX(h, updateColor = true) {
        this.HEX = h;
        if (!this.fromHEX()) return;
        this.stringHEX.value = h;
        if (!updateColor) return;
        this.toHSV();
        this.toHSL();
        this.rangeR.style.background = `linear-gradient(to right, rgba(0,${this.G},${this.B},${this.A}), rgba(255,${this.G},${this.B},${this.A}))`;
        this.rangeG.style.background = `linear-gradient(to right, rgba(${this.R},0,${this.B},${this.A}), rgba(${this.R},255,${this.B},${this.A}))`;
        this.rangeB.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},0,${this.A}), rgba(${this.R},${this.G},255,${this.A}))`;
        this.rangeA.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},${this.B},0), rgba(${this.R},${this.G},${this.B},1))`;
        this.drawColor();
    }

    /** Updates the `R` value for `RGB` notation
     * @param {number} r 
     * @param {boolean} updateColor 
     */
    changeR(r, updateColor = true) {
        this.R = clamp(parseInt(r), 0, 255);
        document.getElementById('intR').value = r;
        this.rangeR.value = r;
        if (!updateColor) return;
        this.toHSV();
        this.toHEX();
        this.toHSL();
        this.stringHEX.value = this.HEX;
        this.rangeG.style.background = `linear-gradient(to right, rgba(${this.R},0,${this.B},${this.A}), rgba(${this.R},255,${this.B},${this.A}))`;
        this.rangeB.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},0,${this.A}), rgba(${this.R},${this.G},255,${this.A}))`;
        this.rangeA.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},${this.B},0), rgba(${this.R},${this.G},${this.B},255))`;
        this.colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${this.A}), transparent), linear-gradient(to right, rgba(255,255,255,${this.A}), hsla(${this.H},100%,50%,${this.A})), url(transparent-bg.png)`;
        this.drawColor();
    }

    /** Updates the `G` value for `RGB` notation
     * @param {number} g 
     * @param {boolean} updateColor 
     */
    changeG(g, updateColor = true) {
        this.G = clamp(parseInt(g), 0, 255);
        document.getElementById('intG').value = g;
        this.rangeG.value = g;
        if (!updateColor) return;
        this.toHSV();
        this.toHEX();
        this.toHEX();
        this.stringHEX.value = this.HEX;
        this.rangeR.style.background = `linear-gradient(to right, rgba(0,${this.G},${this.B},${this.A}), rgba(255,${this.G},${this.B},${this.A}))`;
        this.rangeB.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},0,${this.A}), rgba(${this.R},${this.G},255,${this.A}))`;
        this.rangeA.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},${this.B},0), rgba(${this.R},${this.G},${this.B},255))`;
        this.colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${this.A}), transparent), linear-gradient(to right, rgba(255,255,255,${this.A}), hsla(${this.H},100%,50%,${this.A})), url(transparent-bg.png)`;
        this.drawColor();
    }

    /** Updates the `B` value for `RGB` notation
     * @param {number} b
     * @param {boolean} updateColor 
     */
    changeB(b, updateColor = true) {
        this.B = clamp(parseInt(b), 0, 255);
        document.getElementById('intB').value = b;
        this.rangeB.value = b;
        if (!updateColor) return;
        this.toHSV();
        this.toHEX();
        this.toHSL();
        this.stringHEX.value = this.HEX;
        this.rangeR.style.background = `linear-gradient(to right, rgba(0,${this.G},${this.B},${this.A}), rgba(255,${this.G},${this.B},${this.A}))`;
        this.rangeG.style.background = `linear-gradient(to right, rgba(${this.R},0,${this.B},${this.A}), rgba(${this.R},255,${this.B},${this.A}))`;
        this.rangeA.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},${this.B},0), rgba(${this.R},${this.G},${this.B},255))`;
        this.colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${this.A}), transparent), linear-gradient(to right, rgba(255,255,255,${this.A}), hsla(${this.H},100%,50%,${this.A})), url(transparent-bg.png)`;
        this.drawColor();
    }

    /** Updates the `A` (transparency) value. Common to all color systems
     * @param {number} a
     * @param {boolean} updateColor 
     */
    changeA(a, updateColor = true) {
        this.A = clamp(parseFloat(a), 0, 1);
        document.getElementById('floatA').value = a;
        this.rangeA.value = a
        if (!updateColor) return;
        this.toHSV();
        this.toHEX();
        this.toHSL();
        this.stringHEX.value = this.HEX;
        this.rangeR.style.background = `linear-gradient(to right, rgba(0,${this.G},${this.B},${this.A}), rgba(255,${this.G},${this.B},${this.A}))`;
        this.rangeG.style.background = `linear-gradient(to right, rgba(${this.R},0,${this.B},${this.A}), rgba(${this.R},255,${this.B},${this.A}))`;
        this.rangeB.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},0,${this.A}), rgba(${this.R},${this.G},255,${this.A}))`;
        this.colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${this.A}), transparent), linear-gradient(to right, rgba(255,255,255,${this.A}), hsla(${this.H},100%,50%,${this.A})), url(transparent-bg.png)`;
        this.drawColor();
    }

    /** Updates the `H` value for both `HSV` and `HSL` notation
     * @param {number} h
     * @param {boolean} updateColor
     */
    changeH(h, updateColor = true) {
        this.H = clamp(parseInt(h), 0, 360);
        this.rangeH.value = h;
        if (!updateColor) return;
        this.fromHSV();
        this.toHEX();
        this.toHSL();
        this.rangeR.style.background = `linear-gradient(to right, rgba(0,${this.G},${this.B},${this.A}), rgba(255,${this.G},${this.B},${this.A}))`;
        this.rangeG.style.background = `linear-gradient(to right, rgba(${this.R},0,${this.B},${this.A}), rgba(${this.R},255,${this.B},${this.A}))`;
        this.rangeB.style.background = `linear-gradient(to right, rgba(${this.R},${this.G},0,${this.A}), rgba(${this.R},${this.G},255,${this.A}))`;
        this.colorRect.style.background = `linear-gradient(to top, rgba(0,0,0,${this.A}), transparent), linear-gradient(to right, rgba(255,255,255,${this.A}), hsla(${this.H},100%,50%,${this.A})), url(transparent-bg.png)`;
        this.drawColor();
    }

    /** Updates the `S` value for `HSV` notation (not the same as `HSL` notation)
     * @param {number} s
     * @param {boolean} updateColor
     */
    changeSv(s, updateColor = true) {
        this.Sv = clamp(parseFloat(s), 0, 1);
        if (!updateColor) return;
        this.fromHSV();
        this.toHEX();
        this.toHSL();
        this.drawColor();
    }

    /** Updates the `V` value for `HSV` notation
     * @param {number} v
     * @param {boolean} updateColor
     */
    changeV(v, updateColor = true) {
        this.V = clamp(parseFloat(v), 0, 1);
        if (!updateColor) return;
        this.fromHSV();
        this.toHEX();
        this.toHSL();
        this.drawColor();
    }

    /** Updates the `S` value for `HSL` notation (not the same as `HSV` notation)
     * @param {number} s
     * @param {boolean} updateColor
     */
    changeSl(s, updateColor = true) {
        this.Sl = clamp(parseFloat(s), 0, 1);
        if (!updateColor) return;
        this.fromHSL();
        this.toHSV();
        this.toHEX();
        this.drawColor();
    }

    /** Updates the `L` value for `HSL` notation
     * @param {number} l
     * @param {boolean} updateColor
     */
    changeL(l, updateColor = true) {
        this.L = clamp(parseFloat(l), 0, 1);
        if (!updateColor) return;
        this.fromHSL();
        this.toHSV();
        this.toHEX();
        this.drawColor();
    }

    // Color conversion methods

    /** Changes `RGB` values by parsing `HEX` value */
    fromHEX() {
        if (this.HEX.length == 6 || this.HEX.length == 8) {
            this.changeR(parseInt(this.HEX.substring(0, 2), 16), false);
            this.changeG(parseInt(this.HEX.substring(2, 4), 16), false);
            this.changeB(parseInt(this.HEX.substring(4, 6), 16), false);
            this.changeA(this.HEX.length == 8 ? parseInt(this.HEX.substring(6, 8), 16) / 255 : 1, false);
            return true;
        } else if (this.HEX.length == 3 || this.HEX.length == 4) {
            this.changeR(parseInt(this.HEX.substring(0, 1).repeat(2), 16), false);
            this.changeG(parseInt(this.HEX.substring(1, 2).repeat(2), 16), false);
            this.changeB(parseInt(this.HEX.substring(2, 3).repeat(2), 16), false);
            this.changeA(this.HEX.length == 4 ? parseInt(this.HEX.substring(3, 4).repeat(2), 16) / 255 : 1, false);
            return true;
        }
        return false;
    }

    /** Changes `HEX` value by parsing `RGB` values */
    toHEX() {
        var r = this.R.toString(16).toUpperCase();
        if (r.length == 1) r = '0' + r;
        var g = this.G.toString(16).toUpperCase();
        if (g.length == 1) g = '0' + g;
        var b = this.B.toString(16).toUpperCase();
        if (b.length == 1) b = '0' + b;
        this.HEX = r + g + b;
        if (this.A != 1) {
            var a = Math.round(this.A * 255).toString(16).toUpperCase();
            if (a.length == 1) a = '0' + a;
            this.HEX += a;
        }
        this.changeHEX(this.HEX);
    }

    /** Changes `RGB` values by parsing `HSV` values */
    fromHSV() {
        let hi = Math.floor(this.H / 60) % 6, f = this.H / 60 - hi, p = this.V * (1 - this.Sv), q = this.V * (1 - f * this.Sv), t = this.V * (1 - (1 - f) * this.Sv), r, g, b;
        if (hi == 0) [r, g, b] = [this.V, t, p];
        else if (hi == 1) [r, g, b] = [q, this.V, p];
        else if (hi == 2) [r, g, b] = [p, this.V, t];
        else if (hi == 3) [r, g, b] = [p, q, this.V];
        else if (hi == 4) [r, g, b] = [t, p, this.V];
        else[r, g, b] = [this.V, p, q];
        this.changeR(Math.round(255 * r), false);
        this.changeG(Math.round(255 * g), false);
        this.changeB(Math.round(255 * b), false);
    }

    /** Changes `HSV` values by parsing `RGB` values */
    toHSV() {
        let max = Math.max(this.R, this.G, this.B), min = Math.min(this.R, this.G, this.B);
        if (max == min) this.changeH(0, false);
        else if (max == this.R) this.changeH(60 * (this.G - this.B) / (max - min) + (this.G < this.B ? 360 : 0), false);
        else if (max == this.G) this.changeH(60 * (this.B - this.R) / (max - min) + 120, false);
        else if (max == this.B) this.changeH(60 * (this.R - this.G) / (max - min) + 240, false);
        this.changeSv((max == 0) ? 0 : 1 - min / max, false);
        this.changeV(max / 255, false);
        this.cursor.style.left = `${this.Sv * 400}px`;
        this.cursor.style.top = `${200 - this.V * 200}px`
    }

    /** Changes `RGB` values by parsing `HSL` values */
    fromHSL() {
        let r, g, b;
        if (this.Sl == 0) [r, g, b] = [this.L, this.L, this.L];
        else {
            let c = (1 - Math.abs(2 * this.L - 1)) * S, x = c * (1 - Math.abs((this.H / 60) % 2 - 1)), m = this.L - c / 2;
            if (this.H < 60) [r, g, b] = [c, x, 0];
            else if (this.H < 60) [r, g, b] = [x, c, 0];
            else if (this.H < 60) [r, g, b] = [0, c, x];
            else if (this.H < 60) [r, g, b] = [0, x, c];
            else if (this.H < 60) [r, g, b] = [x, 0, c];
            else if (this.H < 60) [r, g, b] = [c, 0, x];
            [r, g, b] = [r * 255, g * 255, b * 255];
        }
        this.changeR(Math.round(255 * r), false);
        this.changeG(Math.round(255 * g), false);
        this.changeB(Math.round(255 * b), false);
    }

    /** Changes `HSL` values by parsing `RGB` values */
    toHSL() {
        let max = Math.max(this.R, this.G, this.B), min = Math.min(this.R, this.G, this.B);
        if (max == min) this.changeH(0, false);
        else if (max == this.R) this.changeH(60 * (this.G - this.B) / (max - min) + (this.G < this.B ? 360 : 0), false);
        else if (max == this.G) this.changeH(60 * (this.B - this.R) / (max - min) + 120, false);
        else if (max == this.B) this.changeH(60 * (this.R - this.G) / (max - min) + 240, false);
        this.changeL((max + min) / 510, false);
        this.changeSl(max == min ? 0 : ((max - min) / (this.L <= 1 / 2 ? 2 * this.L : 2 - 2 * this.L)) / 255, false);
    }

    // Events

    _applyCallback;
    /** Event fired when the colorPicker's `apply` button has been clicked and its color has been changed
     * @example colorPicker.onApply = () => {
     *      //code here
     * }
     */
    onApply(callback) {
        this._applyCallback = callback;
    }

    _cancelCallback;
    /** Event fired when the colorPicker's `cancel` button has been clicked and its color has been reverted back to its previous state
     * @example colorPicker.onCancel = someFunction;
     */
    onCancel(callback) {
        this._cancelCallback = callback;
    }
}