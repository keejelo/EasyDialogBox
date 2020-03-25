//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox 1.414
// ** Created by: keejelo, 2020.
// ** GitHub: https://github.com/keejelo/EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** CALLBACK_EasyDialogBox (return values sent from dialog, use them for further processing)
//-----------------------------------------------------------------------------------------------------------------
let CALLBACK_EasyDialogBox = function(nRetParam, strActionParam, strPromptBoxParam)
{   'use strict';

    // ** Variable "nRetParam" values:
    //  0 = "CloseX", "Close" button or outside box was clicked
    //  1 = "Yes" button was clicked
    //  2 = "No" button was clicked
    //  3 = "OK" button was clicked
    //  4 = "Cancel" was button clicked

    // ** Check returned value from button click
    // ** Example
    if(typeof nRetParam === 'number')
    {
        if(nRetParam === 0)
        {
            console.log('CALLBACK: User clicked "CloseX", "Close" button or out side box. Return value = ' + nRetParam);
        }
        else if(nRetParam === 1)
        {
            console.log('CALLBACK: User clicked "Yes" button. Return value = ' + nRetParam);

            // ** Example: Create a dialog on the fly!
            let myBox = EasyDialogBox.create('dlg','Testing on the fly dialog','<p>Hello on the fly!</p>','doNothing');

            // ** Check if box was created successfully
            if(myBox)
            {
                // ** Show the new box (returns true if box can be shown)
                let bRet = EasyDialogBox.show(myBox);

                // ** Check if box was shown successfully
                if(bRet)
                {
                    console.log('CALLBACK: Showing a new dialog on the fly since the user clicked "Yes" button. (Example in CALLBACK function)');
                }
                else
                {
                    console.log('CALLBACK: Error, could not show dialog: ' + myBox);
                }
            }

            // ** TEST: Remove it after 3 seconds :)
            /*
            setTimeout(function()
            {
                EasyDialogBox.destroy(myBox);
                console.log('CALLBACK: Destroyed the dialogbox after 3 seconds. (Example in CALLBACK function)')
            }, 3000);
            */
            // ** END: Example: Create a dialog on the fly!
        }
        else if(nRetParam === 2)
        {
            console.log('CALLBACK: User clicked "No" button. Return value = ' + nRetParam);
        }
        else if(nRetParam === 3)
        {
            console.log('CALLBACK: User clicked "OK" button. Return value = ' + nRetParam);
        }
        else if(nRetParam === 4)
        {
            console.log('CALLBACK: User clicked "Cancel" button. Return value = ' + nRetParam);
        }
    }


    // ** Variable "strPromptBoxParam" = value from input
    // ** Example
    if(strPromptBoxParam !== '') // Check if any text was typed into input
    {
        console.log('CALLBACK: Promptbox input value = ' + strPromptBoxParam);
    }


    // ** Variable "strActionParam" = value from 'name' attribute (can be used to indicate custom action to execute)
    // ** Example
    if(strActionParam === 'myCustomActionInCallbackFunc') // <-- this value is taken from the dialogbox 'name' attribute, located in HTML example.
    {
        console.log('CALLBACK: string "' + strActionParam + '" from "name" attribute recieved in CALLBACK function');
    }
    else if(strActionParam === 'doNothing') // <-- this value is taken from the dialogbox 'name' attribute of the OnTheFly dialog.
    {
        console.log('CALLBACK: string "' + strActionParam + '" from "name" attribute recieved in CALLBACK function');
    }

    // ..combine all of the above to do your custom stuff..

    // ..blah..

};
//-----------------------------------------------------------------------------------------------------------------
// ** END: CALLBACK_EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox Object (module)
//-----------------------------------------------------------------------------------------------------------------
let EasyDialogBox = (function()
{   'use strict';

    // ** Buttontext
    let _btnTextClose  = 'Close';   // Close
    let _btnTextYes    = 'Yes';     // Yes
    let _btnTextNo     = 'No';      // No
    let _btnTextOk     = 'OK';      // OK
    let _btnTextCancel = 'Cancel';  // Cancel

    // ** Dialogbox types, can be used separately or in combination separated by a space
    let _strBoxTypeList = ['dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok','dlg-cancel','dlg-ok-cancel','dlg-no-footer','dlg-no-btns','dlg-no-overlay'];

    // ** "Action"-name of box, can be used to indicate custom action in CALLBACK function
    let _strAction = '';

    // ** Variable that stores current input text in promptbox
    let _promptBoxInputValue = '';

    // ** Variable that stores the original padding-right value of body element
    let _orgBodyPaddingRight = 0;

    // ** Indicate that a box is current in view (is shown)
    let _isActive = false;

    // ** Dialogbox 'id' default: null
    let _boxId = null;

    // ** Callback function to pass along return values
    let _callback = function(nRetCode)
    {
        // ** Pass values along to outside function so they can be used easier.
        CALLBACK_EasyDialogBox(nRetCode, _strAction, _promptBoxInputValue);
    };
        
    // ** Check if array contains/matches value, string or other array item value (separator used when string needs to be split)
    let _contains = function(arr, str, bSplit, separator)
    {
        let val = str;
        if(bSplit === true)
        {
            val = str.split(separator);
        }
        
        for(let i = 0; i < val.length; i++)
        {
            for(let j = 0; j < arr.length; j++)
            {
                if(arr[j] === val[i])
                {
                    return j;
                }
            }
            return -1;
        }
    };
    
    // ** Reference to this object itself (after register() has run)
    let _that = null;

    //---------------------------------------------------------------------
    // ** Public methods
    //---------------------------------------------------------------------
    return { //<-- bracket need to be on same line, else it just returns undefined

        // ** Register self awareness, variable used in event-listeners to point to this object
        register : function()
        {
            _that = this;
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
                }
            });
        },

        // ** Create dialog from scratch, creates a new dialog directly without pre-created HTML, use it to create dialogs on the fly.
        create : function(strBoxTypeClass, strTitle, strMessage, strAction)
        {
            // ** Check if type is valid (>= 0)
            if(_contains(_strBoxTypeList, strBoxTypeClass, true, ' ') >= 0)
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

                // ** Return the 'id' value of the newly created element
                return dlg.getAttribute('id');
            }
            else
            {
                console.log('create(): Error, dialogbox type not defined or not a valid type: ' + strBoxTypeClass);
            }
            return null;
        },

        // ** Show the dialog box
        show : function(id)
        {
            // ** Get the 'id' from function parameter, we want to show the dialog that have this 'id'
            let dlg = document.getElementById(id);
            
            // ** Get classes, string
            let strBoxTypeClass = dlg.getAttribute('class');

            // ** Check if element with the 'id' exist in DOM, and that no other dialog is active at this moment
            if( dlg && (_isActive === false) && (_contains(_strBoxTypeList, strBoxTypeClass, true, ' ') >= 0) )
            {
                // ** Create a temp 'id' for the showing dialogbox                
                _boxId = id + '_1';

                // ** Get value from 'name' attribute, passed on to CALLBACK function, can be used to excute custom action in CALLBACK function
                _strAction = dlg.getAttribute('name');

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
                message.setAttribute('class','dlg-message');
                message.innerHTML = orgMessage;
                box.appendChild(message);

                // ** Create prompt box (input + OK + Cancel)
                if(dlg.classList.contains('dlg-prompt'))
                {
                    let div = document.createElement('div');
                    div.setAttribute('class', 'dlg-input');
                    message.appendChild(div);

                    let input = document.createElement('input');
                    input.setAttribute('class', 'dlg-input-field');
                    input.setAttribute('type', 'text');
                    input.setAttribute('value', '');
                    div.appendChild(input);

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
                if(parseInt(height) >= window.innerHeight)
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
                _orgBodyPaddingRight = parseInt(_orgBodyPaddingRight);

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
                    w3 += parseInt(_orgBodyPaddingRight);
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
                        _callback(0);
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
                        _callback(0);
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
                        _callback(0);
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
                            _callback(1);
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
                            _callback(2);
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
                            _callback(3);
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
                            _callback(4);
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
            else if(_isActive)
            {
                console.log('show(): Error, a box is already in view! Can only show one dialogbox at a time!');
            }
            else if(!dlg)
            {
                console.log('show(): Error, element id \'' + id + '\' do not exist!\nReturned value = ' + dlg);
            }
            else
            {
                console.log('show(): unknown error');
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
            body.setAttribute('style', 'padding-right:' + parseInt(_orgBodyPaddingRight) + 'px;');

            // ** Get the dlg element
            let dlg = document.getElementById(id);

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
