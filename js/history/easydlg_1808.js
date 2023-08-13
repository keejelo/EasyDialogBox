//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------
// Version: 1.8.0.8
// Created by: keejelo
// Year: 2020-2021
// Web: github.com/keejelo/EasyDialogBox
// Comment: Crossbrowser, legacy-browser support as much as possible.
//-----------------------------------------------------------------------------------------------------------------
var EasyDialogBox = (function()
{
    'use strict';

    // ** DEBUG: false/true (output messages to console)
    var DEBUG = false;

    // ** Used in console messages
    var _name = 'EasyDialogBox';

    // ** Debug logger
    var _log = function(s) { if(DEBUG && window.console.log) { return window.console.log(s); } };

    // ** If debug is enabled, inform user
    if(DEBUG) { _log(_name + ' DEBUG console-output is enabled. You can disable it in "easydlg.js" by setting: DEBUG = false'); }

    // ** Buttontext (custom your own text if you want)
    var _btnTextClose  = 'Close';   // Close
    var _btnTextYes    = 'Yes';     // Yes
    var _btnTextNo     = 'No';      // No
    var _btnTextOk     = 'OK';      // OK
    var _btnTextCancel = 'Cancel';  // Cancel

    // ** Button return codes, constant literals
    var CLOSE  = 0;
    var YES    = 1;
    var NO     = 2;
    var OK     = 3;
    var CANCEL = 4;

    // ** Dialogbox types and flags
    var _strBoxTypeList = ('dlg|dlg-close|dlg-prompt|dlg-yes|dlg-no|dlg-yes-no|dlg-ok|dlg-cancel|dlg-ok-cancel|dlg-toast|' +
                           'dlg-disable-heading|dlg-disable-footer|dlg-disable-btns|dlg-disable-overlay|dlg-disable-drag|' +
                           'dlg-disable-esc|dlg-disable-clickout|' +
                           'dlg-nomodal|dlg-multi|dlg-fade|dlg-resize|' +
                           'dlg-info|dlg-question|dlg-error|dlg-success|dlg-exclamation|' +
                           'dlg-rounded|dlg-shadow').split('|');

    // ** Array that holds all created box-objects, so we can get to them later if we need to, delete them etc.
    var _boxObj = [];

    // ** Prevent content shift when scrollbar hides/shows, if centered body content.
    var _orgBodyPadRight = 0;

    // ** Flag that indicates if a modal dialog is currently active (prevents other dialogs being displayed)
    var _bModalActive = false;

    // ** Get body element
    var _body = function() { return document.querySelector('body'); };

    // ** Convert string to integer (decimal base), "failsafe": if all fails return zero
    var _s2i = function(s) { var n = parseInt(s,10); if(!isFinite(n)) { _log('DEBUG: _s2i(' + s + ') | Error:' + n); n = 0; } return n; };

    // ** Trim leading and trailing whitespace
    var _trim = function(s) { return s.replace(/^\s+|\s+$/g,''); };

    // ** Add "Array.indexOf" support if not exist (IE8)
    if(!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function(elt /*, from*/)
        {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if(from < 0) { from += len; }
            for(; from < len; from++)
            {
                if(from in this && this[from] === elt) { return from; }
            }
            return -1;
        };
    }

    // ** Add event listener (xbrowser-legacy)
    var _attachEventListener = function(target, eventType, functionRef, capture)
    {
        if(typeof target.addEventListener !== 'undefined')
        {
            target.addEventListener(eventType, functionRef, capture);
        }
        else if(typeof target.attachEvent !== 'undefined')
        {
            var functionString = eventType + functionRef;
            target['e' + functionString] = functionRef;
            target[functionString] = function(evt)
            {
                evt = evt || window.event;
                try
                {
                    target['e' + functionString](evt);
                }
                catch(err)
                {
                    //_log('DEBUG: ' + target.nodeName + ' ' + eventType + ' | Error: Object does not support this property or method (can happen in IE8, other browsers?)');
                }
            };
            target.attachEvent('on' + eventType, target[functionString]);
        }
        else
        {
            eventType = 'on' + eventType;
            if(typeof target[eventType] === 'function')
            {
                var oldListener = target[eventType];
                target[eventType] = function()
                {
                    oldListener();
                    return functionRef();
                };
            }
            else
            {
                target[eventType] = functionRef;
            }
        }
    };
    // ** END: Add event listener (xbrowser-legacy)

    // ** Remove event listener (xbrowser-legacy)
    var _detachEventListener = function(target, eventType, functionRef, capture)
    {
        if(typeof target.removeEventListener !== 'undefined')
        {
            target.removeEventListener(eventType, functionRef, capture);
        }
        else if(typeof target.detachEvent !== 'undefined')
        {
            var functionString = eventType + functionRef;
            target.detachEvent('on' + eventType, target[functionString]);
            target['e' + functionString] = null;
            target[functionString] = null;
        }
        else
        {
            target['on' + eventType] = null;
        }
    };

    // ** Get event target (xbrowser-legacy)
    var _target = function(e)
    {
        var t = e.target || e.srcElement;
        if(t.nodeType === 3) { t = t.parentNode; }
        return t;
    };

    // ** Stop event from bubbling (xbrowser-legacy)
    var _stopEvent = function(e)
    {
        if(typeof e.stopPropagation !== 'undefined')
        {
            e.stopPropagation();
        }
        else
        {
            e.cancelBubble = true;
        }
    };

    // ** Stop default event action (xbrowser-legacy)
    var _stopDefault = function(e)
    {
        if(typeof e.preventDefault !== 'undefined')
        {
            e.preventDefault();
        }
        if(typeof e.returnValue !== 'undefined')
        {
            e.returnValue = false;
        }
    };

    // ** Get window width
    var _winWidth = function() { return window.innerWidth || document.documentElement.clientWidth || _body().clientWidth; }

    // ** Get window height
    var _winHeight = function() { return window.innerHeight || document.documentElement.clientHeight || _body().clientHeight; }

    // ** Get computed style (xbrowser-legacy)
    // @prop = need to be in quotes and 'camelCase'
    var _getStyle = function(el, prop)
    {
        return (typeof getComputedStyle !== 'undefined' ? getComputedStyle(el, null) : el.currentStyle)[prop];
    };

    // ** Check if element contains specific class
    var _hasClass = function(el, classValue)
    {
        var pattern = new RegExp('(^|\\s)' + classValue + '(\\s|$)');
        return pattern.test(el.className);  // boolean
    };

    // ** Add class to element
    var _addClass = function(el, classValue)
    {
        if(!(_hasClass(el, classValue)))
        {
            if(el.className === '')
            {
                el.className = classValue;
            }
            else
            {
                el.className += ' ' + classValue;
            }
        }
    };

    // ** Remove class from element
    var _removeClass = function(el, classValue)
    {
        if(_hasClass(el, classValue))
        {
            var reg = new RegExp('(^|\\s)' + classValue + '(\\s|$)');
            var newClass = el.className.replace(reg, ' ');
            el.className = newClass.replace(/^\s+|\s+$/g,''); // remove leading and trailing whitespace
        }
    };

    // ** Get object from array by using id
    var _getObjById = function(id)
    {
        for(var i = 0; i < _boxObj.length; i++)
        {
            if(_boxObj[i].id === id)
            {
                return _boxObj[i];
            }
        }
        return null; // if no object found
    };

    // ** Check if array matches ALL test-values
    var _matchAll = function(arr, str, exp, sep)
    {
        // ** Parameters
        // @arr = array that holds the values we want to match against
        // @str = string/array that we want to match with the above array
        // @exp = true = split string into array, using separator,
        //         false (or omitted) = do not split, treat string as one value.
        // @sep = character that is used as a string splitter, for instance a space ' ' or comma ','
        //         or other character enclosed in single quotes. If omitted then a space ' ' is used as the default separator

        var val = str;
        if(exp === true)
        {
            if(typeof sep === 'undefined')
            {
                sep = ' '; // space is default separator
            }
            val = str.split(sep);
        }

        var passed = 0;
        for(var i = 0; i < val.length; i++)
        {
            for(var j = 0; j < arr.length; j++)
            {
                if(arr[j] === val[i])
                {
                    passed++;
                }
            }
        }

        // ** Ensure that ALL values matched, else return failure.
        //    Total items tested equal the number of items passed
        if(val.length === passed) { return true; }
        return false;
    };
    // ** END: Check if array matches ALL test-values

    // ** Adjust element size and position according to window size (responsive-mode)
    var _adjustElSizePos = function(id)
    {
        var el = document.getElementById(id);
        var obj = _getObjById(el.id.split('_1')[0]);

        // ** Check if element exist
        if(el)
        {
            // ** If height is larger or equal to window height, disable vertical alignment,
            //    position to: top (try to prevent out of view)

            if( _s2i(el.offsetHeight + obj.customPosY) >= _winHeight() )
            {
                // ** Try to retain responsiveness by setting default values
                el.style.top = '0';
                el.style.marginTop = '0';
                el.style.marginBottom = '0';
                //el.style.height = '';       // DISABLED, was making box height flicker in size
                //el.style.maxHeight = '';    // DISABLED, was making box height flicker in size

                // ** Remove borders top and bottom
                el.style.borderTopWidth = '0';
                el.style.borderBottomWidth = '0';

                // ** Reset variable since it went too far and triggered responsive-mode
                obj.customPosY = 0;

                // ** Hide body scrollbar, show dialogbox own scrollbar and enable it
                if( _hasClass(el.parentNode, 'dlg-multi') || _hasClass(el.parentNode, 'dlg-disable-overlay') || _hasClass(el.parentNode, 'dlg-nomodal') )
                {
                    _scrollbarHide();
                    el.parentNode.style.overflow = 'auto';
                    if(window.PointerEvent) { el.parentNode.style.pointerEvents = 'auto'; }
                }
            }
            // ** Else if window height larger than dialogbox height, set dialogbox position free
            //    If no custom values are set, then center dialog vertically
            else
            {
                if(!obj.customPosY)
                {
                    el.style.top = ( (_winHeight() / 2) - (el.offsetHeight / 2) ) + 'px';
                }
                else
                {
                    //el.style.top = el.customPosY + 'px';
                    el.style.top = obj.customPosY + 'px';
                }

                if(obj.customHeight)
                {
                    el.style.height = obj.customHeight + 'px';
                }

                el.style.borderTopWidth = '';
                el.style.borderBottomWidth = '';

                // ** Check if multiple boxes
                if( _hasClass(el.parentNode, 'dlg-multi') || _hasClass(el.parentNode, 'dlg-disable-overlay') || _hasClass(el.parentNode, 'dlg-nomodal') )
                {
                    _scrollbarShow();
                    el.parentNode.style.overflow = 'hidden';
                    if(window.PointerEvent) { el.parentNode.style.pointerEvents = 'none'; }
                }
                else
                {
                    // ** Keep body scrollbar hidden for all other dialogbox types which are using overlay
                    _scrollbarHide();
                }
            }

            // ** If width is larger or equal to window width, disable horizontal alignment,
            //    position to: left (try to prevent out of view)

            var overlap = 30; // default: 30 (was 40), value to help width-detection trigger responsivemode
            if( _s2i(el.offsetWidth + obj.customPosX + overlap) >= _winWidth() )
            {
                // ** Try to retain responsiveness by setting default values
                el.style.left = '0';
                el.style.marginLeft = '0';
                el.style.marginRight = '0';
                //el.style.width = '';       // DISABLED, was making box width flicker in size
                //el.style.maxWidth = '';    // DISABLED, was making box width flicker in size

                // ** Remove borders left and right (helps to prevent horizontal scrollbar)
                el.style.borderLeftWidth = '0';
                el.style.borderRightWidth = '0';

                // ** Reset variable since it went too far and triggered responsive-mode
                obj.customPosX = 0;
            }
            // ** Else if window width larger than dialogbox width, let dialogbox free
            //    If no custom values are set, then center dialog horizontally
            else
            {
                if(!obj.customPosX)
                {
                    el.style.left = ( (_winWidth() / 2) - (el.offsetWidth / 2) ) + 'px';
                }
                else
                {
                    el.style.left = obj.customPosX + 'px';
                }

                if(obj.customWidth)
                {
                    el.style.maxWidth = obj.customWidth + 'px';
                }

                el.style.borderLeftWidth = '';
                el.style.borderRightWidth = '';
            }
        }

        // ** TODO: (maybe)
        //    If custom position and "dlg-disable-drag" is set,
        //    then set dialog back to its custom pos if window
        //    is larger than dialog after being resized,
        //    not just position it in center of window.
    };
    // ** END: Adjust element size and position according to window size

    // ** Shorthand for getting elements inside the box, or the box element itself
    var _getEl = function(objId, str)
    {
        // ** Get dialogbox element
        var box = document.getElementById(objId + '_1');

        // ** If not specified return box element itself
        if(!str) { return box; }

        // ** Trim leading and trailing spaces
        str = _trim(str);

        // ** If string contains '#' (hash), and NOT any multiple selector chars
        if( str.indexOf('#') !== -1 && str.match(/[\s+>,+:\[]/g) === null )
        {
            return box.querySelector(str);  // return ONE single element
        }
        // ** Else must be several elements query
        else
        {
            if(box)
            {
                var q = box.querySelectorAll(str);
                if(q.length) { return q; }
            }
        };

        _log('DEBUG: _getEl(): ' + str + ' cannot be found, return: null');
        return null;
    };
    // ** END: Shorthand for getting elements inside the box, or the box element itself

    // ** Get highest z-index of the dialogs, then return highest + 1
    var _getZindex = function(el)
    {
        var zIndex = _s2i(_getStyle(el, 'zIndex'));
        for(var i = 0; i < _boxObj.length; i++)
        {
            if(zIndex <= _s2i(_getStyle(_getEl(_boxObj[i].id).parentNode, 'zIndex')) && _getEl(_boxObj[i].id).parentNode !== el)
            {
                zIndex = _s2i(_getStyle(_getEl(_boxObj[i].id).parentNode, 'zIndex')) + 1;
            }
        }
        return _s2i(zIndex);
    };
    // ** END: Get highest z-index of the dialogs, then return highest + 1

    // ** Hide scrollbar while retaining padding, prevent body content shift
    var _scrollbarHide = function()
    {
        // ** Prevent function from running if already applied
        if( !(_hasClass(_body(), 'dlg-stop-scrolling')) )
        {
            // ** Store the original padding-right value
            _orgBodyPadRight = _getStyle(_body(), 'paddingRight');

            // ** Convert from string to integer (remove 'px' postfix and return value as integer)
            _orgBodyPadRight = _s2i(_orgBodyPadRight);

            // ** Get width of body before removing scrollbar
            var w1 = _body().offsetWidth;

            // ** Stop scrolling of background content (body) when dialogbox is in view, removes scrollbar
            _addClass(_body(), 'dlg-stop-scrolling');

            // ** Get width of body after removing scrollbar
            var w2 = _body().offsetWidth;

            // ** Get width-difference (scrollbarwidth?)
            var w3 = w2 - w1;

            // ** If conditions are true: add both padding-right values,
            if(typeof _orgBodyPadRight === 'number' && _orgBodyPadRight > 0)
            {
                w3 += _s2i(_orgBodyPadRight);
            }

            // ** Apply width-difference as padding-right to body, substitute for scrollbar,
            //    can prevent contentshift if content is centered when scrollbar disappears.
            _body().setAttribute('style','padding-right:' + w3 + 'px;');
        }
    };
    // ** END: Hide scrollbar while retaining padding

    // ** Restore and show scrollbar
    var _scrollbarShow = function(el,obj)
    {
        // ** If both params are set then go ahead
        if(el && obj)
        {
            // ** Check if multiple boxes are visible before restoring body scrollbar
            if( _hasClass(el, 'dlg-multi') || _hasClass(el, 'dlg-disable-overlay') || _hasClass(el, 'dlg-nomodal') )
            {
                var multi = 0;
                for(var i = 0; i < _boxObj.length;i++)
                {
                    if(_boxObj[i].bVisible && _boxObj[i].id !== obj.id)
                    {
                        multi++;
                    }
                }

                // ** Other boxes are still visible so do NOT restore body scrollbar
                if(multi !== 0)
                {
                    return false;
                }
            }
        }

        // ** Reset and enable scrollbar if flag is set true
        if(_hasClass(_body(), 'dlg-stop-scrolling'))
        {
            _removeClass(_body(), 'dlg-stop-scrolling');
            _body().setAttribute('style', 'padding-right:' + _s2i(_orgBodyPadRight) + 'px;');
        }
        return true;
    };
    // ** END: Restore and show scrollbar

    // ** Fade in/out element
    var _fade = function(el, dir, fn, spd)
    {
        var n;
        (dir) ? n = 10 : n = 0;
        var t = setInterval(function()
        {
            (dir) ? n-- : n++;
            el.style.opacity = n / 10;
            if( (dir && n <= 0) || (!dir && n >= 10) )
            {
                clearInterval(t);
                if(typeof fn === 'function') { fn(); }
            }
        }, spd || 30);  // default speed: 30
    };
    // ** END: Fade in/out element

    // ** Add custom button to footer
    var _addButton = function(objId, strText, fnClick, nPos)
    {
        var f = _getEl(objId, '.dlg-footer');
        if(f)
        {
            var b = document.createElement('button');
            var t = document.createTextNode(strText);
            b.appendChild(t);
            f = f[0];
            f.getElementsByTagName('button')[nPos] ? f.insertBefore(b, f.getElementsByTagName('button')[nPos]) : f.appendChild(b);
            _attachEventListener(b, 'click', fnClick);
            return b;
        }
        return null;
    };

    // ** Calculate message height
    var _calcHeight = function(el,obj)
    {
        // ** Set total message height start
        var msgHeight = _s2i(obj.h);

        // ** If heading is NOT disabled
        if( !(_hasClass(el, 'dlg-disable-heading')) )
        {
            var head = _getEl(obj.id, '#' + obj.id + ' .dlg-heading');
            if(head)
            {
                head = head[0];
                msgHeight -= _s2i(_getStyle(head, 'height')) +
                _s2i(_getStyle(head, 'paddingTop')) +
                _s2i(_getStyle(head, 'paddingBottom')) +
                _s2i(_getStyle(head, 'borderTopWidth')) +
                _s2i(_getStyle(head, 'borderBottomWidth'));
            }
        }

        // ** If footer is NOT disabled
        if( !(_hasClass(el, 'dlg-disable-footer')) )
        {
            var foot = _getEl(obj.id, '#' + obj.id + ' .dlg-footer');
            if(foot)
            {
                foot = foot[0];
                msgHeight -= _s2i(_getStyle(foot, 'height')) +
                _s2i(_getStyle(foot, 'paddingTop')) +
                _s2i(_getStyle(foot, 'paddingBottom')) +
                _s2i(_getStyle(foot, 'borderTopWidth')) +
                _s2i(_getStyle(foot, 'borderBottomWidth'));
            }
        }

        // ** Get message element, adjust custom height
        var msg = _getEl(obj.id, '.dlg-message');
        if(msg)
        {
            msg = msg[0];
            msgHeight -= _s2i(_getStyle(msg, 'borderTopWidth')) +
            _s2i(_getStyle(msg, 'paddingTop')) +
            _s2i(_getStyle(msg, 'paddingBottom')) +
            _s2i(_getStyle(msg, 'borderBottomWidth'));
            msg.style.height = _s2i(msgHeight) + 'px';
            msg.style.maxHeight = _s2i(msgHeight) + 'px';
        }
    };
    // ** END: Calculate message height

    // ** Show dialog box
    var _show = function(objId)
    {
        // ** If modal is already displayed then return false
        if(_bModalActive)
        {
            _log('DEBUG: show(): Dialog could not be displayed! A modal dialog is currently active!');
            return false;
        };

        // ** Get object
        var obj = _getObjById(objId);

        // ** Check if box exist
        if(obj !== null)
        {
            // ** Get element (dialog surface overlay)
            var dlg = document.getElementById(obj.id);

            // ** Hide scrollbar (if element does not contain classes) (is modal dialog)
            if( !(_hasClass(dlg, 'dlg-disable-overlay')) && !(_hasClass(dlg, 'dlg-nomodal')) && !(_hasClass(dlg, 'dlg-multi')) )
            {
                _scrollbarHide();
                _bModalActive = true; // set modal flag true
            }

            // ** Make it draggable, unless flag is set
            if( !(_hasClass(dlg, 'dlg-disable-drag')) )
            {
                _drag.init(obj.id + '_1');
            }

            // ** Show the hidden dialog (overlay and boxsurface), bring dialog to top
            dlg.style.display = 'block';
            dlg.style.zIndex = _s2i(_getZindex(dlg));

            // ** Fade in if variable true
            if(obj.bFade)
            {
                dlg.style.opacity = 0;
                _fade(dlg);
            }

            // ** Get the dialogbox itself
            var box = document.getElementById(obj.id + '_1');

            // ** Check if position is set, if true then change position, else default value used
            if(typeof obj.x === 'number' || typeof obj.x === 'string')
            {
                box.style.left = _s2i(obj.x) + 'px';
                obj.customPosX = _s2i(obj.x);
            }
            // ** Check if position is set, if true then change position, else default value used
            if(typeof obj.y === 'number' || typeof obj.y === 'string')
            {
                box.style.top = _s2i(obj.y) + 'px';
                obj.customPosY = _s2i(obj.y);
            }
            // ** END: Check if position is set

            // ** Check if size is set, if true then change size, else default value used
            if(obj.w)
            {
                box.style.maxWidth = _s2i(obj.w) + 'px';
                obj.customWidth = _s2i(obj.w);
            }
            // ** Check if size is set, set custom
            if(obj.h)
            {
                //box.style.height = _s2i(obj.h) + 'px';    // DISABLED, only set custom
                //box.style.maxHeight = _s2i(obj.h) + 'px'; // DISABLED, only set custom

                obj.customHeight = _s2i(obj.h);
            }
            // ** END: Check if size is set

            // ** If custom height then adjust
            if(obj.customHeight)
            {
                _calcHeight(obj.el, obj);
            }
            // ** END: If custom height then adjust

            // ** Show the dialog box itself, set flag, run on-func
            box.style.visibility = 'visible';
            obj.bVisible = true;
            obj.onShow();

            // ** Position box in viewport (defaults to center if no custom position has been set, or no moving has occurred)
            _adjustElSizePos(obj.id + '_1');

            _log('DEBUG: show(): executed');

            // ** Return object
            return obj;
        }

        // ** Return fail
        _log('DEBUG: show(): error, object do not exist');
        return false;
    };
    // ** END: Show dialog box

    // ** Hide dialog box
    var _hide = function(objId, bSkip)
    {
        var dlg = document.getElementById(objId);
        var box = document.getElementById(objId + '_1');

        // ** Get the object stored in the array
        var obj = _getObjById(objId);

        // ** Save position - preHTML dialogboxes depends on this to remember last position
        if(obj.x)
        {
            obj.xPos(obj.x);
        }
        if(obj.y)
        {
            obj.yPos(obj.y);
        }

        // ** Save current size
        if(obj.w)
        {
            obj.width(obj.w);
        }

        if(obj.h)
        {
            obj.height(obj.h);
        }

        // ** Hide the overlay/fade out, run "onHide"
        if(dlg && box)
        {
            // ** Run "onHide", do NOT fade out
            if(bSkip !== true && !obj.bFade)
            {
                dlg.style.display = 'none';
                box.style.visibility = 'hidden';
                obj.bVisible = false;
                obj.onHide();
            }
            // ** Run "onHide" and fade out
            else if(bSkip !== true && obj.bFade)
            {
                _fade(dlg, true, function()
                {
                    dlg.style.display = 'none';
                    box.style.visibility = 'hidden';
                    obj.bVisible = false;
                    obj.onHide();
                });
            }
            // ** Do NOT run "onHide" and do NOT fade out
            else if(bSkip === true && !obj.bFade)
            {
                dlg.style.display = 'none';
                box.style.visibility = 'hidden';
                obj.bVisible = false;
            }
            else
            {
                dlg.style.display = 'none';
                box.style.visibility = 'hidden';
                obj.bVisible = false;
            }
        }

        // ** Restore body scrollbar
        _scrollbarShow(dlg,obj);

        // ** Reset flag if modal
        if( !(_hasClass(dlg, 'dlg-disable-overlay')) && !(_hasClass(dlg, 'dlg-nomodal')) && !(_hasClass(dlg, 'dlg-multi')) )
        {
            _bModalActive = false;
        }

        // ** Return object
        return obj;
    };
    // ** END: Hide dialog box

    // ** Close and destroy dialog box
    var _destroy = function(objId)
    {
        var success = false; // set default: false

        // ** Get the object stored in the objectarray (memory)
        var obj = _getObjById(objId);

        // ** Get the dlg element
        var dlg = document.getElementById(objId);

        // ** Begin destroying if element exist
        if(dlg)
        {
            // ** Hide it visually (if not already)
            dlg.style.display = 'none';

            // ** Restore body scrollbar
            _scrollbarShow(dlg,obj);

            // ** Reset flag if modal
            if( !(_hasClass(dlg, 'dlg-disable-overlay')) && !(_hasClass(dlg, 'dlg-nomodal')) && !(_hasClass(dlg, 'dlg-multi')) )
            {
                _bModalActive = false;
            }

            // ** Run onDestroy function
            obj.onDestroy();

            // ** If promptbox was created, remove eventlisteners
            var pBox = dlg.querySelectorAll('.dlg-input-field');
            if(pBox.length > 0)
            {
                pBox[0].onkeyup = null;
                pBox[0].onchange = null;
            }

            // ** Remove it from DOM
            dlg.parentNode.removeChild(dlg);

            // ** Flag that the box as no longer in DOM
            obj.bExistInDOM = false;

            // ** Flag that the box is no longer visible (this can be useful if keeping box alive)
            obj.bVisible = false;

            // ** Remove object from array
            var index = _boxObj.indexOf(obj);
            if(index > -1)
            {
                setTimeout(function()
                {
                    var wasDeleted = _boxObj.splice(index, 1);

                    if(wasDeleted.length === 1)
                    {
                        success = true;
                        _log('DEBUG: destroy(): object deleted from object array');
                    }
                    else
                    {
                        success = false;
                        _log('DEBUG: destroy(): Error, object NOT deleted from object array');
                    }
                }, 10);
            }
            else
            {
                _log('DEBUG: destroy(): Error, object not found in array');
                success = false;
            }
        }

        // ** Return boolean
        return success;
    };
    // ** END: Close and destroy dialog box

    // ** Create dialogbox and insert it into DOM
    var _create = function(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h)
    {
        // ** Check if object already exist, if so return that object instead of creating a new
        var existingObj = _getObjById(strId + '_0');
        if(existingObj)
        {
            _log('DEBUG: create(): new object not created. An object with same ID already exist. Existing object returned');
            return existingObj;
        }

        // ** Remove extra spaces if any, correct matchstring before doing match
        strTypeClass = strTypeClass.replace(/\s+/g,' ');
        strTypeClass = _trim(strTypeClass);

        // ** Check if types are correct
        var matched = _matchAll(_strBoxTypeList, strTypeClass, true);

        // ** Check if valid types
        if(matched === true)
        {
            // ** Check if id is set, if not, then create a new random string to use as id
            if(strId === '' || typeof strId === 'undefined' || strId === null || strId === 0)
            {
                // ** Create a unique string for the 'id'
                strId = 'a'; // start with letter, else selector is not valid CSS/JS, was causing bug/error.
                strId += Math.random().toString(36).substr(2,9);
            }

            // ** Add token to object id (so we dont mix up id's, avoiding parent child mismatch)
            strId += '_0';

            // ** Check if value is set, if not set it to: false
            if(typeof fnCallback === 'undefined')
            {
                fnCallback = false;
            }

            // ** Begin creating the object
            var obj =
            {
                // ** Properties
                id : strId,
                strTypeClass : strTypeClass,
                strTitle : strTitle,
                strMessage : strMessage,
                x : x,
                y : y,
                w : w,
                h : h,
                strInput : '',
                nRetCode : -1,
                bVisible : false,
                bExistInDOM : false,
                bFade : false,
                bResize : false,
                nTimeId : null,
                el : null,
                customPosX : null,
                customPosY : null,
                customWidth : null,
                customHeight : null,

                // ** Callback
                callback : function(a,b)
                {
                    try
                    {
                        if(typeof a === 'undefined')
                        {
                            a = this.nRetCode;
                        }

                        if(typeof b === 'undefined')
                        {
                            b = this.strInput;
                        }

                        // ** Check which kind of box and if it has a callback function
                        if(typeof window[fnCallback] === 'function')
                        {
                            // ** Execute function (pre-written HTML boxes(?))
                            window[fnCallback](a,b);
                        }
                        else if(typeof fnCallback === 'function')
                        {
                            // ** Execute function (script-created boxes(?))
                            fnCallback(a,b);
                        }
                        else if(fnCallback === false || fnCallback === 0 || fnCallback === null)
                        {
                            return false;
                        }
                        else
                        {
                            _log('\n\nDEBUG: If the dialogbox does not have a callback function, you can ignore the below message:');
                            _log('       typeof fnCallback = "' + typeof fnCallback + '" and not a function.');
                            _log('       Scope? Possible solution can be to use "hoisting".');
                            _log('       Try to use "var callbackFuncName = function(a,b){}" instead of "let callbackFuncName = function(a,b){}"');
                            _log('       ..or declare the callback function before the module "' + _name + '" is initialized\n\n');
                        }
                    }
                    catch(err)
                    {
                        _log('DEBUG: fnCallback(): error: ' + err);
                    }
                },

                // ** Show
                show : function()
                {
                    return _show(this.id);
                },

                // ** Hide
                hide : function(nMsec, bSkip)
                {
                    if(nMsec !== 0 && typeof nMsec === 'number')
                    {
                        var that = this;
                        that.nTimeId = setTimeout(function()
                        {
                            return _hide(that.id, bSkip);
                        }, nMsec);
                    }
                    else
                    {
                        return _hide(this.id, bSkip);
                    }
                },

                // ** Destroy
                destroy : function()
                {
                    return _destroy(this.id);
                },

                // ** onCreate
                onCreate : function()
                {
                    _log('DEBUG: Default "obj.onCreate()" function fired. Override this by creating your own.');
                },

                // ** onShow
                onShow : function()
                {
                    _log('DEBUG: Default "obj.onShow()" function fired. Override this by creating your own.');
                },

                // ** onHide
                onHide : function()
                {
                    _log('DEBUG: Default "obj.onHide()" function fired. Override this by creating your own.');
                },

                // ** onClose
                onClose : function()
                {
                    _log('DEBUG: Default "obj.onClose()" function fired. Override this by creating your own.');
                },

                // ** onDestroy
                onDestroy : function()
                {
                    _log('DEBUG: Default "obj.onDestroy()" function fired. Override this by creating your own.');
                },

                // ** Shorthand for getting element
                $ : function(str)
                {
                    return _getEl(this.id, str);
                },

                // ** Set border color
                colorBorder : function(color)
                {
                    _getEl(this.id).style.borderColor = color;
                    return this;
                },

                // ** Set heading backgroundcolor
                colorHeading : function(color)
                {
                    _getEl(this.id, '#' + this.id + '_1_heading').style.backgroundColor = color;
                    return this;
                },

                // ** Set both colors
                color : function(color)
                {
                    if(_getEl(this.id, '#' + this.id + '_1_heading'))
                    {
                        _getEl(this.id, '#' + this.id + '_1_heading').style.backgroundColor = color;
                    }
                    _getEl(this.id).style.borderColor = color;
                    return this;
                },

                // ** Set width
                width : function(n)
                {
                    this.w = this.customWidth = _s2i(n);
                    //_getEl(this.id).style.width = this.w + 'px';  // DISABLED: breaks "responsiveness" (triggers horizontal scroll)
                    _getEl(this.id).style.maxWidth = this.w + 'px';
                    return this;
                },

                // ** Set height
                height : function(n)
                {
                    var el = _getEl(this.id);
                    this.h = this.customHeight = _s2i(n);
                    _getEl(this.id).style.height = this.h + 'px';
                    _getEl(this.id).style.maxHeight = this.h + 'px';
                    _calcHeight(el.parentNode, this);
                    return this;
                },

                // ** Set position X (left)
                xPos : function(n)
                {
                    this.x = this.customPosX = _s2i(n);
                    _getEl(this.id).style.left = this.x + 'px';
                    return this;
                },

                // ** Set position Y (top)
                yPos : function(n)
                {
                    this.y = this.customPosY = _s2i(n);
                    _getEl(this.id).style.top = this.y + 'px';
                    return this;
                },

                // ** Center dialogbox in window
                center : function()
                {
                    var el = _getEl(this.id);
                    el.style.left = ( (_winWidth() / 2) - (el.offsetWidth / 2) ) + 'px';
                    el.style.top = ( (_winHeight() / 2) - (el.offsetHeight / 2) ) + 'px';
                    return this;
                },

                // ** Add custom button to footer
                addButton : function(strText, fnClick, nPos)
                {
                    return _addButton(this.id, strText, fnClick, nPos);
                }
            }
            _boxObj.push(obj);  // insert object into object-array
            // ** END: creating the object


            //---------------------------------------------------------------------
            // ** Create DOM element
            //---------------------------------------------------------------------

            // ** Get object from id, reuse same 'obj' variable as defined above
            obj = _getObjById(strId);

            // ** Fix for pre-written HTML boxes: add '_0' to id before getting object
            if(obj === null)
            {
                strId += '_0';
                obj = _getObjById(strId);
            }

            // ** Create dialog surface and insert into parent element (body)
            var dlg = document.createElement('div');
            dlg.setAttribute('id', obj.id);
            dlg.setAttribute('class', obj.strTypeClass);
            _body().appendChild(dlg);

            // ** If type 'dlg-toast' then add flags
            if(_hasClass(dlg, 'dlg-toast'))
            {
                _removeClass(dlg, 'dlg-toast');
                _addClass(dlg, 'dlg dlg-disable-heading dlg-disable-footer dlg-disable-drag dlg-disable-overlay');
            }

            // ** If type 'dlg-fade' then set "bFade" true
            if(_hasClass(dlg, 'dlg-fade'))
            {
                obj.bFade = true;
            }

            // ** If element exist in DOM, proceed
            if(dlg)
            {
                // ** Create the box (the dialogbox itself)
                var box = document.createElement('div');
                box.setAttribute('id', obj.id + '_1');
                box.setAttribute('class','dlg-box');
                dlg.appendChild(box);

                // ** Add extra styles if flags are set, and remove from parent
                if(_hasClass(dlg, 'dlg-rounded'))
                {
                    _addClass(box, 'dlg-rounded');
                    _removeClass(dlg, 'dlg-rounded');
                }
                if(_hasClass(dlg, 'dlg-shadow'))
                {
                    _addClass(box, 'dlg-shadow');
                    _removeClass(dlg, 'dlg-shadow');
                }

                // ** Create heading if disable-flag is NOT set
                if(!(_hasClass(dlg, 'dlg-disable-heading')))
                {
                    // ** Create heading
                    var heading = document.createElement('div');
                    heading.setAttribute('id', obj.id + '_1_heading');
                    heading.setAttribute('class','dlg-heading');
                    box.appendChild(heading);

                    // ** Create [X] close button
                    var closeX = document.createElement('span');
                    closeX.setAttribute('class','dlg-close-x');
                    //var closeText = document.createTextNode('\u00D7'); // u00D7 = unicode X
                    //closeX.appendChild(closeText);
                    closeX.innerHTML = '&#215;'; // using HTML entity instead, avoid the need to specify unicode charset for javascript ?
                    heading.appendChild(closeX);

                    // ** Create title (here because of z-index)
                    var titleText = document.createTextNode(obj.strTitle);
                    heading.appendChild(titleText);
                }
                else
                {
                    // ** Create [X] close button in messagebody instead
                    var closeX = document.createElement('span');
                    closeX.setAttribute('class','dlg-close-x');
                    closeX.innerHTML = '&#215;';
                    box.appendChild(closeX);
                }

                // ** Create message/content container
                var message = document.createElement('div');

                // ** Prepare reference to inner boxes (used if icon is set)
                var leftbox = null;
                var rightbox = null;

                // ** Check if icon should be displayed
                if(_hasClass(dlg, 'dlg-info')
                || _hasClass(dlg, 'dlg-question')
                || _hasClass(dlg, 'dlg-error')
                || _hasClass(dlg, 'dlg-success')
                || _hasClass(dlg, 'dlg-exclamation')
                )
                {
                    message.setAttribute('class','dlg-message dlg-flex-container');

                    // ** Create left box
                    leftbox = document.createElement('div');
                    leftbox.setAttribute('class','dlg-flexbox-left');

                    // ** Check which icon to display
                    if(_hasClass(dlg, 'dlg-info'))
                    {
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-info"></div>';
                    }
                    else if(_hasClass(dlg, 'dlg-question'))
                    {
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-question"></div>';
                    }
                    else if(_hasClass(dlg, 'dlg-error'))
                    {
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-error"></div>';
                    }
                    else if(_hasClass(dlg, 'dlg-success'))
                    {
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-success"></div>';
                    }
                    else if(_hasClass(dlg, 'dlg-exclamation'))
                    {
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-excl"></div>';
                    }

                    // ** Insert it into parent div
                    message.appendChild(leftbox);

                    // ** Create right box
                    rightbox = document.createElement('div');
                    rightbox.setAttribute('class','dlg-flexbox-right');
                    rightbox.innerHTML = obj.strMessage;

                    // ** Insert it into parent div
                    message.appendChild(rightbox);
                }
                else
                {
                    message.setAttribute('class','dlg-message');
                    message.innerHTML = obj.strMessage;
                }
                box.appendChild(message);

                // ** Create prompt box (input + OK + Cancel)
                if(_hasClass(dlg, 'dlg-prompt'))
                {
                    var inputbox = document.createElement('div');
                    inputbox.setAttribute('class', 'dlg-input');

                    if(_hasClass(message, 'dlg-flex-container'))
                    {
                        rightbox.appendChild(inputbox);
                    }
                    else
                    {
                        message.appendChild(inputbox);
                    }

                    var input = document.createElement('input');
                    input.setAttribute('class', 'dlg-input-field');
                    input.setAttribute('type', 'text');
                    input.setAttribute('value', obj.strInput);
                    inputbox.appendChild(input);

                    // ** Add buttons if not already stated in class
                    if(!(_hasClass(dlg, 'dlg-ok-cancel')))
                    {
                        _addClass(dlg, 'dlg-ok-cancel');
                    }
                }

                // ** Create footer and buttons
                // ** If "dlg-disable-footer" is specified in class then do not create footer or any buttons
                if(!(_hasClass(dlg, 'dlg-disable-footer')))
                {
                    // ** Create footer
                    var footer = document.createElement('div');
                    footer.setAttribute('class','dlg-footer');
                    box.appendChild(footer);

                    // ** If "dlg-disable-btns" is NOT specified in class, then make buttons
                    if(!(_hasClass(dlg, 'dlg-disable-btns')))
                    {
                        // ** If "Yes" button is specified in class
                        if(_hasClass(dlg, 'dlg-yes')
                        || _hasClass(dlg, 'dlg-yes-no')
                        )
                        {
                            // ** Create button
                            var yesBtn = document.createElement('button');
                            yesBtn.setAttribute('class','dlg-yes-btn');
                            var yesBtnText = document.createTextNode(_btnTextYes);
                            yesBtn.appendChild(yesBtnText);
                            footer.appendChild(yesBtn);
                        }

                        // ** If "No" button is specified in class
                        if(_hasClass(dlg, 'dlg-no')
                        || _hasClass(dlg, 'dlg-yes-no')
                        )
                        {
                            // ** Create button
                            var noBtn = document.createElement('button');
                            noBtn.setAttribute('class','dlg-no-btn');
                            var noBtnText = document.createTextNode(_btnTextNo);
                            noBtn.appendChild(noBtnText);
                            footer.appendChild(noBtn);
                        }

                        // ** If "OK" button is specified in class
                        if(_hasClass(dlg, 'dlg-ok')
                        || _hasClass(dlg, 'dlg-ok-cancel')
                        )
                        {
                            // ** Create button
                            var okBtn = document.createElement('button');
                            okBtn.setAttribute('class','dlg-ok-btn');
                            var okBtnText = document.createTextNode(_btnTextOk);
                            okBtn.appendChild(okBtnText);
                            footer.appendChild(okBtn);
                        }

                        // ** If "Cancel" button is specified in class
                        if(_hasClass(dlg, 'dlg-cancel')
                        || _hasClass(dlg, 'dlg-ok-cancel')
                        )
                        {
                            // ** Create button
                            var cancelBtn = document.createElement('button');
                            cancelBtn.setAttribute('class','dlg-cancel-btn');
                            var cancelBtnText = document.createTextNode(_btnTextCancel);
                            cancelBtn.appendChild(cancelBtnText);
                            footer.appendChild(cancelBtn);
                        }

                        // ** If "dlg" or "Close" button is specified in class
                        if(_hasClass(dlg, 'dlg-close') // <-- need to be first
                        || _hasClass(dlg, 'dlg')
                        )
                        {
                            // ** Create button
                            var closeBtn = document.createElement('button');
                            closeBtn.setAttribute('class','dlg-close-btn');
                            var closeBtnText = document.createTextNode(_btnTextClose);
                            closeBtn.appendChild(closeBtnText);
                            footer.appendChild(closeBtn);
                        }
                    }
                }
                // ** END: Create footer and buttons


                //---------------------------------------------------------------------
                // ** Create event-listeners
                //---------------------------------------------------------------------

                // ** Window resize
                _attachEventListener(window, 'resize', function WindowResize()
                {
                    if(obj.bVisible)
                    {
                        _adjustElSizePos(obj.id + '_1');
                    }
                });
                // ** END: Window resize

                // ** User clicks the [X] button
                var xCloseDialog = dlg.querySelector('.dlg-close-x');
                if(xCloseDialog)
                {
                    _attachEventListener(xCloseDialog, 'click', function XCloseClick()
                    {
                        // ** Remove eventlistener
                        // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                        //_detachEventListener(xCloseDialog, 'click', XCloseClick, false);

                        // ** Close dialogbox, reset values, clean up
                        //obj.destroy();  // changed from "destroy" to "hiding", keep the dialogbox in DOM
                        obj.hide(0, true);  // true = do not run obj.onHide()

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        obj.nRetCode = CLOSE;

                        // ** Run onClose function
                        obj.onClose();
                    });
                }
                // ** END: [X] button click handler

                // ** User clicks the CLOSE button
                var btnCloseDialog = dlg.querySelector('.dlg-close-btn');
                if(btnCloseDialog)
                {
                    _attachEventListener(btnCloseDialog, 'click', function BtnCloseClick()
                    {
                        // ** Remove eventlistener
                        // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                        //_detachEventListener(btnCloseDialog, 'click', BtnCloseClick, false);

                        // ** Close dialogbox, reset values, clean up
                        //obj.destroy();  // changed from "destroy" to "hiding", keep the dialogbox in DOM
                        obj.hide(0, true);  // true = do not run obj.onHide()

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        obj.nRetCode = CLOSE;

                        // ** Run onClose function
                        obj.onClose();
                    });
                }
                // ** END: CLOSE button click handler

                // ** User clicks anywhere outside of the dialogbox to close it
                if( !(_hasClass(dlg, 'dlg-disable-clickout')) && !(_hasClass(dlg, 'dlg-multi')) )
                {
                    _attachEventListener(dlg, 'click', function ClickOutClose(e)  // changed FROM: window  TO: dlg
                    {
                        e = e || window.event;
                        if(_target(e) === dlg)
                        {
                            // ** Remove eventlistener
                            // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(window, 'click', ClickOutClose, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0, true);  // true = do not run obj.onHide()

                            // ** Callback, return code: CLOSE
                            obj.callback(CLOSE);
                            obj.nRetCode = CLOSE;

                            // ** Run onClose function
                            obj.onClose();
                        }
                    });
                }
                // ** END: window click outside box click handler

                // ** Close box on ESC-key
                if( !(_hasClass(dlg, 'dlg-disable-esc')) && !(_hasClass(dlg, 'dlg-multi')) )
                {
                    _attachEventListener(document, 'keyup', function EscKeyClose(e)
                    {
                        // ** Get/set event variable
                        e = e || window.event;

                        // ** Listen for key (xbrowser)
                        if(e.which === 27 || e.keyCode === 27 || e.key === 'Escape' || e.code === 'Escape')
                        {
                            if(obj.bVisible)
                            {
                                // ** Remove eventlistener
                                // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                                //_detachEventListener(window, 'keyup', EscKeyClose, false);

                                // ** Close dialogbox, reset values, clean up
                                //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                                obj.hide(0, true);  // true = do not run obj.onHide()

                                // ** Callback, return code: CLOSE
                                obj.callback(CLOSE);
                                obj.nRetCode = CLOSE;

                                // ** Run onClose function
                                obj.onClose();

                                // ** Prevent default event action and bubbling
                                //_stopEvent(e);
                                //_stopDefault(e);
                                //return false;
                            }
                        }
                    });
                }
                // ** END: Close box on ESC-key

                // ** If YES-NO messagebox, create click handler for YES and NO buttons
                if(_hasClass(dlg, 'dlg-yes-no')
                || _hasClass(dlg, 'dlg-yes')
                || _hasClass(dlg, 'dlg-no')
                )
                {
                    // ** User clicks the YES button
                    var btnYesDialog = dlg.querySelector('.dlg-yes-btn');
                    if(btnYesDialog)
                    {
                        _attachEventListener(btnYesDialog, 'click', function BtnYesClick()
                        {
                            // ** Remove eventlistener
                            // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnYesDialog, 'click', BtnYesClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0, true);  // true = do not run obj.onHide()

                            // ** Callback, return code: YES
                            obj.callback(YES);
                            obj.nRetCode = YES;

                            // ** Run onClose function
                            obj.onClose();
                        });
                    }

                    // ** User clicks the NO button
                    var btnNoDialog = dlg.querySelector('.dlg-no-btn');
                    if(btnNoDialog)
                    {
                        _attachEventListener(btnNoDialog, 'click', function BtnNoClick()
                        {
                            // ** Remove eventlistener
                            // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnNoDialog, 'click', BtnNoClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0, true);  // true = do not run obj.onHide()

                            // ** Callback, return code: NO
                            obj.callback(NO);
                            obj.nRetCode = NO;

                            // ** Run onClose function
                            obj.onClose();
                        });
                    }
                }
                // ** END: YES-NO button click handlers

                // ** If OK-CANCEL messagebox, create click handler for OK and CANCEL buttons
                if(_hasClass(dlg, 'dlg-ok-cancel')
                || _hasClass(dlg, 'dlg-ok')
                || _hasClass(dlg, 'dlg-cancel')
                )
                {
                    // ** User clicks the OK button
                    var btnOkDialog = dlg.querySelector('.dlg-ok-btn');
                    if(btnOkDialog)
                    {
                        _attachEventListener(btnOkDialog, 'click', function BtnOkClick()
                        {
                            // ** Remove eventlistener
                            // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnOkDialog, 'click', BtnOkClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0, true);  // true = do not run obj.onHide()

                            // ** Callback, return code: OK
                            obj.callback(OK);
                            obj.nRetCode = OK;

                            // ** Run onClose function
                            obj.onClose();
                        });
                    }

                    // ** User clicks the Cancel button
                    var btnCancelDialog = dlg.querySelector('.dlg-cancel-btn');
                    if(btnCancelDialog)
                    {
                        _attachEventListener(btnCancelDialog, 'click', function BtnCancelClick()
                        {
                            // ** Remove eventlistener
                            // ** DISABLED for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnCancelDialog, 'click', BtnCancelClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0, true);  // true = do not run obj.onHide()

                            // ** Callback, return code: CANCEL
                            obj.callback(CANCEL);
                            obj.nRetCode = CANCEL;

                            // ** Run onClose function
                            obj.onClose();
                        });
                    }
                }
                // ** END: OK-CANCEL button click handlers

                // ** User types in promptbox, update variable: obj.strInput
                if(_hasClass(dlg, 'dlg-prompt'))
                {
                    var pBox = dlg.querySelector('.dlg-input-field');
                    if(pBox)
                    {
                        _attachEventListener(pBox, 'keyup', function PromptBoxKeyUp()
                        {
                            obj.strInput = pBox.value;
                        });

                        _attachEventListener(pBox, 'change', function PromptBoxChange()
                        {
                            obj.strInput = pBox.value;
                        });
                    }
                }
                // ** END: User types in promptbox

                // ** Make it draggable and bring dialogbox to top, if NOT flag is set
                if( !(_hasClass(dlg, 'dlg-disable-drag')) )
                {
                    _drag.init(box.id);

                    // ** Activate drag'n'drop when 'mouseenter' on box element/text
                    _attachEventListener(box, 'mouseenter', function ActivateDragDrop()
                    {
                        _drag.init(box.id);
                    });

                    // ** Bring dialogbox to top (set highest zIndex) when 'mousedown' on box element/text
                    _attachEventListener(box, 'mousedown', function SetDialogBoxToTop()
                    {
                        dlg.style.zIndex = _s2i(_getZindex(dlg));
                    });

                }
                // ** END: Make it draggable and bring dialogbox to top, if NOT flag is set

                // ** Make dialogbox resizable if flag is set
                if(_hasClass(dlg, 'dlg-resize'))
                {
                    _resize.init(box.id);
                    obj.bResize = true;

                    // ** Add extra padding and height to footer
                    var f = _getEl(obj.id, '#' + obj.id + ' .dlg-footer');
                    if(f)
                    {
                        _addClass(f[0], 'dlg-footer-extra-padding');
                    }

                    // ** Activate resize ability
                    _attachEventListener(box, 'mouseenter', function ActivateResize()
                    {
                        _resize.init(box.id);
                    });
                }
                // ** END: Make dialogbox resizable

                //---------------------------------------------------------------------
                // ** END: Create event-listeners
                //---------------------------------------------------------------------

                // ** Set focus to input field if promptbox
                if(_hasClass(dlg, 'dlg-prompt'))
                {
                    dlg.querySelector('.dlg-input-field').focus();
                }

                // ** Object has been created, set flag to true
                obj.bExistInDOM = true;

                // ** Set reference to object itself
                obj.el = document.getElementById(obj.id + '_1');

                // ** Run onCreate function. Need to run it async, since need to run after object has been created
                setTimeout(function()
                {
                    obj.onCreate();
                    _log('DEBUG: obj.onCreate(): executed (async)');
                }, 10);

                _log('DEBUG: create(): new object created and added to DOM');

                // ** Return object
                return obj;
            }
            else if(!matched)
            {
                _log('DEBUG: create(): error, dialogbox type not defined or not a valid type: ' + obj.strTypeClass);
            }
            else if(!dlg)
            {
                _log('DEBUG: create(): error, element id \'' + strId + '\' do not exist.\nReturned value = ' + dlg);
            }
            else
            {
                _log('DEBUG: create(): unknown error');
            }
            //---------------------------------------------------------------------
            // ** END: Create DOM element
            //---------------------------------------------------------------------
        }
        else
        {
            _log('DEBUG: create(): error, dialogbox type not defined or not a valid type: ' + strTypeClass);
        }
        return null; // return failure
    };
    // ** END: Create dialogbox and insert it into DOM

    // ** Initialize the HTML box openers
    var _init = function()
    {
        // ** Display init message
        if(window.console.log) { window.console.log(_name + ' initializing'); }

        // ** Get all elements with class containing 'dlg-opener'
        var opnr = document.querySelectorAll('.dlg-opener');

        // ** Create objects and click handler for each element that contain class 'dlg-opener'
        for(var i = 0; i < opnr.length; i++)
        {
            // ** Get element from DOM
            var dlg = document.getElementById(opnr[i].getAttribute('rel'));

            // ** Since using "var" and not "let" we need to preserve variable scope for "obj", so we wrap it in a closure
            (function()
            {
                // ** Create object from DOM element
                var obj = _create(dlg.getAttribute('id'),            // id
                                  dlg.getAttribute('class'),         // type
                                  dlg.getAttribute('title'),         // title
                                  dlg.innerHTML,                     // message
                                  dlg.getAttribute('data-callback'), // callback function
                                  dlg.getAttribute('data-x'),        // horizontal position
                                  dlg.getAttribute('data-y'),        // vertical position
                                  dlg.getAttribute('data-w'),        // width
                                  dlg.getAttribute('data-h'));       // height

                // ** Create event listeners for openers
                _attachEventListener(opnr[i], 'click', function DlgOpenerClick(e)
                {
                    e = e || window.event;  // Get event object
                    obj.show();             // Show the dialogbox with the id referenced in 'rel' attribute
                    this.blur();            // Remove focus from clicked button or other opening element
                    //_stopEvent(e);        // Prevent bubbling up to parent elements or capturing down to child elements
                    _stopDefault(e);        // Prevent scrolling to top of page if i.e. used in an anchor-link href="#"
                    return false;           // Try to prevent any default navigation action that we don't want
                });
            }());
        } // ** END: for

        // ** Display ready message
        if(window.console.log) { window.console.log(_name + ' ready'); }
        return i; // number of objects parsed through for loop
    };
    // ** END: Initialize the HTML box openers

    // ** Drag'n'drop object module
    var _drag =
    {
        init : function(id)
        {
            if(_drag.bActive !== true)
            {
                _drag.el = document.getElementById(id);
                if(_drag.el === null) { return false; }
                _drag.el.handle = document.getElementById(id + '_heading');
                if(_drag.el.handle === null) { _drag.el.handle = _drag.el; }
                _drag.el.style.position = 'absolute';
                _attachEventListener(_drag.el.handle, 'mousedown', _drag.start);
            }
        },
        start : function(e)
        {
            // ** Left mouse button triggers moving (different mousebuttonID's so try detect if modern browser or IE8)
            e = e || window.event;
            if( (e.button === 0) || (window.attachEvent && !window.addEventListener && e.button === 1) )
            {
                // ** Get event target
                var targ = _target(e);

                // ** If "dlg-disable-heading", only start drag if click is NOT on these elements
                if(targ.tagName.toLowerCase() !== 'input' && targ.tagName.toLowerCase() !== 'textarea'
                && targ.tagName.toLowerCase() !== 'button' && targ.tagName.toLowerCase() !== 'select')
                {
                    _drag.el.handle.style.cursor = 'move';
                    _drag.el.posX2 = e.clientX;
                    _drag.el.posY2 = e.clientY;
                    _attachEventListener(document, 'mouseup', _drag.stop);
                    _attachEventListener(document, 'mousemove', _drag.move);
                    _drag.bActive = true;
                }
            }
        },
        stop : function()
        {
            _drag.el.handle.style.cursor = '';
            _detachEventListener(document, 'mouseup', _drag.stop);
            _detachEventListener(document, 'mousemove', _drag.move);
            _drag.bActive = false;
        },
        move : function(e)
        {
            e = e || window.event;
            _drag.el.posX = _drag.el.posX2 - e.clientX;
            _drag.el.posY = _drag.el.posY2 - e.clientY;
            _drag.el.posX2 = e.clientX;
            _drag.el.posY2 = e.clientY;
            _drag.el.style.top = _s2i(_drag.el.offsetTop - _drag.el.posY) + 'px';
            _drag.el.style.left = _s2i(_drag.el.offsetLeft - _drag.el.posX) + 'px';
            var obj = _getObjById(_drag.el.id.split('_1')[0]);
            obj.yPos(_s2i(_drag.el.style.top));
            obj.xPos(_s2i(_drag.el.style.left));
            _stopDefault(e);
            return false;
        }
    };
    // ** END: Drag'n'drop object module

    // ** Resize object module
    var _resize =
    {
        init : function(id)
        {
            if(_resize.bActive !== true)
            {
                _resize.el = document.getElementById(id);
                _resize.el.style.position = 'absolute';
                var h = document.createElement('div');
                _resize.el.appendChild(h);
                h.className = 'dlg-rh';
                h.innerHTML = '<p class="dlg-rd1"></p>' +
                '<p class="dlg-rd2"></p>' +
                '<p class="dlg-rd3"></p>' +
                '<p class="dlg-rd4"></p>' +
                '<p class="dlg-rd5"></p>' +
                '<p class="dlg-rd6"></p>';
                _attachEventListener(h, 'mousedown', _resize.start);
            }
        },
        start : function(e)
        {
            e = e || window.event;
            _resize.minWidth = _s2i(_getStyle(_resize.el, 'minWidth')) || 100;  // if false then default: 100
            _resize.minHeight = _s2i(_getStyle(_resize.el, 'minHeight')) || 36; // if false then default: 36
            _resize.posX = e.clientX;
            _resize.posY = e.clientY;
            _resize.width = _resize.el.offsetWidth;
            _resize.height = _resize.el.offsetHeight;
            _attachEventListener(document, 'mousemove', _resize.move);
            _attachEventListener(document, 'mouseup', _resize.stop);
            _resize.bActive = true;
            if(_hasClass(_resize.el.parentNode, 'dlg-disable-heading')) { _stopEvent(e); } // prevents dragging if "dlg-disable-heading" is set
            _stopDefault(e);
            return false;
        },
        stop : function()
        {
            _detachEventListener(document, 'mousemove', _resize.move);
            _detachEventListener(document, 'mouseup', _resize.stop);
            _resize.bActive = false;
        },
        move : function(e)
        {
            e = e || window.event;
            var obj = _getObjById(_resize.el.id.split('_1')[0]);
            if(_resize.width + e.clientX - _resize.posX >= _resize.minWidth)
            {
                // ** We set "maxWidth" instead of "width" in this case
                _resize.el.style.maxWidth = _s2i(_resize.width + e.clientX - _resize.posX) + 'px';
                obj.width(_resize.el.style.maxWidth);
            }
            if(_resize.height + e.clientY - _resize.posY >= _resize.minHeight)
            {
                _resize.el.style.height = _s2i(_resize.height + e.clientY - _resize.posY) + 'px';
                obj.height(_resize.el.style.height);
            }
            _stopDefault(e);
            return false;
        }
    };
    // ** END: Resize object module

    // ** Window load event
    _attachEventListener(window, 'load', function WindowLoad()
    {
        // ** Initialize the HTML box openers
        _init();
    });
    // ** END: Window load event

    //---------------------------------------------------------------------
    // ** Public
    //---------------------------------------------------------------------
    return { //<-- IMPORTANT: Bracket need to be on same line as "return", else it just returns 'undefined'

        // ** Create dialog
        create : function(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h)
        {
            return _create(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h);
        },

        // ** Get all objects in objectarray
        getAll : function()
        {
            return _boxObj;
        },

        // ** Get object from id
        getById : function(id)
        {
            return _getObjById(id);
        },

        // ** Initialize the HTML box openers
        init : function()
        {
            return _init();
        }
    };
    //---------------------------------------------------------------------
    // ** END: Public
    //---------------------------------------------------------------------
})();
//-----------------------------------------------------------------------------------------------------------------
// ** END: EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------
