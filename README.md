# EasyDialogBox
<b>Easy to use HTML-CSS-Javascript dialog box, messagebox, alert, confirm, prompt, with optional icons.</b>

- Plain vanilla Javascript, no libraries needed.
- Customizable
- <a href="https://github.com/keejelo/EasyDialogBox/blob/master/js/easydlg.min.js" title="Minified version, smaller size">Lightweight</a>
- Responsive
- Crossbrowser, legacy browser support as much as possible. Using standard HTML, CSS and Javascript (ES5).

<h3>Documentation, how to use, live examples</h3>
https://keejelo.github.io/EasyDialogBox/documentation.html
<br /><br /><br />
<b>Important changes from version 1.735 and above:</b>

Removed parameter <code>bKeepAlive</code> from function: <code>EasyDialogBox.create(...);</code>
<br /><br />
<b>Usage is now:</b>
<br />
<code>let myObj = EasyDialogBox.create(id, strBoxTypeClass, strTitle, strMessage, fnCallback, x, y, w, h);</code>
<br />
<br />
See changelog for other changes.
<br />
<br />
<br />

<b>Important changes from version 1.722 and above:</b>

The "classflags" below has had their names changed due to naming ambiguity causing bugs:

"<b>dlg-no-drag</b>" is now called "<b>dlg-disable-drag</b>"

"<b>dlg-no-btns</b>" is now called "<b>dlg-disable-btns</b>"

"<b>dlg-no-overlay</b>" is now called "<b>dlg-disable-overlay</b>"

"<b>dlg-no-footer</b>" is now called "<b>dlg-disable-footer</b>"

