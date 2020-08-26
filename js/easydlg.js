//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox
// ** Version: 1.695
// ** Created by: Kee J. Elo
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

    // ** Variable that holds the original padding-right value of body element
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

    // ** Convert string to integer (decimal)
    const _s2i = function(str)
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
        // ** Parameters
        // @ arr = array that holds the values we want to match against
        // @ str = string/array that we want to match with the above array
        // @ exp = true = split string into array, using separator,
        //         false (or omitted) = do not split, treat string as one value.
        // @ sep = character that is used as a string splitter, for instance a space ' ' or comma ','  
        //         or other character enclosed in single quotes. If omitted then a space is used as separator, ' '

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
    const _sanitize = function(str)
    {
        str = str.replace(/[^a-z0-9@£#\s\,._-æøåäö-]/gi, '');
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

    // ** Adjust element size and position according to window size
    const _adjustElSizePos = function(id)
    {
        let el = document.getElementById(id);
        if(el)
        {
            // ** If height is larger or equal to window height, disable vertical alignment,
            // ** position to: top (try to prevent out of view)            
            let winHeight = window.innerHeight
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
            let winWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

            let overlap = 40; // value is used to help width-detection
            if( _s2i(el.offsetWidth + el.customPosX + overlap) >= winWidth) // Seem to work OK
            {
                // ** Try to retain responsiveness by setting default values 
                el.style.left = '0';
                el.style.marginLeft = '0';
                el.style.marginRight = '0';
                el.style.width = '';
                el.style.maxWidth = '';
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

    // ** Show the dialog box
    const _show = function(objId)
    {
        // ** Check that no other dialog is active
        if(_isActive === false)
        {
            // ** Get object from id
            let obj = _getObjFromId(_boxObj, objId);

            // ** Fix for pre-written HTML boxes: add '_0' to id before getting object
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

            // ** Check if element with the id exist in DOM, and valid dlg-types
            if( dlg && (matched === true) )
            {            
                // ** Show the backdrop overlay, and the dialogbox eventually
                dlg.style.display = 'block';  // Must be here or else can cause elements size and pos not detected,
                                              // then dynamic values do not work as we want.
                                              
                // ** Create outer box
                let box = document.createElement('div');
                box.setAttribute('id', obj.id + '_1');
                box.setAttribute('class','dlg-box');

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
                    box.style.height = _s2i(obj.h) + 'px';
                    box.customHeight = _s2i(obj.h);
                }
                // ** END: Check if size is set
                
                // ** Add element to DOM
                dlg.appendChild(box);

                // ** Create heading
                let heading = document.createElement('div');
                heading.setAttribute('id', obj.id + '_1_heading');
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
                    if(box.customHeight)
                    {
                        message.style.height = _s2i(obj.h - 101) + 'px';
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
                    if(box.customHeight)
                    {
                        message.style.height = _s2i(obj.h - 130) + 'px';
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


                // ** Creating substitute for scrollbar

                // ** Store the original padding-right value
                _orgBodyPaddingRight = window.getComputedStyle(body, null).getPropertyValue('padding-right');

                // ** Convert from string to integer (remove 'px' postfix and return value as integer)
                _orgBodyPaddingRight = _s2i(_orgBodyPaddingRight);

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
                    w3 += _s2i(_orgBodyPaddingRight);
                }

                // ** Apply width-difference as padding-right to body, substitute for scrollbar,
                // ** can prevent contentshift if content is centered when scrollbar disappears.
                body.setAttribute('style','padding-right:' + w3 + 'px;');
                // ** END: Creating substitute for scrollbar


                //---------------------------------------------------------------------
                // ** Create event-listeners
                //---------------------------------------------------------------------

                // ** Window resize
                window.addEventListener('resize', function WinResize()
                {
                    _adjustElSizePos(box.id);
                });
                // ** END: Window resize

                // ** User clicks the [X] button
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

                        // ** Run onClose function
                        obj.onClose();
                    });
                }
                // ** END: [X] button click handler

                // ** User clicks the CLOSE button
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

                        // ** Run onClose function
                        obj.onClose();
                    });
                }
                // ** END: CLOSE button click handler

                // ** User clicks anywhere outside of the dialogbox
                window.addEventListener('click', function WinCloseClick(evt)
                {
                    // ** Get/set event variable
                    evt = evt || window.event || event;

                    if(evt.target == dlg)
                    {
                        // ** Remove eventlistener
                        window.removeEventListener('click', WinCloseClick);

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();

                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);

                        // ** Run onClose function
                        obj.onClose();
                    }
                });
                // ** END: window click outside box click handler
                
                // ** Close box on ESC-key
                window.addEventListener('keyup', function EscKeyClose(evt)
                {	
                    // ** Get/set event variable
                    evt = evt || window.event || event;

                    // ** Listen for key (crossbrowser)
                    if(evt.key === 'Escape' 
                    || evt.which === 27 
                    || evt.keyCode === 27 
                    || evt.code === 'Escape'
                    )
                    {
                        // ** Remove eventlistener
                        window.removeEventListener('keyup', EscKeyClose);
                        
                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();
                        
                        // ** Callback, return code: CLOSE
                        obj.callback(CLOSE);
                        
                        // ** Run onClose function
                        obj.onClose();
                        
                        // ** Prevent bubbling
                        evt.preventDefault();
                        evt.stopPropagation();
                    }
                });
                // ** END: Close box on ESC-key

                // ** If YES-NO messagebox, create click handler for YES and NO buttons
                if(dlg.classList.contains('dlg-yes-no')
                || dlg.classList.contains('dlg-yes')
                || dlg.classList.contains('dlg-no')
                )
                {
                    // ** User clicks the YES button
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

                            // ** Run onClose function
                            obj.onClose();
                        });
                    }

                    // ** User clicks the NO button
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
                            
                            // ** Run onClose function
                            obj.onClose();
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
                    // ** User clicks the OK button
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

                            // ** Run onClose function
                            obj.onClose();
                        });
                    }

                    // ** User clicks the Cancel button
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
                            
                            // ** Run onClose function
                            obj.onClose();
                        });
                    }
                }
                // ** END: OK-CANCEL button click handlers

                // ** User types in promptbox, update variable: obj.strInput
                if(dlg.classList.contains('dlg-prompt'))
                {
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
                }
                // ** END: User types in promptbox

                //---------------------------------------------------------------------
                // ** END: Create event-listeners
                //---------------------------------------------------------------------
                
                // ** Make it draggable, unless flag is set
                if(!dlg.classList.contains('dlg-no-drag'))
                {
                    _drag.init(obj.id + '_1');
                }

                // ** Set flag to indicate that box is active and can be displayed
                _isActive = true;  // internal module flag
                
                // ** Show dialogbox
                box.style.visibility = 'visible';
                
                // ** Set object "visible" flag to: true
                box.bVisible = true;

                // ** Adjust box size and position according to window size
                _adjustElSizePos(box.id);
                
                // ** Set focus to input field if promptbox
                if(dlg.classList.contains('dlg-prompt'))
                {
                    dlg.getElementsByClassName('dlg-input-field')[0].focus();
                }
                
                // ** Run onShow function
                obj.onShow();

                // ** Return success
                return true;
            }            
            else if(!matched)
            {
                _log('DEBUG: show(): Error, dialogbox type not defined or not a valid type: ' + obj.strTypeClass);
            }
            else if(!dlg)
            {
                _log('DEBUG: show(): Error, element id \'' + objId + '\' do not exist!\nReturned value = ' + dlg);
            }
            else
            {
                _log('DEBUG: show(): Unknown error!');
            }
        }
        else if(_isActive)
        {
            _log('DEBUG: show(): Error, a box is already in view! Can only show one dialogbox at a time!');
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
        body.setAttribute('style', 'padding-right:' + _s2i(_orgBodyPaddingRight) + 'px;');

        // ** Get the dlg element
        let dlg = document.getElementById(objId);

        // ** Hide the box
        if(dlg)
        {
            dlg.style.display = 'none';
        }

        // ** If promptbox was created, remove eventlisteners
        if(dlg)
        {
            let pBox = dlg.getElementsByClassName('dlg-input-field');
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
            let obj = _getObjFromId(_boxObj, objId);
            
            // ** Flag that the box as no longer in DOM
            obj.bExistInDOM = false;
            
            // ** Flag that the box as no longer visible (this can be useful if keeping box alive)
            obj.bVisible = false;

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
                strInput : '',
                nRetCode : -1,
                x : x,
                y : y,
                w : w,
                h : h,
                bVisible : false,
                bExistInDOM : false,

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

                // ** Destroy
                destroy : function()
                {
                    return _destroy(this.id);
                },
                
                // ** onCreate
                onCreate : function()
                {
                    _log('DEBUG: Default "myObj.onCreate()" function fired. Override this by creating your own.');
                },
                
                // ** onShow
                onShow : function()
                {
                    _log('DEBUG: Default "myObj.onShow()" function fired. Override this by creating your own.');
                },
                
                // ** onClose
                onClose : function()
                {
                    _log('DEBUG: Default "myObj.onClose()" function fired. Override this by creating your own.');
                }
            }
            _boxObj.push(obj);  // add object to array
            
            obj.onCreate();  // run onCreate function
            
            return obj;  // return object
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
                let obj = _create(dlg.getAttribute('id'),            // id
                                  dlg.getAttribute('class'),         // type
                                  dlg.getAttribute('title'),         // title
                                  dlg.innerHTML,                     // message
                                  dlg.getAttribute('data-callback'), // callback function
                                  true,                              // keep alive after closing
                                  dlg.getAttribute('data-x'),        // horizontal position
                                  dlg.getAttribute('data-y'),        // vertical position
                                  dlg.getAttribute('data-w'),        // width
                                  dlg.getAttribute('data-h'));       // height

                // ** Create click handler for each element
                btns[i].addEventListener('click', function DlgOpenerClick(evt)
                {
                    // ** Get/set event variable
                    evt = evt || window.event || event;
                    
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
            _drag.el = document.getElementById(id);
            _drag.el.grabber = document.getElementById(id + '_heading');

            if(_drag.el.grabber === null)
            {
                _drag.el.grabber = _drag.el;
            }

            _drag.el.style.position = 'absolute';
            _drag.el.grabber.addEventListener('mousedown', _drag.start);
        },
        start : function(evt)
        {
            // ** Get/set event variable
            evt = evt || window.event || event;

            // ** Left mouse button triggers moving
            if(evt.button === 0)
            {
                evt.preventDefault();
                _drag.el.grabber.style.cursor = 'move';
                _drag.el.posX2 = evt.clientX;
                _drag.el.posY2 = evt.clientY;
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
            // ** Get/set event variable
            evt = evt || window.event || event;

            evt.preventDefault();
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
