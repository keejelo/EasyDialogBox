# EasyDialogBox
Easy to use Javascript dialog box, messagebox, alert, confirm, prompt, toast.

<br />

## Features
- Plain vanilla Javascript, no libraries needed.
- Customizable
- Draggable
- Resizable
- Responsive
- Using standard Javascript (<a href="https://www.google.com/search?q=ecmascript+5" title="https://www.google.com/search?q=ecmascript+5">ES5</a>), HTML and CSS. Crossbrowser, trying to support legacy browsers as much as possible. 
- <a href="https://github.com/keejelo/EasyDialogBox/tree/master/js" title="Minified version, smaller size">Lightweight</a>

<br />

## How to use?
### Documentation, live examples:
<h3>&#10140;&nbsp; https://keejelo.github.io/EasyDialogBox/documentation.html</h3>

<br />

## Important changes
- <b>Version 1.735 and above:</b><br />
  Removed parameter <code>bKeepAlive</code> from function: <code>EasyDialogBox.create(...);</code>
  <br />
  Usage is now:<br />
  <code>let myObj = EasyDialogBox.create(id, strBoxTypeClass, strTitle, strMessage, fnCallback, x, y, w, h);</code>
  
  <br />
  
- <b>Version 1.722 and above:</b><br />
  The "classflags" below has had their names changed due to naming ambiguity causing bugs:

  "<b>dlg-no-drag</b>" is now called "<b>dlg-disable-drag</b>"
  
  "<b>dlg-no-btns</b>" is now called "<b>dlg-disable-btns</b>"
  
  "<b>dlg-no-overlay</b>" is now called "<b>dlg-disable-overlay</b>"
  
  "<b>dlg-no-footer</b>" is now called "<b>dlg-disable-footer</b>"

<br />

## Motivation
I started this when I needed a multipurpose dialogbox for my own projects. Not wanting to be dependant on any libraries I wrote my own module.<br />
Although dialogboxes has got a "bad rap" in the web-world, I still think they have their use when used correctly and in the right settings.<br />
If anyone else finds this useful that's great.

<br />

## Credits
Thanks to ray73864 for testing and feedback.

<br />

## License
MIT &copy; keejelo
