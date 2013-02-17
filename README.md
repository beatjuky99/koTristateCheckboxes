koTristateCheckboxes
====================

Tristate Boolean extension for [knockout.js](http://knockoutjs.com/)

```html
<input type="checkbox" data-bind="tristate: someTristate" />
```

It's so easy to create a tristate Checkbox with [knockout.js](http://knockoutjs.com/) and this plugin...

### Sample Markup

```html
<html>
	<head>
		<script type="text/javascript" language="javascript" src="knockout-2.2.0.debug.js"></script>
		<script type="text/javascript" language="javascript" src="tristateInputField.js"></script>
		<link type="text/css" rel="stylesheet" href="tristateInputField.css">
	</head>
	<body>
		<div id="__test">
			<input type="checkbox" data-bind="tristate: someTristate" />
		</div>
		<script>
			(function(){
				var __test = {someTristate : ko.observable(ko.tristateBoolean(undefined, true))};
				ko.applyBindings(__test, document.getElementById('#__test'));
			})();
		</script>
	</body>
</html>
```


Usage:
------
```javascript
data-bind="tristate: someTristate"
```

the "tristate" binding accepts a "ko.tristateBoolean" or a "ko.observable"-wrapped "ko.tristateBoolean"

ko.tristateBoolean
------------------

```javascript
var tribool = ko.tristateBoolean(initialValue, defaultValue);
```

Creates a tristateBoolean.

The initial value is set as the value of the tristateBoolean.    
    
allowed values are:
```javascript
true
false
undefined or null
```

The default value is returned when converting the tristateBoolean back to a boolean and   
the tristateBoolean has no value.    
    
allowed values are:
```javascript
true
false
```
___

```javascript
tribool.defaultValue(/*bool?*/ defaultValue);
```

Get or set the default value.

___

```javascript
tribool.hasValue();
```

Check if tribool has a value (true or false, but not undefined).

___

```javascript
tribool.getWithDefaultifNull(/*bool?*/ defaultValue);
```

Get value as boolean.    
    
Returns the tribool's default value (or if provided the defaultValue argument) if tribool has no value.

___

```javascript
tribool.and(/*tribool?*/ defaultValue);
```

And (&&) two tristateBooleans.

___

```javascript
tribool.or(/*tribool?*/ defaultValue);
```

Or (||) two tristateBooleans.

___

```javascript
tribool.not();
```

Returns not (!) the value of this tristateBoolean.

helper functions
----------------

```javascript
ko.isTristateBoolean(value);
```

Checks if value is a tristateBoolean.

___

```javascript
ko.utils.unwrapTristateBoolean(value);
```

Unwraps an tristateBoolean or returns value.

___

```javascript
ko.utils.getValidTristateBooleanValue(value);
```

Returns value if valid value (true/false/undefined) or the bool representation of value.


Credits
-------

* get computed css Properties in JS    
	(http://stackoverflow.com/a/1955160)
* Super amazing, cross browser property function    
	(http://johndyer.name/native-browser-get-set-properties-in-javascript/)
* Cross-browser CSS3 Image-Free Custom Checkbox    
	(http://kubyshkin.ru/web/cross-browser-css3-image-free-custom-checkbox/)

License
-------

Copyright (c) 2013 Sebastian J. Keller    
    
Permission is hereby granted, free of charge, to any person obtaining a copy    
of this software and associated documentation files (the "Software"), to deal    
in the Software without restriction, including without limitation the rights    
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell    
copies of the Software, and to permit persons to whom the Software is    
furnished to do so, subject to the following conditions:    
    
The above copyright notice and this permission notice shall be included in    
all copies or substantial portions of the Software.    
    
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,    
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER    
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,    
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN    
THE SOFTWARE.
