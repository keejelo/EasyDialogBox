/**********************************************************************
* EasyDialogBox
* Version: 1.735.18
* Created by: keejelo
* Year: 2020-2021
* GitHub: https://github.com/keejelo/EasyDialogBox
* Comment: Crossbrowser, legacy browser support as much as possible.
**********************************************************************/

//---------------------------------------------------------------------
// ** EasyDialogBox object return values
//---------------------------------------------------------------------
//
// object.nRetCode:
//
//  0 = "Close" button, outside box or [X] clicked
//  1 = "Yes" button clicked
//  2 = "No" button clicked
//  3 = "OK" button clicked
//  4 = "Cancel" button clicked
//
//  object.strInput = string
//
//---------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox Object (module)
//-----------------------------------------------------------------------------------------------------------------
var EasyDialogBox = (function()
{   'use strict';

    // ** Debug: true/false (outputs debug-messages to console)
    var DEBUG = true;

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

    // ** Dialogbox types and flags, can be used separately or in combination separated by a space
    var _strBoxTypeList = ['dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok','dlg-cancel','dlg-ok-cancel',
                           'dlg-disable-heading','dlg-disable-footer','dlg-disable-btns','dlg-disable-overlay','dlg-disable-drag',
                           'dlg-info','dlg-question','dlg-error','dlg-success','dlg-exclamation',
                           'dlg-rounded','dlg-shadow'];

    // ** Array that holds all created boxobjects, so we can refer to them later if we need to, i.e. callback etc...
    var _boxObj = [];

    // ** Variable that holds the original padding-right value of body element
    var _orgBodyPaddingRight = 0;
    
    // ** Flag that indicates if window was resized
    var _bResized = false;    
    
    // ** Flag that indicates if a box is currently in view (is displayed)
    //var _isActive = false;

    // ** Add "forEach" support to IE(9-11)
    if(window.NodeList && !NodeList.prototype.forEach)
    {
        NodeList.prototype.forEach = Array.prototype.forEach;
    };

    // ** Debug-logger
    var _log = function(str)
    {
        if(DEBUG)
        {
            return console.log(str);
        }
    };

    // ** Convert string to integer (decimal)
    var _s2i = function(str)
    {
        return parseInt(str, 10);
    };
    
    // ** Trim leading and trailing space
    var _trim = function(str)
    {
        return str.replace(/^\s+|\s+$/g, '');
    };    

    // ** Add event listener (xbrowser-legacy)
    var _attachEventListener = function(target, eventType, functionRef, capture)
    {
        if(typeof target.addEventListener != 'undefined')
        {
            target.addEventListener(eventType, functionRef, capture);
        }
        else if(typeof target.attachEvent != 'undefined')
        {
            var functionString = eventType + functionRef;
            target['e' + functionString] = functionRef;
            target[functionString] = function(event)
            {
                if(typeof event == 'undefined')
                {
                    event = window.event;
                }
                target['e' + functionString](event);
            };
            target.attachEvent('on' + eventType, target[functionString]);
        }
        else
        {
            eventType = 'on' + eventType;
            if(typeof target[eventType] == 'function')
            {
                var oldListener = target[eventType];
                target[eventType] = function()
                {
                    oldListener();
                    return functionRef();
                }
            }
            else
            {
                target[eventType] = functionRef;
            }
        }
    };

    // ** Remove event listener (xbrowser-legacy)
    var _detachEventListener = function(target, eventType, functionRef, capture)
    {
        if(typeof target.removeEventListener != 'undefined')
        {
            target.removeEventListener(eventType, functionRef, capture)
        }
        else if(typeof target.detachEvent != 'undefined')
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
    var _stopEvent = function(event)
    {
        if(typeof event.stopPropagation != 'undefined')
        {
            event.stopPropagation();
        }
        else
        {
            event.cancelBubble = true;
        }
    };
    
    // ** Stop default event action (xbrowser-legacy)
    var _stopDefault = function(event)
    {
        if(typeof event.preventDefault != 'undefined')
        {
            event.preventDefault();
        }
        else
        {
            event.returnValue = false;
        }
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
            if(el.className == '')
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
            var reg = new RegExp('(^|\\s)' + classValue + '(\\s|$)'), newClass = el.className.replace(reg, ' ');
            el.className = newClass.replace(/^\s+|\s+$/g, ''); // remove leading and trailing whitespace
        }
    };

    // ** Get object from array by using id
    var _getObjFromId = function(arr, strId)
    {
        for(var i = 0; i < arr.length; i++)
        {
            if(arr[i].id === strId)
            {
                return arr[i];
            }
        }
        return null; // if no object found
    };

    // ** Check if array matches ALL test-values in supplied string/array. Returns true/false
    var _matchAll = function(arr, str, exp, sep)
    {
        // ** Parameters
        // @ arr = array that holds the values we want to match against
        // @ str = string/array that we want to match with the above array
        // @ exp = true = split string into array, using separator,
        //         false (or omitted) = do not split, treat string as one value.
        // @ sep = character that is used as a string splitter, for instance a space ' ' or comma ','  
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
        // ** Check if numbers tested equals the numbers of items that passed.
        if(val.length === passed)
        {
            return true;
        }

        return false;
    };

    // ** Harmful chars based on the context: &<>"'`´,!@$%/\()=+{}[]

    // ** Sanitize string, remove all characters except listed
    var _sanitize = function(str)
    {
        str = str.replace(/[^a-z0-9@£#\s\,._-æøåäö-]/gi, '');
        return str;
    };

    // ** Escape string
    var _escape = function(str)
    {
        str = str.replace(/^\s+|\s+$/g, ''); // trim leading and trailing spaces
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/'/g, '&#39;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        return str;
    };

    // ** Encode all characters into html-entities
    var _htmlEncode = function(str)
    {
        return String(str).replace(/[^\w. ]/gi, function(c)
        {
            return '&#'+c.charCodeAt(0)+';';
        });
    };
    
    // ** Adjust element size and position according to window size
    var _adjustElSizePos = function(id)
    {
        var el = document.getElementById(id);
        if(el)
        {
            // ** If height is larger or equal to window height, disable vertical alignment,
            // ** position to: top (try to prevent out of view)            
            var winHeight = window.innerHeight
            || document.documentElement.clientHeight    
            || document.body.clientHeight;

            if( _s2i(el.offsetHeight + el.customPosY) >= winHeight)
            {
                // ** Try to retain responsiveness by setting default values 
                el.style.top = '0';
                el.style.marginTop = '0';
                el.style.marginBottom = '0';
                el.style.height = '';
                el.style.maxHeight = '';
                el.style.borderTopWidth = '0';
                el.style.borderBottomWidth = '0';
            }
            // ** If window height larger than dialogbox height
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
            // ** position to: left (try to prevent out of view)
            var winWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

            var overlap = 20; // 40, value is used to help width-detection
            if( _s2i(el.offsetWidth + el.customPosX + overlap) >= winWidth) // Seem to work OK
            {
                // ** Try to retain responsiveness by setting default values 
                el.style.left = '0';
                el.style.marginLeft = '0';
                el.style.marginRight = '0';
                //el.style.width = '100%'; // was ''    // <-- keep disabled, was making box width flicker in size
                //el.style.maxWidth = '100%'; // was '' // <-- keep disabled, was making box width flicker in size
                el.style.borderLeftWidth = '0';
                el.style.borderRightWidth = '0';
            }
            // ** If window width larger than dialogbox width
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
    };

    // ** Shorthand for getting elements inside and the dialog element itself
    var _getEl = function(objId, str)
    {
        if(str === undefined || typeof str === 'undefined' || str === '' || str === 0 || str === null)
        {
            return document.getElementById(objId + '_1');
        }

        // ** Clean string before working with it, trim leading and trailing spaces
        str = _trim(str);

        if(str.indexOf('#') != -1)
        {
            if(str.indexOf(' ') != -1 || str.indexOf(',') != -1)
            {                                     // The below assumes that string starts with hash '#'
                var idPart = str.split(' ')[0];   // Get first part of string before first space ' '
                str = str.replace(idPart, '');    // Get second half of string by removing '#idPart'
                str = _trim(str);                 // Trim string of leading and trailing spaces (again)

                // ** Check if element exist. If match is not found, try matching dialogbox itself, else return: null
                if(document.querySelector(idPart))
                {
                    if(document.querySelector(idPart).querySelectorAll(str).length > 0)
                    {
                        return document.querySelector(idPart).querySelectorAll(str);
                    }
                }
                else if(document.querySelector(idPart + '_0_1'))
                {
                    if(document.querySelector(idPart + '_0_1').querySelectorAll(str).length > 0)
                    {
                        return document.querySelector(idPart + '_0_1').querySelectorAll(str);
                    }                    
                }
            }
            else
            {
                return document.querySelector(str);
            }
        }
        else
        {
            return document.getElementById(objId).querySelectorAll(str);
        };
        
        _log('DEBUG: _getEl(): element ' + str + ' cannot be found, return: null');
        return null;
    };

    // ** Hide scrollbar while retaining padding
    var _scrollBarFix = function()
    {
        var body = document.getElementsByTagName('body')[0];

        // ** Store the original padding-right value
        _orgBodyPaddingRight = window.getComputedStyle(body, null).getPropertyValue('padding-right');

        // ** Convert from string to integer (remove 'px' postfix and return value as integer)
        _orgBodyPaddingRight = _s2i(_orgBodyPaddingRight);

        // ** Get width of body before removing scrollbar
        var w1 = body.offsetWidth;

        // ** Stop scrolling of background content (body) when dialogbox is in view, removes scrollbar
        _addClass(body, 'dlg-stop-scrolling');

        // ** Get width of body after removing scrollbar
        var w2 = body.offsetWidth;

        // ** Get width-difference
        var w3 = w2 - w1;
        
        // ** If conditions are true: add both padding-right values, 
        if(typeof _orgBodyPaddingRight === 'number' && _orgBodyPaddingRight > 0)
        {
            w3 += _s2i(_orgBodyPaddingRight);
        }

        // ** Apply width-difference as padding-right to body, substitute for scrollbar,
        // ** can prevent contentshift if content is centered when scrollbar disappears.
        body.setAttribute('style','padding-right:' + w3 + 'px;');
    };

    // ** Show the dialog box
    var _show = function(objId)
    {
        // ** Check if box exist
        var obj = _getObjFromId(_boxObj, objId);
        
        if(obj === null)
        {
            _log('DEBUG: show(): error, object do not exist!');
            return false;
        }
        
        // ** Check if box already exist in case it is hidden, we want to show that instead of creating a new
        if(obj !== null && obj.bHidden == true)
        {
            // ** Hide scrollbar
            _scrollBarFix();
            
            // ** Get element (dialog surface)
            var hiddenDlg = document.getElementById(obj.id);
            
            // ** Make it draggable, unless flag is set
            if(!(_hasClass(hiddenDlg, 'dlg-disable-drag')))
            {
                _drag.init(obj.id + '_1');
            }
            
            // ** Show the hidden dialog (surface)
            hiddenDlg.style.display = 'block';
            
            // ** Get the dialogbox itself
            var box = document.getElementById(obj.id + '_1');
            
            // ** Prepare custom values, default set to: 0
            box.customPosX = 0;
            box.customPosY = 0;
            box.customHeight = 0;
            box.customWidth = 0;
            
            //_adjustElSizePos(obj.id + '_1');  // <-- not needed it seems
            //_log('obj.x:' + obj.x)
            
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
                //box.style.maxHeight = _s2i(obj.h) + 'px';
                box.customHeight = _s2i(obj.h);
            }
            // ** END: Check if size is set
            
            box.style.visibility = 'visible';
            obj.bVisible = true;
            obj.onShow();
            
            // ** Position box in viewport (default: center)
            //if(_bResized) //<-- disabled
            //{
            //    _adjustElSizePos(obj.id + '_1');
            //}
            
            // ** Position box in viewport (default to center if no custom position has been set, or if no moving has occurred)
            _adjustElSizePos(obj.id + '_1');

            
            _log('DEBUG: show(): executed');
            
            return true;
        }
        
        // ** Return fail
        return false;
    };
    
    // ** Hide dialog box
    var _hide = function(objId, bDoNotExecuteOnHide)
    {
        var dlg = document.getElementById(objId);
        var box = document.getElementById(objId + '_1');

        // ** Hide the box
        if(dlg && box)
        {
            dlg.style.display = 'none';
            box.style.visibility = 'hidden';
        }
        
        // ** Set flag to false, indicates that no dialogbox is currently "active" (visible)
        //_isActive = false;  // will probably be removed, not using it
        
        // ** Get the object stored in the array
        var obj = _getObjFromId(_boxObj, objId);

        // ** Set hidden flags
        obj.bHidden = true;
        obj.bVisible = false;
        
        // ** Get body element, reset values, restore scrolling
        var body = document.getElementsByTagName('body')[0];
        _removeClass(body, 'dlg-stop-scrolling');
        body.setAttribute('style', 'padding-right:' + _s2i(_orgBodyPaddingRight) + 'px;');        
        
        // ** Update position (if moved/custom pos)
        if(obj.x !== null)
        {
            obj.x = parseInt(box.style.left, 10);
        }        
        if(obj.y !== null)
        {
            obj.y = parseInt(box.style.top, 10);
        }        
        
        // ** Run onHide function if flag is NOT false
        if(bDoNotExecuteOnHide === undefined || typeof bDoNotExecuteOnHide == 'undefined' || bDoNotExecuteOnHide == false)
        {
            obj.onHide();
        }

        // ** Reset flag
        _bResized = false;
    };

    // ** Close and destroy the dialog box
    var _destroy = function(objId)
    {
        var success = false; // default false

        // ** Get body element, reset values, restore scrolling
        var body = document.getElementsByTagName('body')[0];
        _removeClass(body, 'dlg-stop-scrolling');
        body.setAttribute('style', 'padding-right:' + _s2i(_orgBodyPaddingRight) + 'px;');
        
        // ** Get the dlg element
        var dlg = document.getElementById(objId);

        // ** Hide the box
        if(dlg)
        {
            dlg.style.display = 'none';
        }

        // ** If promptbox was created, remove eventlisteners
        if(dlg)
        {
            var pBox = dlg.querySelectorAll('.dlg-input-field');
            if(pBox.length !=0)
            {
                pBox[0].onkeyup = null;
                pBox[0].onchange = null;
            }
        }

        // ** Remove dialogbox, reset values
        if(dlg)
        {
            // ** Remove box from DOM
            dlg.parentNode.removeChild(dlg);

            // ** Get the object stored in the array
            var obj = _getObjFromId(_boxObj, objId);
            
            // ** Run onDestroy function
            obj.onDestroy();
            
            // ** Flag that the box as no longer in DOM
            obj.bExistInDOM = false;
            
            // ** Flag that the box as no longer visible (this can be useful if keeping box alive)
            obj.bVisible = false;

            // ** We override the objects internal variable, since we added "hide" function as default,
            //    destroy will ALWAYS delete dialogbox from memory and DOM.
            //    The variable "bKeepAlive" may be removed eventually if not used.
            obj.bKeepAlive = false;

            // ** If box was created, remove it from array, unless "obj.bKeepAlive = true"
            if(!obj.bKeepAlive)
            {
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
                            _log('DEBUG: destroy(): obj.bKeepAlive = false | Object deleted from array');
                        }
                        else
                        {
                            success = false;
                            _log('DEBUG: destroy(): Error! obj.bKeepAlive = false | But object NOT deleted from array!');
                        }
                    }, 10);
                }
                else
                {
                    _log('DEBUG: destroy(): Error, object not found in array!');
                    success = false;
                }
            }
            // ** If bKeepAlive is true, then do not remove object
            else if(obj.bKeepAlive)
            {
                _log('DEBUG: destroy(): obj.bKeepAlive = true | Object not deleted from array');
                success = false;
            }
        }

        // ** Reset flag 
        //_isActive = false;  // disabled here for now

        // ** Return result
        return success;
    };

    // ** Create dialogbox
    var _create = function(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h)
    {
        // ** Check if object already exist, if so return that object instead of creating a new
        var existingObj = _getObjFromId(_boxObj, strId + '_0');
        if(existingObj)
        {
            _log('DEBUG: create(): new object not created! An object with same ID already exist! Existing object returned');
            return existingObj;
        }
        
        var matched = _matchAll(_strBoxTypeList, strTypeClass, true);

        // ** Check if valid types
        if(matched === true)
        {
            // ** Check if id is set, if not create a new
            if(strId === '' || typeof strId === 'undefined' || strId === null || strId === 0)
            {
                // ** Create a unique string for the 'id'
                strId = Math.random().toString(36).substr(2,9);
            }

            // ** Add token to object id (so we dont mix up id's)
            strId += '_0';

            // ** Check if value is set, if not set it to: false
            if(typeof fnCallback === 'undefined')
            {
                fnCallback = false;
            }

            // ** Check if flag is set, if not set it to default
            //if(typeof bKeepAlive === 'undefined')
            //{
            //    bKeepAlive = true;  // default was changed to "true" from "false", due to implementation of hide function
            //}

            // ** Create object
            var obj =
            {
                // ** Properties
                id : strId,
                strTypeClass : strTypeClass,
                strTitle : strTitle,
                strMessage : strMessage,
                bKeepAlive : true,
                strInput : '',
                nRetCode : -1,
                x : x,
                y : y,
                w : w,
                h : h,
                bVisible : false,
                bExistInDOM : false,
                bHidden : false,
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
                            _log('\n\nDEBUG: typeof fnCallback = ' + typeof fnCallback + ' and not a function.');
                            _log('       Scope? Possible solution can be to use "hoisting".');
                            _log('       Try to use "var callbackFuncName = function(a,b){}" instead of "let callbackFuncName = function(a,b){}"');
                            _log('       ..or declare the callback function before the module "EasyDialogBox" is initialized');
                            _log('       If the dialogbox do not use a callback function, you can ignore the above messages.\n\n');
                        }
                    }
                    catch(err)
                    {
                        _log('CALLBACK: Error! ' + err);
                    }
                },
                
                // ** Show
                show : function()
                {
                    return _show(this.id);
                },
                
                // ** Hide
                hide : function(bDoNotExecuteOnHide)
                {
                    return _hide(this.id, bDoNotExecuteOnHide);
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
                }
            }
            _boxObj.push(obj);  // insert object into array of objects
            
            
            //---------------------------------------------------------------------
            // ** Create DOM element
            //---------------------------------------------------------------------
        
            // ** Get object from id, reuse same variable
            obj = _getObjFromId(_boxObj, strId);

            // ** Fix for pre-written HTML boxes: add '_0' to id before getting object
            if(obj === null)
            {
                strId += '_0';
                obj = _getObjFromId(_boxObj, strId);                
            }

            // ** Create parent reference
            var body = document.getElementsByTagName('body')[0];

            // ** Create box and insert into parent element
            var dlg = document.createElement('div');
            dlg.setAttribute('id', obj.id);
            dlg.setAttribute('class', obj.strTypeClass);
            body.appendChild(dlg);

            // ** Reset value
            matched = false;
            
            if(dlg)
            {
                matched = _matchAll(_strBoxTypeList, obj.strTypeClass, true);
            }

            // ** Check if element with the id exist in DOM, and valid dlg-types
            if( dlg && (matched === true) )
            {   
                // ** Show the backdrop overlay, and the dialogbox eventually
                dlg.style.display = 'block';  // Must be here or else can cause elements size and pos not detected,
                                              // then dynamic values and position do not work as we want.

                // ** Create outer box (the dialogbox itself)
                var box = document.createElement('div');
                box.setAttribute('id', obj.id + '_1');
                box.setAttribute('class','dlg-box');
                
                
                // ** Prepare custom values, default set to: 0
                box.customPosX = 0;
                box.customPosY = 0;
                box.customHeight = 0;
                box.customWidth = 0;
                
                // ** TODO: maybe change above default values to: -1
                //          so user can set box to x=0,y=0 instead of x=1,y=1 to specify upper left position
                //          And check for "value > -1" in below "if else" instead of "true/false"

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
                
                
                // ** Add element to DOM
                dlg.appendChild(box);


                // ** Add extra styles if flags are set
                if(_hasClass(dlg, 'dlg-rounded'))
                {
                    _addClass(box, 'dlg-rounded');
                }                
                if(_hasClass(dlg, 'dlg-shadow'))
                {
                    _addClass(box, 'dlg-shadow');
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
                    var closeText = document.createTextNode(' \u00d7 ');
                    closeX.appendChild(closeText);
                    heading.appendChild(closeX);

                    // ** Create title
                    var titleText = document.createTextNode(obj.strTitle);
                    heading.appendChild(titleText);
                }

                // ** Create message
                var message = document.createElement('div');

                // ** Prepare reference to inner boxes if needed
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
                    //obj.strInput = ''; // Remove earlier entered text from input field (optional)
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

                    // ** If "dlg-disable-btns" is specified in class then do not make buttons.
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
                        if(_hasClass(dlg, 'dlg-close')
                        || _hasClass(dlg, 'dlg')
                        //|| _hasClass(dlg, 'dlg ')
                        //|| ( _hasClass(dlg, 'dlg') && dlg.className.length === 3 )
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
                    _bResized = true;
                    
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
                        obj.hide(true);

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
                        obj.hide(true);

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        obj.nRetCode = CLOSE;

                        // ** Run onClose function
                        obj.onClose();
                    }, false);
                }
                // ** END: CLOSE button click handler

                // ** User clicks anywhere outside of the dialogbox
                _attachEventListener(window, 'click', function WinCloseClick(evt)
                {
                    // ** Get/set event variable
                    evt = evt || window.event || event;

                    if(evt.target == dlg)
                    {
                        // ** Remove eventlistener 
                        // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                        //_detachEventListener(window, 'click', WinCloseClick, false);

                        // ** Close dialogbox, reset values, clean up
                        //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                        obj.hide(true);

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        obj.nRetCode = CLOSE;

                        // ** Run onClose function
                        obj.onClose();
                    }
                }, false);
                // ** END: window click outside box click handler
                
                // ** Close box on ESC-key
                _attachEventListener(window, 'keyup', function EscKeyClose(evt)
                {	
                    // ** Get/set event variable
                    evt = evt || window.event || event;

                    // ** Listen for key (crossbrowser)
                    if(evt.which === 27
                    || evt.keyCode === 27
                    || evt.key === 'Escape'
                    || evt.code === 'Escape'
                    )
                    {
                        if(obj.bVisible)
                        {
                            // ** Remove eventlistener
                            // ** Disabled for now, keeping eventlisteners since we "hide" not "destroy"
                            //_detachEventListener(window, 'keyup', EscKeyClose, false);
                            
                            // ** Close dialogbox, reset values, clean up
                            //obj.destroy();  // Changed from "destroy" to "hiding", keep the dialogbox in DOM
                            obj.hide(true);                        
                            
                            // ** Callback, return code: CLOSE
                            obj.callback(CLOSE);
                            obj.nRetCode = CLOSE;
                            
                            // ** Run onClose function
                            obj.onClose();
                            
                            // ** Prevent default event action and bubbling
                            _stopEvent(evt);
                            _stopDefault(evt);
                        }
                    }
                }, false);
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
                            obj.hide(true);

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
                            obj.hide(true);

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
                            obj.hide(true);

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
                            obj.hide(true);

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
                            obj.strInput = _sanitize(pBox.value);
                            //obj.strInput = _escape(pBox.value);
                            //obj.strInput = _htmlEncode(pBox.value);
                        }, false);

                        _attachEventListener(pBox, 'change', function PromptBoxChange()
                        {
                            obj.strInput = _sanitize(pBox.value);
                            //obj.strInput = _escape(pBox.value);
                            //obj.strInput = _htmlEncode(pBox.value);
                        }, false);
                    }
                }
                // ** END: User types in promptbox

                //---------------------------------------------------------------------
                // ** END: Create event-listeners
                //---------------------------------------------------------------------
                

                // ** Make it draggable, unless flag is set
                if(!(_hasClass(dlg, 'dlg-disable-drag')))
                {
                    _drag.init(box.id);
                }

                // ** Adjust box size and position according to window size
                //_adjustElSizePos(box.id);  // disbled <--- this was making box position problems
                
                // ** Set focus to input field if promptbox
                if(_hasClass(dlg, 'dlg-prompt'))
                {
                    dlg.querySelector('.dlg-input-field').focus();
                }

                // ** Object has been created, set flag to true
                obj.bExistInDOM = true;
                
                // ** Set reference to dialogbox element itself
                //obj.element = document.getElementById(box.id);
                
                // ** First run keep hidden, only create, do not show
                obj.hide(true);  // true = skips execution of "obj.onHide()" function

                // ** Run onCreate function
                obj.onCreate();
                
                _log('DEBUG: create(): new object created and added to DOM');
                
                // ** Return object
                return obj;
            }            
            else if(!matched)
            {
                _log('DEBUG: create(): Error, dialogbox type not defined or not a valid type: ' + obj.strTypeClass);
            }
            else if(!dlg)
            {
                _log('DEBUG: create(): Error, element id \'' + strId + '\' do not exist!\nReturned value = ' + dlg);
            }
            else
            {
                _log('DEBUG: create(): Unknown error!');
            }
            //---------------------------------------------------------------------
            // ** END: Create DOM element
            //---------------------------------------------------------------------            
        }
        else
        {
            _log('DEBUG: create(): Error, dialogbox type not defined or not a valid type: ' + strTypeClass);
        }
        return null; // return failure
    };

    // ** Initialize
    var _init = function()
    {
        // ** Window load event
        _attachEventListener(window, 'load', function LoadWindow()
        {
            // ** Inform user if debuginfo console-output is on
            if(DEBUG)
            {
                _log('EasyDialogBox debug console-output is set to: ON\nYou can switch it OFF in the file "easydlg.js" by setting the variable: DEBUG = false');
            }
            
            // ** Get all elements with class containing 'dlg-opener'
            var btns = document.querySelectorAll('.dlg-opener');
            
            // ** Create objects and click handler for each element that contain class 'dlg-opener'
            for(var i = 0; i < btns.length; i++)
            {
                // ** Get element from DOM
                var dlg = document.getElementById(btns[i].getAttribute('rel'));
                
                // ** Clean up className string to avoid error, just in case
                // ** Replace double whitespace if found
                var classType = dlg.getAttribute('class').replace(/\s\s+/g, ' ');
                // ** Remove leading and trailing whitspace
                classType = classType.replace(/^\s+|\s+$/g, '');
                
                // ** Create object from DOM element
                var obj = _create(dlg.getAttribute('id'),            // id
                                  classType,                         // type
                                  dlg.getAttribute('title'),         // title
                                  dlg.innerHTML,                     // message
                                  dlg.getAttribute('data-callback'), // callback function
                                  dlg.getAttribute('data-x'),        // horizontal position
                                  dlg.getAttribute('data-y'),        // vertical position
                                  dlg.getAttribute('data-w'),        // width
                                  dlg.getAttribute('data-h'));       // height
            }

            // ** Create click handler for each element
            var clkObj = document.querySelectorAll('.dlg-opener');
            clkObj.forEach(function(btn, index)
            {
                _attachEventListener(btn, 'click', function DlgOpenerClick(evt)
                { 
                    // ** Get/set event variable
                    evt = evt || window.event || event;
                    
                    _boxObj[index].show();  // Show the dialogbox with the id referenced in 'rel' attribute
                    this.blur();            // Remove focus from button or other opening element
                    _stopDefault(evt);      // Prevent scrolling to top of page if i.e. used in an anchor-link 'href="#"'
                    _stopEvent(evt);        // Prevent bubbling up to parent elements or capturing down to child elements                    
                }, false);
            });
        }, false);
    };

    // ** Drag'n'drop object module
    var _drag = 
    {
        init : function(id)
        {
            _drag.el = document.getElementById(id);
            _drag.el.grabber = document.getElementById(id + '_heading');

            if(_drag.el.grabber === null)
            {
                _drag.el.grabber = _drag.el;
            }

            _drag.el.style.position = 'absolute';
            _attachEventListener(_drag.el.grabber, 'mousedown', _drag.start, false);
        },
        start : function(evt)
        {
            // ** Get/set event variable
            evt = evt || window.event || event;

            // ** Left mouse button triggers moving
            if(evt.button === 0)
            {
                _stopDefault(evt);
                _drag.el.grabber.style.cursor = 'move';
                _drag.el.posX2 = evt.clientX;
                _drag.el.posY2 = evt.clientY;
                _attachEventListener(document, 'mouseup', _drag.stop, false);
                _attachEventListener(document, 'mousemove', _drag.move, false);
            }
        },
        stop : function()
        {
            _drag.el.grabber.style.cursor = '';
            _detachEventListener(document, 'mouseup', _drag.stop, false);
            _detachEventListener(document, 'mousemove', _drag.move, false);
        },
        move : function(evt)
        {
            // ** Get/set event variable
            evt = evt || window.event || event;

            _stopDefault(evt);
            _drag.el.posX = _drag.el.posX2 - evt.clientX;
            _drag.el.posY = _drag.el.posY2 - evt.clientY;
            _drag.el.posX2 = evt.clientX;
            _drag.el.posY2 = evt.clientY;
            _drag.el.style.top = parseInt((_drag.el.offsetTop) - (_drag.el.posY)) + 'px';
            _drag.el.style.left = parseInt((_drag.el.offsetLeft) - (_drag.el.posX)) + 'px';
        }
    };

    //---------------------------------------------------------------------
    // ** Public methods
    //---------------------------------------------------------------------
    return { //<-- bracket need to be on same line, else it just returns: undefined

        // ** Create dialog
        create : function(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h)
        {
            return _create(strId, strTypeClass, strTitle, strMessage, fnCallback, x, y, w, h);
        },

        // ** Get all objects
        getAll : function()
        {
            return _boxObj;
        },

        // ** Get object from id
        getById : function(id)
        {
            return _getObjFromId(_boxObj, id);
        },

        // Init module
        init : function()
        {
            return _init();
        }
    }
    //----------------------------------------------------------
    // ** END: Public methods
    //----------------------------------------------------------
})();
//-----------------------------------------------------------------------------------------------------------------
// ** END: EasyDialogBox Object (module)
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** Initialize
//-----------------------------------------------------------------------------------------------------------------
(function(){EasyDialogBox.init();})();
//-----------------------------------------------------------------------------------------------------------------
// ** END: Initialize
//-----------------------------------------------------------------------------------------------------------------
