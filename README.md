# Slider jQuery Plugin

(Yet another) circular slider plugin...

## Usage

The basic usage is as follows:

```javascript
$('#my-list-element').slider({
  mask: '.my-mask-element'
});
```

The plugin expects the following  element hierarchy:

```plain
+--- MASK ELEMENT ----------------------------------------------+
|                                                               |
|  +--- LIST ELEMENT ----------------------------------------+  |
|  |                                                         |  |
|  |  +--- LIST ITEM 0 -----------------------------------+  |  |
|  |  |                                                   |  |  |
|  |  +---------------------------------------------------+  |  |
|  |                                                         |  |
|  |  +--- LIST ITEM 1 -----------------------------------+  |  |
|  |  |                                                   |  |  |
|  |  +---------------------------------------------------+  |  |
|  |                                                         |  |
|  |  ...                                                    |  |
|  |                                                         |  |
|  +---------------------------------------------------------+  |
|                                                               |
+---------------------------------------------------------------+

+--- PREV BUTTON (anywhere; optional)---------------------------+
|                                                               |
+---------------------------------------------------------------+

+--- NEXT BUTTON (anywhere; optional)---------------------------+
|                                                               |
+---------------------------------------------------------------+

+--- NAVIGATION (anywhere; optional)----------------------------+
|                                                               |
|  +--- LIST ITEM 0 -----------------------------------------+  |
|  |                                                         |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  +--- LIST ITEM 1 -----------------------------------------+  |
|  |                                                         |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  ...                                                          |
|                                                               |
+---------------------------------------------------------------+
```

If the mask width is greater than the number of list items * the item width, WTF are you going to slide?

And, yes, maybe it could be more practical to call the plugin directly over the mask element... 

## Options

### General Options

* **alwaysShowCaptions**  
  If this option is false (default), the plugin will hide all item captions and hide/show them before/after animating

* **animationDuration**  
  The duration of the sliding animation in milliseconds, or one of the jQuery strings {"slow", "normal", "fast"}; default is "slow"

* **centerItems**  
  Whether to center items on the mask (default is true)

* **keys**  
  Whether to enable keyboard navigation (move forward/backward using the default keys -- see "nextKey" and "prevKey"; default is true)

* **nextKey**  
  The code of the key used to move forward. This has no effect if the "keys" option is disabled. The default key code is 39 (RIGHT ARROW) Use an array of key codes to allow multiple keys

* **prevKey**  
  The code of the key used to move backward. This has no effect if the "keys" option is disabled. The default key code is 37 (LEFT ARROW) Use an array of key codes to allow multiple keys

* **sliderInterval**  
  The sliding interval, in milliseconds. If set to a number, the slider will automatically activate the next item after the given timeout -- the interval is cleared when the user hovers the slider list. Use a value which evaluates to false to disable auto-sliding (default behaviour).

* **stepByStep**  
  Whether to slide step-by-step (like when using prev() and next() methods) or move directly forward/backward (using move() method) to the given index (default)

### Selectors

* **captions**  
  Captions selector. If an element or set of elements down in the DOM hierarchy of any list item matchs this selector, it will be used as the item caption. Use a value which evaluates to false to disable captions (default is ".caption").

* **mask**  
  Mask selector. Note that mask *MUST* be outside the slider list (default is ".mask")

* **navigation**  
  Navigation selector. Use a value which evaluates to false to disable navigation (default).

* **next**  
  Next button selector. Use a value which evaluates to false to disable next button (default)

* **prev**  
  Previous button selector. Use a value which evaluates to false to disable prev button (default)

### Callbacks

* **init**  
  The init callback, called after the plugin has been initialized and all items have been positioned.

* **before**  
  The before callback, called *BEFORE* each animation, can be used to set-up any hook before animating the list. The callback gets passed the current index and the current list element

* **after**  
  The after callback, called *AFTER* each animation, can be used to set-up any hook after animating the list. The callback gets passed the current index and the current list element
    
You are encouraged to use events ("init.slider", "before.slider", and "after.slider"; triggered on the list element) instead of callbacks to hook into any relevant event.