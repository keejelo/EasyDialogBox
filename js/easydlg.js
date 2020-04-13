//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox
// ** Version: 1.626
// ** Created by: keejelo
// ** Year: 2020
// ** GitHub: https://github.com/keejelo/EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


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
const EasyDialogBox = (function()
{   'use strict';

    // ** Debug: true/false (outputs debug-messages to console)
    const DEBUG = true;

    // ** Buttontext (custom your own text if you want)
    let _btnTextClose  = 'Close';   // Close
    let _btnTextYes    = 'Yes';     // Yes
    let _btnTextNo     = 'No';      // No
    let _btnTextOk     = 'OK';      // OK
    let _btnTextCancel = 'Cancel';  // Cancel

    // ** Button return codes, constant literals
    const CLOSE  = 0;
    const YES    = 1;
    const NO     = 2;
    const OK     = 3;
    const CANCEL = 4;

    // ** Dialogbox types and flags, can be used separately or in combination separated by a space
    const _strBoxTypeList = ['dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok','dlg-cancel','dlg-ok-cancel',
                           'dlg-no-footer','dlg-no-btns','dlg-no-overlay','dlg-no-drag',
                           'dlg-info','dlg-question','dlg-error','dlg-success','dlg-exclamation'];

    // ** Array that holds all created boxobjects, so we can refer to them later if we need to, i.e. callback ...
    let _boxObj = [];

    // ** Variable that stores the original padding-right value of body element
    let _orgBodyPaddingRight = 0;

    // ** Flag that indicates if a box is currently in view (is displayed)
    let _isActive = false;

    // ** Debug-logger
    const _log = function(str)
    {
        if(DEBUG)
        {
            return console.log(str);
        }
    };

    // ** Convert string to decimal
    const _str2dec = function(str)
    {
        return parseInt(str, 10);
    };

    // ** Get object from array id
    const _getObjFromId = function(arr, strId)
    {
        for(let i = 0; i < arr.length; i++)
        {
            if(arr[i].id === strId)
            {
                return arr[i];
            }
        }
        return null; // if no object found
    };

    // ** Check if array matches ALL test-values in supplied string/array. Returns true/false
    const _matchAll = function(arr, str, exp, sep)
    {
        // ** Params
        // @ arr = array that holds the values we want to match against
        // @ str = string/array that we want to match with the above array
        // @ exp = (boolean) true = split string into array, using separator. false (or omitted) = do not split, treat string as one value.
        // @ sep = character that is used as a string splitter, for instance a space ' ' or comma ','  or other character enclosed in single quotes

        let val = str;
        if(exp === true)
        {
            if(typeof sep === 'undefined')
            {
                sep = ' '; // default: space
            }
            val = str.split(sep);
        }

        let passed = 0;
        for(let i = 0; i < val.length; i++)
        {
            for(let j = 0; j < arr.length; j++)
            {
                if(arr[j] === val[i])
                {
                    passed++;
                }
            }
        }

        // ** Ensure that ALL values matched, else return failure. Check if numbers tested equals the numbers of items that passed.
        if(val.length === passed)
        {
            return true;
        }

        return false;
    };

    // ** Harmful chars based on the context: &<>"'`´,!@$%/\()=+{}[]

    // ** Sanitize string, remove all characters except listed
    const _sanitize = function(str)
    {
        str = str.replace(/[^a-z0-9@£#\s\,._-זרוהצ-]/gi, '');
        return str;
    };

    // ** Escape string
    const _escape = function(str)
    {
        str = str.trim();
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/'/g, '&#39;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        return str;
    };

    // ** Encode all characters into html-entities
    const _htmlEncode = function(str)
    {
        return String(str).replace(/[^\w. ]/gi, function(c)
        {
            return '&#'+c.charCodeAt(0)+';';
        });
    };

    // ** Show the dialog box
    const _show = function(objId)
    {
        // ** Get object from id
        let obj = _getObjFromId(_boxObj, objId);

        // ** Fix for pre-written HTML boxes, add '_0' to id before getting object
        if(obj === null)
        {
            objId += '_0';
            obj = _getObjFromId(_boxObj, objId);
        }

        // ** Create parent reference
        let body = document.getElementsByTagName('body')[0];

        // ** Create box and insert into parent element
        let dlg = document.createElement('div');
        dlg.setAttribute('id', obj.id);
        dlg.setAttribute('class', obj.strTypeClass);
        body.appendChild(dlg);

        let matched = null;

        if(dlg)
        {
            matched = _matchAll(_strBoxTypeList, obj.strTypeClass, true);
        }

        // ** Check if element with the id exist in DOM, and that no other dialog is active, and valid dlg types
        if( dlg && (_isActive === false) && (matched === true) )
        {
            // ** Flags to indicate custom value usage
            let customPos = false;
            let customSize = false;

            // ** Create outer box
            let box = document.createElement('div');
            box.setAttribute('class','dlg-box');
            //box.setAttribute('class','dlg-box dlg-center-vert');

            
            // ** Check if position is set, if true then change position, else default value used
            if(obj.x)
            {
                // ** Warning! Below code can break "responsiveness"
                box.style.left = _str2dec(obj.x) + 'px';
            }
            // ** Check if position is set, if true then change position, else default value used
            if(obj.y)
            {
                // ** Warning! Below code can break "responsiveness"
                box.style.top = _str2dec(obj.y) + 'px';
                customPos = true;
            }
            else
            {
                box.setAttribute('class','dlg-box dlg-center-vert');
            }
            // ** END: Check if position is set

            // ** Check if size is set, if true then change size, else default value used
            if(obj.w)
            {
                // ** Warning! Below code can break "responsiveness"
                box.style.maxWidth = _str2dec(obj.w) + 'px';
                //customSize = true;
            }
            // ** Check if size is set, if true then change size, else default value used
            if(obj.h)
            {
                // ** Warning! Below code can break "responsiveness"
                box.style.height = _str2dec(obj.h) + 'px';
                customSize = true;
            }            
            // ** END: Check if size is set
            
            
            // ** Add element to DOM
            dlg.appendChild(box);

            // ** Create heading
            let heading = document.createElement('div');
            heading.setAttribute('id', obj.id + '_heading');
            heading.setAttribute('class','dlg-heading');
            box.appendChild(heading);

            // ** Create [X] close button
            let closeX = document.createElement('span');
            closeX.setAttribute('class','dlg-close-x');
            let closeText = document.createTextNode(' \u00d7 ');
            closeX.appendChild(closeText);
            heading.appendChild(closeX);

            // ** Create title
            let titleText = document.createTextNode(obj.strTitle);
            heading.appendChild(titleText);

            // ** Create message
            let message = document.createElement('div');

            // ** Prepare reference to inner boxes if needed
            let leftbox = null;
            let rightbox = null;

            // ** Check if icon should be displayed
            if(dlg.classList.contains('dlg-info')
            || dlg.classList.contains('dlg-question')
            || dlg.classList.contains('dlg-error')
            || dlg.classList.contains('dlg-success')
            || dlg.classList.contains('dlg-exclamation')
            )
            {
                message.setAttribute('class','dlg-message dlg-flex-container');
                
                // ** If custom height then adjust
                if(customSize)
                {
                    message.style.height = _str2dec(obj.h - 101) + 'px';
                }                

                // ** Create left box
                leftbox = document.createElement('div');
                leftbox.setAttribute('class','dlg-flexbox-left');

                // ** Check which icon to display
                if(dlg.classList.contains('dlg-info'))
                {
                    leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-info"></div>';
                }
                else if(dlg.classList.contains('dlg-question'))
                {
                    leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-question"></div>';
                }
                else if(dlg.classList.contains('dlg-error'))
                {
                    leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-error"></div>';
                }
                else if(dlg.classList.contains('dlg-success'))
                {
                    leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-success"></div>';
                }
                else if(dlg.classList.contains('dlg-exclamation'))
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
                if(customSize)
                {
                    message.style.height = _str2dec(obj.h - 130) + 'px';
                }
            }
            box.appendChild(message);

            // ** Create prompt box (input + OK + Cancel)
            if(dlg.classList.contains('dlg-prompt'))
            {
                let inputbox = document.createElement('div');
                inputbox.setAttribute('class', 'dlg-input');

                if(message.classList.contains('dlg-flex-container'))
                {
                    rightbox.appendChild(inputbox);
                }
                else
                {
                    message.appendChild(inputbox);
                }

                let input = document.createElement('input');
                input.setAttribute('class', 'dlg-input-field');
                input.setAttribute('type', 'text');
                //obj.strInput = ''; // Remove earlier entered text from input field (optional)
                input.setAttribute('value', obj.strInput);
                inputbox.appendChild(input);

                // ** Add buttons if not already stated in class
                dlg.classList.add('dlg-ok-cancel');
            }

            // ** Create footer and buttons
            // ** If "dlg-no-footer" is specified in class then do not create footer or any buttons
            if(!dlg.classList.contains('dlg-no-footer'))
            {
                // ** Create footer
                let footer = document.createElement('div');
                footer.setAttribute('class','dlg-footer');
                box.appendChild(footer);

                // ** If "dlg-no-btns" is specified in class then do not make buttons.
                if(!dlg.classList.contains('dlg-no-btns'))
                {
                    // ** If "Yes" button is specified in class
                    if(dlg.classList.contains('dlg-yes')
                    || dlg.classList.contains('dlg-yes-no')
                    )
                    {
                        // ** Create button
                        let yesBtn = document.createElement('button');
                        yesBtn.setAttribute('class','dlg-yes-btn');
                        let yesBtnText = document.createTextNode(_btnTextYes);
                        yesBtn.appendChild(yesBtnText);
                        footer.appendChild(yesBtn);
                    }

                    // ** If "No" button is specified in class
                    if(dlg.classList.contains('dlg-no')
                    || dlg.classList.contains('dlg-yes-no')
                    )
                    {
                        // ** Create button
                        let noBtn = document.createElement('button');
                        noBtn.setAttribute('class','dlg-no-btn');
                        let noBtnText = document.createTextNode(_btnTextNo);
                        noBtn.appendChild(noBtnText);
                        footer.appendChild(noBtn);
                    }

                    // ** If "OK" button is specified in class
                    if(dlg.classList.contains('dlg-ok')
                    || dlg.classList.contains('dlg-ok-cancel')
                    )
                    {
                        // ** Create button
                        let okBtn = document.createElement('button');
                        okBtn.setAttribute('class','dlg-ok-btn');
                        let okBtnText = document.createTextNode(_btnTextOk);
                        okBtn.appendChild(okBtnText);
                        footer.appendChild(okBtn);
                    }

                    // ** If "Cancel" button is specified in class
                    if(dlg.classList.contains('dlg-cancel')
                    || dlg.classList.contains('dlg-ok-cancel')
                    )
                    {
                        // ** Create button
                        let cancelBtn = document.createElement('button');
                        cancelBtn.setAttribute('class','dlg-cancel-btn');
                        let cancelBtnText = document.createTextNode(_btnTextCancel);
                        cancelBtn.appendChild(cancelBtnText);
                        footer.appendChild(cancelBtn);
                    }

                    // ** If "dlg" or "Close" button is specified in class
                    if(dlg.classList.contains('dlg')
                    || dlg.classList.contains('dlg-close')
                    )
                    {
                        // ** Create button
                        let closeBtn = document.createElement('button');
                        closeBtn.setAttribute('class','dlg-close-btn');
                        let closeBtnText = document.createTextNode(_btnTextClose);
                        closeBtn.appendChild(closeBtnText);
                        footer.appendChild(closeBtn);
                    }
                }
            }
            // ** END: Create footer and buttons
            
            // ** Show the dialogbox
            dlg.style.display = 'block';  // must be here or else it causes "height=auto" for other elements
                                          // and "getComputedStyle" do not work as we want

            // ** Get height of inner dialogbox
            //let inDlgBox = dlg.getElementsByClassName('dlg-box')[0];
            //let height = window.getComputedStyle(inDlgBox, null).getPropertyValue('height');
            let height = window.getComputedStyle(box, null).getPropertyValue('height');

            // ** If height is larger or equal to window height, disable vertical alignment,
            // ** just position at top. Prevents out of view.
            if(_str2dec(height) >= window.innerHeight)
            {
                box.classList.remove('dlg-center-vert');
                _log('DEBUG: Class removed: dlg-center-vert');
                
                // ** Try to retain responsiveness by removing custom values
                if(customPos)
                {
                    box.style.top = '';
                    box.style.left = '';
                }
                // ** Try to retain responsiveness by removing custom values
                if(customSize)
                {
                    box.style.width = '';
                    box.style.maxWidth = '';
                    box.style.height = '';
                }
            }
            else
            {
                if(customPos === false)
                {
                    box.classList.add('dlg-center-vert');
                    _log('DEBUG: Class added: dlg-center-vert');
                }
            }

            // ** Creating substitute for scrollbar
            // ** Get body element
            //let body = document.getElementsByTagName('body')[0];

            // ** Store the original padding-right value
            _orgBodyPaddingRight = window.getComputedStyle(body, null).getPropertyValue('padding-right');

            // ** Convert from string to integer (remove 'px' postfix and return value as integer)
            _orgBodyPaddingRight = _str2dec(_orgBodyPaddingRight);

            // ** Get width of body before removing scrollbar
            let w1 = body.offsetWidth;

            // ** Stop scrolling of background content (body) when dialogbox is in view, removes scrollbar
            body.classList.add('dlg-stop-scrolling');

            // ** Get width of body after removing scrollbar
            let w2 = body.offsetWidth;

            // ** Get width-difference
            let w3 = w2 - w1;

            // ** If conditions are true: add both padding-right values, 
            if(typeof _orgBodyPaddingRight === 'number' && _orgBodyPaddingRight > 0)
            {
                w3 += _str2dec(_orgBodyPaddingRight);
            }

            // ** Apply width-difference as padding-right to body, substitute for scrollbar,
            // ** can prevent contentshift if content is centered when scrollbar disappears.
            body.setAttribute('style','padding-right:' + w3 + 'px;');
            // ** END: Creating substitute for scrollbar


            //---------------------------------------------------------------------
            // ** Create event-listeners
            //---------------------------------------------------------------------

            // ** When the user clicks the [X] button
            let xCloseDialog = dlg.getElementsByClassName('dlg-close-x')[0];
            if(xCloseDialog)
            {
                xCloseDialog.addEventListener('click', function XCloseClick()
                {
                    // ** Remove eventlistener
                    xCloseDialog.removeEventListener('click', XCloseClick);

                    // ** Close dialogbox, reset values, clean up
                    obj.destroy();

                    // ** Callback, return code: CLOSE
                    obj.callback(CLOSE);
                });
            }
            // ** END: [X] button click handler

            // ** When the user clicks the CLOSE button
            let btnCloseDialog = dlg.getElementsByClassName('dlg-close-btn')[0];
            if(btnCloseDialog)
            {
                btnCloseDialog.addEventListener('click', function BtnCloseClick()
                {
                    // ** Remove eventlistener
                    btnCloseDialog.removeEventListener('click', BtnCloseClick);

                    // ** Close dialogbox, reset values, clean up
                    obj.destroy();

                    // ** Callback, return code: CLOSE
                    obj.callback(CLOSE);                        
                });
            }
            // ** END: CLOSE button click handler

            // ** When the user clicks anywhere outside of the dialogbox
            window.addEventListener('click', function WinCloseClick(evt)
            {
                if(evt.target == dlg)
                {
                    // ** Remove eventlistener
                    window.removeEventListener('click', WinCloseClick);

                    // ** Close dialogbox, reset values, clean up
                    obj.destroy();

                    // ** Callback, return code: CLOSE
                    obj.callback(CLOSE);
                }
            });
            // ** END: window click outside box click handler

            // ** If YES-NO messagebox, create click handler for YES and NO buttons
            if(dlg.classList.contains('dlg-yes-no')
            || dlg.classList.contains('dlg-yes')
            || dlg.classList.contains('dlg-no')
            )
            {
                // ** When the user clicks the YES button
                let btnYesDialog = dlg.getElementsByClassName('dlg-yes-btn')[0];
                if(btnYesDialog)
                {
                    btnYesDialog.addEventListener('click', function BtnYesClick()
                    {
                        // ** Remove eventlistener
                        btnYesDialog.removeEventListener('click', BtnYesClick);

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();

                        // ** Callback, return code: YES
                        obj.callback(YES);
                    });
                }

                // ** When the user clicks the NO button
                let btnNoDialog = dlg.getElementsByClassName('dlg-no-btn')[0];
                if(btnNoDialog)
                {
                    btnNoDialog.addEventListener('click', function BtnNoClick()
                    {
                        // ** Remove eventlistener
                        btnNoDialog.removeEventListener('click', BtnNoClick);

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();

                        // ** Callback, return code: NO
                        obj.callback(NO);
                    });
                }
            }
            // ** END: YES-NO button click handlers

            // ** If OK-CANCEL messagebox, create click handler for OK and CANCEL buttons
            if(dlg.classList.contains('dlg-ok-cancel')
            || dlg.classList.contains('dlg-ok')
            || dlg.classList.contains('dlg-cancel')
            )
            {
                // ** When the user clicks the OK button
                let btnOkDialog = dlg.getElementsByClassName('dlg-ok-btn')[0];
                if(btnOkDialog)
                {
                    btnOkDialog.addEventListener('click', function BtnOkClick()
                    {
                        // ** Remove eventlistener
                        btnOkDialog.removeEventListener('click', BtnOkClick);

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();

                        // ** Callback, return code: OK
                        obj.callback(OK);                            
                    });
                }

                // ** When the user clicks the Cancel button
                let btnCancelDialog = dlg.getElementsByClassName('dlg-cancel-btn')[0];
                if(btnCancelDialog)
                {
                    btnCancelDialog.addEventListener('click', function BtnCancelClick()
                    {
                        // ** Remove eventlistener
                        btnCancelDialog.removeEventListener('click', BtnCancelClick);

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();

                        // ** Callback, return code: CANCEL
                        obj.callback(CANCEL);
                    });
                }
            }
            // ** END: OK-CANCEL button click handlers

            // ** When the user types in promptbox, update variable: obj.strInput
            let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
            if(pBox)
            {
                pBox.addEventListener('keyup', function PromptBoxKeyUp()
                {
                    obj.strInput = _sanitize(pBox.value);
                    //obj.strInput = _escape(pBox.value);
                    //obj.strInput = _htmlEncode(pBox.value);
                });

                pBox.addEventListener('change', function PromptBoxChange()
                {
                    obj.strInput = _sanitize(pBox.value);
                    //obj.strInput = _escape(pBox.value);
                    //obj.strInput = _htmlEncode(pBox.value);
                });
            }
            // ** END: When the user types in promptbox

            //---------------------------------------------------------------------
            // ** END: Create event-listeners
            //---------------------------------------------------------------------

            // ** Set flag to indicate that box is active and is displayed
            _isActive = true;

            // ** Make it draggable, unless flag is set
            if(!dlg.classList.contains('dlg-no-drag'))
            {
                _drag.init(obj.id + '_heading');
            }

            // ** Set focus to input field if promptbox
            if(dlg.classList.contains('dlg-prompt'))
            {
                dlg.getElementsByClassName('dlg-input-field')[0].focus();
            }

            // ** Return success
            return true;
        }
        else if(!matched)
        {
            _log('DEBUG: show(): Error, dialogbox type not defined or not a valid type: ' + obj.strTypeClass);
        }
        else if(_isActive)
        {
            _log('DEBUG: show(): Error, a box is already in view! Can only show one dialogbox at a time!');
        }
        else if(!dlg)
        {
            _log('DEBUG: show(): Error, element id \'' + objId + '\' do not exist!\nReturned value = ' + dlg);
        }
        else
        {
            _log('DEBUG: show(): Unknown error!');
        }

        // ** Return failure
        return false;
    };

    // ** Close and destroy the dialog box
    const _destroy = function(objId)
    {
        let success = false; // default

        // ** Get body element, reset values, restore scrolling
        let body = document.getElementsByTagName('body')[0];
        body.classList.remove('dlg-stop-scrolling');
        body.setAttribute('style', 'padding-right:' + _str2dec(_orgBodyPaddingRight) + 'px;');

        // ** Get the dlg element
        let dlg = document.getElementById(objId);

        // ** Hide the box
        if(dlg)
        {
            dlg.style.display = 'none';
        }

        // ** If promptbox was created, remove eventlisteners
        let pBox = dlg.getElementsByClassName('dlg-input-field')[0];            
        if(pBox)
        {
            pBox.onkeyup = null;
            pBox.onchange = null;
        }

        // ** Remove dialogbox, reset values
        if(dlg)
        {
            // ** Remove box from DOM
            dlg.parentNode.removeChild(dlg);

            // ** Get object
            let obj = _getObjFromId(_boxObj, objId);

            // ** If box was created, remove it from array, unless "obj.bKeepAlive = true"
            if(!obj.bKeepAlive)
            {
                // ** Remove object from array
                let index = _boxObj.indexOf(obj);
                if(index > -1)
                {
                    setTimeout(function()
                    {
                        let wasDeleted = _boxObj.splice(index, 1);

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
                    }, 1);
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
        _isActive = false;

        // ** Return result
        return success;
    };

    // ** Create dialog
    const _create = function(strId, strTypeClass, strTitle, strMessage, fnCallback, bKeepAlive, x, y, w, h)
    {
        let matched = _matchAll(_strBoxTypeList, strTypeClass, true);

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

            // ** Check if flag is set, if not set it to: false
            if(typeof bKeepAlive === 'undefined')
            {
                bKeepAlive = false;
            }

            // ** Create object
            let obj =
            {
                // ** Properties
                id : strId,
                strTypeClass : strTypeClass,
                strTitle : strTitle,
                strMessage : strMessage,
                bKeepAlive : bKeepAlive,
                x : x,
                y : y,
                w : w,
                h : h,
                strInput : '',
                nRetCode : -1,

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
                            _log('typeof fnCallback = ' + typeof fnCallback + ' and not a function.');
                            _log('Scope? Possible solution can be to use "hoisting".');
                            _log('Try to use "var callbackFuncName = function(a,b){}" instead of "let callbackFuncName = function(a,b){}"');
                            _log('..or declare the callback function before the module "EasyDialogBox" is initialized');
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

                // ** Destroy
                destroy : function()
                {
                    return _destroy(this.id);
                }
            }
            _boxObj.push(obj); // add object to array
            return obj; // return object
        }
        else
        {
            _log('DEBUG: create(): Error, dialogbox type not defined or not a valid type: ' + strTypeClass);
        }
        return null; // return failure
    };

    // ** Initialize
    const _init = function()
    {
        // ** Window load event
        window.addEventListener('load', function LoadWindow()
        {
            // ** Get all elements with class containing 'dlg-opener'
            let btns = document.getElementsByClassName('dlg-opener');

            // ** Create objects and click handler for each element that contain class 'dlg-opener'
            for(let i = 0; i < btns.length; i++)
            {
                // ** Get element from DOM
                let dlg = document.getElementById(btns[i].getAttribute('rel'));

                // ** Create object from DOM element
                let obj = _create(dlg.getAttribute('id'),       // id
                                  dlg.getAttribute('class'),    // type
                                  dlg.getAttribute('title'),    // title
                                  dlg.innerHTML,                // message
                                  dlg.getAttribute('name'),     // callback function
                                  true,                         // keep alive after closing
                                  dlg.getAttribute('x'),        // horizontal position (using this may fail HTML validation)
                                  dlg.getAttribute('y'),        // vertical position (using this may fail HTML validation)
                                  dlg.getAttribute('w'),        // width (using this may fail HTML validation)
                                  dlg.getAttribute('h'));       // height (using this may fail HTML validation)

                // ** Create click handler for each element
                btns[i].addEventListener('click', function DlgOpenerClick(evt)
                {
                    obj.show();             // Show the dialogbox with the id referenced in 'rel' attribute
                    this.blur();            // Remove focus from button or other opening element
                    evt.preventDefault();   // Prevent scrolling to top of page if i.e. used in an anchor-link 'href="#"'
                    evt.stopPropagation();  // Prevent bubbling up to parent elements or capturing down to child elements
                });
            }
        });
    };

    // ** Drag'n'drop object module
    const _drag = 
    {
        init : function(id)
        {
            _drag.el = {};
            _drag.el.grabber = document.getElementById(id);
            _drag.el.grabber.addEventListener('mousedown', _drag.start);
            _drag.el.grabberParent = _drag.el.grabber.parentElement;

            let body = document.getElementsByTagName('body')[0];
            if(_drag.el.grabberParent === body)
            {
                _drag.el.grabberParent = _drag.el.grabber;
            }

            _drag.el.grabberParent.style.position = 'absolute';
        },
        start : function(evt)
        {
            // ** Left mouse button triggers moving
            if(evt.button === 0)
            {
                evt.preventDefault();
                _drag.el.grabber.style.cursor = 'move';
                _drag.el.grabberParent.posX2 = evt.clientX;
                _drag.el.grabberParent.posY2 = evt.clientY;
                document.addEventListener('mouseup', _drag.stop);
                document.addEventListener('mousemove', _drag.move);
            }
        },
        stop : function()
        {
            _drag.el.grabber.style.cursor = '';
            document.removeEventListener('mouseup', _drag.stop);
            document.removeEventListener('mousemove', _drag.move);
        },
        move : function(evt)
        {
            evt.preventDefault();
            _drag.el.grabberParent.posX = _drag.el.grabberParent.posX2 - evt.clientX;
            _drag.el.grabberParent.posY = _drag.el.grabberParent.posY2 - evt.clientY;
            _drag.el.grabberParent.posX2 = evt.clientX;
            _drag.el.grabberParent.posY2 = evt.clientY;
            _drag.el.grabberParent.style.top = parseInt((_drag.el.grabberParent.offsetTop) - (_drag.el.grabberParent.posY)) + 'px';
            _drag.el.grabberParent.style.left = parseInt((_drag.el.grabberParent.offsetLeft) - (_drag.el.grabberParent.posX)) + 'px';
        }
    };

    //---------------------------------------------------------------------
    // ** Public methods
    //---------------------------------------------------------------------
    return { //<-- bracket need to be on same line, else it just returns: undefined

        // ** Create dialog
        create : function(strId, strTypeClass, strTitle, strMessage, fnCallback, bKeepAlive)
        {
            return _create(strId, strTypeClass, strTitle, strMessage, fnCallback, bKeepAlive);
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
