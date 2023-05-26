# Web Color Picker

Because the default HTML color picker isn't that great.  
Full HEX, RGB, HSL and HSV support

## How to use it ?

just include the following line of code in your html document :
`<script src="https://raw.githubusercontent.com/mizkyosia/ColorPicker/main/colorPicker.css" type="text/javascript">`

Then, the script will add the necessary HTML Elements and styling for the picker to properly work. A `colorPicker` variable will be created as the color picker, and will be accessible from any JS script included in the page.

## Code help

### Color-changing methods

You can change the picker's color values by code with its methods. Example :

    /* This will change the R value without updating visuals and converting to other color formats */
    colorPicker.changeR(255);

    /* This will change the G value, update visuals and convert to other color formats */
    colorPicker.changeG(125,true);

When you need to change multiple values at once, only update visuals in the last instruction. This'll save computing power and time. Example :

    changeR(125);
    changeG(175);
    changeB(255,true);

Keep in mind that unless you use the optional `updateColor` parameter when calling a changer method, the updated values won't be converted to the other color systems.

### Color values

List of color values. Changing one of these values goes through calling `change<value name>(value,updateColor?)` :

    R
    G
    B
    A // Alpha channel = transparency
    HEX
    H
    Sv // S value for HSV system
    V
    Sl // S value for HSL system
    L

### CSS Styling output

If you want to retrieve colors to use them in CSS styling, you can use the `getCSSColor` method. Example :

    var hexColor = getCSSColor("HEX");
    var rgbaColor = getCSSColor("RGB");
    var hslaColor = getCSSColor("HSL");

### Events

The colorPicker has two events called `onApply` and `onCancel`. As their name indicates, they are fired when the `apply` and `cancel` buttons of the picker have been pressed. You can use them in your code as follows :

    colorPicker.onApply = () => // Some code here

    function someFunction() {
        // Some code here
    }
    colorPicker.onCancel = someFunction;

## TODO

TODO :

- HSL and HSV Values textboxes (like RGB & HEX)

Will MAYBE do :

- A more intuitive and classy UI
- Mobile support
