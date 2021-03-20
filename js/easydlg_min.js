/*
* EasyDialogBox, version: 1.735.12 (minified), created by: keejelo, year: 2020-2021
* GitHub: https://github.com/keejelo/EasyDialogBox
* Comment: Crossbrowser, legacy browser support as much as possible.
*/
var EasyDialogBox=(function()
{'use strict';var DEBUG=true;var _btnTextClose='Close';var _btnTextYes='Yes';var _btnTextNo='No';var _btnTextOk='OK';var _btnTextCancel='Cancel';var CLOSE=0;var YES=1;var NO=2;var OK=3;var CANCEL=4;var _strBoxTypeList=['dlg','dlg-close','dlg-prompt','dlg-yes','dlg-no','dlg-yes-no','dlg-ok','dlg-cancel','dlg-ok-cancel','dlg-disable-heading','dlg-disable-footer','dlg-disable-btns','dlg-disable-overlay','dlg-disable-drag','dlg-info','dlg-question','dlg-error','dlg-success','dlg-exclamation','dlg-rounded','dlg-shadow'];var _boxObj=[];var _orgBodyPaddingRight=0;var _bResized=false;if(window.NodeList&&!NodeList.prototype.forEach)
{NodeList.prototype.forEach=Array.prototype.forEach;};var _log=function(str)
{if(DEBUG)
{return console.log(str);}};var _s2i=function(str)
{return parseInt(str,10);};var _trim=function(str)
{return str.replace(/^\s+|\s+$/g,'');};var _attachEventListener=function(target,eventType,functionRef,capture)
{if(typeof target.addEventListener!='undefined')
{target.addEventListener(eventType,functionRef,capture);}
else if(typeof target.attachEvent!='undefined')
{var functionString=eventType+functionRef;target['e'+functionString]=functionRef;target[functionString]=function(event)
{if(typeof event=='undefined')
{event=window.event;}
target['e'+functionString](event);};target.attachEvent('on'+eventType,target[functionString]);}
else
{eventType='on'+eventType;if(typeof target[eventType]=='function')
{var oldListener=target[eventType];target[eventType]=function()
{oldListener();return functionRef();}}
else
{target[eventType]=functionRef;}}};var _detachEventListener=function(target,eventType,functionRef,capture)
{if(typeof target.removeEventListener!='undefined')
{target.removeEventListener(eventType,functionRef,capture)}
else if(typeof target.detachEvent!='undefined')
{var functionString=eventType+functionRef;target.detachEvent('on'+eventType,target[functionString]);target['e'+functionString]=null;target[functionString]=null;}
else
{target['on'+eventType]=null;}};var _stopEvent=function(event)
{if(typeof event.stopPropagation!='undefined')
{event.stopPropagation();}
else
{event.cancelBubble=true;}};var _stopDefault=function(event)
{if(typeof event.preventDefault!='undefined')
{event.preventDefault();}
else
{event.returnValue=false;}};var _hasClass=function(el,classValue)
{var pattern=new RegExp('(^|\\s)'+classValue+'(\\s|$)');return pattern.test(el.className);};var _addClass=function(el,classValue)
{if(!(_hasClass(el,classValue)))
{if(el.className=='')
{el.className=classValue;}
else
{el.className+=' '+classValue;}}};var _removeClass=function(el,classValue)
{if(_hasClass(el,classValue))
{var reg=new RegExp('(^|\\s)'+classValue+'(\\s|$)'),newClass=el.className.replace(reg,' ');el.className=newClass.replace(/^\s+|\s+$/g,'');}};var _getObjFromId=function(arr,strId)
{for(var i=0;i<arr.length;i++)
{if(arr[i].id===strId)
{return arr[i];}}
return null;};var _matchAll=function(arr,str,exp,sep)
{var val=str;if(exp===true)
{if(typeof sep==='undefined')
{sep=' ';}
val=str.split(sep);}
var passed=0;for(var i=0;i<val.length;i++)
{for(var j=0;j<arr.length;j++)
{if(arr[j]===val[i])
{passed++;}}}
if(val.length===passed)
{return true;}
return false;};var _sanitize=function(str)
{str=str.replace(/[^a-z0-9@£#\s\,._-æøåäö-]/gi,'');return str;};var _escape=function(str)
{str=str.replace(/^\s+|\s+$/g,'');str=str.replace(/&/g,'&amp;');str=str.replace(/'/g,'&#39;');str=str.replace(/"/g,'&quot;');str=str.replace(/</g,'&lt;');str=str.replace(/>/g,'&gt;');return str;};var _htmlEncode=function(str)
{return String(str).replace(/[^\w. ]/gi,function(c)
{return'&#'+c.charCodeAt(0)+';';});};var _adjustElSizePos=function(id)
{var el=document.getElementById(id);if(el)
{var winHeight=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;if(_s2i(el.offsetHeight+el.customPosY)>=winHeight)
{el.style.top='0';el.style.marginTop='0';el.style.marginBottom='0';el.style.height='';el.style.maxHeight='';el.style.borderTopWidth='0';el.style.borderBottomWidth='0';}
else
{if(!el.customPosY)
{el.style.top=((winHeight/2)-(el.offsetHeight/2))+'px';}
else
{el.style.top=el.customPosY+'px';}
if(el.customHeight)
{el.style.height=el.customHeight+'px';}
el.style.borderTopWidth='';el.style.borderBottomWidth='';}
var winWidth=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;var overlap=40;if(_s2i(el.offsetWidth+el.customPosX+overlap)>=winWidth)
{el.style.left='0';el.style.marginLeft='0';el.style.marginRight='0';el.style.width='';el.style.maxWidth='';el.style.borderLeftWidth='0';el.style.borderRightWidth='0';}
else
{if(!el.customPosX)
{el.style.left=((winWidth/2)-(el.offsetWidth/2))+'px';}
else
{el.style.left=el.customPosX+'px';}
if(el.customWidth)
{el.style.maxWidth=el.customWidth+'px';}
el.style.borderLeftWidth='';el.style.borderRightWidth='';}}};var _getEl=function(objId,str)
{if(str===undefined||typeof str==='undefined'||str===''||str===0||str===null)
{return document.getElementById(objId+'_1');}
else if(str.indexOf('#')!=-1)
{str=_trim(str);if(str.indexOf(' ')!=-1)
{var idPart=str.split(' ')[0];str=str.replace(idPart,'');str=_trim(str);if(document.querySelector(idPart))
{return document.querySelector(idPart).querySelectorAll(str);}
else if(document.querySelector(idPart+'_0_1'))
{return document.querySelector(idPart+'_0_1').querySelectorAll(str);}
_log('DEBUG: _getEl(): element cannot be found, return: null');return null;}
else
{return document.querySelector(str);}}
else
{return document.getElementById(objId).querySelectorAll(str);};};var _scrollBarFix=function()
{var body=document.getElementsByTagName('body')[0];_orgBodyPaddingRight=window.getComputedStyle(body,null).getPropertyValue('padding-right');_orgBodyPaddingRight=_s2i(_orgBodyPaddingRight);var w1=body.offsetWidth;_addClass(body,'dlg-stop-scrolling');var w2=body.offsetWidth;var w3=w2-w1;if(typeof _orgBodyPaddingRight==='number'&&_orgBodyPaddingRight>0)
{w3+=_s2i(_orgBodyPaddingRight);}
body.setAttribute('style','padding-right:'+w3+'px;');};var _show=function(objId)
{var obj=_getObjFromId(_boxObj,objId);if(obj===null)
{_log('DEBUG: show(): error, object do not exist!');return false;}
if(obj!==null&&obj.bHidden==true)
{_scrollBarFix();var hiddenDlg=document.getElementById(obj.id);if(!(_hasClass(hiddenDlg,'dlg-disable-drag')))
{_drag.init(obj.id+'_1');}
hiddenDlg.style.display='block';document.getElementById(obj.id+'_1').style.visibility='visible';obj.bVisible=true;obj.onShow();if(_bResized)
{_adjustElSizePos(obj.id+'_1');}
_log('DEBUG: show(): executed');return true;}
return false;};var _hide=function(objId,bDoNotExecuteOnHide)
{var dlg=document.getElementById(objId);var box=document.getElementById(objId+'_1');if(dlg&&box)
{dlg.style.display='none';box.style.visibility='hidden';}
var obj=_getObjFromId(_boxObj,objId);obj.bHidden=true;obj.bVisible=false;var body=document.getElementsByTagName('body')[0];_removeClass(body,'dlg-stop-scrolling');body.setAttribute('style','padding-right:'+_s2i(_orgBodyPaddingRight)+'px;');if(obj.x!==null)
{obj.x=parseInt(box.style.left,10);}
if(obj.y!==null)
{obj.y=parseInt(box.style.top,10);}
if(bDoNotExecuteOnHide===undefined||typeof bDoNotExecuteOnHide=='undefined'||bDoNotExecuteOnHide==false)
{obj.onHide();}
_bResized=false;};var _destroy=function(objId)
{var success=false;var body=document.getElementsByTagName('body')[0];_removeClass(body,'dlg-stop-scrolling');body.setAttribute('style','padding-right:'+_s2i(_orgBodyPaddingRight)+'px;');var dlg=document.getElementById(objId);if(dlg)
{dlg.style.display='none';}
if(dlg)
{var pBox=dlg.querySelectorAll('.dlg-input-field');if(pBox.length!=0)
{pBox[0].onkeyup=null;pBox[0].onchange=null;}}
if(dlg)
{dlg.parentNode.removeChild(dlg);var obj=_getObjFromId(_boxObj,objId);obj.onDestroy();obj.bExistInDOM=false;obj.bVisible=false;obj.bKeepAlive=false;if(!obj.bKeepAlive)
{var index=_boxObj.indexOf(obj);if(index>-1)
{setTimeout(function()
{var wasDeleted=_boxObj.splice(index,1);if(wasDeleted.length===1)
{success=true;_log('DEBUG: destroy(): obj.bKeepAlive = false | Object deleted from array');}
else
{success=false;_log('DEBUG: destroy(): Error! obj.bKeepAlive = false | But object NOT deleted from array!');}},10);}
else
{_log('DEBUG: destroy(): Error, object not found in array!');success=false;}}
else if(obj.bKeepAlive)
{_log('DEBUG: destroy(): obj.bKeepAlive = true | Object not deleted from array');success=false;}}
return success;};var _create=function(strId,strTypeClass,strTitle,strMessage,fnCallback,x,y,w,h)
{var existingObj=_getObjFromId(_boxObj,strId+'_0');if(existingObj)
{_log('DEBUG: create(): new object not created! An object with same ID already exist! Existing object returned');return existingObj;}
var matched=_matchAll(_strBoxTypeList,strTypeClass,true);if(matched===true)
{if(strId===''||typeof strId==='undefined'||strId===null||strId===0)
{strId=Math.random().toString(36).substr(2,9);}
strId+='_0';if(typeof fnCallback==='undefined')
{fnCallback=false;}
var obj={id:strId,strTypeClass:strTypeClass,strTitle:strTitle,strMessage:strMessage,bKeepAlive:true,strInput:'',nRetCode:-1,x:x,y:y,w:w,h:h,bVisible:false,bExistInDOM:false,bHidden:false,el:null,callback:function(a,b)
{try
{if(typeof a==='undefined')
{a=this.nRetCode;}
if(typeof b==='undefined')
{b=this.strInput;}
if(typeof window[fnCallback]==='function')
{window[fnCallback](a,b);}
else if(typeof fnCallback==='function')
{fnCallback(a,b);}
else if(fnCallback===false||fnCallback===0)
{return false;}
else
{_log('\n\nDEBUG: typeof fnCallback = '+typeof fnCallback+' and not a function.');_log('       Scope? Possible solution can be to use "hoisting".');_log('       Try to use "var callbackFuncName = function(a,b){}" instead of "let callbackFuncName = function(a,b){}"');_log('       ..or declare the callback function before the module "EasyDialogBox" is initialized');_log('       If the dialogbox do not use a callback function, you can ignore the above messages.\n\n');}}
catch(err)
{_log('CALLBACK: Error! '+err);}},show:function()
{return _show(this.id);},hide:function(bDoNotExecuteOnHide)
{return _hide(this.id,bDoNotExecuteOnHide);},destroy:function()
{return _destroy(this.id);},onCreate:function()
{_log('DEBUG: Default "obj.onCreate()" function fired. Override this by creating your own.');},onShow:function()
{_log('DEBUG: Default "obj.onShow()" function fired. Override this by creating your own.');},onHide:function()
{_log('DEBUG: Default "obj.onHide()" function fired. Override this by creating your own.');},onClose:function()
{_log('DEBUG: Default "obj.onClose()" function fired. Override this by creating your own.');},onDestroy:function()
{_log('DEBUG: Default "obj.onDestroy()" function fired. Override this by creating your own.');},$:function(str)
{return _getEl(this.id,str);}}
_boxObj.push(obj);obj=_getObjFromId(_boxObj,strId);if(obj===null)
{strId+='_0';obj=_getObjFromId(_boxObj,strId);}
var body=document.getElementsByTagName('body')[0];var dlg=document.createElement('div');dlg.setAttribute('id',obj.id);dlg.setAttribute('class',obj.strTypeClass);body.appendChild(dlg);matched=null;if(dlg)
{matched=_matchAll(_strBoxTypeList,obj.strTypeClass,true);}
if(dlg&&(matched===true))
{dlg.style.display='block';var box=document.createElement('div');box.setAttribute('id',obj.id+'_1');box.setAttribute('class','dlg-box');box.customPosX=0;box.customPosY=0;box.customHeight=0;box.customWidth=0;if(obj.x)
{box.style.left=_s2i(obj.x)+'px';box.customPosX=_s2i(obj.x);}
if(obj.y)
{box.style.top=_s2i(obj.y)+'px';box.customPosY=_s2i(obj.y);}
if(obj.w)
{box.style.maxWidth=_s2i(obj.w)+'px';box.customWidth=_s2i(obj.w);}
if(obj.h)
{box.style.height=_s2i(obj.h)+'px';box.customHeight=_s2i(obj.h);}
dlg.appendChild(box);if(_hasClass(dlg,'dlg-rounded'))
{_addClass(box,'dlg-rounded');}
if(_hasClass(dlg,'dlg-shadow'))
{_addClass(box,'dlg-shadow');}
if(!(_hasClass(dlg,'dlg-disable-heading')))
{var heading=document.createElement('div');heading.setAttribute('id',obj.id+'_1_heading');heading.setAttribute('class','dlg-heading');box.appendChild(heading);var closeX=document.createElement('span');closeX.setAttribute('class','dlg-close-x');var closeText=document.createTextNode(' \u00d7 ');closeX.appendChild(closeText);heading.appendChild(closeX);var titleText=document.createTextNode(obj.strTitle);heading.appendChild(titleText);}
var message=document.createElement('div');var leftbox=null;var rightbox=null;if(_hasClass(dlg,'dlg-info')||_hasClass(dlg,'dlg-question')||_hasClass(dlg,'dlg-error')||_hasClass(dlg,'dlg-success')||_hasClass(dlg,'dlg-exclamation'))
{message.setAttribute('class','dlg-message dlg-flex-container');if(box.customHeight)
{message.style.height=_s2i(obj.h-101)+'px';}
leftbox=document.createElement('div');leftbox.setAttribute('class','dlg-flexbox-left');if(_hasClass(dlg,'dlg-info'))
{leftbox.innerHTML='<div class="dlg-symbol dlg-icon-info"></div>';}
else if(_hasClass(dlg,'dlg-question'))
{leftbox.innerHTML='<div class="dlg-symbol dlg-icon-question"></div>';}
else if(_hasClass(dlg,'dlg-error'))
{leftbox.innerHTML='<div class="dlg-symbol dlg-icon-error"></div>';}
else if(_hasClass(dlg,'dlg-success'))
{leftbox.innerHTML='<div class="dlg-symbol dlg-icon-success"></div>';}
else if(_hasClass(dlg,'dlg-exclamation'))
{leftbox.innerHTML='<div class="dlg-symbol dlg-icon-excl"></div>';}
message.appendChild(leftbox);rightbox=document.createElement('div');rightbox.setAttribute('class','dlg-flexbox-right');rightbox.innerHTML=obj.strMessage;message.appendChild(rightbox);}
else
{message.setAttribute('class','dlg-message');message.innerHTML=obj.strMessage;if(box.customHeight)
{message.style.height=_s2i(obj.h-130)+'px';}}
box.appendChild(message);if(_hasClass(dlg,'dlg-prompt'))
{var inputbox=document.createElement('div');inputbox.setAttribute('class','dlg-input');if(_hasClass(message,'dlg-flex-container'))
{rightbox.appendChild(inputbox);}
else
{message.appendChild(inputbox);}
var input=document.createElement('input');input.setAttribute('class','dlg-input-field');input.setAttribute('type','text');input.setAttribute('value',obj.strInput);inputbox.appendChild(input);if(!(_hasClass(dlg,'dlg-ok-cancel')))
{_addClass(dlg,'dlg-ok-cancel');}}
if(!(_hasClass(dlg,'dlg-disable-footer')))
{var footer=document.createElement('div');footer.setAttribute('class','dlg-footer');box.appendChild(footer);if(!(_hasClass(dlg,'dlg-disable-btns')))
{if(_hasClass(dlg,'dlg-yes')||_hasClass(dlg,'dlg-yes-no'))
{var yesBtn=document.createElement('button');yesBtn.setAttribute('class','dlg-yes-btn');var yesBtnText=document.createTextNode(_btnTextYes);yesBtn.appendChild(yesBtnText);footer.appendChild(yesBtn);}
if(_hasClass(dlg,'dlg-no')||_hasClass(dlg,'dlg-yes-no'))
{var noBtn=document.createElement('button');noBtn.setAttribute('class','dlg-no-btn');var noBtnText=document.createTextNode(_btnTextNo);noBtn.appendChild(noBtnText);footer.appendChild(noBtn);}
if(_hasClass(dlg,'dlg-ok')||_hasClass(dlg,'dlg-ok-cancel'))
{var okBtn=document.createElement('button');okBtn.setAttribute('class','dlg-ok-btn');var okBtnText=document.createTextNode(_btnTextOk);okBtn.appendChild(okBtnText);footer.appendChild(okBtn);}
if(_hasClass(dlg,'dlg-cancel')||_hasClass(dlg,'dlg-ok-cancel'))
{var cancelBtn=document.createElement('button');cancelBtn.setAttribute('class','dlg-cancel-btn');var cancelBtnText=document.createTextNode(_btnTextCancel);cancelBtn.appendChild(cancelBtnText);footer.appendChild(cancelBtn);}
if(_hasClass(dlg,'dlg-close')||_hasClass(dlg,'dlg'))
{var closeBtn=document.createElement('button');closeBtn.setAttribute('class','dlg-close-btn');var closeBtnText=document.createTextNode(_btnTextClose);closeBtn.appendChild(closeBtnText);footer.appendChild(closeBtn);}}}
_attachEventListener(window,'resize',function WinResize()
{_bResized=true;if(obj.bVisible)
{_adjustElSizePos(obj.id+'_1');}},false);var xCloseDialog=dlg.querySelector('.dlg-close-x');if(xCloseDialog)
{_attachEventListener(xCloseDialog,'click',function XCloseClick()
{obj.hide(true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();},false);}
var btnCloseDialog=dlg.querySelector('.dlg-close-btn');if(btnCloseDialog)
{_attachEventListener(btnCloseDialog,'click',function BtnCloseClick()
{obj.hide(true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();},false);}
_attachEventListener(window,'click',function WinCloseClick(evt)
{evt=evt||window.event||event;if(evt.target==dlg)
{obj.hide(true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();}},false);_attachEventListener(window,'keyup',function EscKeyClose(evt)
{evt=evt||window.event||event;if(evt.which===27||evt.keyCode===27||evt.key==='Escape'||evt.code==='Escape')
{obj.hide(true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();_stopEvent(evt);_stopDefault(evt);}},false);if(_hasClass(dlg,'dlg-yes-no')||_hasClass(dlg,'dlg-yes')||_hasClass(dlg,'dlg-no'))
{var btnYesDialog=dlg.querySelector('.dlg-yes-btn');if(btnYesDialog)
{_attachEventListener(btnYesDialog,'click',function BtnYesClick()
{obj.hide(true);obj.callback(YES);obj.nRetCode=YES;obj.onClose();},false);}
var btnNoDialog=dlg.querySelector('.dlg-no-btn');if(btnNoDialog)
{_attachEventListener(btnNoDialog,'click',function BtnNoClick()
{obj.hide(true);obj.callback(NO);obj.nRetCode=NO;obj.onClose();},false);}}
if(_hasClass(dlg,'dlg-ok-cancel')||_hasClass(dlg,'dlg-ok')||_hasClass(dlg,'dlg-cancel'))
{var btnOkDialog=dlg.querySelector('.dlg-ok-btn');if(btnOkDialog)
{_attachEventListener(btnOkDialog,'click',function BtnOkClick()
{obj.hide(true);obj.callback(OK);obj.nRetCode=OK;obj.onClose();},false);}
var btnCancelDialog=dlg.querySelector('.dlg-cancel-btn');if(btnCancelDialog)
{_attachEventListener(btnCancelDialog,'click',function BtnCancelClick()
{obj.hide(true);obj.callback(CANCEL);obj.nRetCode=CANCEL;obj.onClose();},false);}}
if(_hasClass(dlg,'dlg-prompt'))
{var pBox=dlg.querySelector('.dlg-input-field');if(pBox)
{_attachEventListener(pBox,'keyup',function PromptBoxKeyUp()
{obj.strInput=_sanitize(pBox.value);},false);_attachEventListener(pBox,'change',function PromptBoxChange()
{obj.strInput=_sanitize(pBox.value);},false);}}
if(!(_hasClass(dlg,'dlg-disable-drag')))
{_drag.init(box.id);}
_adjustElSizePos(box.id);if(_hasClass(dlg,'dlg-prompt'))
{dlg.querySelector('.dlg-input-field').focus();}
obj.bExistInDOM=true;obj.element=document.getElementById(box.id);obj.hide(true);obj.onCreate();_log('DEBUG: create(): new object created and added to DOM');return obj;}
else if(!matched)
{_log('DEBUG: create(): Error, dialogbox type not defined or not a valid type: '+obj.strTypeClass);}
else if(!dlg)
{_log('DEBUG: create(): Error, element id \''+strId+'\' do not exist!\nReturned value = '+dlg);}
else
{_log('DEBUG: create(): Unknown error!');}}
else
{_log('DEBUG: create(): Error, dialogbox type not defined or not a valid type: '+strTypeClass);}
return null;};var _init=function()
{_attachEventListener(window,'load',function LoadWindow()
{if(DEBUG)
{_log('EasyDialogBox debug console-output is set to: ON\nYou can switch it OFF in the file "easydlg.js" by setting the variable: DEBUG = false');}
var btns=document.querySelectorAll('.dlg-opener');for(var i=0;i<btns.length;i++)
{var dlg=document.getElementById(btns[i].getAttribute('rel'));var classType=dlg.getAttribute('class').replace(/\s\s+/g,' ');classType=classType.replace(/^\s+|\s+$/g,'');var obj=_create(dlg.getAttribute('id'),classType,dlg.getAttribute('title'),dlg.innerHTML,dlg.getAttribute('data-callback'),dlg.getAttribute('data-x'),dlg.getAttribute('data-y'),dlg.getAttribute('data-w'),dlg.getAttribute('data-h'));}
var clkObj=document.querySelectorAll('.dlg-opener');clkObj.forEach(function(btn,index)
{_attachEventListener(btn,'click',function DlgOpenerClick(evt)
{evt=evt||window.event||event;_boxObj[index].show();this.blur();_stopDefault(evt);_stopEvent(evt);},false);});},false);};var _drag={init:function(id)
{_drag.el=document.getElementById(id);_drag.el.grabber=document.getElementById(id+'_heading');if(_drag.el.grabber===null)
{_drag.el.grabber=_drag.el;}
_drag.el.style.position='absolute';_attachEventListener(_drag.el.grabber,'mousedown',_drag.start,false);},start:function(evt)
{evt=evt||window.event||event;if(evt.button===0)
{_stopDefault(evt);_drag.el.grabber.style.cursor='move';_drag.el.posX2=evt.clientX;_drag.el.posY2=evt.clientY;_attachEventListener(document,'mouseup',_drag.stop,false);_attachEventListener(document,'mousemove',_drag.move,false);}},stop:function()
{_drag.el.grabber.style.cursor='';_detachEventListener(document,'mouseup',_drag.stop,false);_detachEventListener(document,'mousemove',_drag.move,false);},move:function(evt)
{evt=evt||window.event||event;_stopDefault(evt);_drag.el.posX=_drag.el.posX2-evt.clientX;_drag.el.posY=_drag.el.posY2-evt.clientY;_drag.el.posX2=evt.clientX;_drag.el.posY2=evt.clientY;_drag.el.style.top=parseInt((_drag.el.offsetTop)-(_drag.el.posY))+'px';_drag.el.style.left=parseInt((_drag.el.offsetLeft)-(_drag.el.posX))+'px';}};return{create:function(strId,strTypeClass,strTitle,strMessage,fnCallback,x,y,w,h)
{return _create(strId,strTypeClass,strTitle,strMessage,fnCallback,x,y,w,h);},getAll:function()
{return _boxObj;},getById:function(id)
{return _getObjFromId(_boxObj,id);},init:function()
{return _init();}}})();(function(){EasyDialogBox.init();})();
