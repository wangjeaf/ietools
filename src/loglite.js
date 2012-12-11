/**
 * LogLite IE console控制台工具
 *
 * @author 王致富 <wangjeaf@gmail.com, zhifu.wang@renren-inc.com>
 * @date   2012-8-10
 */
;;;(function(win, doc, undefined) {
    if (win.__LogLiteAdded) {
        return;
    }
    win.__LogLiteAdded = 1;
    var toplevel = false;
    try {
        toplevel = win.frameElement == null;
    } catch(e) {}
    if (!toplevel) {
        return;
    }

    /**************************************************
     * dom-drag.js
     * 09.25.2001
     * www.youngpup.net
     **************************************************
     * 10.28.2001 - fixed minor bug where events
     * sometimes fired off the handle, not the root.
     **************************************************/

    var Drag = { 
        obj : null,
        init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper) {
            o.onmousedown	= Drag.start;

            o.hmode			= bSwapHorzRef ? false : true ;
            o.vmode			= bSwapVertRef ? false : true ;

            o.root = oRoot && oRoot != null ? oRoot : o ;

            if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) o.root.style.left   = "0px";
            if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) o.root.style.top    = "0px";
            if (!o.hmode && isNaN(parseInt(o.root.style.right ))) o.root.style.right  = "0px";
            if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) o.root.style.bottom = "0px";

            o.minX	= typeof minX != 'undefined' ? minX : null;
            o.minY	= typeof minY != 'undefined' ? minY : null;
            o.maxX	= typeof maxX != 'undefined' ? maxX : null;
            o.maxY	= typeof maxY != 'undefined' ? maxY : null;

            o.xMapper = fXMapper ? fXMapper : null;
            o.yMapper = fYMapper ? fYMapper : null;

            o.root.onDragStart	= new Function();
            o.root.onDragEnd	= new Function();
            o.root.onDrag		= new Function();
        },

        start : function(e) {
            var o = Drag.obj = this;
            e = Drag.fixE(e);
            var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
            var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
            o.root.onDragStart(x, y);

            o.lastMouseX	= e.clientX;
            o.lastMouseY	= e.clientY;

            if (o.hmode) {
                if (o.minX != null)	o.minMouseX	= e.clientX - x + o.minX;
                if (o.maxX != null)	o.maxMouseX	= o.minMouseX + o.maxX - o.minX;
            } else {
                if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
                if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
            }

            if (o.vmode) {
                if (o.minY != null)	o.minMouseY	= e.clientY - y + o.minY;
                if (o.maxY != null)	o.maxMouseY	= o.minMouseY + o.maxY - o.minY;
            } else {
                if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
                if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
            }

            document.onmousemove	= Drag.drag;
            document.onmouseup		= Drag.end;

            return false;
        },

        drag : function(e) {
            e = Drag.fixE(e);
            var o = Drag.obj;

            var ey	= e.clientY;
            var ex	= e.clientX;
            var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
            var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
            var nx, ny;

            if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
            if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
            if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
            if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

            nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
            ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

            if (o.xMapper)		nx = o.xMapper(y);
            else if (o.yMapper)	ny = o.yMapper(x);

            Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
            Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
            Drag.obj.lastMouseX	= ex;
            Drag.obj.lastMouseY	= ey;

            Drag.obj.root.onDrag(nx, ny);
            return false;
        },

        end : function() {
            document.onmousemove = null;
            document.onmouseup   = null;
            Drag.obj.root.onDragEnd(	parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]), 
                                        parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]));
            Drag.obj = null;
        },

        fixE : function(e) {
            if (typeof e == 'undefined') e = window.event;
            if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
            if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
            return e;
        }
    },

        isIE = !!(win.attachEvent && !win.opera),
        isIE7 = navigator.userAgent.indexOf('MSIE 7.0') > -1,
        isIE6 = navigator.userAgent.indexOf('MSIE 6.0') > -1,

        showLogOnLoad = false,

        zIndex = 3000001,
        css = [
            '#logLiteContainer {display:none;font-size:16px;position:fixed;_position:absolute;top:1px;right:10px;width:500px;background-color:white;border:2px solid #ADB6C9;border-bottom:none;z-index:' + zIndex + ';}',
            '#logLiteHeader {background-color:#F1F4FA;height:25px;line-height:25px;font-weight:bold;padding-left:5px;color:#787878;cursor:move;font-size:14px;}',
            '#logLiteCloseBtn {position:absolute;color:#A9ADB9;cursor:pointer;font-size:14px;font-weight:bold;right:5px;*margin-top:-3px;}',
            '#logLiteRecordTools {position:absolute;color:#787878;font-size:16px;top:228px;right:5px;background-color:white;z-index:' + (zIndex + 100) + ';opacity:0.5;*filter:alpha(opacity=50);}',
            '#mode-switcher {border:1px solid gray;cursor:pointer;*zoom:1;margin-right:10px;}',
            '#logs-cleaner {border:1px solid gray;cursor:pointer;*zoom:1;}',
            '#logs-container {position:relative;width:100%;height:220px;font-size:14px;overflow-y:auto;overflow-x:hidden;}',
            '#single-line-editor {background-color:#F1F4FA;height:35px;line-height:35px;border-top:1px solid #ADB6C9;border-bottom:2px solid #ADB6C9;font-size:14px;}',
            '#single-line-inputer {border:1px solid #ADB6C9;width:70%;font-size:16px;margin-right:5px;}',
            '#single-line-run-btn {height:28px;padding:0 5px;font-size:14px;}',
            '#single-line-clear-btn {height:28px;padding:0 5px;font-size:14px;margin-left:5px;}',
            '#multi-line-editor {display:none;background-color:#F1F4FA;height:135px;line-height:135px;border-top:1px solid #ADB6C9;}',
            '#multi-line-inputer {font-size:16px;margin:2px;width:98%;height:123px;resize:none;}',
            '#multi-line-actions {display:none;border-bottom:2px solid #ADB6C9;}',
            '#multi-line-run-btn {height:28px;padding:0 10px;font-size:16px;margin:2px 10px 2px 2px;}',
            '#logLiteErrorMsg {font-size:12px;margin-left:20px;color:salmon;}',
            '#multi-line-clear-btn {height:28px;padding:0 10px;font-size:16px;margin:2px 10px 2px 0px;}',
            '#logLiteTrigger {position:fixed;_position:absolute;color:#A9ADB9;cursor:pointer;font-size:12px;border:1px solid gray;font-weight:bold;right:2px;top:1px;border:2px solid #ADB6C9;height:20px;line-height:20px;padding:1px;background-color:#F1F4FA;z-index:', zIndex + 20, ';}'
        ].join(''),

        html = ['<div id="logLiteContainer" style="display:none;">', 
                    '<div id="logLiteHeader">LogLite', 
                        '<span id="logLiteErrorMsg"></span>', 
                        '<span id="logLiteCloseBtn">&times;</span>',
                    '</div>', 
                    '<div id="logLiteRecordTools">',
                        '<span id="mode-switcher">multiline</span>',
                        '<span id="logs-cleaner">clear logs</span>', 
                    '</div>' ,
                    '<div id="logs-container"></div>' , 
                    '<div id="single-line-editor">' ,
                        '>>><input id="single-line-inputer" type="text"/>', 
                        '<input id="single-line-run-btn" type="button" value="run"/>', 
                        '<input id="single-line-clear-btn" type="button" value="clear"/>' ,
                    '</div>',
                    '<div id="multi-line-editor">',
                        '<textarea id="multi-line-inputer"></textarea>' ,
                    '</div>',
                    '<div id="multi-line-actions">',
                        '<input id="multi-line-run-btn" type="button" value="run"/>',
                        '<input id="multi-line-clear-btn" type="button" value="clear"/>',
                    '</div>',
               '</div>', 
               '<div id="logLiteTrigger">LogLite</div>'
            ].join(''),

        appendCss = function(cssText) {
            if (isIE) {
                var style = doc.createStyleSheet();
                style.cssText = cssText;
            } else {
                var node = doc.createElement('style');
                node.setAttribute('type', 'text/css');
                var css_text = doc.createTextNode(cssText);
                node.appendChild(css_text);
                doc.head.appendChild(node);
            }
        },

        $ = function(id) {
            return doc.getElementById(id);
        },

        trim = function(str) {
            return str.replace(/^\s+|\s+$/g, '');
        }, 

        addEvent = (function() {
            return doc.addEventListener ? function(ele, name, func) {
                ele.addEventListener(name, func, false);
            } : function(ele, name, func) {
                ele.attachEvent('on' + name, function() {
                    func.apply(ele, arguments);
                });
            };
        })(),

        backupedLogs = [],

        addLog = function(logs, type, msg) {
            var color = 'black';
            if (type == 'warn') {
                color = '#FF8C00;';
            } else if (type == 'error') {
                color = '#DA4F49;';
            }
            var logContent = doc.createElement('div');
            logContent.style.cssText = 'border-bottom:1px solid gray;line-height:20px;color:' + color;
            logContent.innerHTML = '[' + type + '] ' + msg;
            logs.appendChild(logContent);
        },

        hasOwn = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice,

        isObject = function(obj) {
            return toString.call(obj) === '[object Object]';
        },

        isArray = function(obj) {
            return toString.call(obj) === '[object Array]';
        },

        isWindow = function(obj) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        },

        isPlainObject = function(obj) { /* 参考 jquery */
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!obj || !isObject(obj) || obj.nodeType || isWindow(obj)) {
                return false;
            }

            try {
                // Not own constructor property must be Object
                if (obj.constructor &&
                    !hasOwn.call(obj, "constructor") &&
                    !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.

            var key;
            for (key in obj) {}

            return key === undefined || hasOwn.call(obj, key);
        },

        toObjectStr = function(obj) {
            var result = [];
            for(var prop in obj) {
                if (hasOwn.call(obj, prop)) {
                    result.push(prop + ':' + obj[prop]);
                }
            }
            return '{' + result.join(', ') + '}';
        },

        formatLog = function(args) {
            var realArgs = slice.call(args);
            for (var i = 0, l = realArgs.length; i < l; i++) {
                if (isPlainObject(realArgs[i])) {
                    realArgs[i] = toObjectStr(realArgs[i]);
                } else if (isArray(realArgs[i])) {
                    realArgs[i] = '[' + realArgs[i].join(',') + ']';
                }
            }
            return realArgs.join(' ');
        },

        logs = null,
        initErrorMsg = null,

        handleLogs = function(type, args) {
            logs = logs || $('logs-container');
            if (!logs) {
                backupedLogs.push({
                    type : type,
                    msg : formatLog(args)
                });
                return;
            }
            addLog(logs, type, formatLog(args));
            logs.scrollTop = 100000;
        },

        overwriteConsoleLog = function() {
            var canOverwrite = true;
            if (typeof console != 'undefined') {
                try {
                    win.console = {a: 1};
                    canOverwrite = (win.console.a === 1);
                } catch (e) {
                    canOverwrite = false;
                }
            }
            var console2 = {
                log : function() {
                    handleLogs('log', arguments);
                },
                warn : function() {
                    handleLogs('warn', arguments);
                },
                error : function() {
                    handleLogs('error', arguments);
                }
            };
            console2.err = console2.error;

            if (canOverwrite) {
                win.console = win.console2 = console2;
            } else {
                win.console2 = console2;
                initErrorMsg = 'console.log已存在且不允许覆盖，请使用console2，例如console2.log';
            }
        },

        exec = function(code) {
            code = trim(code);
            var result = null;
            try {
                if (isIE) {
                    result = win.eval(code);
                } else {
                    result = win.eval(code);
                }
            } catch (e) {
                console2.error(e.message);
                return;
            }
            if (code.indexOf('console.') == -1 || result != null) {
                console2.log(result);
            }
        },

        hide = function(el) {
            el.style.display = 'none';
        },

        show = function(el) {
            el.style.display = 'block';
        },

        bindEvent = function() {
            var logs = $('logs-container'),
                container = $('logLiteContainer'),
                logLiteTrigger = $('logLiteTrigger'),
                singleLineEditor = $('single-line-editor'),
                multiLineEditor = $('multi-line-editor'),
                multiLineActions = $('multi-line-actions'),
                singleLineInputer = $('single-line-inputer'),
                multiLineInputer = $('multi-line-inputer'),
                switcher = $('mode-switcher'),
                code, result;

            win.hideLogLiteEverything = function() {
                container.style.display = 'none';
                logLiteTrigger.style.display = 'none';
            };
            win.showLogLiteEverything = function(onlyTrigger) {
                if (!onlyTrigger) {
                    //container.style.display = 'block';
                }
                logLiteTrigger.style.display = 'block';
            };

            Drag.init(container.firstChild, container);
            addEvent(logLiteTrigger, 'click', function(e) {
                var timer = null;
                if (container.style.display != 'none') {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    container.style.display = 'none';
                } else {
                    container.style.display = 'block';
                    timer = setTimeout(function() {
                        if (switcher.innerHTML === 'multiline') {
                            singleLineInputer.focus();
                        } else {
                            multiLineInputer.focus();
                        }
                    }, 100);
                }
            });

            addEvent(container, 'keydown', function(e) {
                var target = e.target || e.srcElement;
                if (e.keyCode === 13) {
                    if (target.id === 'single-line-inputer') {
                        code = trim(singleLineInputer.value);
                        result = exec(code);
                    }
                    if (e.ctrlKey && target.id === 'multi-line-inputer') {
                        code = trim(multiLineInputer.value);
                        result = exec(code);
                    }
                }
            });

            addEvent(container, 'click', function(e) {
                var target = e.target || e.srcElement;
                switch (target.id) {
                    case 'single-line-run-btn': 
                        code = trim(singleLineInputer.value);
                        result = exec(code);
                        break;
                    case 'single-line-clear-btn': 
                        singleLineInputer.value = '';
                        singleLineInputer.focus();
                        break;
                    case 'logs-cleaner': 
                        var entries = logs.getElementsByTagName('div');
                        while(entries.length > 0) {
                            logs.removeChild(entries[0]);
                        }
                        setTimeout(function() {
                            if (switcher.innerHTML === 'multiline') {
                                singleLineInputer.focus();
                            } else {
                                multiLineInputer.focus();
                            }
                        }, 100);
                        break;
                    case 'logLiteCloseBtn': 
                        hide(container);
                        show(logLiteTrigger);
                        break;
                    case 'mode-switcher':
                        if (switcher.innerHTML == 'multiline') {
                            switcher.innerHTML = 'singleline';
                            hide(singleLineEditor);
                            show(multiLineEditor);
                            show(multiLineActions);
                            setTimeout(function() {
                                multiLineInputer.focus();
                            }, 100);
                        } else {
                            switcher.innerHTML = 'multiline';
                            show(singleLineEditor);
                            hide(multiLineEditor);
                            hide(multiLineActions);
                            setTimeout(function() {
                                singleLineInputer.focus();
                            }, 100);
                        }
                        break;
                    case 'multi-line-run-btn': 
                        code = trim(multiLineInputer.value);
                        result = exec(code);
                        break;
                    case 'multi-line-clear-btn': 
                        multiLineInputer.value = '';
                        multiLineInputer.focus();
                        break;
                }
            });

            if (isIE7 || isIE6) {
                container.style.position = 'absolute';
                logLiteTrigger.style.position = 'absolute';
                addEvent(win, 'scroll', function(e) {
                    if (!container) {
                        return;
                    }
                    var scrolled = getScrollTop();
                    container.style.top = scrolled + 1 + 'px';
                    logLiteTrigger.style.top = scrolled + 1 + 'px';
                });
            }
        },

        getScrollTop = function(){
            if (typeof pageYOffset != 'undefined') {
                return pageYOffset;
            }
            var B = document.body;
            var D = document.documentElement;
            D = (D.clientHeight) ? D : B;
            return D.scrollTop;
        },

        recoverBackupedLogs = function() {
            for(var i = 0, current, l = backupedLogs.length; i < l; i++) {
                current = backupedLogs[i];
                console[current.type](current.msg);
            }
            if (showLogOnLoad && l > 0) {
                $('logLiteContainer').style.display = 'block';
                //$('logLiteTrigger').style.display = 'none';
            }
        },

        initDOM = function() {
            addEvent(win, 'load', function(e) {
                var con = doc.createElement('div');
                con.id = 'logLiteWrapper';
                con.innerHTML = html;
                doc.body.appendChild(con);
                bindEvent();
                appendCss(css);
                recoverBackupedLogs();

                if (initErrorMsg) {
                    $('logLiteErrorMsg').innerHTML = initErrorMsg;
                }
            });
        };

    if (isIE) {
        overwriteConsoleLog();
        initDOM();
    }
})(this, document);
