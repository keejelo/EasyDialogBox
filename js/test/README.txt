Update: fixed some errors in alpha version, alpha now has become beta version.

This is a test of EasyDialogBox version 1733 beta

The new in this version is:

- Created a "hide" method that can hide dialogbox: myObj.hide();
  this method also fires: myObj.onHide()


- Dialogboxes now hides in DOM when closing the box by clicking "Close", "X", pressing "ESC" key.
  All dialogboxs will be kept alive by default, they are only destroyed when the user executes the 
  "destroy" function: myObj.destroy();
    

- There is also an added feature to get elements inside the dialogbox by using these shorthand methods:

   var myEL = myObj.el('#HtmlElementWithSomeID');
   
   var myEL = myObj.el('.HtmlElementWithSomeClass');
   
   var myEL = myObj.el('SomeHtmlElement');
   
..basically shorthands for .getElementById() and .querySelectorAll()

