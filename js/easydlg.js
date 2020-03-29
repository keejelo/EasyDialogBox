//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox 1.459
// ** Created by: keejelo, 2020.
// ** GitHub: https://github.com/keejelo/EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox Object (module)
//-----------------------------------------------------------------------------------------------------------------
let EasyDialogBox = (function()
{   'use strict';

    // ** Debug on/off (outputs debug-messages to console)
    let debug = true;

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
    
    // ** Variable that stores current input text in promptbox
    let _promptBoxInputValue = '';

    // ** Variable that stores the original padding-right value of body element
    let _orgBodyPaddingRight = 0;

    // ** Indicate that a box is current in view (is shown)
    let _isActive = false;

    // ** Dialogbox 'id' default: null
    let _boxId = null;

    // ** Debug-logger
    let log = function(str)
    {
        if(debug) return console.log(str);
    }
    
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
        return -1;
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
        
        // ** Get object from id
        get : function(id)
        {
            return _getObjFromId(_boxObj, id);
        },
        
        // ** Initialize
        init : function()
        {
            window.addEventListener('load', function winLoad()
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
                    
                    // ** Create a new javascript object for each box, to handle callbacks etc.
                    let obj =
                    {
                        id : btns[i].getAttribute('rel'),
                        
                        strInput : null,                        
                        nRetCode : -1,
                        
                        callback_processor : function(p1, p2)
                        {
                            this.nRetCode = p1;
                            this.strInput = p2;
                            
                            if(this.callback)
                            {
                                this.callback();
                            }
                            
                            //console.log('callback hello from: ' + this.id);
                        },
                        
                        show : function()
                        {
                            return _that.show(this.id);
                        },
                        
                        destroy : function()
                        {
                            return _that.destroy(this.id);
                        }
                    }
                    
                    // ** Add to array
                    _boxObj.push(obj);
                }
            });
        },
                
        // ** Create dialog from scratch, creates a new dialog directly without pre-created HTML, use it to create dialogs on the fly.
        create : function(strBoxTypeClass, strTitle, strMessage, strAction)
        {
            let bMatch = _matchAll(_strBoxTypeList, strBoxTypeClass, true);

            // ** Check if valid types
            if(bMatch === true)
            {
                // ** Create parent reference
                let body = document.getElementsByTagName('body')[0];

                // ** Create a unique timestamp for the 'id'
                let d = new Date();
                let n = d.getTime();

                // ** Create box and insert into parent element
                let dlg = document.createElement('div');
                dlg.setAttribute('id', 'OnTheFly_' + n);
                dlg.setAttribute('class', strBoxTypeClass);
                dlg.classList.add('on-the-fly');
                dlg.setAttribute('title', strTitle);
                dlg.setAttribute('name', strAction);
                dlg.innerHTML = strMessage;
                body.appendChild(dlg);

                // ** Create object and return it
                let obj =
                {
                    id : dlg.getAttribute('id'),
                    
                    strInput : null,                        
                    nRetCode : -1,

                    callback_processor : function(p1, p2)
                    {
                        this.nRetCode = p1;
                        this.strInput = p2;
                        
                        if(this.callback)
                        {
                            this.callback();
                        }

                        //console.log('callback processor fired');
                    },
                    
                    show : function()
                    {
                        return _that.show(this.id);
                    },
                    
                    destroy : function()
                    {
                        return _that.destroy(this.id);
                    }
                }
                
                // ** Add to array
                _boxObj.push(obj);
                
                // ** Return object
                return obj;
            }
            else
            {
                log('create(): Error, dialogbox type not defined or not a valid type: ' + strBoxTypeClass);
            }
            return null;
        },

        // ** Show the dialog box
        show : function(id)
        {
            // ** Get the 'id' from function parameter, we want to show the dialog that have this 'id'
            let dlg = document.getElementById(id);
            
            // ** If dlg returns false, try to get id from object
            if(!dlg)
            {
                let o = id;
                let obj = _getObjFromId(_boxObj, o.id);
                dlg = document.getElementById(obj.id);
            }

            let strBoxTypeClass = null;
            let bMatch = null;
            
            if(dlg)
            {
                // ** Get classes, string
                strBoxTypeClass = dlg.getAttribute('class');

                // ** Check if values match
                bMatch = _matchAll(_strBoxTypeList, strBoxTypeClass, true);
            }

            // ** Check if element with the 'id' exist in DOM, and that no other dialog is active, and valid dlg types
            if( dlg && (_isActive === false) && (bMatch === true) )
            {
                // ** Create a temp 'id' for the showing dialogbox                
                _boxId = id + '_1';

                // ** Get current 'title' value and store it
                let orgTitleText = dlg.getAttribute('title');
                dlg.setAttribute('title',''); // temporary remove 'title' value, prevents showing up on hovering over dialogbox

                // ** Get message content and store it
                let orgMessage = dlg.innerHTML;
                dlg.innerHTML = ''; // temporary remove html

                // ** Create outer box
                let box = document.createElement('div');
                box.setAttribute('id', _boxId);
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
                let titleText = document.createTextNode(orgTitleText);
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
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-info"></div>';
                    else if(dlg.classList.contains('dlg-question'))
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-question"></div>';
                    else if(dlg.classList.contains('dlg-error'))
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-error"></div>';
                    else if(dlg.classList.contains('dlg-success'))
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-success"></div>';
                    else if(dlg.classList.contains('dlg-exclamation'))
                        leftbox.innerHTML = '<div class="dlg-symbol dlg-icon-excl"></div>';

                    // ** Insert it into parent div
                    message.appendChild(leftbox);
                    
                    // ** Create right box
                    rightbox = document.createElement('div');
                    rightbox.setAttribute('class','dlg-flexbox-right');
                    rightbox.innerHTML = orgMessage;
                    
                    // ** Insert it into parent div
                    message.appendChild(rightbox);
                }
                else
                {
                    message.setAttribute('class','dlg-message');
                    message.innerHTML = orgMessage;
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

                // ** Remove earlier entered text
                _promptBoxInputValue = '';

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

                        // ** Close dialogbox, reset values, clean up
                        _that.destroy(id, _that._boxId, orgTitleText, orgMessage);
                        
                        // ** Return code 0 (false), since user clicked X (close)
                        _that.callback_processor(id, 0, _promptBoxInputValue);
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

                        // ** Close dialogbox, reset values, clean up
                        _that.destroy(id, _that._boxId, orgTitleText, orgMessage);

                        // ** Return code 0 , since user clicked Close
                        //_callback(0);
                        
                        // ** Return code 0 , since user clicked Close
                        _that.callback_processor(id, 0, _promptBoxInputValue);
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

                        // ** Close dialogbox, reset values, clean up
                        _that.destroy(id, _that._boxId, orgTitleText, orgMessage);

                        // ** Return code 0 (false), since we just want to exit
                        //_callback(0);
                        
                        // ** Return code 0 (false), since we just want to exit
                        _that.callback_processor(id, 0, _promptBoxInputValue);
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
                            _that.destroy(id, _that._boxId, orgTitleText, orgMessage);

                            // ** Return code 1 , since user clicked YES
                            //_callback(1);
                            
                            // ** Return code 1 , since user clicked YES
                            _that.callback_processor(id, 1, _promptBoxInputValue);
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
                            _that.destroy(id, _that._boxId, orgTitleText, orgMessage);

                            // ** Return code 2 , since user clicked NO
                            //_callback(2);
                            
                            // ** Return code 2 , since user clicked NO
                            _that.callback_processor(id, 2, _promptBoxInputValue);
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
                            _that.destroy(id, _that._boxId, orgTitleText, orgMessage);

                            // ** Return code 3 , since user clicked OK
                            //_callback(3);
                            
                            // ** Return code 3 , since user clicked OK
                            _that.callback_processor(id, 3, _promptBoxInputValue);
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
                            _that.destroy(id, _that._boxId, orgTitleText, orgMessage);

                            // ** Return code 4 , since user clicked Cancel
                            //_callback(4);
                            
                            // ** Return code 4 , since user clicked Cancel
                            _that.callback_processor(id, 4, _promptBoxInputValue);
                        });
                    }
                }
                // ** END: OK-CANCEL button click handlers

                // ** When the user types in promptbox, update variable "_promptBoxInputValue"
                let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
                if(pBox)
                {
                    pBox.addEventListener('keyup', function PromptBoxKeyUp()
                    {
                        _promptBoxInputValue = pBox.value.trim();
                    });

                    pBox.addEventListener('change', function PromptBoxChange()
                    {
                        _promptBoxInputValue = pBox.value.trim();
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
            else if(bMatch < 0)
            {
                log('create(): Error, dialogbox type not defined or not a valid type: ' + strBoxTypeClass);
            }
            else if(_isActive)
            {
                log('show(): Error, a box is already in view! Can only show one dialogbox at a time!');
            }
            else if(!dlg)
            {
                log('show(): Error, element id \'' + id + '\' do not exist!\nReturned value = ' + dlg);
            }
            else
            {
                log('show(): unknown error');
            }

            // ** Return failure
            return false;
        },

        // ** Close and destroy the dialog box
        destroy : function(id, boxId, orgTitleText, orgMessage)
        {
            // ** Get body element, reset values, restore scrolling
            let body = document.getElementsByTagName('body')[0];
            body.classList.remove('dlg-stop-scrolling');
            body.setAttribute('style', 'padding-right:' + _str2dec(_orgBodyPaddingRight) + 'px;');

            // ** Get the dlg element
            let dlg = document.getElementById(id);
            
            if(!dlg)
            {
                let o = id;
                let obj = _getObjFromId(_boxObj, o.id);
                //console.log(obj);
                dlg = document.getElementById(obj.id);
            }            

            // ** If promptbox was created, remove eventlisteners
            let pBox = dlg.getElementsByClassName('dlg-input-field')[0];            
            if(pBox)
            {
                pBox.onkeyup = null;
                pBox.onchange = null;
            }

            // ** Remove the newly created box element from DOM
            if(document.getElementById(boxId))
            {
                let el = document.getElementById(boxId);
                el.parentNode.removeChild(el);
            }

            // ** Close dialogbox, reset values
            if(dlg)
            {
                dlg.style.display = 'none';

                
                // ** If 'OnTheFly' box was created, remove all
                if(dlg.classList.contains('on-the-fly'))
                {
                    dlg.parentNode.removeChild(dlg);
                }
                // ** If not, just reset values back to original
                else
                {
                    dlg.setAttribute('title', orgTitleText);
                    dlg.innerHTML = orgMessage;
                }
            }

            // ** Reset flag 
            _isActive = false;
        },
        
        // ** CALLBACK
        callback_processor : function(oRef, param1, param2)
        {            
            let obj = _getObjFromId(_boxObj, oRef.id);

            if(obj < 0)
            {
                let el = document.getElementById(oRef);
                
                if(el !== null)
                {
                    let obj = _getObjFromId(_boxObj, el.id);
                    obj.callback_processor(param1, param2);
                }
                else
                {
                    let obj = _getObjFromId(_boxObj, oRef);
                    obj.callback_processor(param1, param2);
                }
            }
            else
            {            
                obj.callback_processor(param1, param2);
            }
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



//-----------------------------------------------------------------------------------------------------------------
// ** Callback Examples
//-----------------------------------------------------------------------------------------------------------------
// 
// IMPORTANT ! 
//
// Must be created after EasyDialogBox "Activate and start"
//
//
//---------------------------------------------------------------------
// ** EasyDialogBox object return code values "nRetCode"
//  0 = "CloseX", "Close" button or outside box was clicked
//  1 = "Yes" button was clicked
//  2 = "No" button was clicked
//  3 = "OK" button was clicked
//  4 = "Cancel" was button clicked
//---------------------------------------------------------------------

//----------------------------------------------------------
// ** Wait until page loading has finished
//----------------------------------------------------------
window.addEventListener('load', function()
{
 
    // ** Example 1: Getting an existing HTML element box and creating a callback for it
    let box1 = EasyDialogBox.get('myBox');
    if(box1)
    {
        box1.callback = function()
        {
            if(box1.nRetCode === 0)
            {
                console.log('CALLBACK: User clicked "CloseX", "Close" button or out side box: ' + box1.id + ', return value: ' + box1.nRetCode);
            }
        }
    }
 
    // ** Example 2: Getting an existing HTML element box and creating a callback for it. And then creating a new box on the fly!
    let box2 = EasyDialogBox.get('myBoxYesNo');
    if(box2)
    {
        box2.callback = function()
        {
            if(box2.nRetCode === 1)
            {
                console.log('CALLBACK: User clicked YES in box: ' + box2.id + ', return value: ' +  box2.nRetCode);
                
                // ** Example: Create a dialog on the fly!
                let myFlyBox = EasyDialogBox.create('dlg dlg-success','Testing on the fly dialog','<p>Hello on the fly!</p>');
                
                // ** Create a callback for it
                myFlyBox.callback = function()
                {
                    console.log('CALLBACK: Hello from on the fly box');
                }
                
                // ** Check if box was created successfully
                if(myFlyBox)
                {
                    // ** Show the new box (returns true if box can be shown)
                    let bRet = myFlyBox.show();

                    // ** Check if box was shown successfully
                    if(bRet)
                    {
                        console.log('CALLBACK: Showing a new dialog on the fly since the user clicked YES button.');
                    }
                    else
                    {
                        console.log('CALLBACK: Error, could not show dialog: ' + myFlyBox);
                    }
                }
            }
            else if(box2.nRetCode === 2)
            {
                console.log('Callback: User clicked NO in box: ' + box2.id + ', return value: ' +  box2.nRetCode);
            }
        }
    }
    
    // ** Example 3: Getting an existing HTML element box and creating a callback for it
    let box3 = EasyDialogBox.get('myPromptBox');
    if(box3)
    {
        box3.callback = function()
        {
            if(box3.nRetCode === 3)
            {
                console.log('CALLBACK: User clicked OK in box: ' + box3.id + ', return value: ' +  box3.nRetCode);
                
                if(box3.strInput !== '')
                {
                    console.log('CALLBACK: value from input field: ' + box3.strInput);
                }
            }
            else if(box3.nRetCode === 4)
            {
                console.log('CALLBACK: User clicked CANCEL in box: ' + box3.id + ', return value: ' +  box3.nRetCode);
            }
        }
    }

});
//-----------------------------------------------------------------------------------------------------------------
// ** END: Callback Examples
//-----------------------------------------------------------------------------------------------------------------
