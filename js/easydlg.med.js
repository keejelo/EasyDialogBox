/*EasyDialogBox,mediumver:1.735.68,github.com/keejelo/EasyDialogBox*/
var EasyDialogBox=(function()
{'use strict';var DEBUG=false;var _btnTextClose='Close';var _btnTextYes='Yes';var _btnTextNo='No';var _btnTextOk='OK';var _btnTextCancel='Cancel';var CLOSE=0;var YES=1;var NO=2;var OK=3;var CANCEL=4;var _strBoxTypeList=('dlg|dlg-close|dlg-prompt|dlg-yes|dlg-no|dlg-yes-no|dlg-ok|dlg-cancel|dlg-ok-cancel|dlg-toast|'+'dlg-disable-heading|dlg-disable-footer|dlg-disable-btns|dlg-disable-overlay|dlg-disable-drag|'+'dlg-disable-esc|dlg-disable-clickout|'+'dlg-nomodal|dlg-multi|dlg-fade|'+'dlg-info|dlg-question|dlg-error|dlg-success|dlg-exclamation|'+'dlg-rounded|dlg-shadow').split('|');var _boxObj=[];var _bodyPadRight=0;var _bResized=false;var _log=function(s)
{if(DEBUG)
{return console.log(s);}};var _s2i=function(s)
{return parseInt(s,10);};var _trim=function(s)
{return s.replace(/^\s+|\s+$/g,'');};if(!Array.prototype.indexOf)
{Array.prototype.indexOf=function(elt)
{var len=this.length>>>0;var from=Number(arguments[1])||0;from=(from<0)?Math.ceil(from):Math.floor(from);if(from<0){from+=len;}
for(;from<len;from++)
{if(from in this&&this[from]===elt){return from;}}
return-1;};}
var _attachEventListener=function(target,eventType,functionRef,capture)
{if(typeof target.addEventListener!=='undefined')
{target.addEventListener(eventType,functionRef,capture);}
else if(typeof target.attachEvent!=='undefined')
{var functionString=eventType+functionRef;target['e'+functionString]=functionRef;target[functionString]=function(event)
{if(typeof event==='undefined')
{event=window.event;}
target['e'+functionString](event);};target.attachEvent('on'+eventType,target[functionString]);}
else
{eventType='on'+eventType;if(typeof target[eventType]==='function')
{var oldListener=target[eventType];target[eventType]=function()
{oldListener();return functionRef();};}
else
{target[eventType]=functionRef;}}};var _detachEventListener=function(target,eventType,functionRef,capture)
{if(typeof target.removeEventListener!=='undefined')
{target.removeEventListener(eventType,functionRef,capture);}
else if(typeof target.detachEvent!=='undefined')
{var functionString=eventType+functionRef;target.detachEvent('on'+eventType,target[functionString]);target['e'+functionString]=null;target[functionString]=null;}
else
{target['on'+eventType]=null;}};var _stopEvent=function(e)
{if(typeof e.stopPropagation!=='undefined')
{e.stopPropagation();}
else
{e.cancelBubble=true;}};var _stopDefault=function(e)
{if(typeof e.preventDefault!=='undefined')
{e.preventDefault();}
else
{e.returnValue=false;}};var _getStyle=function(el,prop)
{return(typeof getComputedStyle!=='undefined'?getComputedStyle(el,null):el.currentStyle)[prop];};var _hasClass=function(el,classValue)
{var pattern=new RegExp('(^|\\s)'+classValue+'(\\s|$)');return pattern.test(el.className);};var _addClass=function(el,classValue)
{if(!(_hasClass(el,classValue)))
{if(el.className==='')
{el.className=classValue;}
else
{el.className+=' '+classValue;}}};var _removeClass=function(el,classValue)
{if(_hasClass(el,classValue))
{var reg=new RegExp('(^|\\s)'+classValue+'(\\s|$)');var newClass=el.className.replace(reg,' ');el.className=newClass.replace(/^\s+|\s+$/g,'');}};var _getObjFromId=function(arr,id)
{for(var i=0;i<arr.length;i++)
{if(arr[i].id===id)
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
return false;};var _adjustElSizePos=function(id)
{var el=document.getElementById(id);if(el)
{var winHeight=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;if(_s2i(el.offsetHeight+el.customPosY)>=winHeight)
{el.style.top='0';el.style.marginTop='0';el.style.marginBottom='0';el.style.borderTopWidth='0';el.style.borderBottomWidth='0';el.customPosY=0;}
else
{if(!el.customPosY)
{el.style.top=((winHeight/2)-(el.offsetHeight/2))+'px';}
else
{el.style.top=el.customPosY+'px';}
if(el.customHeight)
{el.style.height=el.customHeight+'px';}
el.style.borderTopWidth='';el.style.borderBottomWidth='';}
var winWidth=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;var overlap=40;if(_s2i(el.offsetWidth+el.customPosX+overlap)>=winWidth)
{el.style.left='0';el.style.marginLeft='0';el.style.marginRight='0';el.style.borderLeftWidth='0';el.style.borderRightWidth='0';el.customPosX=0;}
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
str=_trim(str);if(str.indexOf('#')!==-1)
{if(str.indexOf(' ')!==-1||str.indexOf(',')!==-1||str.indexOf('>')!==-1)
{var idPart=str.split(' ')[0];str=str.replace(idPart,'');idPart=idPart.replace(',','');idPart=idPart.replace('>','');idPart=idPart.replace(':','');str=_trim(str);var a=document.querySelector(idPart);var aa=document.querySelectorAll(idPart+' '+str);var b=document.querySelector(idPart+'_0_1');var bb=document.querySelectorAll(idPart+'_0_1 '+str);if(a)
{if(aa.length>0)
{return aa;}}
else if(b)
{if(bb.length>0)
{return bb;}}}
else
{return document.querySelector(str);}}
else
{var c=document.getElementById(objId);if(c)
{var cc=c.querySelectorAll(str)
if(cc)
{return cc;}}};_log('DEBUG: _getEl(): '+str+' cannot be found, return: null');return null;};var _setZindex=function(el)
{var zIndex=_s2i(_getStyle(el,'zIndex'));for(var i=0;i<_boxObj.length;i++)
{if(zIndex<=_s2i(_getStyle(_getEl(_boxObj[i].id).parentNode,'zIndex'))&&_getEl(_boxObj[i].id).parentNode!==el)
{zIndex=_s2i(_getStyle(_getEl(_boxObj[i].id).parentNode,'zIndex'))+1;}}
return _s2i(zIndex);};var _scrollBarFix=function()
{var body=document.querySelector('body');if(_hasClass(body,'dlg-stop-scrolling'))
{return;}
_bodyPadRight=_getStyle(body,'paddingRight');_bodyPadRight=_s2i(_bodyPadRight);var w1=body.offsetWidth;_addClass(body,'dlg-stop-scrolling');var w2=body.offsetWidth;var w3=w2-w1;if(typeof _bodyPadRight==='number'&&_bodyPadRight>0)
{w3+=_s2i(_bodyPadRight);}
body.setAttribute('style','padding-right:'+w3+'px;');};var _fade=function(el,dir,spd,fn)
{var n;(dir)?n=10:n=0;var t=setInterval(function()
{(dir)?n--:n++;el.style.opacity=n/10;if((dir&&n<=0)||(!dir&&n>=10))
{clearInterval(t);if(typeof fn==='function'){fn();}}},spd||30);};var _show=function(objId)
{var obj=_getObjFromId(_boxObj,objId);if(obj!==null)
{var dlg=document.getElementById(obj.id);if(!(_hasClass(dlg,'dlg-disable-overlay'))&&!(_hasClass(dlg,'dlg-nomodal'))&&!(_hasClass(dlg,'dlg-multi')))
{_scrollBarFix();}
if(!(_hasClass(dlg,'dlg-disable-drag')))
{_drag.init(obj.id+'_1');}
dlg.style.display='block';dlg.style.zIndex=_s2i(_setZindex(dlg));if(obj.bFade)
{dlg.style.opacity=0;_fade(dlg);}
var box=document.getElementById(obj.id+'_1');box.customPosX=0;box.customPosY=0;box.customHeight=0;box.customWidth=0;if(obj.x)
{box.style.left=_s2i(obj.x)+'px';box.customPosX=_s2i(obj.x);}
if(obj.y)
{box.style.top=_s2i(obj.y)+'px';box.customPosY=_s2i(obj.y);}
if(obj.w)
{box.style.maxWidth=_s2i(obj.w)+'px';box.customWidth=_s2i(obj.w);}
if(obj.h)
{box.customHeight=_s2i(obj.h);}
if(box.customHeight)
{var message=box.querySelector('#'+box.id+' .dlg-message');var h=115;message.style.height=_s2i(obj.h-h)+'px';}
box.style.visibility='visible';obj.bVisible=true;obj.onShow();_adjustElSizePos(obj.id+'_1');_log('DEBUG: show(): executed');return obj;}
_log('DEBUG: show(): error, object do not exist');return false;};var _hide=function(objId,bSkip)
{var dlg=document.getElementById(objId);var box=document.getElementById(objId+'_1');var obj=_getObjFromId(_boxObj,objId);if(obj.x!==null)
{obj.x=_s2i(box.style.left);}
if(obj.y!==null)
{obj.y=_s2i(box.style.top);}
if(dlg&&box)
{if(bSkip!==true&&!obj.bFade)
{dlg.style.display='none';box.style.visibility='hidden';obj.bHidden=true;obj.bVisible=false;obj.onHide();}
else if(bSkip!==true&&obj.bFade)
{_fade(dlg,true,0,function()
{dlg.style.display='none';box.style.visibility='hidden';obj.bHidden=true;obj.bVisible=false;obj.onHide();});}
else if(bSkip===true&&!obj.bFade)
{dlg.style.display='none';box.style.visibility='hidden';obj.bHidden=true;obj.bVisible=false;}
else
{dlg.style.display='none';box.style.visibility='hidden';obj.bHidden=true;obj.bVisible=false;}}
var body=document.querySelector('body');_removeClass(body,'dlg-stop-scrolling');body.setAttribute('style','padding-right:'+_s2i(_bodyPadRight)+'px;');_bResized=false;return obj;};var _destroy=function(objId)
{var success=false;var body=document.querySelector('body');_removeClass(body,'dlg-stop-scrolling');body.setAttribute('style','padding-right:'+_s2i(_bodyPadRight)+'px;');var dlg=document.getElementById(objId);if(dlg)
{dlg.style.display='none';var pBox=dlg.querySelectorAll('.dlg-input-field');if(pBox.length>0)
{pBox[0].onkeyup=null;pBox[0].onchange=null;}
dlg.parentNode.removeChild(dlg);var obj=_getObjFromId(_boxObj,objId);obj.onDestroy();obj.bExistInDOM=false;obj.bVisible=false;var index=_boxObj.indexOf(obj);if(index>-1)
{setTimeout(function()
{var wasDeleted=_boxObj.splice(index,1);if(wasDeleted.length===1)
{success=true;_log('DEBUG: destroy(): object deleted from object array');}
else
{success=false;_log('DEBUG: destroy(): Error, object NOT deleted from object array');}},10);}
else
{_log('DEBUG: destroy(): Error, object not found in array');success=false;}}
return success;};var _create=function(strId,strTypeClass,strTitle,strMessage,fnCallback,x,y,w,h)
{var existingObj=_getObjFromId(_boxObj,strId+'_0');if(existingObj)
{_log('DEBUG: create(): new object not created. An object with same ID already exist. Existing object returned');return existingObj;}
strTypeClass=strTypeClass.replace(/\s+/g,' ');strTypeClass=_trim(strTypeClass);var matched=_matchAll(_strBoxTypeList,strTypeClass,true);if(matched===true)
{if(strId===''||typeof strId==='undefined'||strId===null||strId===0)
{strId='a';strId+=Math.random().toString(36).substr(2,9);}
strId+='_0';if(typeof fnCallback==='undefined')
{fnCallback=false;}
var obj={id:strId,strTypeClass:strTypeClass,strTitle:strTitle,strMessage:strMessage,strInput:'',nRetCode:-1,x:x,y:y,w:w,h:h,bVisible:false,bExistInDOM:false,bHidden:false,bFade:false,nTimeId:null,el:null,callback:function(a,b)
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
{_log('DEBUG: fnCallback(): error: '+err);}},show:function()
{return _show(this.id);},hide:function(nMsec,bSkip)
{if(nMsec!==0&&typeof nMsec==='number')
{var that=this;that.nTimeId=setTimeout(function()
{return _hide(that.id,bSkip);},nMsec);}
else
{return _hide(this.id,bSkip);}},destroy:function()
{return _destroy(this.id);},onCreate:function()
{_log('DEBUG: Default "obj.onCreate()" function fired. Override this by creating your own.');},onShow:function()
{_log('DEBUG: Default "obj.onShow()" function fired. Override this by creating your own.');},onHide:function()
{_log('DEBUG: Default "obj.onHide()" function fired. Override this by creating your own.');},onClose:function()
{_log('DEBUG: Default "obj.onClose()" function fired. Override this by creating your own.');},onDestroy:function()
{_log('DEBUG: Default "obj.onDestroy()" function fired. Override this by creating your own.');},$:function(str)
{return _getEl(this.id,str);},colorBorder:function(color)
{_getEl(this.id).style.borderColor=color;return this;},colorHeading:function(color)
{_getEl(this.id,'#'+this.id+'_1_heading').style.backgroundColor=color;return this;},color:function(color)
{if(_getEl(this.id,'#'+this.id+'_1_heading'))
{_getEl(this.id,'#'+this.id+'_1_heading').style.backgroundColor=color;}
_getEl(this.id).style.borderColor=color;return this;},width:function(n)
{this.w=_s2i(n);_getEl(this.id).style.maxWidth=this.w+'px';return this;},height:function(n)
{this.h=_s2i(n);_getEl(this.id).style.height=this.h+'px';_getEl(this.id).style.maxHeight=this.h+'px';var message=_getEl(this.id,'.dlg-message')[0];var h=115;message.style.height=_s2i(this.h-h)+'px';return this;},xPos:function(n)
{this.x=_s2i(n);_getEl(this.id).style.left=this.x+'px';return this;},yPos:function(n)
{this.y=_s2i(n);_getEl(this.id).style.top=this.y+'px';return this;},center:function()
{var winWidth=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;var winHeight=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;var el=_getEl(this.id);el.style.left=((winWidth/2)-(el.offsetWidth/2))+'px';el.style.top=((winHeight/2)-(el.offsetHeight/2))+'px';return this;}}
_boxObj.push(obj);obj=_getObjFromId(_boxObj,strId);if(obj===null)
{strId+='_0';obj=_getObjFromId(_boxObj,strId);}
var body=document.querySelector('body');var dlg=document.createElement('div');dlg.setAttribute('id',obj.id);dlg.setAttribute('class',obj.strTypeClass);body.appendChild(dlg);if(_hasClass(dlg,'dlg-toast'))
{_removeClass(dlg,'dlg-toast');_addClass(dlg,'dlg dlg-disable-heading dlg-disable-footer dlg-disable-drag dlg-disable-overlay');}
if(_hasClass(dlg,'dlg-fade'))
{obj.bFade=true;}
if(dlg)
{dlg.style.display='block';var box=document.createElement('div');box.setAttribute('id',obj.id+'_1');box.setAttribute('class','dlg-box');box.customPosX=0;box.customPosY=0;box.customHeight=0;box.customWidth=0;if(obj.x)
{box.style.left=_s2i(obj.x)+'px';box.customPosX=_s2i(obj.x);}
if(obj.y)
{box.style.top=_s2i(obj.y)+'px';box.customPosY=_s2i(obj.y);}
if(obj.w)
{box.style.maxWidth=_s2i(obj.w)+'px';box.customWidth=_s2i(obj.w);}
if(obj.h)
{box.style.height=_s2i(obj.h)+'px';box.customHeight=_s2i(obj.h);}
dlg.appendChild(box);if(_hasClass(dlg,'dlg-rounded'))
{_addClass(box,'dlg-rounded');_removeClass(dlg,'dlg-rounded');}
if(_hasClass(dlg,'dlg-shadow'))
{_addClass(box,'dlg-shadow');_removeClass(dlg,'dlg-shadow');}
if(!(_hasClass(dlg,'dlg-disable-heading')))
{var heading=document.createElement('div');heading.setAttribute('id',obj.id+'_1_heading');heading.setAttribute('class','dlg-heading');box.appendChild(heading);var closeX=document.createElement('span');closeX.setAttribute('class','dlg-close-x');closeX.innerHTML='&#215;';heading.appendChild(closeX);var titleText=document.createTextNode(obj.strTitle);heading.appendChild(titleText);}
else
{var closeX=document.createElement('span');closeX.setAttribute('class','dlg-close-x');closeX.innerHTML='&#215;';box.appendChild(closeX);}
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
{obj.hide(0,true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();},false);}
var btnCloseDialog=dlg.querySelector('.dlg-close-btn');if(btnCloseDialog)
{_attachEventListener(btnCloseDialog,'click',function BtnCloseClick()
{obj.hide(0,true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();},false);}
if(!(_hasClass(dlg,'dlg-disable-clickout'))&&!(_hasClass(dlg,'dlg-multi')))
{_attachEventListener(dlg,'click',function ClickOutClose(e)
{e=e||window.event;var targ;if(e.target)
{targ=e.target;}
else if(e.srcElement)
{targ=e.srcElement;}
if(targ.nodeType===3)
{targ=targ.parentNode;}
if(targ===dlg)
{obj.hide(0,true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();}},false);}
if(!(_hasClass(dlg,'dlg-disable-esc'))&&!(_hasClass(dlg,'dlg-multi')))
{_attachEventListener(document,'keyup',function EscKeyClose(e)
{e=e||window.event;if(e.which===27||e.keyCode===27||e.key==='Escape'||e.code==='Escape')
{if(obj.bVisible)
{obj.hide(0,true);obj.callback(CLOSE);obj.nRetCode=CLOSE;obj.onClose();_stopEvent(e);_stopDefault(e);}}},false);}
if(_hasClass(dlg,'dlg-yes-no')||_hasClass(dlg,'dlg-yes')||_hasClass(dlg,'dlg-no'))
{var btnYesDialog=dlg.querySelector('.dlg-yes-btn');if(btnYesDialog)
{_attachEventListener(btnYesDialog,'click',function BtnYesClick()
{obj.hide(0,true);obj.callback(YES);obj.nRetCode=YES;obj.onClose();},false);}
var btnNoDialog=dlg.querySelector('.dlg-no-btn');if(btnNoDialog)
{_attachEventListener(btnNoDialog,'click',function BtnNoClick()
{obj.hide(0,true);obj.callback(NO);obj.nRetCode=NO;obj.onClose();},false);}}
if(_hasClass(dlg,'dlg-ok-cancel')||_hasClass(dlg,'dlg-ok')||_hasClass(dlg,'dlg-cancel'))
{var btnOkDialog=dlg.querySelector('.dlg-ok-btn');if(btnOkDialog)
{_attachEventListener(btnOkDialog,'click',function BtnOkClick()
{obj.hide(0,true);obj.callback(OK);obj.nRetCode=OK;obj.onClose();},false);}
var btnCancelDialog=dlg.querySelector('.dlg-cancel-btn');if(btnCancelDialog)
{_attachEventListener(btnCancelDialog,'click',function BtnCancelClick()
{obj.hide(0,true);obj.callback(CANCEL);obj.nRetCode=CANCEL;obj.onClose();},false);}}
if(_hasClass(dlg,'dlg-prompt'))
{var pBox=dlg.querySelector('.dlg-input-field');if(pBox)
{_attachEventListener(pBox,'keyup',function PromptBoxKeyUp()
{obj.strInput=pBox.value;},false);_attachEventListener(pBox,'change',function PromptBoxChange()
{obj.strInput=pBox.value;},false);}}
if(!(_hasClass(dlg,'dlg-disable-drag')))
{_drag.init(box.id);_attachEventListener(box,'mouseenter',function ActivateDragDrop()
{_drag.init(box.id);},false);_attachEventListener(box,'mousedown',function SetDialogBoxToTop()
{dlg.style.zIndex=_s2i(_setZindex(dlg));},false);}
if(_hasClass(dlg,'dlg-prompt'))
{dlg.querySelector('.dlg-input-field').focus();}
obj.bExistInDOM=true;obj.hide(0,true);obj.el=document.getElementById(obj.id+'_1');setTimeout(function()
{obj.onCreate();_log('DEBUG: obj.onCreate(): executed (async)');},100);_log('DEBUG: create(): new object created and added to DOM');return obj;}
else if(!matched)
{_log('DEBUG: create(): error, dialogbox type not defined or not a valid type: '+obj.strTypeClass);}
else if(!dlg)
{_log('DEBUG: create(): error, element id \''+strId+'\' do not exist.\nReturned value = '+dlg);}
else
{_log('DEBUG: create(): unknown error');}}
else
{_log('DEBUG: create(): error, dialogbox type not defined or not a valid type: '+strTypeClass);}
return null;};var _init=function()
{_attachEventListener(window,'load',function WinLoad()
{if(DEBUG)
{_log('EasyDialogBox debug console-output is set to: ON\nYou can switch it OFF in the file "easydlg.js" by setting the variable: DEBUG = false');}
var opnr=document.querySelectorAll('.dlg-opener');for(var i=0;i<opnr.length;i++)
{var dlg=document.getElementById(opnr[i].getAttribute('rel'));(function()
{var obj=_create(dlg.getAttribute('id'),dlg.getAttribute('class'),dlg.getAttribute('title'),dlg.innerHTML,dlg.getAttribute('data-callback'),dlg.getAttribute('data-x'),dlg.getAttribute('data-y'),dlg.getAttribute('data-w'),dlg.getAttribute('data-h'));_attachEventListener(opnr[i],'click',function DlgOpenerClick(e)
{e=e||window.event;obj.show();this.blur();_stopDefault(e);_stopEvent(e);},false);}());}},false);};var _drag={init:function(id)
{if(_drag.bActive!==true)
{_drag.el=document.getElementById(id);if(_drag.el===null)
{return false;}
_drag.el.grabber=document.getElementById(id+'_heading');if(_drag.el.grabber===null)
{_drag.el.grabber=_drag.el;}
_drag.el.style.position='absolute';_attachEventListener(_drag.el.grabber,'mousedown',_drag.start,false);}},start:function(e)
{e=e||window.event;if(e.button===0)
{_stopDefault(e);_drag.el.grabber.style.cursor='move';_drag.el.posX2=e.clientX;_drag.el.posY2=e.clientY;_attachEventListener(document,'mouseup',_drag.stop,false);_attachEventListener(document,'mousemove',_drag.move,false);_drag.bActive=true;}},stop:function()
{_drag.el.grabber.style.cursor='';_detachEventListener(document,'mouseup',_drag.stop,false);_detachEventListener(document,'mousemove',_drag.move,false);_drag.bActive=false;},move:function(e)
{e=e||window.event;_stopDefault(e);_drag.el.posX=_drag.el.posX2-e.clientX;_drag.el.posY=_drag.el.posY2-e.clientY;_drag.el.posX2=e.clientX;_drag.el.posY2=e.clientY;_drag.el.style.top=parseInt((_drag.el.offsetTop)-(_drag.el.posY),10)+'px';_drag.el.style.left=parseInt((_drag.el.offsetLeft)-(_drag.el.posX),10)+'px';}};return{create:function(strId,strTypeClass,strTitle,strMessage,fnCallback,x,y,w,h)
{return _create(strId,strTypeClass,strTitle,strMessage,fnCallback,x,y,w,h);},getAll:function()
{return _boxObj;},getById:function(id)
{return _getObjFromId(_boxObj,id);},init:function()
{return _init();}}})();(function(){EasyDialogBox.init();})();
