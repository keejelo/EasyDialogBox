/*****************************************************************************************************************
* EasyDialogBox
* Version: 1.735.72
* Created by: keejelo
* Year: 2020-2021
* GitHub: https://github.com/keejelo/EasyDialogBox
* Comment: Crossbrowser, legacy browser support as much as possible.
******************************************************************************************************************/

//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox Object (module)
//-----------------------------------------------------------------------------------------------------------------
var EasyDialogBox = (function()
{
    'use strict';

    // ** Debug: true/false (output debug-messages to console)
    var DEBUG = false;

    // ** Display message to inform that module is started
    var _name = 'EasyDialogBox';
    if(window.console.log) { window.console.log(_name + ' initialized'); }

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
                           'dlg-nomodal|dlg-multi|dlg-fade|' +
                           'dlg-info|dlg-question|dlg-error|dlg-success|dlg-exclamation|' +
                           'dlg-rounded|dlg-shadow').split('|');

    // ** Array that holds all created boxobjects, so we can get to them later if we need to, delete them etc.
    var _boxObj = [];

    // ** Variable that holds the original padding-right value of body element,
    //    used to prevent content shift when scrollbar hides/shows.
    var _bodyPadRight = 0;

    // ** Debug-logger
    var _log = function(s)
    {
        if(DEBUG && window.console.log)
        {
            return window.console.log(s);
        }
    };

    // ** Convert string to integer (decimal base)
    var _s2i = function(s)
    {
        return parseInt(s,10);
    };

    // ** Trim leading and trailing whitespace
    var _trim = function(s)
    {
        return s.replace(/^\s+|\s+$/g,'');
    };

    // ** Add "Array.indexOf" support if not exist (IE8)
    if(!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function(elt /*, from*/)
        {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if(from < 0) {from += len;}
            for(; from < len; from++)
            {
                if(from in this && this[from] === elt) {return from;}
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
            target[functionString] = function(event)
            {
                event = event || window.event;
                try
                {
                    target['e' + functionString](event);
                }
                catch(err)
                {
                    //_log('DEBUG: Error: Object does not support this property or method (can happen in IE8)');
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
        else
        {
            e.returnValue = false;
        }
    };

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
    var _getObjFromId = function(arr, id)
    {
        for(var i = 0; i < arr.length; i++)
        {
            if(arr[i].id === id)
            {
                return arr[i];
            }
        }
        return null; // if no object found
    };

    // ** Check if array matches ALL test-values in supplied string/array. Returns boolean
    var _matchAll = function(arr, str, exp, sep)
    {
        // ** Parameters
        // @arr = array that holds the values we want to match against
        // @str = string/array that we want to match with the above array
        // @exp = true = split string into array, using separator,
        //         false (or omitted) = do not split, treat string as one value.
        // @sep = character that is used as a string splitter, for instance a space ' ' or comma ','
        //         or other character enclosed in single quotes. If omitted then a space is used as separator, ' '

        var val = str;
        if(exp === true)
        {
            if(typeof sep === 'undefined')
            {
                sep = ' '; // default: space
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
        //    Check if total items tested are equal to the number of items passed
        if(val.length === passed)
        {
            return true;
        }

        return false;
    };
    // ** END: Check if array matches ALL test-values in supplied string/array. Returns true/false

    // ** Adjust element size and position according to window size (responsive)
    var _adjustElSizePos = function(id)
    {
        var el = document.getElementById(id);
        if(el)
        {
            // ** If height is larger or equal to window height, disable vertical alignment,
            //    position to: top (try to prevent out of view)

            // ** Get window height (xbrowser)
            var winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            if( _s2i(el.offsetHeight + el.customPosY) >= winHeight )
            {
                // ** Try to retain responsiveness by setting default values
                el.style.top = '0';
                el.style.marginTop = '0';
                el.style.marginBottom = '0';
                //el.style.height = '';       // <-- keep disabled, was making box height flicker in size
                //el.style.maxHeight = '';    // <-- keep disabled, was making box height flicker in size

                // ** Remove borders top and bottom
                el.style.borderTopWidth = '0';
                el.style.borderBottomWidth = '0';

                // ** Reset box pos Y since it went too far and triggered responsive-mode
                el.customPosY = 0;
            }
            // ** Else if window height larger than dialogbox height, set dialogbox position free
            //    If no custom values are set, then center dialog vertically
            else
            {
                if(!el.customPosY)
                {
                    el.style.top = ( (winHeight / 2) - (el.offsetHeight / 2) ) + 'px';
                }
                else
                {
                    el.style.top = el.customPosY + 'px';
                }

                if(el.customHeight)
                {
                    el.style.height = el.customHeight + 'px';
                }

                el.style.borderTopWidth = '';
                el.style.borderBottomWidth = '';
            }

            // ** If width is larger or equal to window width, disable horizontal alignment,
            //    position to: left (try to prevent out of view)

            // ** Get window width (xbrowser)
            var winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            var overlap = 40; // 40, value is used to help width-detection
            if( _s2i(el.offsetWidth + el.customPosX + overlap) >= winWidth ) // Seem to work OK
            {
                // ** Try to retain responsiveness by setting default values
                el.style.left = '0';
                el.style.marginLeft = '0';
                el.style.marginRight = '0';
                //el.style.width = '';       // <-- keep disabled, was making box width flicker in size
                //el.style.maxWidth = '';    // <-- keep disabled, was making box width flicker in size

                // ** Remove borders left and right (helps to prevent horizontal scrollbar)
                el.style.borderLeftWidth = '0';
                el.style.borderRightWidth = '0';

                // ** Reset box pos X since it went too far and triggered responsive-mode
                el.customPosX = 0;
            }
            // ** Else if window width larger than dialogbox width, let dialogbox free
            //    If no custom values are set, then center dialog horizontally
            else
            {
                if(!el.customPosX)
                {
                    el.style.left = ( (winWidth / 2) - (el.offsetWidth / 2) ) + 'px';
                }
                else
                {
                    el.style.left = el.customPosX + 'px';
                }

                if(el.customWidth)
                {
                    el.style.maxWidth = el.customWidth + 'px';
                }

                el.style.borderLeftWidth = '';
                el.style.borderRightWidth = '';
            }
        }

        // ** TODO:
        //    If custom position and dlg-disable-drag is set,
        //    then set dialog back to its custom pos if window
        //    is larger than dialog after being resized,
        //    and not just position it in center of window.
        //    Set and get custom values from object and not element (?)
    };
    // ** END: Adjust element size and position according to window size

    // ** Shorthand for getting elements inside the box and the box element itself
    var _getEl = function(objId, str)
    {
        if(str === undefined || typeof str === 'undefined' || str === '' || str === 0 || str === null)
        {
            return document.getElementById(objId + '_1');
        }

        // ** Clean string before working with it, trim leading and trailing spaces
        str = _trim(str);

        // ** If string contains '#' (hash)
        if(str.indexOf('#') !== -1)
        {
            // ** If string contains ' ' (space) or multiple selector-chars
            if(str.indexOf(' ') !== -1 || str.indexOf(',') !== -1 || str.indexOf('>') !== -1)
            {
                // ** The below assumes that string starts with hash '#' and that spaces are used to separate each selector item
                var idPart = str.split(' ')[0];   // Get first part of string before first space ' '
                str = str.replace(idPart, '');    // Get second half of string by removing '#idPart'
                idPart = idPart.replace(',', ''); // Remove char from string (if present)
                idPart = idPart.replace('>', ''); // Remove char from string (if present)
                idPart = idPart.replace(':', ''); // Remove char from string (if present)
                str = _trim(str);                 // Trim string of leading and trailing spaces (again, just in case)

                var a  = document.querySelector(idPart);
                var aa = document.querySelectorAll(idPart + ' ' + str);
                var b  = document.querySelector(idPart + '_0_1');
                var bb = document.querySelectorAll(idPart + '_0_1 ' + str);

                // ** Check if element exist. If match is not found, try matching dialogbox itself
                if(a)
                {
                    if(aa.length)
                    {
                        return aa;
                    }
                }
                else if(b)
                {
                    if(bb.length)
                    {
                        return bb;
                    }
                }
            }
            else
            {
                return document.querySelector(str);
            }
        }
        // ** Else if string do NOT contain '#' (hash), search for elements inside dialogbox
        else
        {
            var c = document.getElementById(objId);
            if(c)
            {
                var cc = c.querySelectorAll(str);
                if(cc.length)
                {
                    return cc;
                }
            }
        };

        _log('DEBUG: _getEl(): ' + str + ' cannot be found, return: null');
        return null;
    };
    // ** END: Shorthand for getting elements inside and the dialog element itself

    // ** Get and set highest z-index (of the dialogs), then return highest + 1
    var _setZindex = function(el)
    {
        var zIndex = _s2i(_getStyle(el, 'zIndex'));
        for(var i = 0; i < _boxObj.length; i++)
        {
            if(zIndex <= _s2i(_getStyle(_getEl(_boxObj[i].id).parentNode, 'zIndex'))
                && _getEl(_boxObj[i].id).parentNode !== el)
            {
                zIndex = _s2i(_getStyle(_getEl(_boxObj[i].id).parentNode, 'zIndex')) + 1;
            }
        }
        return _s2i(zIndex);
    };
    // ** END: Get and set highest z-index (of the dialogs), then return highest + 1

    // ** Hide scrollbar while retaining padding
    var _scrollBarFix = function()
    {
        // ** Get body element
        var body = document.querySelector('body');

        // ** If already has class this means it's already applied, then just return back
        if(_hasClass(body, 'dlg-stop-scrolling'))
        {
            return;
        }

        // ** Store the original padding-right value
        _bodyPadRight = _getStyle(body, 'paddingRight');

        // ** Convert from string to integer (remove 'px' postfix and return value as integer)
        _bodyPadRight = _s2i(_bodyPadRight);

        // ** Get width of body before removing scrollbar
        var w1 = body.offsetWidth;

        // ** Stop scrolling of background content (body) when dialogbox is in view, removes scrollbar
        _addClass(body, 'dlg-stop-scrolling');

        // ** Get width of body after removing scrollbar
        var w2 = body.offsetWidth;

        // ** Get width-difference
        var w3 = w2 - w1;

        // ** If conditions are true: add both padding-right values,
        if(typeof _bodyPadRight === 'number' && _bodyPadRight > 0)
        {
            w3 += _s2i(_bodyPadRight);
        }

        // ** Apply width-difference as padding-right to body, substitute for scrollbar,
        //    can prevent contentshift if content is centered when scrollbar disappears.
        body.setAttribute('style','padding-right:' + w3 + 'px;');
    };
    // ** END: Hide scrollbar while retaining padding

    // ** Fade in/out element
    var _fade = function(el, dir, spd, fn)
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
        }, spd || 30);
    };
    // ** END: Fade in/out element

    // ** Add custom button to footer
    var _addButton = function(objId, btnText, fnClick, nInsert)
    {
        var b = document.createElement('button');
        var t = document.createTextNode(btnText);
        b.appendChild(t);
        var f = _getEl(objId, '.dlg-footer')[0];
        f.getElementsByTagName('button')[nInsert] ? f.insertBefore(b, f.getElementsByTagName('button')[nInsert]) : f.appendChild(b);
        _addClass(b, 'dlg-btn');
        _attachEventListener(b, 'click', fnClick, false);
        return b;
    };

    // ** Show dialog box
    var _show = function(objId)
    {
        // ** Get object
        var obj = _getObjFromId(_boxObj, objId);

        // ** Check if box exist
        if(obj !== null)
        {
            // ** Get element (dialog surface)
            var dlg = document.getElementById(obj.id);

            // ** Hide scrollbar (if element does not contain class)
            if( !(_hasClass(dlg, 'dlg-disable-overlay')) && !(_hasClass(dlg, 'dlg-nomodal')) && !(_hasClass(dlg, 'dlg-multi')) )
            {
                _scrollBarFix();
            }

            // ** Make it draggable, unless flag is set
            if(!(_hasClass(dlg, 'dlg-disable-drag')))
            {
                _drag.init(obj.id + '_1');
            }

            // ** Show the hidden dialog (overlay and boxsurface), bring dialog to top
            dlg.style.display = 'block';
            dlg.style.zIndex = _s2i(_setZindex(dlg));

            // ** Fade in if variable true
            if(obj.bFade)
            {
                dlg.style.opacity = 0;
                _fade(dlg);
            }

            // ** Get the dialogbox itself
            var box = document.getElementById(obj.id + '_1');

            // ** Prepare custom values, default set to: 0
            box.customPosX = 0;
            box.customPosY = 0;
            box.customHeight = 0;
            box.customWidth = 0;

            // ** Check if position is set, if true (bigger than 0) then change position, else default value used
            if(obj.x)
            {
                box.style.left = _s2i(obj.x) + 'px';
                box.customPosX = _s2i(obj.x);
            }
            // ** Check if position is set, if true then change position, else default value used
            if(obj.y)
            {
                box.style.top = _s2i(obj.y) + 'px';
                box.customPosY = _s2i(obj.y);
            }
            // ** END: Check if position is set

            // ** Check if size is set, if true then change size, else default value used
            if(obj.w)
            {
                box.style.maxWidth = _s2i(obj.w) + 'px';
                box.customWidth = _s2i(obj.w);
            }
            // ** Check if size is set, if true then change size, else default value used
            if(obj.h)
            {
                //box.style.height = _s2i(obj.h) + 'px';    // disabled, only set custom
                //box.style.maxHeight = _s2i(obj.h) + 'px'; // disabled, only set custom
                box.customHeight = _s2i(obj.h);
            }
            // ** END: Check if size is set

            // ** If custom height then adjust
            if(box.customHeight)
            {
                // ** Get message element
                var message = box.querySelector('#' + box.id + ' .dlg-message');

                // ** Set default extra height value
                var h = 115;

                /* Disabled -- not needed, did some CSS adjustments instead
                // ** If icon is used, set a different height value
                if(_hasClass(dlg, 'dlg-info')
                || _hasClass(dlg, 'dlg-question')
                || _hasClass(dlg, 'dlg-error')
                || _hasClass(dlg, 'dlg-success')
                || _hasClass(dlg, 'dlg-exclamation')
                )
                {
                    h = 100;
                }*/

                // ** Adjust custom height
                message.style.height = _s2i(obj.h - h) + 'px';
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
        var obj = _getObjFromId(_boxObj, objId);

        // ** Update position (if moved/custom pos)
        // ** ALL dialogboxes depends on this to remember last position
        if(obj.x !== null)
        {
            obj.x = _s2i(box.style.left);
        }
        if(obj.y !== null)
        {
            obj.y = _s2i(box.style.top);
        }
        // ** END: Update position (if moved/custom pos)

        // ** Hide the overlay, fade out, run "onHide"
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
                _fade(dlg, true, 0, function()
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

        // ** Get body element, reset values, restore scrolling
        var body = document.querySelector('body');
        _removeClass(body, 'dlg-stop-scrolling');
        body.setAttribute('style', 'padding-right:' + _s2i(_bodyPadRight) + 'px;');

        // ** Return object
        return obj;
    };
    // ** END: Hide dialog box

    // ** Close and destroy dialog box
    var _destroy = function(objId)
    {
        var success = false; // set default: false

        // ** Get body element, reset values, restore scrolling
        var body = document.querySelector('body');
        _removeClass(body, 'dlg-stop-scrolling');
        body.setAttribute('style', 'padding-right:' + _s2i(_bodyPadRight) + 'px;');

        // ** Get the dlg element
        var dlg = document.getElementById(objId);

        // ** Begin destroying
        if(dlg)
        {
            // ** Hide it visually (if not already)
            dlg.style.display = 'none';

            // ** If promptbox was created, remove eventlisteners
            var pBox = dlg.querySelectorAll('.dlg-input-field');
            if(pBox.length > 0)
            {
                pBox[0].onkeyup = null;
                pBox[0].onchange = null;
            }

            // ** Remove it from DOM
            dlg.parentNode.removeChild(dlg);

            // ** Get the object stored in the objectarray (memory)
            var obj = _getObjFromId(_boxObj, objId);

            // ** Run onDestroy function
            obj.onDestroy();

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

        // ** Return result
        return success;
    };
    // ** END: Close and destroy dialog box

    // ** Create dialogbox and insert it into DOM
    var _create = function(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h)
    {
        // ** Check if object already exist, if so return that object instead of creating a new
        var existingObj = _getObjFromId(_boxObj, strId + '_0');
        if(existingObj)
        {
            _log('DEBUG: create(): new object not created. An object with same ID already exist. Existing object returned');
            return existingObj;
        }

        // ** Remove extra spaces if any, to correct matchstring, before doing match
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
                nTimeId : null,
                el : null,

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
                        else if(fnCallback === false || fnCallback === 0)
                        {
                            return false;
                        }
                        else
                        {
                            _log('\n\nDEBUG: If the dialogbox do not use a callback function, you can ignore the below message:');
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
                    this.w = _s2i(n);
                    //_getEl(this.id).style.width = this.w + 'px';  // Disabled: breaks "Responsiveness" (triggers horizontal scroll)
                    _getEl(this.id).style.maxWidth = this.w + 'px';
                    return this;
                },

                // ** Set height
                height : function(n)
                {
                    this.h = _s2i(n);
                    _getEl(this.id).style.height = this.h + 'px';
                    _getEl(this.id).style.maxHeight = this.h + 'px';

                    // ** Get message element
                    var message = _getEl(this.id, '.dlg-message')[0];

                    // ** Set default extra height value
                    var h = 115;

                    /* Disabled -- not needed, did some CSS adjustments instead
                    // ** If icon is used, set a different height value
                    var dlg = _getEl(this.id);
                    if(_hasClass(dlg, 'dlg-info')
                    || _hasClass(dlg, 'dlg-question')
                    || _hasClass(dlg, 'dlg-error')
                    || _hasClass(dlg, 'dlg-success')
                    || _hasClass(dlg, 'dlg-exclamation')
                    )
                    {
                        h = 100;
                    }*/

                    // ** Adjust custom height
                    message.style.height = _s2i(this.h - h) + 'px';
                    return this;
                },

                // ** Set position X (left)
                xPos : function(n)
                {
                    this.x = _s2i(n);
                    _getEl(this.id).style.left = this.x + 'px';
                    return this;
                },

                // ** Set position Y (top)
                yPos : function(n)
                {
                    this.y = _s2i(n);
                    _getEl(this.id).style.top = this.y + 'px';
                    return this;
                },

                // ** Center dialogbox in window
                center : function()
                {
                    var winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                    var winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                    var el = _getEl(this.id);
                    el.style.left = ( (winWidth / 2) - (el.offsetWidth / 2) ) + 'px';
                    el.style.top = ( (winHeight / 2) - (el.offsetHeight / 2) ) + 'px';
                    return this;
                },

                // ** Add custom button to footer
                addButton : function(btnText, fnClick, nInsert)
                {
                    return _addButton(this.id, btnText, fnClick, nInsert);
                }
            }
            _boxObj.push(obj);  // insert object into array of objects

            // ** END: creating the object


            //---------------------------------------------------------------------
            // ** Create DOM element
            //---------------------------------------------------------------------

            // ** Get object from id, reuse same 'obj' variable as defined above
            obj = _getObjFromId(_boxObj, strId);

            // ** Fix for pre-written HTML boxes: add '_0' to id before getting object
            if(obj === null)
            {
                strId += '_0';
                obj = _getObjFromId(_boxObj, strId);
            }

            // ** Get body element
            var body = document.querySelector('body');

            // ** Create dialog surface and insert into parent element (body)
            var dlg = document.createElement('div');
            dlg.setAttribute('id', obj.id);
            dlg.setAttribute('class', obj.strTypeClass);
            body.appendChild(dlg);

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

            // ** Check if element with the id exist in DOM, and valid dlg-types
            //if( dlg && (matched === true) )
            if(dlg)
            {
                // ** Show the backdrop overlay, and the dialogbox eventually
                dlg.style.display = 'block';  // Must be here or else can cause elements size and pos not detected,
                                              // and then dynamic values and position do not work as we want.

                // ** Create the box (the dialogbox itself)
                var box = document.createElement('div');
                box.setAttribute('id', obj.id + '_1');
                box.setAttribute('class','dlg-box');

                // ** Need to have this here (used for pre-written HTML boxes)
                // ** Prepare custom values, default set to: 0
                box.customPosX = 0;
                box.customPosY = 0;
                box.customHeight = 0;
                box.customWidth = 0;

                // ** Maybe change above default values to: -1
                //    so user can set box to x=0,y=0 instead of x=1,y=1 to specify upper left position
                //    And check for "value > -1" in below "if else" instead of "true/false"

                // ** Check if position is set, if true (bigger than 0) then change position, else default value used
                if(obj.x)
                {
                    box.style.left = _s2i(obj.x) + 'px';
                    box.customPosX = _s2i(obj.x);
                }
                // ** Check if position is set, if true then change position, else default value used
                if(obj.y)
                {
                    box.style.top = _s2i(obj.y) + 'px';
                    box.customPosY = _s2i(obj.y);
                }
                // ** END: Check if position is set

                // ** Check if size is set, if true then change size, else default value used
                if(obj.w)
                {
                    box.style.maxWidth = _s2i(obj.w) + 'px';
                    box.customWidth = _s2i(obj.w);
                }
                // ** Check if size is set, if true then change size, else default value used
                if(obj.h)
                {
                    box.style.height = _s2i(obj.h) + 'px';
                    box.customHeight = _s2i(obj.h);
                }
                // ** END: Check if size is set
                // ** END: Need to have this here (used for pre-written HTML boxes)

                // ** Add element to DOM
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
                    closeX.innerHTML = '&#215;'; // using HTML entity instead, maybe avoid the need to specify unicode charset for javascript ?
                    heading.appendChild(closeX);

                    // ** Create title (here because of z-index)
                    var titleText = document.createTextNode(obj.strTitle);
                    heading.appendChild(titleText);
                }
                else
                {
                    // ** Create [X] close button
                    var closeX = document.createElement('span');
                    closeX.setAttribute('class','dlg-close-x');
                    closeX.innerHTML = '&#215;';
                    box.appendChild(closeX);
                }

                // ** Create message
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

                    // ** If custom height then adjust
                    if(box.customHeight)
                    {
                        message.style.height = _s2i(obj.h - 101) + 'px';
                    }

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

                    // ** If custom height then adjust
                    if(box.customHeight)
                    {
                        message.style.height = _s2i(obj.h - 130) + 'px';
                    }
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
                _attachEventListener(window, 'resize', function WinResize()
                {
                    if(obj.bVisible)
                    {
                        _adjustElSizePos(obj.id + '_1');
                    }
                }, false);
                // ** END: Window resize

                // ** User clicks the [X] button
                var xCloseDialog = dlg.querySelector('.dlg-close-x');
                if(xCloseDialog)
                {
                    _attachEventListener(xCloseDialog, 'click', function XCloseClick()
                    {
                        // ** Remove eventlistener
                        // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                        //_detachEventListener(xCloseDialog, 'click', XCloseClick, false);

                        // ** Close dialogbox, reset values, clean up
                        //obj.destroy();  // changed from "destroy" to "hiding", keep the dialogbox in DOM
                        obj.hide(0,true);  // true = do not run obj.onHide()

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        obj.nRetCode = CLOSE;

                        // ** Run onClose function
                        obj.onClose();
                    }, false);
                }
                // ** END: [X] button click handler

                // ** User clicks the CLOSE button
                var btnCloseDialog = dlg.querySelector('.dlg-close-btn');
                if(btnCloseDialog)
                {
                    _attachEventListener(btnCloseDialog, 'click', function BtnCloseClick()
                    {
                        // ** Remove eventlistener
                        // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                        //_detachEventListener(btnCloseDialog, 'click', BtnCloseClick, false);

                        // ** Close dialogbox, reset values, clean up
                        //obj.destroy();  // changed from "destroy" to "hiding", keep the dialogbox in DOM
                        obj.hide(0,true);  // true = do not run obj.onHide()

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        obj.nRetCode = CLOSE;

                        // ** Run onClose function
                        obj.onClose();
                    }, false);
                }
                // ** END: CLOSE button click handler

                // ** User clicks anywhere outside of the dialogbox to close it
                if( !(_hasClass(dlg, 'dlg-disable-clickout')) && !(_hasClass(dlg, 'dlg-multi')) )
                {
                    _attachEventListener(dlg, 'click', function ClickOutClose(e)  // changed FROM: window  TO: dlg
                    {
                        e = e || window.event;

                        // ** Get event target
                        var targ;
                        if(e.target)
                        {
                            targ = e.target;
                        }
                        else if(e.srcElement)
                        {
                            targ = e.srcElement;
                        }
                        if(targ.nodeType === 3)
                        {
                            targ = targ.parentNode;
                        }

                        if(targ === dlg)
                        {
                            // ** Remove eventlistener
                            // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(window, 'click', ClickOutClose, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0,true);  // true = do not run obj.onHide()

                            // ** Callback, return code: CLOSE
                            obj.callback(CLOSE);
                            obj.nRetCode = CLOSE;

                            // ** Run onClose function
                            obj.onClose();
                        }
                    }, false);
                }
                // ** END: window click outside box click handler

                // ** Close box on ESC-key
                if( !(_hasClass(dlg, 'dlg-disable-esc')) && !(_hasClass(dlg, 'dlg-multi')) )
                {
                    //_attachEventListener(document, 'keyup', function EscKeyClose(e)
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
                                // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                                //_detachEventListener(window, 'keyup', EscKeyClose, false);

                                // ** Close dialogbox, reset values, clean up
                                //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                                obj.hide(0,true);  // true = do not run obj.onHide()

                                // ** Callback, return code: CLOSE
                                obj.callback(CLOSE);
                                obj.nRetCode = CLOSE;

                                // ** Run onClose function
                                obj.onClose();

                                // ** Prevent default event action and bubbling
                                _stopEvent(e);
                                _stopDefault(e);
                                return false;
                            }
                        }
                    }, false);
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
                            // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnYesDialog, 'click', BtnYesClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0,true);  // true = do not run obj.onHide()

                            // ** Callback, return code: YES
                            obj.callback(YES);
                            obj.nRetCode = YES;

                            // ** Run onClose function
                            obj.onClose();
                        }, false);
                    }

                    // ** User clicks the NO button
                    var btnNoDialog = dlg.querySelector('.dlg-no-btn');
                    if(btnNoDialog)
                    {
                        _attachEventListener(btnNoDialog, 'click', function BtnNoClick()
                        {
                            // ** Remove eventlistener
                            // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnNoDialog, 'click', BtnNoClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0,true);  // true = do not run obj.onHide()

                            // ** Callback, return code: NO
                            obj.callback(NO);
                            obj.nRetCode = NO;

                            // ** Run onClose function
                            obj.onClose();
                        }, false);
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
                            // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnOkDialog, 'click', BtnOkClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0,true);  // true = do not run obj.onHide()

                            // ** Callback, return code: OK
                            obj.callback(OK);
                            obj.nRetCode = OK;

                            // ** Run onClose function
                            obj.onClose();
                        }, false);
                    }

                    // ** User clicks the Cancel button
                    var btnCancelDialog = dlg.querySelector('.dlg-cancel-btn');
                    if(btnCancelDialog)
                    {
                        _attachEventListener(btnCancelDialog, 'click', function BtnCancelClick()
                        {
                            // ** Remove eventlistener
                            // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(btnCancelDialog, 'click', BtnCancelClick, false);

                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(0,true);  // true = do not run obj.onHide()

                            // ** Callback, return code: CANCEL
                            obj.callback(CANCEL);
                            obj.nRetCode = CANCEL;

                            // ** Run onClose function
                            obj.onClose();
                        }, false);
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
                        }, false);

                        _attachEventListener(pBox, 'change', function PromptBoxChange()
                        {
                            obj.strInput = pBox.value;
                        }, false);
                    }
                }
                // ** END: User types in promptbox

                // ** Make it draggable and bring dialogbox to top, if NOT flag is set
                if( !(_hasClass(dlg, 'dlg-disable-drag')) )
                {
                    _drag.init(box.id);

                    // ** Activate drag'n'drop when 'mouseenter' on element
                    _attachEventListener(box, 'mouseenter', function ActivateDragDrop()
                    {
                        _drag.init(box.id);
                    }, false);

                    // ** Bring dialogbox to top (set highest zIndex) when 'mousedown' on element
                    _attachEventListener(box, 'mousedown', function SetDialogBoxToTop()
                    {
                        dlg.style.zIndex = _s2i(_setZindex(dlg));
                    }, false);
                }
                // ** END: Make it draggable and bring dialogbox to top, if NOT flag is set

                //---------------------------------------------------------------------
                // ** END: Create event-listeners
                //---------------------------------------------------------------------

                // ** Adjust box size and position according to window size
                //_adjustElSizePos(box.id);  // disabled <-- this was making box position problems here

                // ** Set focus to input field if promptbox
                if(_hasClass(dlg, 'dlg-prompt'))
                {
                    dlg.querySelector('.dlg-input-field').focus();
                }

                // ** Object has been created, set flag to true
                obj.bExistInDOM = true;

                // ** First run keep hidden, only create, do not show, do not run "onHide" func
                obj.hide(0,true);  // true = do not run obj.onHide()

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
    (function _init()
    {
        // ** Window load event
        _attachEventListener(window, 'load', function WinLoad()
        {
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
                        e = e || window.event;  // Get/set event variable
                        obj.show();             // Show the dialogbox with the id referenced in 'rel' attribute
                        this.blur();            // Remove focus from button or other opening element
                        _stopDefault(e);        // Prevent scrolling to top of page if i.e. used in an anchor-link href="#"
                        _stopEvent(e);          // Prevent bubbling up to parent elements or capturing down to child elements
                        return false;           // Try to prevent any default navigation action that we don't want
                    }, false);
                }());
            } // ** END: for

            // ** Display ready message
            if(window.console.log) { window.console.log(_name + ' ready'); }

            // ** Inform user if debug is enabled
            if(DEBUG) { _log(_name + ' debug console-output is enabled. You can disable it in "easydlg.js" by setting: DEBUG = false'); }

        }, false);
        // ** END: Window load event
    })();
    // ** END: Initialize the HTML box openers

    // ** Drag'n'drop object module
    var _drag =
    {
        init : function(id)
        {
            if(_drag.bActive !== true)
            {
                _drag.el = document.getElementById(id);
                if(_drag.el === null)
                {
                    return false;
                }

                _drag.el.grabber = document.getElementById(id + '_heading');
                if(_drag.el.grabber === null)
                {
                    _drag.el.grabber = _drag.el;
                }

                _drag.el.style.position = 'absolute';
                _attachEventListener(_drag.el.grabber, 'mousedown', _drag.start, false);
            }
        },
        start : function(e)
        {
            e = e || window.event;
            // ** Left mouse button triggers moving (different mousebuttonID's so try detect if modern browser or IE8)
            if( (e.button === 0) || (window.attachEvent && !window.addEventListener && e.button === 1) )
            {
                _drag.el.grabber.style.cursor = 'move';
                _drag.el.posX2 = e.clientX;
                _drag.el.posY2 = e.clientY;
                _attachEventListener(document, 'mouseup', _drag.stop, false);
                _attachEventListener(document, 'mousemove', _drag.move, false);
                _drag.bActive = true;
                _stopDefault(e);
                return false;
            }
        },
        stop : function()
        {
            _drag.el.grabber.style.cursor = '';
            _detachEventListener(document, 'mouseup', _drag.stop, false);
            _detachEventListener(document, 'mousemove', _drag.move, false);
            _drag.bActive = false;
        },
        move : function(e)
        {
            e = e || window.event;
            _drag.el.posX = _drag.el.posX2 - e.clientX;
            _drag.el.posY = _drag.el.posY2 - e.clientY;
            _drag.el.posX2 = e.clientX;
            _drag.el.posY2 = e.clientY;
            _drag.el.style.top = parseInt( (_drag.el.offsetTop) - (_drag.el.posY), 10) + 'px';
            _drag.el.style.left = parseInt( (_drag.el.offsetLeft) - (_drag.el.posX), 10) + 'px';
            _stopDefault(e);
            return false;
        }
    };
    // ** END: Drag'n'drop object module

    //---------------------------------------------------------------------
    // ** Public methods
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
            return _getObjFromId(_boxObj, id);
        }
    };
    //---------------------------------------------------------------------
    // ** END: Public methods
    //---------------------------------------------------------------------
})();
//-----------------------------------------------------------------------------------------------------------------
// ** END: EasyDialogBox Object (module)
//-----------------------------------------------------------------------------------------------------------------
