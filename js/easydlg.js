//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox 1.322
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
			console.log('User clicked "CloseX", "Close" button or outside box. Return value = ' + retVal);
		}
		else if(retVal === 1)
		{
			console.log('User clicked "Yes" button. Return value = ' + retVal);
			
			// ** Create a dialog on the fly!
			let myBox = EasyDialogBox.create('dlg','Testing on the fly dialog','<p>Hello on the fly!</p>','doNothing');
			EasyDialogBox.show(myBox);
			
			console.log('Created a new dialog on the fly since the user clicked "Yes" button.');
			
			/*
			// ** Remove it after 3 seconds :)
			setTimeout(function()
			{
				EasyDialogBox.destroy(myBox)
			}, 3000);
			*/
		}
		else if(retVal === 2)
		{
			console.log('User clicked "No" button. Return value = ' + retVal);
		}
		else if(retVal === 3)
		{
			console.log('User clicked "OK" button. Return value = ' + retVal);
		}
		else if(retVal === 4)
		{
			console.log('User clicked "Cancel" button. Return value = ' + retVal);
		}
	}
	
	
	// ** Variable "strPromptBox" = value from input
	// ** Example
	if(typeof strPromptBox !== 'undefined') // Check if any text was typed into input
	{
		console.log('Promptbox input value = ' + strPromptBox);
	}			
	
	
	// ** Variable "strAction" = value from 'name' attribute (can be used to indicate custom action to execute)	
	// ** Example
	if(strAction === 'myCustomActionInCallbackFunc') // <-- this value is taken from the dialogbox 'name' attribute, located in HTML example.
	{
		console.log('string "myCustomActionInCallbackFunc" from "name" attribute recieved in CALLBACK function');
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
	closeButtonText  : 'Close',   // Close
	yesButtonText    : 'Yes',     // Yes
	noButtonText     : 'No',      // No
	okButtonText     : 'OK',      // OK
	cancelButtonText : 'Cancel',  // Cancel
	
	// ** Dialogbox types, can be used separately or in combination
	strBoxTypeList : ['dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok','dlg-cancel','dlg-ok-cancel','no-footer','no-btns'],

	// ** Create 'id' for dialogbox, hopefully it won't clash with any other html elements 'id'
	// ** If we wanted to create an unique 'id' for each dialogbox we could've used a timestamp.
	boxId : 'EasyDialogBoxID_de82cd512cb22112aa6813dd5182ef37',
	
	// ** Variable that stores current input text in promptbox, default = undefined
	promptBoxInputValue : undefined,
	
	// ** "Action"-name of box, can be used to indicate custom action in CALLBACK function
	strAction : undefined,
	
	// ** Variable that stores the original padding-right value of body element
	orgBodyPaddingRight : undefined, 
	
	// ** False by default, set to true when onTheFly box is created, signals to destroy func to remove it.
	onTheFly : false,
	
	// ** Initialize
	init : function()
	{	
		// ** Get all elements with 'class' containing 'dlg-opener'
		let btns = document.getElementsByClassName('dlg-opener');
		
		// ** Create click handler for each element that contain above 'class'
		for(let i = 0; i < btns.length; i++)
		{
			btns[i].addEventListener('click', function dlgOpenerClick(event)
			{
				EasyDialogBox.show(this.getAttribute('rel')); // show the dialogbox with the 'id' referenced in 'rel' attribute
				this.blur(); // remove focus from button or other opening element
				event.preventDefault(); // if used in an anchor-link with 'href="#"' we prevent scrolling to top of page
				event.stopPropagation(); // prevent bubbling up to parent elements or capturing down to child elements
			});
		}
	},
	
	// ** Check if array contains value, helper function 
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
	
	// ** Create dialog from scratch, creates a new dialog directly without pre-created HTML, use it to create a dialog on the fly.
	create : function(strBoxTypeClass, strTitle, strMessage, strAction)
	{
		// ** Check if type is valid (>= 0)
		if(this.contains(this.strBoxTypeList, strBoxTypeClass) >= 0)
		{
			// ** Create parent reference
			let body = document.getElementsByTagName('body')[0];
			
			// ** Create box and insert into parent element
			let dlg = document.createElement('div');
			dlg.setAttribute('id', 'EasyDialogBoxOnTheFly');
			dlg.setAttribute('class', strBoxTypeClass);
			dlg.setAttribute('title', strTitle);
			dlg.setAttribute('name', strAction);
			dlg.innerHTML = strMessage;
			body.appendChild(dlg);
			
			// ** Set flag to true
			this.onTheFly = true;
			
			// ** Return the 'id' value of the newly created element
			return dlg.getAttribute('id');
		}
		else
		{
			console.log('Dialogbox type not defined or not a valid type: ' + strBoxTypeClass);
		}
	},
	
	// ** Show the dialog box
	show : function(id)
	{			
		// ** Check if a dialogbox is already created, we dont want more than one at once
		let dlg_exist = document.getElementById(this.boxId); // we want it to be: null

		// ** Get the 'id' from function parameter, we want to create a dialog from the element containing this 'id'
		let dlg = document.getElementById(id);
		
		// ** Check if element with the 'id' exist in DOM, and that no other dialog exist at this moment
		if(dlg && !dlg_exist)
		{	
			// ** Get value from 'name' attribute, pass it on to CALLBACK function, can be used to excute custom action in CALLBACK function
			this.strAction = dlg.getAttribute('name');
		
			// ** Get current 'title' value and store it
			let orgTitleText = dlg.getAttribute('title');
			dlg.setAttribute('title',''); // temporary remove 'title' value, prevents showing up on hovering over dialogbox

			// ** Get message content and store it
			let orgMessage = dlg.innerHTML;
			dlg.innerHTML = ''; // temporary remove html 
			
			// ** Create dialogbox
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
			// ** If "no-footer" is specified in class then do not create footer or any buttons
			if(!dlg.classList.contains('no-footer'))
			{
				// ** Create footer
				let footer = document.createElement('div');
				footer.setAttribute('class','dlg-footer');
				box.appendChild(footer);
				
				// ** If "no-btns" is specified in class then do not make buttons. 
				if(!dlg.classList.contains('no-btns'))
				{
					// ** If "Yes" button is specified in class
					if(dlg.classList.contains('dlg-yes') 
					|| dlg.classList.contains('dlg-yes-no')
					)
					{
						// ** Create button
						let yesBtn = document.createElement('button');
						yesBtn.setAttribute('class','dlg-yes-btn');
						let yesBtnText = document.createTextNode(this.yesButtonText);
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
						let noBtnText = document.createTextNode(this.noButtonText);
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
						let okBtnText = document.createTextNode(this.okButtonText);
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
						let cancelBtnText = document.createTextNode(this.cancelButtonText);
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
						let closeBtnText = document.createTextNode(this.closeButtonText);
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
			let dlgBox = dlg.getElementsByClassName('dlg-box')[0];
			let height = window.getComputedStyle(dlgBox, null).getPropertyValue('height');
			
			// ** If height is larger or equal to window height, disable vertical alignment,
			// ** just position at top. Prevents out of view.
			if(parseInt(height) >= window.innerHeight)
			{
				dlgBox.classList.remove('dlg-center-vert');
			}
			else
			{
				dlgBox.classList.add('dlg-center-vert');
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
			
			// ** Add both padding-right values, if conditions are true
			if(typeof this.orgBodyPaddingRight === 'number' && this.orgBodyPaddingRight !== 0)
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
				xCloseDialog.addEventListener('click', function xCloseClick()
				{
					// ** Close dialogbox, reset values, clean up
					EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);
					
					// ** Remove eventlistener
					xCloseDialog.removeEventListener('click', xCloseClick);
					
					// ** If promptbox was created
					let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
					if(pBox)
					{
						// ** Since user clicked Cancel, delete inputted text value, set to: undefined
						this.promptBoxInputValue = undefined;
					}

					// ** Return code 0 (false), since user clicked X (close)
					EasyDialogBox.callback(0, EasyDialogBox.strAction);
				});
			}
			// ** END: X button click handler
			
			// ** When the user clicks the CLOSE button, close the dialogbox
			let btnCloseDialog = dlg.getElementsByClassName('dlg-close-btn')[0];
			if(btnCloseDialog)
			{
				btnCloseDialog.addEventListener('click', function btnCloseClick()
				{
					// ** Close dialogbox, reset values, clean up
					EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);

					// ** Remove eventlistener
					btnCloseDialog.removeEventListener('click', btnCloseClick);
					
					// ** Return code 0 , since user clicked Close
					EasyDialogBox.callback(0, EasyDialogBox.strAction);
				});
			}
			// ** END: CLOSE button click handler
			
			// ** When the user clicks anywhere outside of the dialogbox, close it
			window.addEventListener('click', function winCloseClick(event)
			{
				if (event.target == dlg)
				{	
					// ** Close dialogbox, reset values, clean up
					EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);
					
					// ** Remove eventlistener
					window.removeEventListener('click', winCloseClick);
					
					// ** Return code 0 (false), since we just want to exit
					EasyDialogBox.callback(0, EasyDialogBox.strAction);
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
					btnYesDialog.addEventListener('click', function btnYesClick()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnYesDialog.removeEventListener('click', btnYesClick);
						
						// ** Return code 1 , since user clicked YES
						EasyDialogBox.callback(1, EasyDialogBox.strAction);
					});
				}
				
				// ** When the user clicks the NO button
				let btnNoDialog = dlg.getElementsByClassName('dlg-no-btn')[0];
				if(btnNoDialog)
				{
					btnNoDialog.addEventListener('click', function btnNoClick()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnNoDialog.removeEventListener('click', btnNoClick);
						
						// ** Return code 2 , since user clicked NO
						EasyDialogBox.callback(2, EasyDialogBox.strAction);
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
					btnOkDialog.addEventListener('click', function btnOkClick()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnOkDialog.removeEventListener('click', btnOkClick);

						// ** Return code 3 , since user clicked OK
						EasyDialogBox.callback(3, EasyDialogBox.strAction);
					});
				}
				
				// ** When the user clicks the Cancel button
				let btnCancelDialog = dlg.getElementsByClassName('dlg-cancel-btn')[0];
				if(btnCancelDialog)
				{
					btnCancelDialog.addEventListener('click', function btnCancelClick()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(id, EasyDialogBox.boxId, orgTitleText, orgMessage);
						
						// ** Remove eventlistener
						btnCancelDialog.removeEventListener('click', btnCancelClick);
						
						// ** If promptbox was created
						let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
						if(pBox)
						{
							// ** Since user clicked Cancel, delete inputted text value, set to: undefined
							this.promptBoxInputValue = undefined;
						}

						// ** Return code 4 , since user clicked Cancel
						EasyDialogBox.callback(4, EasyDialogBox.strAction);
					});
				}
			}
			// ** END: OK-CANCEL button click handlers
			
			// ** When the user types in promptbox, update variable "promptBoxInputValue"
			let pBox = dlg.getElementsByClassName('dlg-input-field')[0];
			if(pBox)
			{
				pBox.addEventListener('keyup', function promptBoxKeyUp()
				{
					EasyDialogBox.promptBoxInputValue = pBox.value.trim();
				});
				
				pBox.addEventListener('change', function promptBoxChange()
				{
					EasyDialogBox.promptBoxInputValue = pBox.value.trim();
				});
			}
			// ** END: When the user types in promptbox
			
			//---------------------------------------------------------------------
			// ** END: Create event-listeners
			//---------------------------------------------------------------------
		}
		else if(dlg_exist)
		{
			console.log('An element with id \'' + this.boxId + '\' already exist!\nNo new element created.');
		}				
		else if(!dlg)
		{
			console.log('Error, element id \'' + id + '\' do not exist!\nReturned value = ' + dlg);
		}		
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
			dlg.setAttribute('title', orgTitleText);
			dlg.innerHTML = orgMessage;
		}

		// ** If 'onTheFly' box was created, remove it, and reset flag
		if(this.onTheFly)
		{
			if(dlg)
			{
				dlg.parentNode.removeChild(dlg);
			}
			
			// ** Reset flag to default state
			this.onTheFly = false;
		}
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
// ** Load-handler, activate
//-----------------------------------------------------------------------------------------------------------------
window.addEventListener('load', EasyDialogBox.init);
//-----------------------------------------------------------------------------------------------------------------
// ** END: Load-handler
//-----------------------------------------------------------------------------------------------------------------
