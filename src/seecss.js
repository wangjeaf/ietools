/**
 * SeeCss css样式查看修改工具
 *
 * @author 王致富 <wangjeaf@gmail.com, zhifu.wang@renren-inc.com>
 * @date   2012-8-20
 */
;;;(function(win, doc, undefined) {
    if (win.__SeeCssAdded) {
        return;
    }
    win.__SeeCssAdded = 1;

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

    haveATry = ['0', 'none', 'static', 'white', 'auto'],
    slaveTags = ['div', 'span', 'label', 'input', 'form', 'article', 'section', 'i', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'p', 'a', 'img', 'strong', 'dt', 'dl', 'dd', 'ul'],
    slaves = {}, i, l, prop, defaultBrowserStyles = {},
    compatModeFlag, slavesContainer,
    zIndex = 3000002,

    seeCssStyle = [
        '#resultContainer {display:none;position:fixed;_position:absolute;*zoom:1;width:300px;border:2px solid #ADB6C9;background-color:white;z-index:' + zIndex + ';}',
        '#resultContainer .header {background-color:#F1F4FA;height:25px;line-height:25px;font-weight:bold;padding-left:5px;color:#787878;font-size:14px;cursor:move;}',
        '#cssInspectorHideBtn, #cssInspectorCloseBtn, #cssInspectorResetAllBtn {position:absolute;color:#A9ADB9;cursor:pointer;font-size:12px;font-weight:bold;right:10px;*margin-top:-3px;}',
        '#domOperationTools {height:20px;line-height:20px;font-weight:bold;padding-left:5px;color:#787878;font-size:14px;}',
        '#domOperationTools .findParentNode, #domOperationTools .findPreviousSibling, #domOperationTools .findNextSibling, #domOperationTools .findChildNode {color:#A9ADB9;cursor:pointer;font-size:12px;font-weight:bold;}',
        '#domOperationTools .findPreviousSibling, #domOperationTools .findNextSibling, #domOperationTools .findChildNode {margin-left:10px;}',
        '#cssInspectorHideBtn {right:30px;}',
        '#cssInspectorResetAllBtn {right:10px;}',
        '#styleRuleAddTools {font-size:14px;margin-bottom:2px;display:none;}',
        '#styleRuleAddTools label {font-size:14px;}',
        '#styleRuleAddTools .inputer {font-size:14px;width:70px;height:14px;}',
        '#addStyleOkBtn {margin-left:5px;font-size:14px;background-color:#ADB6C9;padding:0 5px;}',
        '#seperatorStyle, #seperatorDefault, #seperatorCss {font-size:14px;background-color:#ADB6C9;cursor:pointer;padding:2px;}',
        '#seperatorDefault, #seperatorCss {margin-top:2px;}',
        '#resultContainer .trigger {float:right;margin-right:10px;*margin-top:-20px;}',
        '#resultContainer #stylePropsList {font-size:14px;}',
        '#cssPropsList, #defaultPropsList {font-size:14px;height:200px;overflow:auto;*width:300px;}',
        '#defaultPropsList {display:none;height:300px;}',
        '#styleInputer {font-size:14px;position:absolute;top:0px;left:0px;display:none;width:0px;height:14px;font-family:sans-serif;}',
        '#inspector {position:fixed;_position:absolute;color:#A9ADB9;cursor:pointer;font-size:12px;border:1px solid gray;font-weight:bold;right:147px;top:1px;border:2px solid #ADB6C9;height:20px;line-height:20px;padding:1px 13px;z-index:' + zIndex + ';background:#F1F4FA url(data:image/gif;base64,R0lGODlhEAAQAMQUAPLy80hQYaJsM56kre/v8fT09ry+xVNebPHx805YZ/Pz9fb294tHAGZte5ebpdPV2amttXN5hs6ylO3t7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABQALAAAAAAQABAAAAVlIEU9ThM0ziOuqxFBUwxFBis+EQEUSwEQERXLAQEsjkcAxGFrTHgKBCE2adgCEwB1G2huv9Yh7DtZ2nDkSdBGcY3LkcSAPSqdUoPDQEBnDxgSDH0sAhKGgoMigIeJioZ8jRQMfCEAOw%3D%3D) no-repeat 5px center;}',
        '#seeCssTrigger {position:fixed;_position:absolute;color:#A9ADB9;cursor:pointer;font-size:12px;border:1px solid gray;font-weight:bold;right:97px;top:1px;border:2px solid #ADB6C9;height:20px;line-height:20px;padding:1px;z-index:' + zIndex + ';background:#F1F4FA;}',
        '#resultContainer .css-switcher {display:inline-block;*display:inline;*zoom:1;width:10px;*width:8px;margin:0 2px;cursor:pointer;padding:0px 2px;font-size:14px;white-space:nowrap;}',
        '#resultContainer .css-name {color:#006400;}',
        '#resultContainer .style-record-wrapper {white-space:nowrap;}',
        '#resultContainer .css-value {color:#00008B;white-space:nowrap;}',
        '#SeeCssMask {margin:0;padding:0;border:0;cursor:pointer;position:absolute; overflow:hidden; display:block;z-index: 2147483550;top:0; left:0;background:url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D);}',
        '#hoveredElementBorder {position:absolute;border:1px solid red;}',
        '#seeCssErrorMsg {font-size:12px;margin-left:20px;color:salmon;}'
    ].join(''),

    bigHTML = ['<div id="SeeCss">', 
        '<div id="resultContainer" style="display:none;">', 
            '<div class="header">SeeCss<span id="seeCssErrorMsg"></span>', 
                '<span id="cssInspectorHideBtn">hide</span>', 
                '<span id="cssInspectorCloseBtn">&times;</span>', 
            '</div>',
            '<div id="domOperationTools">', 
                '<span class="findParentNode">parent</span>', 
                '<span class="findPreviousSibling">previous</span>', 
                '<span class="findNextSibling">next</span>', 
                '<span class="findChildNode">child</span>', 
                '<span id="cssInspectorResetAllBtn">reset</span>', 
            '</div>',
            '<div id="styleRuleAddTools">', 
                '<label for="addStyleName">name: </label><input class="inputer" id="addStyleName" value=""/>',
                '<label for="addStyleValue">value: </label><input class="inputer" id="addStyleValue" value=""/>',
                '<input id="addStyleOkBtn" type="button" value="ok"/>',
            '</div>',
            '<div id="seperatorStyle">',
                'element style',
                '<a href="#nogo" onclick="return false;" class="trigger" id="stylesTrigger">hide</a>',
                '<a href="#nogo" onclick="return false;" class="trigger" id="styleAddTrigger">add</a>',
            '</div>',
            '<div id="stylePropsList"></div>',
            '<div id="seperatorCss">',
                '<span>css</span>',
                '<a href="#nogo" onclick="return false;" class="trigger" id="cssStylesTrigger">hide</a>',
            '</div>',
            '<div id="cssPropsList"></div>',
            '<div id="seperatorDefault">',
                '<span>browser default</span>',
                '<a href="#nogo" onclick="return false;" class="trigger" id="defaultStylesTrigger">show</a>',
            '</div>',
            '<div id="defaultPropsList"></div>',
            '<input id="styleInputer" type="text" />',
        '</div>',
        '<div id="seeCssTrigger">',
            'SeeCss',
        '</div>',
        '<div id="inspector"></div>',
    '</div>'].join(''),

    commonStyles = ['width', 'height', 'margin', 'padding', 'zIndex', 'clear', 'filter', 'color', 
        'background', 'backgroundColor', 'float', 'cursor', 'display', 'position', 'right', 'left', 'top', 'bottom', 
        'visibility', 'overflow', 'opacity', 'border', 'verticalAlign', 'borderLeftColor', 'borderTopColor', 
        'borderRightColor', 'borderBottomColor', 'borderColor', 'borderTop', 'borderLeft', 
        'borderRight', 'borderBottom', 'wordWrap', 'borderLeftWidth', 'borderRightWidth', 
        'borderTopWidth', 'borderBottomWidth', 'wordBreak', 'marginLeft', 'marginRight', 
        'marginTop', 'marginBottom', 'textUnderlinePosition', 'borderTopStyle', 'borderBottomStyle', 
        'borderLeftStyle', 'borderRightStyle', 'lineBreak', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 
        'letterSpacing', 'backgroundRepeat', 'textAlign', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 
        'textAutospace', 'styleFloat', 'borderWidth', 'lineHeight', 'textIndent', 'textJustify', 'textTransform',
        'textOverflow',  'zoom', 'backgroundAttachment', 'backgroundPosition', 
        'backgroundPositionX', 'backgroundPositionY', 'backgroundImage', 'textDecoration', 'fontFamily', 'minHeight',
        'whiteSpace', 'borderStyle', 'wordSpacing'].sort(),

    input, resultContainer, 
        stylePropsList, cssPropsList, defaultPropsList, 
        stylesTrigger, cssStylesTrigger, defaultStylesTrigger, styleAddTrigger, seeCssTrigger,
        cssInspectorHideBtn, cssInspectorCloseBtn, cssInspectorResetAllBtn, styleRuleAddTools, 
        addStyleOkBtn, addStyleName, addStyleValue, domOperationTools,
        lookedElement, lookedElementOriginCssText = null, 
        timer = null,

    ignoreIds = ['domLiteContainer', 'SeeCss', 'logLiteWrapper','domLiteTrigger', 'seeCssSlavesContainer', 'SeeCssMask'],

    addEvent = (function() {
        return doc.addEventListener ? function(ele, name, func) {
            var i, l;
            if (ele.length) {
                for(i = 0, l = ele.length; i < l; i++) {
                    ele[i].addEventListener(name, func, false)
                }
            } else {
                ele.addEventListener(name, func, false);
            }
        } : function(ele, name, func) {
            var i, l;
            if (ele.length) {
                for(i = 0, l = ele.length; i < l; i++) {
                    ele[i].attachEvent('on' + name, function() {
                        func.apply(ele, arguments);
                    });
                }
            } else {
                ele.attachEvent('on' + name, function() {
                    func.apply(ele, arguments);
                });
            }
        };
    })();


    function appendCss(cssText) {
        var style, node, css_text;
        if (isIE) {
            style = doc.createStyleSheet();
            style.cssText = cssText;
        } else {
            node = doc.createElement('style');
            node.setAttribute('type', 'text/css');
            css_text = doc.createTextNode(cssText);
            node.appendChild(css_text);
            doc.head.appendChild(node);
        }
    }

    function getComputedStyles(ele) {
        if(ele.currentStyle) {
            return ele.currentStyle;
        } else {
            return doc.defaultView.getComputedStyle(ele, null)
        }
    }

    function cleanObject(obj) {
        for(var prop in obj) {
            obj[prop] = null;
            try {
                delete obj[prop];
            } catch (e) {};
        }
    }

    function contains(arr, str) {
        var i, l;
        for(i = 0, l = arr.length; i<l; i++) {
            if (arr[i] == str) {
                return true;
            }
        }
        return false;
    }

    function hyphenate(str) {
        return str.replace(/[A-Z]/g, function(match){
            return ('-' + match.charAt(0).toLowerCase());
        });
    }

    function camelCase(str) {
        return str.replace(/-\D/g, function(match){
            return match.charAt(1).toUpperCase();
        });
    }

    function trim(str) {
        return str.replace(/^\s+|\s+$/g, '');
    }

    function now() {
        return new Date().getTime();
    }

    function getPosition(element, parent) {
        if (!parent) {
            parent = doc.body;
        }
        var p = element;
        var rl = rt = 0;
        try {
            while (p && p != parent) {
                rl += p.offsetLeft;
                rt += p.offsetTop;
                p = p.offsetParent;
            }
        } catch(e) {}
        return { 'left' : rl, 'top' : rt };
    }

    function clearResultContainer() {
        stylePropsList.innerHTML = '';
        cssPropsList.innerHTML = '';
        defaultPropsList.innerHTML = '';
    }

    function cutShort(msg) {
        if (msg.length > 23) {
            msg = msg.substring(0, 20) + '...';
        }
        return msg;
    }

    function showInfo(msg) {
        if (timer) {
            clearTimeout(timer);
        }
        errorMsg.innerHTML = cutShort(msg);
    }

    function showError(msg) {
        if (timer) {
            clearTimeout(timer);
        }
        errorMsg.innerHTML = cutShort(msg);
        timer = setTimeout(function() {
            errorMsg.innerHTML = '';
        }, 2000);
    }

    function handleStyleAdd() {
        var name = trim(addStyleName.value),
        value = trim(addStyleValue.value);
        if (endsWith(name, ':')) {
            name = name.replace(/\:$/g, '');
        }
        if (endsWith(value, ';')) {
            value = value.replace(/\;$/g, '');
        }
        if (/[A-Z]/.test(name)) {
            showError('请填写css样式名');
            return;
        }
        if (!contains(commonStyles, camelCase(name))) {
            showError('css名称有误或暂不支持');
            return;
        }
        if (!isValidValue('div', name, value)) {
            showError('css取值设置不合法');
            return;
        }
        if (name && value) {
            addStyleItem(name, camelCase(name), value, stylePropsList);
            addStyleName.value = '';
            addStyleValue.value = '';
            styleRuleAddTools.style.display = 'none';
            applyCss(camelCase(name), value);
            if (stylePropsList.style.display != 'block') {
                stylePropsList.style.display = 'block';
            }
        }
    }

    function endsWith(str, tail) {
        if (!str) {
            return false;
        }
        return str.indexOf(tail) == str.length - tail.length;
    }

    function getNodeInfo(node) {
        var msg = node.tagName.toLowerCase();
        if (node.id) {
            msg += '#' + node.id;
        } else if (node.className) {
            msg += '.' + node.className;
        }
        return msg;
    }

    function inspectDomElement(element) {
        if (!element) {
            showError('element is null');
            return;
        }

        var calStyle = getComputedStyles(element), propsByStyle = [], styleName, tagName = element.tagName || 'div',
            browserDefaultStyle = defaultBrowserStyles[tagName.toLowerCase()] || defaultBrowserStyles['div'],
            styleFragment = doc.createDocumentFragment(),
            defaultStylesfragment = doc.createDocumentFragment(),
            cssStylesfragment = doc.createDocumentFragment(),
            i, l;

        lookedElement = element;
        lookedElementOriginCssText = element.style.cssText;

        clearResultContainer();

        for (i = 0, l = commonStyles.length; i < l; i++) {
            styleName = commonStyles[i];
            if (element.style[styleName]) {
                propsByStyle.push(styleName);
                addStyleItem(hyphenate(styleName), styleName, element.style[styleName], styleFragment);
            }
        }
        stylePropsList.appendChild(styleFragment);

        for (i = 0, l = commonStyles.length; i < l; i++) {
            styleName = commonStyles[i];
            if (contains(propsByStyle, styleName)) {
                continue;
            }
            if (calStyle[styleName]) {
                if (calStyle[styleName] == browserDefaultStyle[styleName]) {
                    addStyleItem(hyphenate(styleName), styleName, calStyle[styleName], defaultStylesfragment);
                } else {
                    addStyleItem(hyphenate(styleName), styleName, calStyle[styleName], cssPropsList);
                }
            }
        }
        defaultPropsList.appendChild(defaultStylesfragment);
        cssPropsList.appendChild(cssStylesfragment);
        showInfo(getNodeInfo(lookedElement));
    }

    win.inspectDomElement = function() {
        inspectDomElement(arguments[0]);
        resultContainer.style.display = 'block';
        stylePropsList.style.display = 'block';
        defaultPropsList.style.display = 'none';
        cssPropsList.style.display = 'block';
        stylesTrigger.parentNode.style.display = 'block';
        defaultStylesTrigger.parentNode.style.display = 'block';
        cssStylesTrigger.parentNode.style.display = 'block';
        cssInspectorHideBtn.innerHTML = 'hide';
        if (isIE6 || isIE7) {
            inspectorNode.innerHTML = 'Find';
        } else {
            inspectorNode.innerHTML = '';
        }
        seeCssTrigger.style.display = 'block';
        inspecting = false;
    };
    
    function addStyleItem(style1, style2, value, target, head) {
        var ele = doc.createElement('div');
        ele.className = 'style-record-wrapper';
        ele.innerHTML = renderStyleItem(style1, style2, value);
        if (!head) {
            target.appendChild(ele);
        } else {
            target.insertBefore(ele, target.firstChild);
        }
    }

    function renderStyleItem(style1, style2, value) {
        return ['<span class="css-switcher" data-css-prop="', style2, '" css-disabled="">', 
                   '&radic;',
               '</span>',
               '<span class="css-name">',
                   '<span class="css-prop">', style1, '</span>',
               '</span>', 
               ': ', 
               '<span class="css-value">', 
                   '<span class="css-value" data-css-prop="', style2, '">', value, '</span>', 
               '</span>;'].join('');
    }

    function applyCss(prop, value) {
        var prop = prop ||input.linkedElement.getAttribute('data-css-prop'),
            value = value || input.value;
        if (!isValidValue('div', prop, value)) {
            return;
        }
        try {
            lookedElement.style[prop] = value;
        } catch (e) {
            showError(prop + ': ' + value + ' is invalid');
        }
    }

    function handleUpAndDownKeyEvent(dir) {
        var matched = /-?\d+(\.\d+)?/.exec(input.value),
            increment, neg;
        if (!matched) {
            return;
        }
        if (!matched[1]) {
            increment = 1;
            if (dir == 'down') {
                increment = -increment;
            }
            input.value = input.value.replace(matched[0], parseFloat(matched[0], 10) + increment);
            input.select();
        } else {
            increment = 0.1;
            if (matched[1].length == 3) {
                increment = 0.01;
            } else if (matched[1].length == 4) {
                increment = 0.001;
            }
            if (dir == 'down') {
                increment = -increment;
            }
            neg = parseFloat(matched[0]) < 0;
            if (!neg) {
                input.value = input.value.replace(matched[0], (parseInt(matched[0]) + parseFloat(matched[1], 10) + increment).toFixed(matched[1].length - 1));
            } else {
                input.value = input.value.replace(matched[0], (-parseInt(matched[0]) - parseFloat(parseFloat(matched[1]) - increment).toFixed(matched[1].length - 1)));
            }
        }
        applyCss();
    }

    function adjustInputWidth(input, value) {
        var width = value.length * 7;
        if (width < 50) {
            width = 50;
        }
        input.style.width = width + 'px';
    }

    function isValidValue(tagName, prop, value) {
        var slave;
        if (!value) {
            return true;
        }
        slave = slaves[tagName] || slaves['div'];
        try {
            /* 没有异常就ok了 */
            slave.style[prop] = value;
            return true;
        } catch (e) {
            return false;
        }
    }

    function getParentDivNode(ele) {
        while(ele.tagName) {
            if (ele.tagName.toLowerCase() != 'div') {
                ele = ele.parentNode;
                continue;
            }
            if (ele.id != 'defaultPropsList' && ele.id != 'stylePropsList' && ele.id != 'cssPropsList') {
                ele = ele.parentNode;
                continue;
            }
            break;
        }
        return ele;
    }

    function focusInputTo(element) {
        var pos = getPosition(element, resultContainer),
            parent = getParentDivNode(element),
            adjust;
        input.style.left = pos.left - 3 + 'px';
        adjust = 4;
        if (isIE6) {
            adjust = 2;
        }
        if (parent.scrollTop) {
            input.style.top = pos.top - parent.scrollTop - adjust + 'px';
        } else {
            input.style.top = pos.top - adjust + 'px';
        }
        input.style.display = 'block';
        adjustInputWidth(input, element.innerHTML);
        input.value = element.innerHTML;
        input.__bakValue = element.innerHTML;
        input.linkedElement = element;
        input.select();
        input.focus();
    }

    function stopEvent(e) {
        if (isIE) {
            e.returnValue = false;
			e.cancelBubble = true;	
        } else {
            e.preventDefault();
			e.stopPropagation();
        }
    }

    function $(id) {
        return doc.getElementById(id);
    }
    
    function getParentNode() {
        var parent = lookedElement.parentNode;
        if (!parent) {
            return parent;
        }

        if (parent.tagName.toLowerCase() != 'body') {
            return parent;
        }
        return null;
    }

    function getSibling(direction) {
        var sibling = lookedElement[direction + 'Sibling'];
        while(sibling && sibling.nodeType != 1 || sibling && contains(ignoreIds, sibling.id)) {
            sibling = sibling[direction + 'Sibling'];
        }
        return sibling;
    }

    function getChildNode() {
        var childs = lookedElement.childNodes, l = childs.length, i = 0;
        for (i = 0; i < l; i++) {
            if (childs[i].nodeType == 1) {
                return childs[i];
            }
        }
        return null;
    }

    function init() {
        var added = false, inspecting = false, hoveredElement = null;
            inspectorNode = $('inspector');

        /* 整个js都在用 */
        input = $('styleInputer'),
        resultContainer = $('resultContainer'),
        stylePropsList = $('stylePropsList'),
        defaultPropsList = $('defaultPropsList'),
        cssPropsList = $('cssPropsList'),
        stylesTrigger = $('stylesTrigger'),
        defaultStylesTrigger = $('defaultStylesTrigger'),
        cssStylesTrigger = $('cssStylesTrigger'),
        styleAddTrigger = $('styleAddTrigger'),
        seeCssTrigger = $('seeCssTrigger'),
        styleRuleAddTools = $('styleRuleAddTools'),
        addStyleOkBtn = $('addStyleOkBtn'),
        addStyleName = $('addStyleName'),
        addStyleValue = $('addStyleValue'),
        cssInspectorHideBtn = $('cssInspectorHideBtn'),
        cssInspectorCloseBtn = $('cssInspectorCloseBtn'),
        cssInspectorResetAllBtn = $('cssInspectorResetAllBtn'),
        domOperationTools = $('domOperationTools'),
        errorMsg = $('seeCssErrorMsg');

        compatModeFlag = doc.compatMode != "BackCompat";

        if (isIE6) {
            input.style.height = '18px';
        }

        addEvent(domOperationTools, 'click', function(e) {
            if (!lookedElement) {
                return;
            }
            var target = e.target || e.srcElement, node, className = target.className, msg;
            switch (className) {
                case 'findParentNode':
                    node = getParentNode();
                    msg = '已经到达顶部';
                    break;
                case 'findPreviousSibling':
                    node = getSibling('previous');
                    msg = '前面已经没有节点';
                    break;
                case 'findNextSibling':
                    node = getSibling('next');
                    msg = '后面已经没有节点';
                    break;
                case 'findChildNode':
                    node = getChildNode();
                    msg = '没有子节点';                    
            }
            if (!msg) {
                return;
            }
            if (node) {
                inspectDomElement(node);
                if (win.highlightDomNodeInTree) {
                    win.highlightDomNodeInTree(node);
                }
            } else {
                showError(msg);
            }
        });
        addEvent(cssInspectorResetAllBtn, 'click', function(e) {
            lookedElement.style.cssText = lookedElementOriginCssText;
            inspectDomElement(lookedElement);
        });

        addEvent(cssInspectorCloseBtn, 'click', function(e) {
            resultContainer.style.display = 'none';
        });

        addEvent(cssInspectorHideBtn, 'click', function(e) {
            var nodes = resultContainer.childNodes, i, l;
            if (cssInspectorHideBtn.innerHTML == 'hide') {
                cssInspectorHideBtn.innerHTML = 'show';
                for(i = 1, l = nodes.length; i < l; i++) {
                    nodes[i].style.display = 'none';
                }
            } else {
                cssInspectorHideBtn.innerHTML = 'hide';
                for(i = 1, l = nodes.length; i < l; i++) {
                    nodes[i].style.display = '';
                }
            }
        });

        addEvent(addStyleName, 'keyup', function(e) {
            var value = trim(addStyleName.value);
            if (endsWith(value, ':')) {
                addStyleName.value = value.replace(/:$/g, '');
                addStyleValue.focus();
            }
        });

        addEvent(addStyleValue, 'keyup', function(e) {
            stopEvent(e);
            if (e.keyCode == 13) {
                handleStyleAdd();
            }
        });

        addEvent(styleAddTrigger, 'click', function(e) {
            stopEvent(e);
            styleRuleAddTools.style.display = 'block';
            setTimeout(function() {
                addStyleName.focus();
            }, 100);
        });

        addEvent(seeCssTrigger, 'click', function(e) {
            if (resultContainer.style.display != 'none') {
                resultContainer.style.display = 'none';
            } else {
                resultContainer.style.display = 'block';
            }
        });

        addEvent(addStyleOkBtn, 'click', function(e) {
            stopEvent(e);
            handleStyleAdd();
        });

        addEvent([cssStylesTrigger, cssStylesTrigger.parentNode], 'click', function(e) {
            stopEvent(e);
            if (cssStylesTrigger.innerHTML == 'show') {
                cssPropsList.style.display = 'block';
                cssStylesTrigger.innerHTML = 'hide';
            } else {
                cssPropsList.style.display = 'none';
                cssStylesTrigger.innerHTML = 'show';
            }
        });

        addEvent([defaultStylesTrigger, defaultStylesTrigger.parentNode], 'click', function(e) {
            stopEvent(e);
            if (defaultStylesTrigger.innerHTML == 'show') {
                defaultPropsList.style.display = 'block';
                defaultStylesTrigger.innerHTML = 'hide';
            } else {
                defaultPropsList.style.display = 'none';
                defaultStylesTrigger.innerHTML = 'show';
            }
        });

        addEvent([stylesTrigger, stylesTrigger.parentNode], 'click', function(e) {
            stopEvent(e);
            if (stylesTrigger.innerHTML == 'show') {
                stylePropsList.style.display = 'block';
                stylesTrigger.innerHTML = 'hide';
            } else {
                stylePropsList.style.display = 'none';
                stylesTrigger.innerHTML = 'show';
            }
        });

        addEvent(input, 'blur', function() {
            input.style.display = 'none';
            if (input.style.color != 'sandybrown') {
                if (input.value) {
                    input.linkedElement.innerHTML = input.value;
                }
                applyCss();
            }
            input.style.color = '';
        }, false);

        addEvent(input, 'keydown', function(e) {
            var keyCode = e.keyCode;
            switch(keyCode) {
                case 38: 
                    handleUpAndDownKeyEvent('up');
                    break;
                case 40: 
                    handleUpAndDownKeyEvent('down');
                    break;
            }
        }, false);

        addEvent(input, 'keyup', function(e) {
            var keyCode = e.keyCode;
            switch(keyCode) {
                case 13: 
                    input.style.display = 'none';
                    if (input.style.color != 'sandybrown') {
                        input.linkedElement.innerHTML = input.value;
                        applyCss();
                    }
                    break;
                case 27:
                    input.style.display = 'none';
                    input.value = input.__bakValue;
                    applyCss();
                default:
                    adjustInputWidth(input, input.value);
                    if (!isValidValue('div', input.linkedElement.getAttribute('data-css-prop'), input.value)) {
                        input.style.color = 'sandybrown';
                    } else {
                        applyCss();
                        input.style.color = '';
                    }
            }
        }, false);

        addEvent(resultContainer, 'click', function(e) {
            var element = e.target || e.srcElement,
                parent = element.parentNode,
                prop, computed, i, l, valueSet = false;

            if (element.className === 'css-value') {
                focusInputTo(element);
                return;
            } 

            if (element.className != 'css-switcher') {
                return;
            }

            if (element.getAttribute('css-disabled') != 'true') {
                parent.__backBgColor = parent.style.backgroundColor;
                parent.style.backgroundColor = 'indianred';
                prop = element.getAttribute('data-css-prop');
                element.setAttribute('css-disabled', 'true');
                element.innerHTML = '&times;';

                if (lookedElement) {
                    lookedElement.__backStyle = lookedElement.__backStyle || {};
                    computed = getComputedStyles(lookedElement);

                    if (prop == 'border') {
                        lookedElement.__backStyle[prop] = [computed['borderColor'], ' ', 
                            computed['borderWidth'], ' ', computed['borderStyle']].join('');
                    } else {
                        lookedElement.__backStyle[prop] = computed[prop];
                    }
                    try {
                        /* 如果禁用了，则用浏览器默认样式 */
                        lookedElement.style[prop] = defaultBrowserStyles[lookedElement.tagName.toLowerCase()][prop];
                        valueSet = true;
                    } catch(e) {
                        valueSet = false;
                    }
                    /* 如果万一没有设置，则给几个尝试 */
                    if (!valueSet) {
                        for(i = 0, l = haveATry.length; i < l; i++) {
                            try {
                                lookedElement.style[prop] = haveATry[i];
                                break;
                            } catch(e) {continue;}
                        }
                    }
                }
            } else {
                prop = element.getAttribute('data-css-prop');
                element.setAttribute('css-disabled', '');
                element.innerHTML = '&radic;';
                parent.style.backgroundColor = parent.__backBgColor;
                parent.__backBgColor = null;
                if (lookedElement && lookedElement.__backStyle) {
                    lookedElement.style[prop] = lookedElement.__backStyle[prop];
                }
                try {
                    delete parent.__backBgColor;
                    delete lookedElement.__backStyle[prop];
                } catch (e) {}
            }
        }, false);

        function getNodeTreeInfo(target) {
            var msgs = [], counter = 0;
            while(target.tagName && target.tagName.toLowerCase() != 'body') {
                msgs.unshift(getNodeInfo(target));
                target = target.parentNode;
                counter ++;
                if (counter == 3) {
                    break;
                }
            }
            return '<span style="color:sandybrown;">' + msgs.join(' > ') + '</span>';
        }

        function getWindowScrollSize() {
            var width = 0, height = 0, el;

            if (compatModeFlag && (el = doc.documentElement) && (el.scrollHeight || el.scrollWidth)) {
                width = el.scrollWidth;
                height = el.scrollHeight;
            }
            
            if ((el = doc.body) && (el.scrollHeight || el.scrollWidth) &&
                    (el.scrollWidth > width || el.scrollHeight > height)) {
                width = el.scrollWidth;
                height = el.scrollHeight;
            }
            
            return {width: width, height: height};
        }

        var seecssMaskElement, hoveredElementBorder;
        addEvent(inspectorNode, 'click', function(e) {
            var lastTime, currentTime, size;

            if (win.hideDomLiteEverything) {
                win.hideDomLiteEverything();
            }

            if (win.hideLogLiteEverything) {
                win.hideLogLiteEverything();
            }

            stopEvent(e);
            resultContainer.style.display = 'none';
            inspectorNode.innerHTML = 'Inspecting';

            seeCssTrigger.style.display = 'none';

            stylePropsList.style.display = 'block';
            cssPropsList.style.display = 'block';
            defaultPropsList.style.display = 'none';

            stylesTrigger.innerHTML = 'hide';
            cssStylesTrigger.innerHTML = 'hide';
            defaultStylesTrigger.innerHTML = 'show';

            errorMsg.innerHTML = '';
            inspecting = true;

            var scrolled = getScrollTop();
            inspectorNode.style.top = scrolled + 100 + 'px';

            if (added) {
                return;
            }

            if (!seecssMaskElement) {
                seecssMaskElement = doc.createElement("div");
                seecssMaskElement.id = "SeeCssMask";
                seecssMaskElement.innerHTML = '<div id="hoveredElementBorder"></div>';
                doc.body.appendChild(seecssMaskElement);
                hoveredElementBorder = seecssMaskElement.firstChild;
            }

            hoveredElementBorder.style.display = 'none';
            size = getWindowScrollSize();
            seecssMaskElement.style.width = size.width + 'px';
            seecssMaskElement.style.height = size.height + 'px';
            added = true;

            lastTime = now();
            addEvent(doc, 'mousemove', function(e) {
                var target, msg;
                if (!inspecting) {
                    return;
                }
                currentTime = now();
                /* 减少查询频率，性能考虑 */
                if (currentTime - lastTime < 200) {
                    return;
                }
                lastTime = currentTime;
                seecssMaskElement.style.display = 'none';
                target = doc.elementFromPoint(e.clientX, e.clientY);
                seecssMaskElement.style.display = 'block';

                if (!hoveredElement) {
                    hoveredElement = target;
                    modifyPositionOfIndicator(target);
                }
                if (hoveredElement != target) {
                    hoveredElement = target;
                    modifyPositionOfIndicator(target);
                }

                msg = 'Inspecting ' + getNodeTreeInfo(target);
                inspectorNode.innerHTML = msg;

                var scrolled = getScrollTop();
                if (e.clientY < 60) {
                    inspectorNode.style.top = scrolled + 100 + 'px';
                } else {
                    inspectorNode.style.top = scrolled + 1 + 'px';
                }
            });

            function modifyPositionOfIndicator(target) {
                if (target == inspectorNode) {
                    return;
                }
                var pos = getPosition(target), 
                    adjust = compatModeFlag ? 2 : 0;
                hoveredElementBorder.style.display = 'block';
                hoveredElementBorder.style.width = target.offsetWidth - adjust + 'px';
                hoveredElementBorder.style.height = target.offsetHeight - adjust + 'px';
                hoveredElementBorder.style.left = pos.left + 'px';
                hoveredElementBorder.style.top = pos.top + 'px';
            }

            addEvent(doc, 'keydown', function(e) {
                if (inspecting && e.keyCode == 27) {
                    hoveredElement = null;
                    seecssMaskElement.style.display = 'none';
                    if (isIE6 || isIE7) {
                        inspectorNode.innerHTML = 'Find';
                    } else {
                        inspectorNode.innerHTML = '';
                    }
                    seeCssTrigger.style.display = 'block';
                    inspecting = false;
                    if (win.showLogLiteEverything) {
                        win.showLogLiteEverything(true);
                    }
                    if (win.showDomLiteEverything) {
                        win.showDomLiteEverything(true);
                    }
                }
            });

            addEvent(doc, 'click', function(e) {
                if (!inspecting) {
                    return;
                }
                seecssMaskElement.style.display = 'none';
                target = hoveredElement;
                hoveredElement = null;
                resultContainer.style.display = 'block';
                stylePropsList.style.display = 'block';
                defaultPropsList.style.display = 'none';
                cssPropsList.style.display = 'block';
                stylesTrigger.parentNode.style.display = 'block';
                defaultStylesTrigger.parentNode.style.display = 'block';
                cssStylesTrigger.parentNode.style.display = 'block';
                cssInspectorHideBtn.innerHTML = 'hide';
                if (isIE6 || isIE7) {
                    inspectorNode.innerHTML = 'Find';
                } else {
                    inspectorNode.innerHTML = '';
                }
                seeCssTrigger.style.display = 'block';
                inspecting = false;

                var scrolled = getScrollTop();
                inspectorNode.style.top = scrolled + 1 + 'px';
                if (!target) {
                    return;
                }
                inspectDomElement(target);

                if (win.showDomLiteEverything) {
                    win.showDomLiteEverything(target);
                }

                if (win.showLogLiteEverything) {
                    win.showLogLiteEverything();
                }
            });
        });
    }
    
    slavesContainer = doc.createElement('div');
    slavesContainer.id = 'seeCssSlavesContainer';
    slavesContainer.style.display = 'none';
    for(i = 0, l = slaveTags.length; i < l; i++) {
        slaves[slaveTags[i]] = doc.createElement(slaveTags[i]);
    }

    for (prop in slaves) {
        slavesContainer.appendChild(slaves[prop]);
    }

    function calculateComputedStyles(ele) {
        var computed = getComputedStyles(ele), result = {}, i, l;
        for (i = 0, l = commonStyles.length; i < l; i++) {
            result[commonStyles[i]] = computed[commonStyles[i]];
        }
        return result;
    }

    function storeDefaultStyles() {
        for(var slaveTag in slaves) {
            defaultBrowserStyles[slaveTag] = calculateComputedStyles(slaves[slaveTag]);
        }
    }

    function getScrollLeft(){
        var B, D;
        if (typeof pageXOffset!= 'undefined') {
            return pageXOffset;
        }
        B = doc.body;
        D = doc.documentElement;
        D = (D.clientWidth) ? D : B;
        return D.scrollLeft;
    }

    function getScrollTop(){
        var B, D;
        if (typeof pageYOffset!= 'undefined') {
            return pageYOffset;
        }
        B = doc.body;
        D = doc.documentElement;
        D = (D.clientHeight) ? D : B;
        return D.scrollTop;
    }
    
    if (isIE) {
        addEvent(win, 'load', function(e) {
            var div = doc.createElement('div'), container, inspector;
            div.innerHTML = bigHTML;
            doc.body.appendChild(div.firstChild);
            init();
            doc.body.appendChild(slavesContainer);
            storeDefaultStyles();
            appendCss(seeCssStyle);
            if (isIE7 || isIE6) {
                resultContainer.style.position = 'absolute';
                inspectorNode.style.position = 'absolute';
                inspectorNode.style.padding = '1px';
                inspectorNode.innerHTML = 'Find';
            }
            container = $('resultContainer');
            Drag.init(container.firstChild, container);
        });
        if (isIE7 || isIE6) {
            addEvent(win, 'scroll', function(e) {
                if (!resultContainer) {
                    return;
                }
                var scrolled = getScrollTop();
                resultContainer.style.top = scrolled + 30 + 'px';
                inspectorNode.style.top = scrolled + 1 + 'px';
            });
        }
    }

})(this, document);
