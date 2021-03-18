EasyDialogBox version 1733b (BETA) for testing (will eventually be released if no errors or bugs are detected)

Filename: "easydlg_1733b.js"

https://github.com/keejelo/EasyDialogBox/blob/master/js/test/js/easydlg_1733b.js


---------------------------------------------------------------------------------------------------------
New in this version:
---------------------------------------------------------------------------------------------------------

-> Dialogboxes are now created in DOM and memory at once with the "EasyDialogBox.create()" function.
   ( Before dialogbox was only created in memory, and the DOM element was created with "obj.show()" )

---------------------------------------------------------------------------------------------------------

-> Added a "hide" function that hides the dialogbox when doing: myObj.hide();
   It will still exist in DOM, but hidden with css.
   This function also fires: myObj.onHide();

---------------------------------------------------------------------------------------------------------

-> Dialogboxes now hides in DOM when closing the box by clicking "Close", "X", pressing "ESC" key,
   they are NOT destroyed from DOM and memory like the previous versions was.
  
   All dialogboxs will be kept alive by default, they are only destroyed when the user executes the 
   "destroy" function: myObj.destroy();
   The user is now responsible for deleting/destroying the dialogbox objects to prevent DOM-fill and memory leaks.
  
   Tip: By specifying an ID when creating a box, the existing box are reused when hiding and showing, instead of
   a new box being created each time the box is hidden and shown and filling up the DOM, and leak memory
   if not destroyed.  
  
   (The variable "bKeepAlive" might be obsolete, and maybe removed in future versions)

---------------------------------------------------------------------------------------------------------

-> Added ways to get the dialogbox element itself and the elements inside, using these shorthand methods:

   myObj.element;           // returns the dialogbox HTML element itself
   
   myObj.el();              // using () blank, returns the dialogbox HTML element itself
  
   myObj.el('#someID');     // using # (hash), returns the HTML element containing the specified ID
   
   myObj.el('.someClass');  // using . (dot), returns an indexed HTMLCollection ([i] as normal)
  
   myObj.el('someElement'); // returns an indexed HTMLCollection ([i] as normal)
  
   ..similar to .getElementById() and .querySelectorAll()
   
---------------------------------------------------------------------------------------------------------

Update:
I'm now working on improving all of this, will update.
Running tests now..
Seems to work ok, no errors or bugs detected yet.




