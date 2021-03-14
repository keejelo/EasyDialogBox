Update: fixed some errors in alpha version, alpha has now become BETA version.

EasyDialogBox version 1733b (BETA)

The new in this version is:

- Created a "hide" method that can hide dialogbox: myObj.hide();
  It will still exist in DOM, but hidden with css (display:none; and visibility:hidden;)
  This method also fires: myObj.onHide()

- Dialogboxes now hides in DOM when closing the box by clicking "Close", "X", pressing "ESC" key.
  All dialogboxs will be kept alive by default, they are only destroyed when the user executes the 
  "destroy" function: myObj.destroy();
  (The variable "bKeepAlive" will be obsolete, and may be removed in future versions)

- There is also an added feature to get elements inside the dialogbox by using these shorthand methods:

  myObj.el('#HtmlElementWithID');     // returns a HTML element that contains that ID
   
  myObj.el('.HtmlElementWithClass');  // returns an indexed HTMLCollection (as normal)
   
  myObj.el('SomeHtmlElement');        // returns an indexed HTMLCollection (as normal)
   
..basically shorthands for .getElementById() and .querySelectorAll()

