//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox 2.5
// ** Created by: keejelo, 2020.
// ** GitHub: https://github.com/keejelo/EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** CALLBACK_EasyDialogBox (return values sent from buttons and input in box, us them as you wish)
//-----------------------------------------------------------------------------------------------------------------
function CALLBACK_EasyDialogBox(retVal, strPromptBox)
{
	// ** Variable "retVal" values:
	//  0 = "CloseX", "Close" button or outside box was clicked
	//  1 = "Yes" button was clicked
	//  2 = "No" button was clicked
	//  3 = "OK" button was clicked
	//  4 = "Cancel" was button clicked

	// ** Check returned value
	if(typeof retVal === 'number')
	{
		if(retVal === 0)
		{
			console.log('User clicked "CloseX", "Close" button or outside box. Return value = ' + retVal);
		}
		else if(retVal === 1)
		{
			console.log('User clicked "Yes" button. Return value = ' + retVal);
		}
		else if(retVal === 2)
		{
			console.log('User clicked "No" button. Return value = ' + retVal);
		}
		else if(retVal === 3)
		{
			console.log('User clicked "OK" button. Return value = ' + retVal);
			
			if(strPromptBox !== null)
			{
				console.log('Promptbox input value = ' + strPromptBox);
			}
		}
		else if(retVal === 4)
		{
			console.log('User clicked "Cancel" button. Return value = ' + retVal);
		}		
	}
	
	
	// ** Run your custom function(s) here using the return value "retVal" 
	// ** and the variable "strPromptBox"
	
	// ..do stuff here..blah..blah..
	
	// CustomFunctionHere();
	
	
};
//-----------------------------------------------------------------------------------------------------------------
// ** END: CALLBACK_EasyDialogBox
//-----------------------------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
// ** EasyDialogBox Object
//-----------------------------------------------------------------------------------------------------------------
var EasyDialogBox =
{
	// ** (Optional) Custom your own text for the buttons.
	closeButtonText  : 'Close',   // Close
	yesButtonText    : 'Yes',     // Yes
	noButtonText     : 'No',      // No
	okButtonText     : 'OK',      // OK
	cancelButtonText : 'Cancel',  // Cancel
	
	// ** Variable that stores current input text in promptbox
	promptBoxInputValue : null, 

	// ** Initialize
	init : function()
	{
		// ** Get all elements with classname 'easydlg-opener'
		var btns = document.getElementsByClassName('easydlg-opener');

		// ** Create click handler for each element that contain above class
		for(var i = 0; i < btns.length; i++)
		{
			btns[i].addEventListener('click', function(event)
			{
				EasyDialogBox.show(this.getAttribute('rel'));
				event.preventDefault(); // if used in an anchor-link with href="#" we prevent scrolling to top of page
				this.blur(); // remove focus from button
				this.tabIndex = -1; // remove from tabindex, prevents opening more boxes if user tabs to element and presses spacebar or enter. Not ideal solution, breaks accessibility.
			});
		}	
	},
	
	// ** Show the dialog box
	show : function(id)
	{
		// ** Variables that reference eventlisteners
		var pBoxKeyupFunc = null;
		var pBoxChangeFunc = null;
		
		// ** Variable that stores the original padding-right value of body element
		var orgBodyPaddingRight = null; 
		
		// ** Get time, create timestamp
		var d = new Date();
		var n = d.getTime();
		
		// ** Create unique id for modalbox
		var boxId = 'boxId' + n;
			
		// ** Get the easydlg element
		var easydlg = document.getElementById(id);
		
		// ** Check if element exist
		if(easydlg)
		{	
			// ** Get title and store it
			var orgTitleText = easydlg.getAttribute('title');
			easydlg.setAttribute('title',''); // temporary remove title value, or else it will show up on hovering all over modalbox
			
			// ** Get message content and store it
			var orgMessage = easydlg.innerHTML;
			easydlg.innerHTML = ''; // temporary remove html 
			
			// ** Create modalbox
			var box = document.createElement('div');
			box.setAttribute('id', boxId);
			box.setAttribute('class','easydlg-box easydlg-center-vert');
			easydlg.appendChild(box);
			
			// ** Create heading
			var heading = document.createElement('div');
			heading.setAttribute('class','easydlg-heading');
			box.appendChild(heading);
			
			// ** Create "CloseX"
			var closeX = document.createElement('span');
			closeX.setAttribute('class','easydlg-close-x');
			var closeText = document.createTextNode(' \u00d7 ');
			closeX.appendChild(closeText);
			heading.appendChild(closeX);
			
			// ** Create title
			var titleText = document.createTextNode(orgTitleText);
			heading.appendChild(titleText);	
			/* This works better, apply text directly into heading <div>, 
			prevents small screen titletext overflow and CloseX layering
			(z-index)-problems where click didnt register */
			
			/*
			// ** Create title - Not used right now, use above instead
			var title = document.createElement('span');
			title.setAttribute('class','easydlg-title');
			var titleText = document.createTextNode(orgTitleText);
			title.appendChild(titleText);
			heading.appendChild(title);
			*/

			// ** Create message
			var message = document.createElement('div');
			message.setAttribute('class','easydlg-message');
			message.innerHTML = orgMessage;
			box.appendChild(message);
			
			// ** Create prompt box (input + OK + Cancel)
			if(easydlg.classList.contains('easydlg-prompt'))
			{
				var div = document.createElement('div');
				div.setAttribute('class', 'easydlg-input');
				message.appendChild(div);
				
				var input = document.createElement('input');
				input.setAttribute('class', 'easydlg-input-field');
				input.setAttribute('type', 'text');
				input.setAttribute('value', '');
				div.appendChild(input);
				
				// ** Remove earlier entered text 
				this.promptBoxInputValue = null;

				// ** Add buttons if not already stated in class
				easydlg.classList.add('easydlg-ok-cancel');
			}

			// ** Create footer and buttons
			// ** If "no-footer" is specified in class then do not create footer or any buttons
			if(!easydlg.classList.contains('no-footer'))
			{
				// ** Create footer
				var footer = document.createElement('div');
				footer.setAttribute('class','easydlg-footer');
				box.appendChild(footer);
				
				// ** If "no-btns" is specified in class then do not make buttons. 
				if(!easydlg.classList.contains('no-btns'))
				{
					// ** If "Yes" button is specified in class
					if(easydlg.classList.contains('easydlg-yes') || easydlg.classList.contains('easydlg-yes-no'))
					{
						// ** Create button
						var yesBtn = document.createElement('button');
						yesBtn.setAttribute('class','easydlg-yes-btn');
						var yesBtnText = document.createTextNode(this.yesButtonText);
						yesBtn.appendChild(yesBtnText);
						footer.appendChild(yesBtn);
					}
					
					// ** If "No" button is specified in class
					if(easydlg.classList.contains('easydlg-no') || easydlg.classList.contains('easydlg-yes-no'))
					{
						// ** Create button
						var noBtn = document.createElement('button');
						noBtn.setAttribute('class','easydlg-no-btn');
						var noBtnText = document.createTextNode(this.noButtonText);
						noBtn.appendChild(noBtnText);
						footer.appendChild(noBtn);
					}
					
					// ** If "OK" button is specified in class
					if(easydlg.classList.contains('easydlg-ok') || easydlg.classList.contains('easydlg-ok-cancel'))
					{
						// ** Create button
						var okBtn = document.createElement('button');
						okBtn.setAttribute('class','easydlg-ok-btn');
						var okBtnText = document.createTextNode(this.okButtonText);
						okBtn.appendChild(okBtnText);
						footer.appendChild(okBtn);
					}
					
					// ** If "Cancel" button is specified in class
					if(easydlg.classList.contains('easydlg-cancel') || easydlg.classList.contains('easydlg-ok-cancel'))
					{
						// ** Create button
						var cancelBtn = document.createElement('button');
						cancelBtn.setAttribute('class','easydlg-cancel-btn');
						var cancelBtnText = document.createTextNode(this.cancelButtonText);
						cancelBtn.appendChild(cancelBtnText);
						footer.appendChild(cancelBtn);
					}				
		
					// ** If no special button-rules is specified in class, then just create a "Close" button
					if(!easydlg.classList.contains('easydlg-yes') 
					&& !easydlg.classList.contains('easydlg-no')
					&& !easydlg.classList.contains('easydlg-yes-no') 
					&& !easydlg.classList.contains('easydlg-ok') 
					&& !easydlg.classList.contains('easydlg-cancel')
					&& !easydlg.classList.contains('easydlg-ok-cancel')
					)
					{
						if(easydlg.classList.contains('easydlg') 
						|| easydlg.classList.contains('easydlg-close')
						)
						{
							// ** Create button
							var closeBtn = document.createElement('button');
							closeBtn.setAttribute('class','easydlg-close-btn');
							var closeBtnText = document.createTextNode(this.closeButtonText);
							closeBtn.appendChild(closeBtnText);
							footer.appendChild(closeBtn);
						}
					}				
				}
			}
			// ** END: Create footer and buttons
			
			// ** Show easydlg overlay and dialogbox
			easydlg.style.display = 'block';
			
			// ** Set focus to input field if promptbox
			if(easydlg.classList.contains('easydlg-prompt'))
			{
				easydlg.getElementsByClassName('easydlg-input-field')[0].focus();
			}		

			// ** Get height of inner modalbox
			var modalBox = easydlg.getElementsByClassName('easydlg-box')[0];
			var height = window.getComputedStyle(modalBox, null).getPropertyValue('height');
			
			// ** If height is larger or equal to window height, disable vertical alignment,
			// ** just position at top. Prevents out of view.
			if(parseInt(height) >= window.innerHeight)
			{
				modalBox.classList.remove('easydlg-center-vert');
			}
			else
			{
				modalBox.classList.add('easydlg-center-vert');
			}
			
			// ** Get body element
			var body = document.getElementsByTagName('body')[0];

			// ** Store the original padding-right value
			orgBodyPaddingRight = window.getComputedStyle(body, null).getPropertyValue('padding-right');
			
			// ** Convert from string to integer (remove 'px' postfix return value as integer)
			orgBodyPaddingRight = parseInt(orgBodyPaddingRight);
			
			// ** Get width of body before removing scrollbar
			var w1 = body.offsetWidth;

			// ** Stop scrolling of background content (body) when modalbox is in view, removes scrollbar
			body.classList.add('easydlg-stop-scrolling');

			// ** Get width of body after removing scrollbar
			var w2 = body.offsetWidth;
			
			// ** Get width-difference
			var w3 = w2 - w1;
			
			// ** Add both padding-right values, if conditions are true
			if(orgBodyPaddingRight !== null
			|| orgBodyPaddingRight !== undefined
			|| orgBodyPaddingRight !== 0
			|| orgBodyPaddingRight !== false
			|| orgBodyPaddingRight !== NaN
			|| orgBodyPaddingRight !== ''
			)
			{
				w3 += parseInt(orgBodyPaddingRight);
			}
			
			// ** Apply width-difference as padding-right to body, subtitute for scrollbar,
			// ** can prevent contentshift if content is centered when scrollbar disappears.
			body.setAttribute('style','padding-right:' + w3 + 'px;');		
			
			
			//---------------------------------------------------------------------
			// ** Create click-handlers
			//---------------------------------------------------------------------
			
			// ** When the user clicks the X button, close the modalbox
			var xCloseModal = easydlg.getElementsByClassName('easydlg-close-x')[0];
			if(xCloseModal)
			{
				var xCloseFunc = xCloseModal.addEventListener('click', function()
				{
					// ** Close dialogbox, reset values, clean up
					EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);
					
					// ** Remove eventlistener
					xCloseModal.removeEventListener('click', xCloseFunc);
					xCloseFunc = null;
					
					// ** If promptbox was created
					var pBox = easydlg.getElementsByClassName('easydlg-input-field')[0];
					if(pBox)
					{
						// ** Since user clicked Cancel, delete inputted text value, set to: null
						EasyDialogBox.promptBoxInputValue = null;
					}
					
					// ** Return code 0 (false), since user clicked X (close)
					EasyDialogBox.callback(0);
				});
			}
			// ** END: X button click handlers
			
			// ** When the user clicks the CLOSE button, close the modalbox
			var btnCloseModal = easydlg.getElementsByClassName('easydlg-close-btn')[0];
			if(btnCloseModal)
			{
				var btnCloseFunc = btnCloseModal.addEventListener('click', function()
				{
					// ** Close dialogbox, reset values, clean up
					EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);				

					// ** Remove eventlistener
					btnCloseModal.removeEventListener('click', btnCloseFunc);
					btnCloseFunc = null;
					
					// ** Return code 0 , since we user clicked Close
					EasyDialogBox.callback(0);
				});
			}
			// ** END: CLOSE button click handler
			
			
			// ** When the user clicks anywhere outside of the modalbox, close it
			var winCloseFunc = window.addEventListener('click', function(event)
			{
				if (event.target == easydlg)
				{	
					// ** Close dialogbox, reset values, clean up
					EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);
					
					// ** Remove eventlistener
					window.removeEventListener('click', winCloseFunc);
					winCloseFunc = null;
					
					// ** Return code 0 (false), since we just want to exit
					EasyDialogBox.callback(0);
				}			
			});
			// ** END: window click outside box click handler		

			
			// ** If YES-NO messagebox, create click handler for YES and NO buttons
			if(easydlg.classList.contains('easydlg-yes-no')
			|| easydlg.classList.contains('easydlg-yes')
			|| easydlg.classList.contains('easydlg-no')
			)
			{
				// ** When the user clicks the YES button
				var btnYesModal = easydlg.getElementsByClassName('easydlg-yes-btn')[0];
				if(btnYesModal)
				{
					var btnYesFunc = btnYesModal.addEventListener('click', function()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);
						
						// ** Remove eventlistener
						btnYesModal.removeEventListener('click', btnYesFunc);
						btnYesFunc = null;
						
						// ** Return code 1 , since user clicked YES
						EasyDialogBox.callback(1);
					});
				}
				
				// ** When the user clicks the NO button
				var btnNoModal = easydlg.getElementsByClassName('easydlg-no-btn')[0];
				if(btnNoModal)
				{
					var btnNoFunc = btnNoModal.addEventListener('click', function()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);
						
						// ** Remove eventlistener
						btnNoModal.removeEventListener('click', btnNoFunc);
						btnNoFunc = null;
						
						// ** Return code 2 , since user clicked NO
						EasyDialogBox.callback(2);
					});
				}			
			}
			// ** END: YES-NO button click handlers
			
			
			// ** If OK-CANCEL messagebox, create click handler for OK and CANCEL buttons
			if(easydlg.classList.contains('easydlg-ok-cancel')
			|| easydlg.classList.contains('easydlg-ok')
			|| easydlg.classList.contains('easydlg-cancel')
			)
			{		
				// ** When the user clicks the OK button
				var btnOkModal = easydlg.getElementsByClassName('easydlg-ok-btn')[0];
				if(btnOkModal)
				{
					var btnOkFunc = btnOkModal.addEventListener('click', function()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);
						
						// ** Remove eventlistener
						btnOkModal.removeEventListener('click', btnOkFunc);
						btnOkFunc = null;

						// ** Return code 3 , since user clicked OK
						EasyDialogBox.callback(3);
					});
				}
				
				// ** When the user clicks the Cancel button
				var btnCancelModal = easydlg.getElementsByClassName('easydlg-cancel-btn')[0];
				if(btnCancelModal)
				{
					var btnCancelFunc = btnCancelModal.addEventListener('click', function()
					{
						// ** Close dialogbox, reset values, clean up
						EasyDialogBox.destroy(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc);
						
						// ** Remove eventlistener
						btnCancelModal.removeEventListener('click', btnCancelFunc);
						btnCancelFunc = null;
						
						// ** If promptbox was created
						var pBox = easydlg.getElementsByClassName('easydlg-input-field')[0];
						if(pBox)
						{
							// ** Since user clicked Cancel, delete inputted text value, set to: null
							EasyDialogBox.promptBoxInputValue = null;
						}

						// ** Return code 4 , since user clicked Cancel
						EasyDialogBox.callback(4);
					});
				}
			}
			// ** END: OK-CANCEL button click handlers
			
			
			// ** When the user types in promptbox, update variable "promptBoxInputValue"
			var pBox = easydlg.getElementsByClassName('easydlg-input-field')[0];
			if(pBox)
			{
				pBoxKeyupFunc = pBox.addEventListener('keyup', function()
				{
					EasyDialogBox.promptBoxInputValue = pBox.value.trim();
				});
				
				pBoxChangeFunc = pBox.addEventListener('change', function()
				{
					EasyDialogBox.promptBoxInputValue = pBox.value.trim();
				});			
			}
			// ** END: When the user types in promptbox
			
			
			//---------------------------------------------------------------------
			// ** END: Create click-handlers
			//---------------------------------------------------------------------
		}
		else
		{
			console.log('Error, element id \'' + id + '\' do not exist!\nReturned value = ' + easydlg);
		}		
	},
	
	// ** Close and destroy the dialog box
	destroy : function(boxId, id, orgTitleText, orgMessage, orgBodyPaddingRight, pBoxKeyupFunc, pBoxChangeFunc)
	{
		// ** Remove the newly created box element from DOM
		if(document.getElementById(boxId))
		{
			//document.getElementById(boxId).remove(); // not supported in old browsers, using legacy instead
			var el = document.getElementById(boxId);
			el.parentNode.removeChild(el);
		}
		
		// ** Get the easydlg element, close dialogbox, reset values
		var easydlg = document.getElementById(id);
		easydlg.style.display = 'none';
		easydlg.setAttribute('title', orgTitleText);
		easydlg.innerHTML = orgMessage;

		// ** Get body element, reset values, restore scrolling
		var body = document.getElementsByTagName('body')[0];	
		body.classList.remove('easydlg-stop-scrolling');
		body.setAttribute('style', 'padding-right:' + parseInt(orgBodyPaddingRight) + 'px;');

		// ** If promptbox was created, remove eventlisteners
		var pBox = easydlg.getElementsByClassName('easydlg-input-field')[0];
		if(pBox)
		{
			pBox.removeEventListener('keyup', pBoxKeyupFunc);
			pBoxKeyupFunc = null;
			
			pBox.removeEventListener('change', pBoxChangeFunc);
			pBoxChangeFunc = null;
		}		
	},
	
	// ** Callback function to pass along return values 
	callback : function(retVal)
	{
		// ** Pass values along to outside function so they can be used.
		CALLBACK_EasyDialogBox(retVal, EasyDialogBox.promptBoxInputValue);
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

