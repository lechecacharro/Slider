(function($) {

/**
 * Slider jQuery plugin.
 * 
 * The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
 * NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
 * "OPTIONAL" in this document are to be interpreted as described in
 * RFC 2119.
 */
$.fn.slider = function(options) {
  
  var log = function() {
    if(window.console && console.log) {
      console.log.apply(console, [].slice.call(arguments, 0));
    }
  };
  
  var o = $.extend(true, {

    // general options
    
    /**
     * If alwaysShowCaptions is false (default), the plugin will hide
     * all captions, and YOU must hide/show them before/after animating
     * 
     * @type {Boolean}
     * @default false
     */
    alwaysShowCaptions: false,
    
    /**
     * The duration of the sliding animation in milliseconds, or one of 
     * the jQuery strings {"slow", "normal", "fast"}
     * 
     * @type {Number | String}
     * @default "slow"
     */
    animationDuration: 'slow',

    /**
     * Whether to center items on the mask. This option has no effect if
     * mask is not specified
     * 
     * @type {Boolean}
     * @default true
     */
    centerItems: true,
    
    /**
     * Whether to enable keyboard navigation (move forward backward using 
     * the default keys -- see "nextKey" and "prevKey" options).
     * 
     * @type {Boolean}
     * @default true
     */
    keys: true,
    
    /**
     * The code of the key used to move forward. This has no effect if the 
     * "keys" option is disabled. The default key code is 39 (RIGHT ARROW)
     * Use an array of key codes to allow multiple keys
     * 
     * @type {Number | Number[]}
     * @default 39
     */
    nextKey: 39,
    
    /**
     * The code of the key used to move backward. This has no effect if the 
     * "keys" option is disabled. The default key code is 37 (LEFT ARROW)
     * Use an array of key codes to allow multiple keys
     * 
     * @type {Number | Number[]}
     * @default 37
     */
    prevKey: 37,

    /**
     * The sliding interval, in milliseconds. If set to a number, the slider
     * will automatically activate the next item after the given timeout --
     * the interval is cleared when the user hovers the slider list. Use a 
     * value which evaluates to false to disable auto-sliding.
     * 
     * @type {Number | Boolean}
     * @default false
     */
    sliderInterval: false,
    
    /**
     * Whether to slide step-by-step (like when using prev() and next() 
     * methods) or move directly forward/backward (using move() method) to 
     * the given index.
     * 
     * NOTE: Actually, the plugin only supports stepByStep navigation
     * (the move method must be FIXED ;)
     * 
     * @type {Boolean}
     * @default false
     */
    stepByStep: false,

    
    // selectors
    
    /**
     * Captions selector. If an element or set of elements down in the DOM 
     * hierarchy of any list item matchs this selector, it will be used as
     * the item caption. Use a value which evaluates to false to disable
     * captions.
     * 
     * @type {any}
     * @default ".caption"
     */
    caption: '.caption',

    /**
     * Mask selector. Note that mask MUST be outside the slider list.
     * 
     * @type {any}
     * @default ".mask"
     */
    mask: '.mask',
    
    /**
     * Navigation selector. Use a value which evaluates to false to disable
     * navigation.
     * 
     * @type {any}
     * @default false
     */
    navigation: false,
    
    /**
     * Next button selector. Use a value which evaluates to false to disable
     * next button.
     * 
     * @type {any}
     * @default false
     */
    next: false,

    /**
     * Previous button selector. Use a value which evaluates to false to  
     * disable prev button.
     * 
     * @type {any}
     * @default false
     */
    prev: false,
    
    
    // callbacks
    
    /**
     * The init callback, called after the plugin has been initialized
     * and all items have been positioned. You can also use the "init.slider"
     * event, which is triggered on the list element
     * 
     * @param {Number} index The current index
     * @param {HTMLElement} li The list item corresponding to the current index
     */
    init: function(index, li) {},
    
    /**
     * The before callback, called *BEFORE* animation, can be used to set-up
     * any hook before animating the list (e.g., hide current caption). You 
     * can also use the "before.slider" event, which is triggered on the list 
     * element
     * 
     * @param {Number} index The current index (before animating)
     * @param {HTMLElement} li The list item corresponding to the current 
     * index (before animating)
     */
    before: function(index, li) {},
    
    /**
     * The after callback, called *AFTER* animation, can be used to set-up
     * any hook before animating the list (e.g., show current caption). You 
     * can also use the "after.slider" event, which is triggered on the list 
     * element
     * 
     * @param {Number} index The current index
     * @param {HTMLElement} li The list item corresponding to the current 
     * index (after animation)
     */
    after: function(index, li) {}
    
  }, options);
  
  /**
   * Slider class.
   * 
   *    +--- MASK ELEMENT ----------------------------------------------+
   *    |                                                               |
   *    |  +--- LIST ELEMENT ----------------------------------------+  |
   *    |  |                                                         |  |
   *    |  |  +--- LIST ITEM 0 -----------------------------------+  |  |
   *    |  |  |                                                   |  |  |
   *    |  |  +---------------------------------------------------+  |  |
   *    |  |                                                         |  |
   *    |  |  +--- LIST ITEM 1 -----------------------------------+  |  |
   *    |  |  |                                                   |  |  |
   *    |  |  +---------------------------------------------------+  |  |
   *    |  |                                                         |  |
   *    |  |  ...                                                    |  |
   *    |  |                                                         |  |
   *    |  +---------------------------------------------------------+  |
   *    |                                                               |
   *    +---------------------------------------------------------------+
   * 
   * @param {jQuery} list The list element
   */
  Slider = function(list) {
    var
      self = this,
      initialized = false,
      mask,
      navigation,
      prevBtn,
      nextBtn,
      currentIndex = 0,
      numItems,
      maskWidth,
      center,
      itemWidth,
      itemsScreen,
      sideItems,
      interval = null,
      chain = [],
      positions = [],
      animating = false;
    
    // private functions
    var
    
      isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      },
    
      /**
       * Initializes the slider.
       * 
       * @private
       * @returns {Slider}
       */
      init = function() {
        var currentItem;
        
        if(initialized) {
          log('Slider already initialized');
          return;
        }
        
        // initialize UI elements
        mask = $(o.mask);
        prevBtn = $(o.prev);
        nextBtn = $(o.next);
        navigation = $(o.navigation);
        
        // initialize state variables
        currentIndex = 0;
        numItems = list.children().length;
        itemWidth = list.children().eq(0).outerWidth();
        
        // set each child's index and hide captions, if necessary
        list.children().each(function(i, li) {
          $(this).attr('data-index', i);
          if(o.alwaysShowCaptions === false) {
            $(this).find(o.caption).hide();
          }
        });
        
        // show caption of the current index and mark current navigation 
        // item as active, if necessary
        list.children().eq(currentIndex).find(o.caption).show();
        
        if(navigation.length) {
          navigation.children().eq(currentIndex).children('a').addClass('active');
        }
        
        // position items and bind reposition to window's resize event 
        positionItems();
        $(window).bind('resize', reposition);
        
        if(o.keys) {
          $(document).keydown(function(e) {
            if((o.prevKey instanceof Array && o.prevKey.indexOf(e.which) > -1) || e.which === o.prevKey) {
              prev();
            }
            if((o.nextKey instanceof Array && o.nextKey.indexOf(e.which) > -1) || e.which === o.nextKey) {
              next();
            }
          });
        }
        
        // initialize prev and next navigation buttons
        if(prevBtn.length) {
          prevBtn.bind('click', function() {
            prev();
          });
        }
        if(nextBtn.length) {
          nextBtn.bind('click', function() {
            next();
          });
        }
        
        // initialize navigation
        if(navigation.length) {
          navigation.children('li').children('a').bind('click', function(e) {
            var index = navigation.children().index($(this).parent());
            
            e.preventDefault();
            e.stopPropagation();
            
            navigation.children().children('a').removeClass('active');
            navigation.children().eq(index).children('a').addClass('active');
            
            clearInterval(interval);
            gotoIndex(index);
            
            if(o.sliderInterval) {
              chain.push(startInterval);
            }
          });
        }
        
        // initialize auto-sliding, if necessary, stop on mouse enter 
        // and resume on mouse leave
        if(isNumber(o.sliderInterval)) {
          log('Starting slider interval');
          startInterval();
          
          mask.bind('mouseenter', function() {
            log('MOUSE IN -> stop auto-sliding interval');
            if(o.sliderInterval && interval) {
              clearInterval(interval);
            }
          }).bind('mouseleave', function() {
            log('MOUSE OUT -> re-start auto-sliding interval');
            if(o.sliderInterval) {
              startInterval();
            }
          });
        }
        
        // mark the slider as initialized
        initialized = true;
        currentItem = list.children('li[data-index=' + currentIndex + ']');
        
        // init callback
        if(typeof o.init === 'function') {
          o.init(currentIndex, currentItem);
        }
        
        // trigger init event
        list.trigger('init.slider', currentIndex, currentItem);
        
        return self;
      },
      
      /**
       * Positions the slider items.
       * 
       * @private
       * @returns {undefined}
       */
      positionItems = function() {
        var clone = null;
        
        positions = [];
        
        // compute mask width
        maskWidth = mask.outerWidth();
        center = (maskWidth - itemWidth) / 2;
        
        // warn
        if(maskWidth > list.width()) {
          log('Esto no va a ir bien, la máscara es mayor que el número de imágenes');
        }
        
        // the number of items which fit on the mask
        itemsScreen = 1 + Math.ceil(maskWidth / itemWidth);
        
        // the number of items which fit at each side of 
        // the central item + 1
        sideItems = 1 + Math.ceil((itemsScreen - 1) / 2);
        
        // set list width
        list.width(numItems * itemWidth);
        
        // fix list left position
        if(list.width() < maskWidth) {
          list.css('left', (maskWidth - list.width()) / 2);
        }
        
        // center first item and position items
        if(o.centerItems) {
          list.children().each(function(i, li) {
            $(li)
              .css('position', 'absolute')
              .css('left', center + $(li).attr('data-index') * itemWidth);
          });
        }
        
        if(numItems === 1) {
          list.children().eq(0).css('left', 0);
        }
        
        log('Slider side items: ' + sideItems);
        
        // prepend the last sideItems items at the beginning of the list
        if(itemsScreen > 1 && numItems > sideItems) {
          for(var i = 0; i < sideItems; i++) {
            clone = list.children().eq(numItems - 1)
              .detach()
              .prependTo(list)
              .css('left', center - (i + 1) * itemWidth);
          }
          log('Prepended ' + sideItems + ' items at the beginning of the list');
        }
        
        // initialize positions
        list.children().each(function(i, li) {
          positions.push(parseInt($(this).css('left'), 10));
        });
        
        log('Item positions: ', positions);
      },
      
      /**
       * Repositions the slider items after window resize events.
       * 
       * @private
       * @returns {undefined}
       */
      reposition = function() {
        var centralIndex = list.children().index(list.children('li[data-index=' + currentIndex + ']'));

        maskWidth = mask.outerWidth();
        center = (maskWidth - itemWidth) / 2;
        
        // reposition items
        list.children().each(function(i, li) {
          var left = center + (i - centralIndex) * itemWidth;
          
          $(li).css('left', left);
          positions[i] = left;
        });
      },
      
      /**
       * Starts the sliding interval.
       * 
       * @private
       * @returns {undefined}
       */
      startInterval = function() {
        interval = setInterval(next, o.sliderInterval);
      },
      
      /**
       * Navigates to the next item.
       * 
       * @private
       * @param {Function} callback
       * @returns {Slider}
       */
      next = function(callback) {
        var n = 0, done;
        
        if(animating || numItems === 1) {
          log('Skip call to next() method, already animating!');
          return;
        }
        
        done = function() {
          var index = numItems - sideItems + 1;
          
          log('Moving item ' + list.children().eq(0).attr('data-index') + ' at the end of the list, left = ' + positions[index] + ' (pos = ' + (index) + ')');
          
          list.children().eq(0)
            .detach()
            .appendTo(list)
            .css('left', positions[index]);
          
          // update index
          if(currentIndex < numItems - 1) {
            currentIndex++;
          } else {
            currentIndex = 0;
          }
          
          animating = false;
          
          if(typeof callback === 'function') {
            callback();
            return;
          }
          
          showCaption();
          
          if(navigation.length) {
            navigation.children().children('a').removeClass('active');
            navigation.children().eq(currentIndex).children('a').addClass('active');
          }
          
          after();
        };
        
        // before callback and event
        before();
        
        animating = true;
        list.children().animate({
          left: '-=' + itemWidth
        }, {
          duration: o.animationDuration,
          complete: function() {
            n++;
            if(n === numItems) {
              done();
            }
          }
        });
        
        if(!chain.length) {
          hideCaption();
        }
        
        return self;
      },
      
      /**
       * Navigates to the previous item, if any.
       * 
       * @private
       * @param {Function} callback
       * @returns {Slider}
       */
      prev = function(callback) {
        var n = 0, done;
        
        if(animating || numItems === 1) {
          log('Skip call to prev() method, already animating!');
          return;
        }
        
        done = function() {
          log('Moving item ' + list.children().eq(numItems - 1).attr('data-index') + ' at the beginning of the list, left = ' + positions[0] + ' (pos = 0)');
          list.children().eq(numItems - 1)
            .detach()
            .prependTo(list)
            .css('left', positions[0]);
          
          // update index
          if(currentIndex > 0) {
            currentIndex--;
          } else {
            currentIndex = numItems - 1;
          }

          animating = false;
          
          if(typeof callback === 'function') {
            callback();
            return;
          }
          
          showCaption();
          
          if(navigation.length) {
            navigation.children().children('a').removeClass('active');
            navigation.children().eq(currentIndex).children('a').addClass('active');
          }
          
          after();
        };
        
        // before callback and event
        before();
        
        animating = true;
        list.children().animate({
          left: '+=' + itemWidth
        }, {
          duration: o.animationDuration,
          complete: function() {
            n++;
            if(n === numItems) {
              done();
            }
          }
        });
        
        if(!chain.length) {
          hideCaption();
        }
      },
      
      /**
       * Moves to the given index.
       * 
       * FIXME please!
       * 
       * @private
       * @param {Number} index
       * @returns {Slider}
       */
      move = function(delta) {
        var itemsToAnimate;
        
        if(delta === 0) {
          return self;
          
        } else if(delta === 1) {
          return next();
          
        } else if(delta === -1) {
          return prev();
        }
        
        // append first n items at the list end, if delta > 0; or
        // prepend last n items to the list beginning, if delta < 0
        for(var i = 0, n = Math.abs(delta); i < n; ++i) {
          if(delta > 0) {
            list.children().eq(i)
              .clone(false)
              .appendTo(list)
              .css('left', positions[numItems - 1] + i * itemWidth);
          } else {
            log('Cloning and prepending last item to the beginning');
            list.children().eq(numItems - 1)
              .clone(false)
              .prependTo(list)
              .css('left', positions[0] - (i + 1) * itemWidth);
          }
        }
        
        before();
        
        // animate
        animating = true;
        hideCaption();
        n = 0;
        itemsToAnimate = list.children().length;
        
        list.children().animate({
          left: (delta > 0 ? '-=' : '+=') + ((Math.abs(delta) - 1) * itemWidth)
        }, {
          duration: o.duration,
          complete: function() {
            var cloned = Math.abs(delta);
            if(++n === itemsToAnimate) {
              // animation complete; all items have been animated
              while(cloned--) {
                if(delta > 0) {
                  list.children().eq(0).detach();
                } else {
                  list.children().eq(list.children().length - 1).detach();
                }
              }
              
              // fix
              list.children().each(function(i, li) {
                $(li).css('left', positions[i]);
              });
              
              // adjust current index and show caption
              if(delta > 0) {
                currentIndex = (currentIndex + delta) % numItems;
              } else {
                currentIndex = (numItems + delta + currentIndex) % numItems;
              }
              showCaption();
              
              if(navigation.length) {
                navigation.children().children('a').removeClass('active');
                navigation.children().eq(currentIndex).children('a').addClass('active');
              }
                            
              animating = false;

              after();
            }
          }
        });
      },
      
      /**
       * Hides the current item caption.
       * 
       * @private
       * @returns {undefined}
       */
      hideCaption = function() {
        if(!o.alwaysShowCaptions && o.caption) {
          list.children('li[data-index=' + currentIndex + ']').find(o.caption).fadeOut();
        }
      },
      
      /**
       * Shows the current item caption.
       * 
       * @private
       * @returns {undefined}
       */
      showCaption = function() {
        if(!o.alwaysShowCaptions && o.caption) {
          list.children('li[data-index=' + currentIndex + ']').find(o.caption).fadeIn();
        }
      },
      
      /**
       * Triggers the "before.slider" event and calls the before callback, if any.
       * 
       * @private
       * @returns {undefined}
       */
      before = function() {
        var currentItem = list.children('li[data-index=' + currentIndex + ']');
        
        list.trigger('before.slider', currentIndex, currentItem);
        
        if(typeof o.before === 'function') {
          o.before(currentIndex, currentItem);
        }
      },
      
      /**
       * Triggers the "after.slider" event and calls the after callback, if any.
       * 
       * @private
       * @returns {undefined}
       */
      after = function() {
        var currentItem = list.children('li[data-index=' + currentIndex + ']');
        
        list.trigger('after.slider', currentIndex, currentItem);
        
        if(typeof o.after === 'function') {
          o.after(currentIndex, currentItem);
        }
      },
      
      /**
       * Returns the current selected index.
       * 
       * @private
       * @returns {Number}
       */
      getCurrentIndex = function() {
        return currentIndex;
      },
      
      /**
       * Navigates to the given index.
       * 
       * @private
       * @param {Number} index
       * @returns {Slider}
       */
      gotoIndex = function(index) {
        var i, delta;
        
        // vaciar la cola
        chain = [];
        
        // asegurar que el índice está en el rango [0, numItems - 1]
        index = Math.max(0, Math.min(numItems - 1, index));
        
        // calcular diferencia respecta al índice actual
        delta = index - currentIndex;
        
        if(delta === 0) {
          return;
          
        } else if(delta === 1) {
          next();
          
        } else if(delta === -1) {
          prev();
          
        } else if(delta > 0) {
          
          if(o.stepByStep) {
            for(i = 0; i < delta; i++) {
              chain.push(next);
            }
            executeChain();
            
          } else {
            log('Move ' + delta);
            move(delta);
          }
          
        } else if(delta < 0) {
          if(o.stepByStep) {
            for(i = 0; i < Math.abs(delta); i++) {
              chain.push(prev);
            }
            executeChain();
            
          } else {
            log('Move ' + delta);
            move(delta);
          }
        }
      },
      
      /**
       * Executes the chain of functions currently stored.
       * 
       * @private
       * @returns {Number}
       */
      executeChain = function() {
        var fn;
        if(chain.length) {
          fn = chain.shift();
          fn(executeChain);
        } else {
          
          list.children('li[data-index=' + currentIndex + ']').find(o.caption).fadeIn();
          
          if(navigation) {
            navigation.children().children('a').removeClass('active');
            navigation.children().eq(currentIndex).children('a').addClass('active');
          }
          
          if(typeof o.after === 'function') {
            o.after(currentIndex, list.children('li[data-index=' + currentIndex + ']'));
          }
        }
      };
      
    // public API
    return {
      init: init,
      next: next,
      prev: prev,
      getCurrentIndex: getCurrentIndex,
      gotoIndex: gotoIndex,
      move: move
    };
  };
    
  // jQuery plugin implementation
  this.each(function() {
    var api = $(this).data("slider");
    if(api) {
      log("Call to slider() jQuery plugin on '" + this.id + "' (object already constructed) -> return API.", api);
      return api;
    }
    
    var slider = new Slider($(this));
    
    $(this).data("slider", slider);
    
    slider.init();
  });
  
};

}(jQuery));