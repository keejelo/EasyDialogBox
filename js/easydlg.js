//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox 1.365
// ** Created by: keejelo, 2020.
// ** GitHub: https://github.com/keejelo/EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** CALLBACK_EasyDialogBox (return values sent from dialog, use them for further processing)
//-----------------------------------------------------------------------------------------------------------------
function CALLBACK_EasyDialogBox(retVal, strAction, strPromptBox)
{
	// ** Variable "retVal" values:
	//  0 = "CloseX", "Close" button or outside box was clicked
	//  1 = "Yes" button was clicked
	//  2 = "No" button was clicked
	//  3 = "OK" button was clicked
	//  4 = "Cancel" was button clicked

	// ** Check returned value from button click
	// ** Example
	if(typeof retVal === 'number')
	{
		if(retVal === 0)
		{
			console.log('CALLBACK: User clicked "CloseX", "Close" button or outside box. Return value = ' + retVal);
		}
		else if(retVal === 1)
		{
			console.log('CALLBACK: User clicked "Yes" button. Return value = ' + retVal);
			
			// ** Example: Create a dialog on the fly!
			let myBox = EasyDialogBox.create('dlg','Testing on the fly dialog','<p>Hello on the fly!</p>','doNothing');
			
			// ** Check if box was created successfully
			if(myBox) 
			{
				// ** Show the new box
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
		else if(retVal === 2)
		{
			console.log('CALLBACK: User clicked "No" button. Return value = ' + retVal);
		}
		else if(retVal === 3)
		{
			console.log('CALLBACK: User clicked "OK" button. Return value = ' + retVal);
		}
		else if(retVal === 4)
		{
			console.log('CALLBACK: User clicked "Cancel" button. Return value = ' + retVal);
		}
	}
	
	
	// ** Variable "strPromptBox" = value from input
	// ** Example
	if(typeof strPromptBox !== 'undefined') // Check if any text was typed into input
	{
		console.log('CALLBACK: Promptbox input value = ' + strPromptBox);
	}			
	
	
	// ** Variable "strAction" = value from 'name' attribute (can be used to indicate custom action to execute)	
	// ** Example
	if(strAction === 'myCustomActionInCallbackFunc') // <-- this value is taken from the dialogbox 'name' attribute, located in HTML example.
	{
		console.log('CALLBACK: string "myCustomActionInCallbackFunc" from "name" attribute recieved in CALLBACK function');
	}
	
	
	// ..combine all of the above to do your custom stuff..
	
	// ..blah..
	
};
//-----------------------------------------------------------------------------------------------------------------
// ** END: CALLBACK_EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox Object
//-----------------------------------------------------------------------------------------------------------------
let EasyDialogBox =
{
	// ** (Optional) Custom your own text for the buttons.
	btnCloseText  : 'Close',   // Close
	btnYesText    : 'Yes',     // Yes
	btnNoText     : 'No',      // No
	btnOkText     : 'OK',      // OK
	btnCancelText : 'Cancel',  // Cancel
	
	// ** Dialogbox types, can be used separately or in combination separated by a space
	strBoxTypeList : ['dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok','dlg-cancel','dlg-ok-cancel','dlg-no-footer','dlg-no-btns'],

	// ** Variable that stores current input text in promptbox, default = undefined
	promptBoxInputValue : undefined,
	
	// ** "Action"-name of box, can be used to indicate custom action in CALLBACK function
	strAction : undefined,
	
	// ** Variable that stores the original padding-right value of body element
	orgBodyPaddingRight : undefined, 

	// ** Indicate that a box is current in view (is shown)
	isActive : false,
	
	// ** Dialogbox 'id' default: null
	boxId : null,

	// ** Register self awareness, variable used in event-listeners to point to this object
	that : null,
	register : function()
	{
		that = this;
	},

	// ** Initialize
	init : function()
	{	
		// ** Get all elements with 'class' containing 'dlg-opener'
		let btns = document.getElementsByClassName('dlg-opener');
		
		// ** Create click handler for each element that contain above 'class'
		for(let i = 0; i < btns.length; i++)
		{
			btns[i].addEventListener('click', function DlgOpenerClick(event)
			{
				that.show(this.getAttribute('rel')); // show the dialogbox with the 'id' referenced in 'rel' attribute
				this.blur(); // remove focus from button or other opening element
				event.preventDefault(); // i.e. if used in an anchor-link with 'href="#"' we prevent scrolling to top of page
				event.stopPropagation(); // prevent bubbling up to parent elements or capturing down to child elements
			});
		}
	},
	
	// ** Check if array contains/matches value (helper function)
	contains : function(arr, val)
	{
		for(let i = 0; i < arr.length; i++)
		{
			if(arr[i] === val)
			{
				return i;
			}
		}
		return -1;		
	},
	
	// ** Create dialog from scratch, creates a new dialog directly without pre-created HTML, use it to create dialogs on the fly.
	create : function(strBoxTypeClass, strTitle, strMessage, strAction)
	{
		// ** Check if type is valid (>= 0)
		if(this.contains(this.strBoxTypeList, strBoxTypeClass) >= 0)
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
		
		// ** Check if element with the 'id' exist in DOM, and that no other dialog is active at this moment
		if(dlg && (this.isActive === false))
		{
			// ** Create a temp 'id' for the showing dialogbox
			this.boxId = id + '_1';
			
			// ** Get value from 'name' attribute, passed on to CALLBACK function, can be used to excute custom action in CALLBACK function
			this.strAction = dlg.getAttribute('name');
		
			// ** Get current 'title' value and store it
			let orgTitleText = dlg.getAttribute('title');
			dlg.setAttribute('title',''); // temporary remove 'title' value, prevents showing up on hovering over dialogbox

			// ** Get message content and store it
			let orgMessage = dlg.innerHTML;
			dlg.innerHTML = ''; // temporary remove html 
			
			// ** Create outer box
			let box = document.createElement('div');
			box.setAttribute('id', this.boxId);
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
				
				// ** Remove earlier entered text, set to: undefined
				this.promptBoxInputValue = undefined;

				// ** Add buttons if not already stated in 'class'
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
						let yesBtnText = document.createTextNode(this.btnYesText);
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
						let noBtnText = document.createTextNode(this.btnNoText);
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
						let okBtnText = document.createTextNode(this.btnOkText);
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
						let cancelBtnText = document.createTextNode(this.btnCancelText);
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
						let closeBtnText = document.createTextNode(this.btnCloseText);
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
			this.orgBodyPaddingRight = window.getComputedStyle(body, null).getPropertyValue('padding-right');
			
			// ** Convert from string to integer (remove 'px' postfix and return value as integer)
			this.orgBodyPaddingRight = parseInt(this.orgBodyPaddingRight);
			
			// ** Get width of body before removing scrollbar
			let w1 = body.offsetWidth;

			// ** Stop scrolling of background content (body) when dialogbox is in view, removes scrollbar
			body.classList.add('dlg-stop-scrolling');

			// ** Get width of body after removing scrollbar
			let w2 = body.offsetWidth;
			
			// ** Get width-difference
			let w3 = w2 - w1;
			
			// ** If conditions are true: add both padding-right values, 
			if(typeof this.orgBodyPaddingRight === 'number' && this.orgBodyPaddingRight > 0)
			{
				w3 += parseInt(this.orgBodyPaddingRight);
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
					// ** Close dialogbox, reset values, clean up
					that.destroy(id, that.boxId, orgTitleText, orgMessage);
					
					// ** Remove eventlistener
					xCloseDialog.removeEventListener('click', XCloseClick);
					
					// ** If promptbox was created
					let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
					if(pBox)
					{
						// ** Since user clicked Cancel, delete inputted text value, set to: undefined
						this.promptBoxInputValue = undefined;
					}

					// ** Return code 0 (false), since user clicked X (close)
					that.callback(0, that.strAction);
				});
			}
			// ** END: X button click handler
			
			// ** When the user clicks the CLOSE button, close the dialogbox
			let btnCloseDialog = dlg.getElementsByClassName('dlg-close-btn')[0];
			if(btnCloseDialog)
			{
				btnCloseDialog.addEventListener('click', function BtnCloseClick()
				{
					// ** Close dialogbox, reset values, clean up
					that.destroy(id, that.boxId, orgTitleText, orgMessage);

					// ** Remove eventlistener
					btnCloseDialog.removeEventListener('click', BtnCloseClick);
					
					// ** Return code 0 , since user clicked Close
					that.callback(0, that.strAction);
				});
			}
			// ** END: CLOSE button click handler
			
			// ** When the user clicks anywhere outside of the dialogbox, close it
			window.addEventListener('click', function WinCloseClick(event)
			{
				if (event.target == dlg)
				{	
					// ** Close dialogbox, reset values, clean up
					that.destroy(id, that.boxId, orgTitleText, orgMessage);
					
					// ** Remove eventlistener
					window.removeEventListener('click', WinCloseClick);
					
					// ** Return code 0 (false), since we just want to exit
					that.callback(0, that.strAction);
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
						// ** Close dialogbox, reset values, clean up
						that.destroy(id, that.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnYesDialog.removeEventListener('click', BtnYesClick);
						
						// ** Return code 1 , since user clicked YES
						that.callback(1, that.strAction);
					});
				}
				
				// ** When the user clicks the NO button
				let btnNoDialog = dlg.getElementsByClassName('dlg-no-btn')[0];
				if(btnNoDialog)
				{
					btnNoDialog.addEventListener('click', function BtnNoClick()
					{
						// ** Close dialogbox, reset values, clean up
						that.destroy(id, that.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnNoDialog.removeEventListener('click', BtnNoClick);
						
						// ** Return code 2 , since user clicked NO
						that.callback(2, that.strAction);
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
						// ** Close dialogbox, reset values, clean up
						that.destroy(id, that.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnOkDialog.removeEventListener('click', BtnOkClick);

						// ** Return code 3 , since user clicked OK
						that.callback(3, that.strAction);
					});
				}
				
				// ** When the user clicks the Cancel button
				let btnCancelDialog = dlg.getElementsByClassName('dlg-cancel-btn')[0];
				if(btnCancelDialog)
				{
					btnCancelDialog.addEventListener('click', function BtnCancelClick()
					{
						// ** Close dialogbox, reset values, clean up
						that.destroy(id, that.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnCancelDialog.removeEventListener('click', BtnCancelClick);
						
						// ** If promptbox was created
						let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
						if(pBox)
						{
							// ** Since user clicked Cancel, delete inputted text value, set to: undefined
							this.promptBoxInputValue = undefined;
						}

						// ** Return code 4 , since user clicked Cancel
						that.callback(4, that.strAction);
					});
				}
			}
			// ** END: OK-CANCEL button click handlers
			
			// ** When the user types in promptbox, update variable "promptBoxInputValue"
			let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
			if(pBox)
			{
				pBox.addEventListener('keyup', function PromptBoxKeyUp()
				{
					that.promptBoxInputValue = pBox.value.trim();
				});
				
				pBox.addEventListener('change', function PromptBoxChange()
				{
					that.promptBoxInputValue = pBox.value.trim();
				});
			}
			// ** END: When the user types in promptbox
			
			//---------------------------------------------------------------------
			// ** END: Create event-listeners
			//---------------------------------------------------------------------
			
			// ** Set flag to indicate box is active and is shown
			this.isActive = true;
			
			// ** Return success
			return true;
		}
		else if(this.isActive)
		{
			console.log('show(): Error, a box is already in view! Can only show one dialogbox at a time!');
		}						
		else if(!dlg)
		{
			console.log('show(): Error, element id \'' + id + '\' do not exist!\nReturned value = ' + dlg);
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
		body.setAttribute('style', 'padding-right:' + parseInt(this.orgBodyPaddingRight) + 'px;');
		
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
		if(document.getElementById(this.boxId))
		{
			let el = document.getElementById(this.boxId);
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
		this.isActive = false;
	},
	
	// ** Callback function to pass along return values 
	callback : function(retVal, strAction)
	{
		// ** Pass values along to outside function so they can be used.
		CALLBACK_EasyDialogBox(retVal, strAction, this.promptBoxInputValue);
	}
};
//-----------------------------------------------------------------------------------------------------------------
// ** END: EasyDialogBox Object
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** Activate and start
//-----------------------------------------------------------------------------------------------------------------
(function()
{
	EasyDialogBox.register();
	window.addEventListener('load', EasyDialogBox.init);
}
)();
//-----------------------------------------------------------------------------------------------------------------
// ** END: Activate and start
//-----------------------------------------------------------------------------------------------------------------
