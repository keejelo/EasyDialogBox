//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox 1.516
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
//  0 = "X", "Close" button or outside box clicked
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
let EasyDialogBox = (function()
{   'use strict';

    // ** Debug: true/false (outputs debug-messages to console)
    let DEBUG = true;

    // ** Buttontext (custom your own text if you want)
    let _btnTextClose  = 'Close';   // Close
    let _btnTextYes    = 'Yes';     // Yes
    let _btnTextNo     = 'No';      // No
    let _btnTextOk     = 'OK';      // OK
    let _btnTextCancel = 'Cancel';  // Cancel

    // ** Dialogbox types and flags, can be used separately or in combination separated by a space
    let _strBoxTypeList = ['on-the-fly','dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok',
                           'dlg-cancel','dlg-ok-cancel','dlg-no-footer','dlg-no-btns','dlg-no-overlay',
                           'dlg-info','dlg-question','dlg-error','dlg-success','dlg-exclamation'];

    // ** Array that holds all created boxobjects, so we can refer to them later if we need to, i.e. callback ...
    let _boxObj = [];
    
    // ** Variable that stores the original padding-right value of body element
    let _orgBodyPaddingRight = 0;

    // ** Indicate that a box is current in view (is shown)
    let _isActive = false;

    // ** Debug-logger
    let _log = function(str)
    {
        if(DEBUG)
        {
            return console.log(str);
        }
    };
    
    // ** Convert string to decimal
    let _str2dec = function(str)
    {
        return parseInt(str, 10);
    };

    // ** Get object from array id
    let _getObjFromId = function(arr, strId)
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
    
    // ** Check if array matches ALL test-values in supplied string/array
    let _matchAll = function(arr, str, exp, sep)
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

    // ** Reference to this object itself (after register() has run)
    let _that = null;

    //---------------------------------------------------------------------
    // ** Public methods
    //---------------------------------------------------------------------
    return { //<-- bracket need to be on same line, else it just returns: undefined

        // ** Register self awareness, variable used in event-listeners to point to this object
        register : function()
        {
            _that = this;
        },
        
        // ** Get all objects
        getAllObj : function()
        {
            return _boxObj;
        },
        
        // ** Get object from id, can be used to get object from a pre-written HTML box by searching for its 'id' in the array of objects
        getObjById : function(id)
        {
            return _getObjFromId(_boxObj, id);
        },
        
        // ** Initialize
        init : function()
        {
            window.addEventListener('load', function windowLoad()
            {
                // ** Get all elements with 'class' containing 'dlg-opener'
                let btns = document.getElementsByClassName('dlg-opener');

                // ** Create click handler for each element that contain above 'class'
                for(let i = 0; i < btns.length; i++)
                {
                    btns[i].addEventListener('click', function DlgOpenerClick(evt)
                    {
                        _that.show(this.getAttribute('rel')); // show the dialogbox with the 'id' referenced in 'rel' attribute
                        this.blur(); // remove focus from button or other opening element
                        evt.preventDefault(); // i.e. if used in an anchor-link with 'href="#"' we prevent scrolling to top of page
                        evt.stopPropagation(); // prevent bubbling up to parent elements or capturing down to child elements
                    });
                    
                    // ** Get dlg element
                    let dlg = document.getElementById(btns[i].getAttribute('rel'));
                    
                    // ** Create object
                    let success = _that.create(btns[i].getAttribute('rel'),
                                               dlg.getAttribute('class'), 
                                               dlg.getAttribute('title'),
                                               dlg.innerHTML,
                                               dlg.getAttribute('name'),
                                               true);
                }
            });
        },

        // ** Create dialog from scratch, creates a new dialog directly without pre-created HTML, use it to create dialogs on the fly.
        create : function(strId, strBoxTypeClass, strTitle, strMessage, fnCallback, bKeepAlive)
        {
            let match = _matchAll(_strBoxTypeList, strBoxTypeClass, true);

            // ** Check if valid types
            if(match === true)
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
                
                // ** Create object and return it
                let obj =
                {
                    // ** Variables
                    id : strId,
                    typeClass : strBoxTypeClass,
                    title : strTitle,
                    message : strMessage,
                    bKeepAlive : bKeepAlive,
                    strInput : '',
                    nRetCode : -1,

                    // ** Callback 
                    callback : function()
                    {
                        try
                        {
                            let a = this.nRetCode;
                            let b = this.strInput;

                            // ** Check which kind of box and if it has a callback function
                            if(typeof window[fnCallback] === 'function')
                            {
                                // ** Execute function (pre-written HTML boxes)
                                window[fnCallback](a,b);
                            }
                            else if(typeof fnCallback === 'function')
                            {
                                // ** Execute function (script-created boxes)
                                fnCallback(a,b);
                            }
                            else
                            {
                                _log('typeof fnCallback = ' + typeof fnCallback + ' and not function (scope?)');
                                _log('Possible solution can be to use "hoisting".\nTry to use "var callbackFuncName = function(){}" instead of "let callbackFuncName = function(){}"');
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
                        return _that.show(this.id);
                    },
                    
                    // ** Destroy
                    destroy : function()
                    {
                        return _that.destroy(this.id);
                    }
                }
                _boxObj.push(obj); // add object to array
                return obj; // return object
            }
            else
            {
                _log('DEBUG: create(): Error, dialogbox type not defined or not a valid type: ' + strBoxTypeClass);
            }
            return null; // return failure
        },

        // ** Show the dialog box
        show : function(objId)
        {                        
            // ** Get object from id
            let obj = _getObjFromId(_boxObj, objId);

            // ** Fix for pre-written HTML boxes, need to add '_0' to id before getting object
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
            dlg.setAttribute('class', obj.typeClass);
            body.appendChild(dlg);
            
            let strBoxTypeClass = obj.typeClass;
            let match = null;
            
            if(dlg)
            {
                match = _matchAll(_strBoxTypeList, obj.typeClass, true);
            }

            // ** Check if element with the 'id' exist in DOM, and that no other dialog is active, and valid dlg types
            if( dlg && (_isActive === false) && (match === true) )
            {
                // ** Create outer box
                let box = document.createElement('div');
                box.setAttribute('class','dlg-box dlg-center-vert');
                dlg.appendChild(box);

                // ** Create heading
                let heading = document.createElement('div');
                heading.setAttribute('class','dlg-heading');
                box.appendChild(heading);

                // ** Create "CloseX"
                let closeX = document.createElement('span');
                closeX.setAttribute('class','dlg-close-x');
                let closeText = document.createTextNode(' \u00d7 ');
                closeX.appendChild(closeText);
                heading.appendChild(closeX);

                // ** Create title
                let titleText = document.createTextNode(obj.title);
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
                    rightbox.innerHTML = obj.message;
                    
                    // ** Insert it into parent div
                    message.appendChild(rightbox);
                }
                else
                {
                    message.setAttribute('class','dlg-message');
                    message.innerHTML = obj.message;
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
                    input.setAttribute('value', '');
                    inputbox.appendChild(input);

                    // ** Add buttons if not already stated in 'class'
                    dlg.classList.add('dlg-ok-cancel');
                }

                // ** Remove earlier entered text from input field
                obj.strInput = '';

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

                // ** Show dlg overlay and dialogbox
                dlg.style.display = 'block';

                // ** Set focus to input field if promptbox
                if(dlg.classList.contains('dlg-prompt'))
                {
                    dlg.getElementsByClassName('dlg-input-field')[0].focus();
                }

                // ** Get height of inner dialogbox
                let inDlgBox = dlg.getElementsByClassName('dlg-box')[0];
                let height = window.getComputedStyle(inDlgBox, null).getPropertyValue('height');

                // ** If height is larger or equal to window height, disable vertical alignment,
                // ** just position at top. Prevents out of view.
                if(_str2dec(height) >= window.innerHeight)
                {
                    inDlgBox.classList.remove('dlg-center-vert');
                }
                else
                {
                    inDlgBox.classList.add('dlg-center-vert');
                }

                // ** Creating substitute for scrollbar
                // ** Get body element
                let body = document.getElementsByTagName('body')[0];

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
                
                // ** When the user clicks the X button, close the dialogbox
                let xCloseDialog = dlg.getElementsByClassName('dlg-close-x')[0];
                if(xCloseDialog)
                {
                    xCloseDialog.addEventListener('click', function XCloseClick()
                    {
                        // ** Remove eventlistener
                        xCloseDialog.removeEventListener('click', XCloseClick);

                        // ** Return code 0, since user clicked X (close)
                        obj.nRetCode = 0;

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();
                        
                        // ** Callback
                        obj.callback();
                    });
                }
                // ** END: X button click handler

                // ** When the user clicks the CLOSE button, close the dialogbox
                let btnCloseDialog = dlg.getElementsByClassName('dlg-close-btn')[0];
                if(btnCloseDialog)
                {
                    btnCloseDialog.addEventListener('click', function BtnCloseClick()
                    {
                        // ** Remove eventlistener
                        btnCloseDialog.removeEventListener('click', BtnCloseClick);

                        // ** Return code 0, since user clicked Close
                        obj.nRetCode = 0;

                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();
                        
                        // ** Callback
                        obj.callback();                        
                    });
                }
                // ** END: CLOSE button click handler

                // ** When the user clicks anywhere outside of the dialogbox, close it
                window.addEventListener('click', function WinCloseClick(evt)
                {
                    if(evt.target == dlg)
                    {
                        // ** Remove eventlistener
                        window.removeEventListener('click', WinCloseClick);
                        
                        // ** Return code 0, since user clicked outside box
                        obj.nRetCode = 0;
                        
                        // ** Close dialogbox, reset values, clean up
                        obj.destroy();
                        
                        // ** Callback
                        obj.callback();
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
                            
                            // ** Return code 1, since user clicked YES
                            obj.nRetCode = 1;
                            
                            // ** Close dialogbox, reset values, clean up
                            obj.destroy();
                            
                            // ** Callback
                            obj.callback();
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
                            
                            // ** Return code 2, since user clicked NO
                            obj.nRetCode = 2;
                            
                            // ** Close dialogbox, reset values, clean up
                            obj.destroy();
                            
                            // ** Callback
                            obj.callback();
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
                            
                            // ** Return code 3, since user clicked OK
                            obj.nRetCode = 3;
                            
                            // ** Close dialogbox, reset values, clean up
                            obj.destroy();
                            
                            // ** Callback
                            obj.callback();                            
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
                            
                            // ** Return code 4, since user clicked Cancel
                            obj.nRetCode = 4;
                            
                            // ** Close dialogbox, reset values, clean up
                            obj.destroy();
                            
                            // ** Callback
                            obj.callback();
                        });
                    }
                }
                // ** END: OK-CANCEL button click handlers

                // ** When the user types in promptbox, update variable obj.strInput
                let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
                if(pBox)
                {
                    pBox.addEventListener('keyup', function PromptBoxKeyUp()
                    {
                        obj.strInput = pBox.value.trim();
                    });

                    pBox.addEventListener('change', function PromptBoxChange()
                    {
                        obj.strInput = pBox.value.trim();
                    });
                }
                // ** END: When the user types in promptbox

                //---------------------------------------------------------------------
                // ** END: Create event-listeners
                //---------------------------------------------------------------------

                // ** Set flag to indicate box is active and is shown
                _isActive = true;

                // ** Return success
                return true;
            }
            else if(!match)
            {
                _log('DEBUG: show(): Error, dialogbox type not defined or not a valid type: ' + strBoxTypeClass);
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
        },

        // ** Close and destroy the dialog box
        destroy : function(objId)
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
                            _boxObj.splice(index, 1);
                            _log('DEBUG: destroy(): obj.bKeepAlive = false | Object deleted from array');
                            success = true;
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
                    _log('DEBUG: destroy(): obj.bKeepAlive = true | Object was NOT deleted from array');
                    success = false;
                }
            }

            // ** Reset flag 
            _isActive = false;

            // ** Return result
            return success;
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
// ** Activate and start
//-----------------------------------------------------------------------------------------------------------------
(function()
{
    EasyDialogBox.register();
    EasyDialogBox.init();
}
)();
//-----------------------------------------------------------------------------------------------------------------
// ** END: Activate and start
//-----------------------------------------------------------------------------------------------------------------
