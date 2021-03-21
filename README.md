# EasyDialogBox

Easy to use HTML-CSS-Javascript dialog box, messagebox, alert, confirm, prompt, with optional icons.

Lightweight. Customizable. Responsive. Plain vanilla Javascript, no libraries.

Using standard HTML, CSS and Javascript.  
Crossbrowser, legacy browser support as much as possible.

Documentation and live examples: https://keejelo.github.io/EasyDialogBox/doc.html

<br />
<b>New version released: 1.735.12</b>
<br />
Important change: 
<br /><br />
<b>Removed parameter "bKeepAlive" from function: <code>EasyDialogBox.create(...);</code></b>
<br/ ><br />
<b>Usage is now: <code>let myObj = EasyDialogBox.create(id, strBoxTypeClass, strTitle, strMessage, fnCallback, x, y, w, h);</code></b>
<br/ ><br />
See changelog for other important changes: https://github.com/keejelo/EasyDialogBox/blob/master/changelog.txt
<br />
<br />
<br />

<b>Important changes from version 1.722 and above:</b>

The "classflags" below has had their names changed due to naming ambiguity causing bugs:

"<b>dlg-no-drag</b>" is now called "<b>dlg-disable-drag</b>"

"<b>dlg-no-btns</b>" is now called "<b>dlg-disable-btns</b>"

"<b>dlg-no-overlay</b>" is now called "<b>dlg-disable-overlay</b>"

"<b>dlg-no-footer</b>" is now called "<b>dlg-disable-footer</b>"

