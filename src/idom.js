/**
 * iDOM dom结构查看工具
 *
 * @author 王致富 <wangjeaf@gmail.com, zhifu.wang@renren-inc.com>
 * @date   2012-9-6
 */
;;;(function(win, doc, undefined) {
    if (win.__iDomAdded) {
        return;
    }
    win.__iDomAdded = 1;

    var toplevel = false;
    try {
        toplevel = win.frameElement == null;
    } catch(e) {}
    if (!toplevel) {
        return;
    }

    var isIE = !!(win.attachEvent && !win.opera);

    if (!isIE) {
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

    html = [
        '<div id="domLiteContainer" style="display:none;">',
            '<div class="header">IDom',
                '<span id="domLiteInspectorCloseBtn">&times;</span>',
                '<span id="domLiteInspectorHideBtn">hide</span>',
                '<span id="domLiteInspectorReloadBtn">reset</span>',
            '</div>',
            '<div id="domlite-treeview-wrapper">',
                '<div id="domLiteTree">',
                    '<ul class="treeview">',
                        '<li class="collapsable lastCollapsable">',
                            '<div class="hitarea collapsable-hitarea lastCollapsable-hitarea"></div>',
                            '<div class="infoarea" data-node-index="0"><span>&lt;html&gt;</span></div>',
                            '<ul style="display:;" data-domlite-expanded="true">',
                                '<li class="expandable">',
                                    '<div class="hitarea expandable-hitarea"></div>',
                                    '<div class="infoarea" data-node-index="1"><span>&lt;head&gt;</span></div>',
                                    '<ul style="display:none;"></ul>',
                                '</li>',
                                '<li class="expandable lastExpandable">',
                                    '<div class="hitarea expandable-hitarea lastExpandable-hitarea"></div>',
                                    '<div class="infoarea" data-node-index="2"><span>&lt;body&gt;</span></div>',
                                    '<ul style="display:none;" id="domLite-body-ul"></ul>',
                                '</li>',
                            '</ul>',
                        '</li>',
                    '</ul>',
                '</div>',
                '<div id="rightClickTools" style="display:none;">',
                    '<div class="domlite-inspect-tools inspect-dom">Inspect DOM</div>',
                    '<div class="domlite-inspect-tools inspect-css">Inspect CSS</div>',
                '</div>',
            '</div>',
            '<div id="domInspectorDataContainer">',
                '<table cellpadding="0" cellspacing="0">',
                    '<tr>',
                        '<td style="color:green;font-weight:bold;">nothing</td>',
                        '<td>nothing</td>',
                    '</tr>',
                '</table>',
            '</div>',
            '<div id="domInspectorDataContainerTrigger">&lt;&lt;&lt;</div>',
        '</div>'
    ].join(''),

    domLiteTriggerHTML = '<div id="domLiteTrigger">IDom</div>',

    zIndex = 3000000,
    domLiteStyle = [
        '.treeview, .treeview ul { padding: 0; margin: 0; list-style: none; }',
        '.treeview ul { background-color: white; margin-top: 4px; }',
        '.treeview .hitarea {background: url(http://s.xnimg.cn/test/foropm/treeview-default.gif) -64px -25px no-repeat; height: 16px; width: 16px; margin-left: -16px; float: left; cursor: pointer; }',
        '.treeview .infoarea { cursor: pointer; }',
        '* html .hitarea { display: inline; float:none; }',
        '.treeview li { margin: 0; padding: 3px 0pt 3px 16px; }',
        '.treeview li { background: url(http://s.xnimg.cn/test/foropm/treeview-default-line.gif) 0 0 no-repeat; }',
        '.treeview li.collapsable, .treeview li.expandable { background-position: 0 -176px;white-space:nowrap;}',
        '.treeview .expandable-hitarea { background-position: -80px -3px; }',
        '.treeview li.last { background-position: 0 -1766px }',
        '.treeview li.lastCollapsable, .treeview li.lastExpandable { background-image: url(http://s.xnimg.cn/test/foropm/treeview-default.gif); }',  
        '.treeview li.lastCollapsable { background-position: 0 -111px;white-space:nowrap; }',
        '.treeview li.lastExpandable { background-position: -32px -67px;white-space:nowrap; }',
        '.treeview div.lastCollapsable-hitarea, .treeview div.lastExpandable-hitarea { background-position: 0 1;}',
        '.treeview div.infoarea {display:inline-block;*zoom:1;*display:inline;}',
        '.treeview div.infoarea span{color:blue;}',
        '.domlite-inspect-tools { padding:3px 5px; color:black; text-decoration:none; outline:none; cursor:pointer; }',
        '.domlite-inspect-tools:hover { background-color:#F1F4FA; }',
        '#rightClickTools {position:absolute;display:none;left:0px;top:0px;border:1px solid gray;background-color:white;}',
        '#domlite-treeview-wrapper {width:700px;*width:695px;height:470px;overflow:auto;white-space:nowrap;position:relative;}',
        '#domLiteContainer { font-family: sans-serif, Verdana, helvetica, arial; font-size: 12px; background: #fff; color: #333; border:2px solid #ADB6C9;width:700px;position:relative;height:500px;overflow:hidden;white-space:nowrap;position:absolute;top:10px;left:20px;z-index:', zIndex, ';}',
        '#domLiteContainer .header {background-color:#F1F4FA;height:25px;line-height:25px;font-weight:bold;padding-left:5px;color:#787878;font-size:14px;cursor:move;}',
        '#domLiteInspectorHideBtn, #domLiteInspectorReloadBtn, #domLiteInspectorCloseBtn {position:absolute;color:#A9ADB9;cursor:pointer;font-size:12px;font-weight:bold;right:10px;*margin-top:-3px;}',
        '#domLiteInspectorHideBtn {right:30px;}',
        '#domLiteInspectorReloadBtn {right:70px;}',
        '#domInspectorDataContainer { z-index:', zIndex, '; position:absolute; right: 30px; top: 30px; border:2px solid #ADB6C9; height:400px; overflow-y:auto; overflow-x:hidden; background-color:white; display:none; }',
        '#domInspectorDataContainerTrigger { z-index:', zIndex, '; position:absolute; right:30px; top:30px; border:2px solid #ADB6C9; background-color:white; cursor:pointer; }',
        '#domLiteTrigger {position:fixed;_position:absolute;color:#A9ADB9;cursor:pointer;font-size:12px;border:1px solid gray;font-weight:bold;right:56px;top:1px;border:2px solid #ADB6C9;height:20px;line-height:20px;padding:1px;z-index:', zIndex + 20, ';background-color:#F1F4FA;}',
        '#domInspectorDataContainer table { width:600px; font-family:sans-serif, Verdana, helvetica, arial; font-size:12px;}'
    ].join(''),

    ignoreIds = ['domLiteContainer', 'SeeCss', 'logLiteWrapper','domLiteTrigger', 'seeCssSlavesContainer', 'SeeCssMask'],
    slaveDiv = doc.createElement('div'),
    nodeCacheList = [],
    globalNodeCacheIndex = 0,
    backupContent = '', backupDefaultDataList,

    doHide = null, doShow = null,
    shouldCut = true,

    nodeParentList = null,

    addEvent = (function() {
        return doc.addEventListener ? function(ele, name, func) {
            ele.addEventListener((name), func, false);
        } : function(ele, name, func) {
            ele.attachEvent('on' + name, function() {
                func.apply(ele, arguments);
            });
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

    function findSibling(e, cond) {
        var ele = e;
        while(ele = ele.nextSibling) {
            if (cond(ele)) {
                return ele;
            }
        }
        return null;
    }

    function findParent(e, cond) {
        var ele = e;
        while(ele = ele.parentNode) {
            if (cond(ele)) {
                return ele;
            }
        }
        return null;
    }

    function findParentLi(e) {
        return findParent(e, function(ele) {return ele.tagName && ele.tagName.toLowerCase() == 'li';});
    }

    function findSiblingUl(e) {
        return findSibling(e, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() == 'ul';
        });
    }

    function $(id) {
        return doc.getElementById(id);
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

    function trim(str) {
        if (!str) {
            return str;
        }
        return str.replace(/^\s+|\s$/g, '');
    }

    function init() {
        var tree = $('tree'),
            domLiteContainer = $('domLiteContainer'),
            rightClickTools = $('rightClickTools'),
            domLiteTree = $('domLiteTree'),
            inspectingElement = null,
            lastInspectingElement,
            domInspectorDataContainer = $('domInspectorDataContainer'),
            domLiteInspectorCloseBtn = $('domLiteInspectorCloseBtn'),
            domLiteInspectorHideBtn = $('domLiteInspectorHideBtn'),
            domLiteInspectorReloadBtn = $('domLiteInspectorReloadBtn'),
            domLiteTrigger = $('domLiteTrigger'),
            contentWrapper = $('domlite-treeview-wrapper'),
            domInspectorDataContainerTrigger = $('domInspectorDataContainerTrigger');
            
        doHide = function() {
            domLiteInspectorHideBtn.innerHTML = 'show';
            domLiteTree.style.display = 'none';
            domInspectorDataContainerTrigger.style.display = 'none';
            domInspectorDataContainer.style.display = 'none';
            domLiteContainer.style.height = '25px';
        };

        doShow = function() {
            domLiteInspectorHideBtn.innerHTML = 'hide';
            domLiteTree.style.display = '';
            domInspectorDataContainerTrigger.style.display = '';
            domInspectorDataContainer.style.display = '';
            domLiteContainer.style.height = 'auto';
            domLiteContainer.style.display = 'block';
        };

        backupContent = backupContent || domLiteTree.innerHTML;
        backupDefaultDataList = backupDefaultDataList || domInspectorDataContainer.innerHTML;

        domLiteContainer.oncontextmenu = function() {
            return false;
        };

        function reset(clear) {
            if (clear) {
                initNodeCacheList();
                if (nodeParentList) {
                    nodeParentList.length = 0;
                }
                domLiteTree.innerHTML = backupContent;
                domInspectorDataContainer.innerHTML = backupDefaultDataList;
                domLiteTrigger.style.display = 'block';
            }
            doShow();
        }

        function hideDomLiteContainer() {
            //domLiteTree.innerHTML = '';
            //domInspectorDataContainer.innerHTML = '';
            domLiteContainer.style.display = 'none';
        }

        function hideDomLiteEverything() {
            hideDomLiteContainer();
            domLiteTrigger.style.display = 'none';
        }

        win.hideDomLiteEverything = hideDomLiteEverything;

        addEvent(domLiteInspectorCloseBtn, 'click', hideDomLiteContainer);

        addEvent(domLiteInspectorReloadBtn, 'click', function() {
            reset(false);
        });

        addEvent(domLiteTrigger, 'click', function() {
            if (domLiteContainer.style.display != 'none') {
                domLiteInspectorHideBtn.innerHTML = 'hide';
                domLiteTree.style.display = '';
                domInspectorDataContainerTrigger.style.display = '';
                domInspectorDataContainer.style.display = '';
                domLiteContainer.style.height = 'auto';
                domLiteContainer.style.display = 'none';
            } else {
                domLiteContainer.style.display = 'block';
                if (!domLiteTree.innerHTML) {
                    domLiteTree.innerHTML = backupContent;
                    domInspectorDataContainer.innerHTML = backupDefaultDataList;
                }
            }
        });

        addEvent(domLiteInspectorHideBtn, 'click', function() {
            if (domLiteInspectorHideBtn.innerHTML == 'hide') {
                doHide();
            } else {
                doShow();
            }
        });

        addEvent(domLiteContainer, 'mousedown', function(e) {
            if(e.button != 2) {
                return;
            }
            var target = e.srcElement || e.target, parentNode;
            if (target.className == 'infoarea') {
                inspectingElement = target;
            } else {
                parentNode = findParentNodeByClassName(target, 'infoarea');
                if (parentNode) {
                    inspectingElement = parentNode;
                } else {
                    return;
                }
            }
            var pos = getPosition(contentWrapper);
            rightClickTools.style.left = e.clientX + contentWrapper.scrollLeft - pos.left + 'px';
            rightClickTools.style.top = e.clientY + contentWrapper.scrollTop - pos.top + 'px';
            rightClickTools.style.display = 'block';
        });

        addEvent(win, 'scroll', function() {
            domLiteContainer.style.top = getScrollTop() + 'px';
        });

        addEvent(domLiteContainer, 'scroll', function() {
            domInspectorDataContainer.style.top = domLiteContainer.scrollTop + 30 + 'px';
            domInspectorDataContainerTrigger.style.top = domLiteContainer.scrollTop + 30 + 'px'
        });

        addEvent(domInspectorDataContainerTrigger, 'click', function() {
            if (domInspectorDataContainerTrigger.innerHTML == '&gt;&gt;&gt;') {
               domInspectorDataContainer.style.display = 'none';
               domInspectorDataContainerTrigger.innerHTML = '&lt;&lt;&lt;';
            } else {
               domInspectorDataContainer.style.display = 'block';
               domInspectorDataContainerTrigger.innerHTML = '&gt;&gt;&gt;';
            }
        });

        function getParentNodeTree(target) {
            if (target == doc.body) {
                return null;
            }
            var result = [target],
                parent = target.parentNode,
                body = doc.body;
            while(parent && parent != body) {
                result[result.length] = parent;
                parent = parent.parentNode;
            }
            result = result.reverse();
            return result;
        }

        function highlightElement(element) {
            if (lastInspectingElement) {
                lastInspectingElement.style.backgroundColor = 'white';
            }
            element.style.backgroundColor = '#ADB6C9';
            lastInspectingElement = element;
        }

        function showDomLiteEverything(target) {
            if (target === true) {
                domLiteTrigger.style.display = 'block';
                return;
            }
            reset(true);
            nodeParentList = getParentNodeTree(target);
            var ul = $('domLite-body-ul');
            ul.style.display = 'block';
            for(var i = 0, l = nodeParentList.length; i < l; i++) {
                nodeCacheList[globalNodeCacheIndex] = nodeParentList[i];
                addExpandableSubNode(ul, getNodeInfoHTML(nodeParentList[i]), globalNodeCacheIndex, 
                    !hasNextSibling(nodeParentList[i]), true);
                globalNodeCacheIndex ++;

                ul = ul.getElementsByTagName('ul')[0];
            }
            
            inspectingElement = getSibling(ul, 'previous');
            highlightElement(inspectingElement);
            
        }

        win.showDomLiteEverything = showDomLiteEverything;

        win.highlightDomNodeInTree = function(node) {
            for(var i = 0, l = nodeCacheList.length; i < l; i++) {
                if (node == nodeCacheList[i]) {
                    break;
                }
            }
            var element = document.getElementById('dataNodeIndex' + i);
            if (element) {
                highlightElement(element);
            } else {
                console.warn(getNodeDesc(node) + '节点还没有展开，手动展开节点才能在iDOM中高亮显示');
            }
        };

        function getNodeDesc(node) {
            var msg = node.tagName.toLowerCase();
            if (node.id) {
                msg += '#' + node.id;
            } else if (node.className) {
                msg += '.' + node.className;
            }
            return msg;
        }

        addEvent(domLiteContainer, 'click', function(e) {
            if (e.button == 2) {
                return;
            }
            var target, className, ul, index, parent, parentIsInfoArea;
            if (rightClickTools.style.display != 'none') {
                rightClickTools.style.display = 'none';
            }
            target = e.srcElement || e.target;
            className = target.className;
            parent = target.parentNode;
            parentIsInfoArea = parent && parent.className.indexOf('infoarea') != -1;
            if (className.indexOf('hitarea') != -1 || className.indexOf('infoarea') != -1 || parentIsInfoArea) {
                if (className.indexOf('infoarea') != -1) {
                    target = getSibling(target, 'previous');
                    className = target.className;
                } else if (parentIsInfoArea) {
                    target = getSibling(target.parentNode, 'previous');
                    className = target.className;
                }
                if (className.indexOf('collapsable-hitarea') != -1) {
                    openToClose(target);
                } else if (className.indexOf('expandable-hitarea') != -1) {
                    closeToOpen(target);
                }
                ul = findSiblingUl(target);
                if (!ul) {
                    return;
                }
                if (ul.getAttribute('data-domlite-expanded') != 'true') {
                    ul.setAttribute('data-domlite-expanded', 'true');
                    retrieveChildNodes(getSibling(target, 'next'), ul);
                }
            } else if (className.indexOf('inspect-') != -1) {
                if (className.indexOf('inspect-dom') != -1) {
                    index = inspectingElement.getAttribute('data-node-index');
                    domInspectorDataContainer.innerHTML = getAttributeListStr(nodeCacheList[index]);
                    domInspectorDataContainer.style.display = 'block';
                    domInspectorDataContainerTrigger.innerHTML = '&gt;&gt;&gt;';
                } else if (className.indexOf('inspect-css') != -1){
                    if (win.inspectDomElement) {
                        highlightElement(inspectingElement);
                        index = inspectingElement.getAttribute('data-node-index');
                        win.inspectDomElement(nodeCacheList[index]);
                        //doHide();
                    }
                }
            }
        }, false);
    }

   function addExpandableSubNode(node, text, index, isLast, forceShow) {
       var className = forceShow ? 'collapsable' : 'expandable',
           lastClassName = forceShow ? ' lastCollapsable' : ' lastExpandable',
           display = forceShow ? 'block' : 'none';
           html;
       var html = ['<li class="', className, '', (isLast ? lastClassName: ''), '">', 
                    '<div class="hitarea ', className, '-hitarea', (isLast ? (lastClassName + '-hitarea') : ''), '"></div>',
                    '<div class="infoarea" id="dataNodeIndex', index , '" data-node-index="', index, '">', text, '</div>', 
                    '<ul style="display:', display, ';">',
                    '</ul>',
               '</li>'].join('');
       slaveDiv.innerHTML = html;
       node.appendChild(slaveDiv.firstChild);
    }

    var iNeedProps = ['id', 'name', 'type', 'className', 'class', 'style', 'value', 'title', 'rel', 'href', 'src'];
    function getNodeInfoHTML(node) {
        var msg = ['<span>&lt;', node.tagName.toLowerCase()];
        for(var i = 0, prop, l = iNeedProps.length; i < l; i++) {
            prop = iNeedProps[i];
            if (prop == 'style') {
                if (trim(node.style.cssText) != "") {
                    msg.push(' ');
                    msg.push('style="<span style="color:red;">');
                    msg.push(cutShort(node.style.cssText, 30, 'red').toLowerCase());
                    msg.push('</span>"');
                }
                continue;
            }
            if (node[prop]) {
                msg.push(' ');
                msg.push(prop == 'className' ? 'class' : prop);
                msg.push('="<span style="color:red;">');
                msg.push(cutShort(node[prop], 30, 'red'));
                msg.push('</span>"');
            }
        }
        msg.push('&gt;</span>');
        return msg.join('');
    }

    function openToClose(e) {
        var ul = findSiblingUl(e), li = findParentLi(e), newClassName;
        newClassName = li.className;
        newClassName = newClassName.replace('collapsable', 'expandable');
        li.className = newClassName.replace('lastCollapsable', 'lastExpandable');

        if (ul) {
            ul.style.display = 'none';
        }
        newClassName = e.className;
        newClassName = newClassName.replace('collapsable-hitarea', 'expandable-hitarea');
        if (newClassName.indexOf('lastCollapsable-hitarea') != -1) {
            newClassName = newClassName.replace('lastCollapsable-hitarea', 'lastExpandable-hitarea');
        }
        e.className = newClassName;
    }

    function closeToOpen(e) {
        var ul = findSibling(e, function(ele) {
                return ele.tagName && ele.tagName.toLowerCase() == 'ul';
            }), 
            newClassName;
        if (ul) {
            ul.style.display = '';
        }
        li = findParentLi(e);
        newClassName = li.className;
        newClassName = newClassName.replace('expandable', 'collapsable');
        li.className = newClassName.replace('lastExpandable', 'lastCollapsable');

        newClassName = e.className;
        newClassName = newClassName.replace('expandable-hitarea', 'collapsable-hitarea');
        if (newClassName.indexOf('lastExpandable-hitarea') != -1) {
            newClassName = newClassName.replace('lastExpandable-hitarea', 'lastCollapsable-hitarea');
        }
        e.className = newClassName;
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

    function findParentNodeByClassName(node, className) {
        var parent = node;
        while(parent) {
            if (!parent.className || parent.className.indexOf(className) == -1) {
                parent = parent.parentNode;
                continue;
            }
            return parent;
        }
        return null;
    }

    function getSibling(ele, direction) {
        var sibling = ele[direction + 'Sibling'];
        while(sibling && sibling.nodeType != 1) {
            sibling = sibling[direction + 'Sibling'];
        }
        return sibling;
    }

    function hasNextSibling(node) {
        var next = getSibling(node, 'next');
        return next && next.id != 'domLiteContainer';
    }

    function retrieveChildNodes(targetInTree, ul) {
        var index = targetInTree.getAttribute('data-node-index'),
            targetInDom = nodeCacheList[index];
        if (!targetInDom) {
            alert('index ' + index + ' error');
            return;
        }
        var subNode = targetInDom.firstChild;
        if (!subNode) {
            var parent = targetInTree.parentNode;
            parent.removeChild(getSibling(targetInTree, 'next'));
            parent.className = '';
            getSibling(targetInTree, 'previous').className = '';
            return;
        }

        for(; subNode; subNode = subNode.nextSibling) {
            var id = subNode.id;
            if (contains(ignoreIds, id)) {
                continue;
            }
            if (nodeParentList && nodeParentList.indexOf(subNode) != -1) {
                continue;
            }
            if (subNode.nodeType == 1) {
                nodeCacheList[globalNodeCacheIndex] = subNode;
                addExpandableSubNode(ul, getNodeInfoHTML(subNode), globalNodeCacheIndex, !hasNextSibling(subNode, 'next'));
                globalNodeCacheIndex ++;
            } else if (subNode.nodeType == 3) {
                var text = trim(subNode.textContent || subNode.innerText || subNode.nodeValue);
                if (text) {
                    nodeCacheList[globalNodeCacheIndex] = subNode;
                    addExpandableSubNode(ul, text, globalNodeCacheIndex, !hasNextSibling(subNode, 'next'));
                    globalNodeCacheIndex ++;
                }
            }
        }
    }

    var reg = /[a-z0-9]/,
        filterList = ['innerHTML', 'outerHTML', 'innerText', 'outerText'];

    function getAttributeListStr(node) {
        var nodeType = node.nodeType, props = [], prop;
        for(prop in node) {
            try {
                var a = node[prop];
            } catch(e) {
                continue;
            }
            if (!node[prop] || !reg.test(prop) || contains(filterList, prop) 
                || nodeType != 3 && prop == 'textContent') {
                continue;
            }
            props.push(prop);
        }

        props.sort();

        var result = ['<table cellpadding="0" cellspacing="0" style="font-size:12px;">'];
        for(var i = 0, l = props.length; i < l; i++) {
            var key = prop = props[i], value = cutShort(String(node[prop]), 30);
            if (typeof node[prop] == 'function') {
                value = '<span style="color:green;">function() {}</span>';
            } else if (typeof node[prop] == 'string') {
                value = '<span style="color:red;">"' + value + '"</span>';
            } else if (typeof node[prop] == 'number' || typeof node[prop] == 'boolean') {
                value = '<span style="color:blue;">' + value + '</span>';
            }
            result.push('<tr><td style="color:green;font-weight:bold;">');
            result.push(key);
            result.push('</td><td style="padding-left:10px;">');
            result.push(value);
            result.push('</td></tr>');
        }
        result.push('</table>');
        return result.join('');
    }

    function cutShort(prop, len, color) {
        if (shouldCut) {
            return prop.length > len ? '<span title="' + prop + '"' + (color ? ' style="color:' + color + '"' : '')+ '>' + prop.substring(0, len) + '...</span>' : prop;
        } else {
            return prop;
        }
    }

    function initNodeCacheList() {
        globalNodeCacheIndex = 0;
        nodeCacheList.length = 0;
        nodeCacheList[globalNodeCacheIndex++] = document.documentElement;
        nodeCacheList[globalNodeCacheIndex++] = document.head || document.getElementsByTagName('head')[0];
        nodeCacheList[globalNodeCacheIndex++] = document.body || document.getElementsByTagName('body')[0];
    }

    addEvent(win, 'load', function() {
        initNodeCacheList();

        appendCss(domLiteStyle);
        slaveDiv.innerHTML = html;
        document.body.appendChild(slaveDiv.firstChild);
        slaveDiv.innerHTML = domLiteTriggerHTML;
        document.body.appendChild(slaveDiv.firstChild);

        init();
        var container = $('domLiteContainer');
        Drag.init(container.firstChild, container);
    });

})(this, document);
