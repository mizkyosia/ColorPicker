# Web Color Picker

Because the default HTML color picker isn't that great.  
Full HEX, RGB, HSL and HSV support

## How to use it ?

To use this color picker, just include the following line in your html document :

```html
    <script src="https://cdn.jsdelivr.net/gh/mizkyosia/ColorPicker/colorPicker.js"></script>
```

Then, the script will add the necessary HTML Elements and styling for the picker to properly work. A `colorPicker` variable will be created as the color picker, and will be accessible from any JS script included in the page.

## Code help

### Color-changing methods

You can change the picker's color values by code with its methods. Example :

```js
    /* This will change the R value without updating visuals and converting to other color formats */
    colorPicker.changeR(255);

    /* This will change the G value, update visuals and convert to other color formats */
    colorPicker.changeG(125,true);
```

When you need to change multiple values at once, only update visuals in the last instruction. This'll save computing power and time. Example :

```js
    colorPicker.changeR(125);
    colorPicker.changeG(175);
    colorPicker.changeB(255,true);
```

Keep in mind that unless you use the optional `updateColor` parameter when calling a changer method, the updated values won't be converted to the other color systems.

### Color values

List of color values. Changing one of these values goes through calling `change<value name>(value,updateColor?)` :

```js
    R
    G
    B
    A    // Alpha channel = transparency
    HEX
    H
    Sv   // S value for HSV system
    V
    Sl   // S value for HSL system
    L
```

### CSS Styling output

If you want to retrieve colors to use them in CSS styling, you can use the `getCSSColor` method. Example :

```js
    const hexColor = colorPicker.getCSSColor("HEX");
    let rgbaColor = colorPicker.getCSSColor("RGB");
    var hslaColor = colorPicker.getCSSColor("HSL");
```

### Events

The colorPicker has two events called `onApply` and `onCancel`. As their name indicates, they are fired when the `apply` and `cancel` buttons of the picker have been pressed. You can use them in your code as follows :

```js
    colorPicker.onApply = () => // Some code here

    function someFunction() {
        // Some code here
    }
    colorPicker.onCancel = someFunction;
```

### Utility functions

This script also includes 3 utility functions defined on the 1st level of the script, outside of the class. Thus, you can use them in any script on the same HTML page as this script.

The `rect` function takes one argument called `e` which is an HTML element. It returns the position of the `top`, `bottom`, `left` and `right` borders of the element relative to the top left corner of the page (not the viewport), as well as the `width` and the `height` of this element. All of theses values are in pixels. Example :

```js
    var r = rect(element);
```

The `clamp` function takes three number arguments : `v`, `min` and `max`. It returns the value `v` clamped in the interval `[min, max]`. Examples :

```js
    clamp(5,10,25) // Output : 10
    clamp(30,10,25) // Output : 25
    clamp(17,10,25) // Output : 17
```

The `randomBetween` function takes two number arguments : a positional argument `max`, and an optional argument `min`. If `min` isn't given, it is equal to 0. Returns a random number between `max` (excluded) and `min` (included). Examples :

```js
    randomBetween(40,20) // Output : random int in range [20, 40[
    randomBetween(30) // Output : random int in range [0, 30[
```

## TODO

TODO :

- HSL and HSV Values textboxes (like RGB & HEX)

Will MAYBE do :

- A more intuitive and classy UI
- Mobile support
