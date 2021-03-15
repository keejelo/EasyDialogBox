EasyDialogBox version 1733b (BETA) for testing (will eventually be released if no errors or bugs are detected)

Filename: "easydlg_1733b.js"

https://github.com/keejelo/EasyDialogBox/blob/master/js/test/js/easydlg_1733b.js


The new in this version is:

- Created a "hide" method that can hide dialogbox: myObj.hide();
  It will still exist in DOM, but hidden with css (display:none; and visibility:hidden;)
  This method also fires: myObj.onHide()
  
  
- Dialogboxes now hides in DOM when closing the box by clicking "Close", "X", pressing "ESC" key.
  All dialogboxs will be kept alive by default, they are only destroyed when the user executes the 
  "destroy" function: myObj.destroy();
  (The variable "bKeepAlive" will be obsolete, and may be removed in future versions)


- There is also an added feature to get elements inside the dialogbox by using these shorthand methods:

  myObj.el('#someID');     // using # (hash), returns the HTML element containing the ID
   
  myObj.el('.someClass');  // using . (dot), returns an indexed HTMLCollection ([i] as normal)
   
  myObj.el('SomeElement'); // returns an indexed HTMLCollection ([i] as normal)
   
..similar to .getElementById() and .querySelectorAll()


( I will also try to add a way to get dialogbox elements in some way like "object.element" )
