This is a test of EasyDialogBox version 1733 alpha.

The new in this version is:

- Dialogboxes now hides in DOM when clicking "Close" etc., they are not destroyed until user executes the "destroy" function themselves: myObj.destroy();

- There is also an added feature to get elements inside the dialogbox by using these shorthand methods:

   myObj.el('#HtmlElementWithSomeID')
   
   myObj.el('.HtmlElementWithSomeClass')
   
   myObj.el('SomeHtmlElement')
   
..basically shorthands for getElementById() and querySelectorAll()
