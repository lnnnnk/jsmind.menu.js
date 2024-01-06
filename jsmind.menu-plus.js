(function ($w) {
  var JsMind = $w["jsMind"];
  var __name__ = "ctxMenu";
  if (!JsMind || JsMind[__name__]) return;

  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++)
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
    return to.concat(ar || Array.prototype.slice.call(from));
  }
  typeof SuppressedError === "function"
    ? SuppressedError
    : function (error, suppressed, message) {
      var e = new Error(message);
      return (
        (e.name = "SuppressedError"),
        (e.error = error),
        (e.suppressed = suppressed),
        e
      );
    };
  function getProp(prop) {
    return typeof prop === "function" ? prop() : prop;
  }
  function itemIsInteractive(item) {
    return itemIsAction(item) || itemIsSubMenu(item);
  }
  function itemIsAction(item) {
    return item.hasOwnProperty("action");
  }
  function itemIsDivider(item) {
    return item.hasOwnProperty("isDivider");
  }
  function itemIsSubMenu(item) {
    return item.hasOwnProperty("subMenu");
  }
  function onHoverDebounced(target, action) {
    var timeout;
    target.addEventListener("mouseenter", function (e) {
      timeout = setTimeout(function () {
        return action(e);
      }, 150);
    });
    target.addEventListener("mouseleave", function () {
      return clearTimeout(timeout);
    });
  }
  function isDisabled(item) {
    return (
      getProp(item.disabled) ||
      (itemIsSubMenu(item) &&
        typeof item.subMenu !== "function" &&
        item.subMenu.length === 0)
    );
  }
  function excludeHide(menuItems, selectedNode) {
    // 根据selectedNode的类型过滤
    if (!Array.isArray(menuItems)) return [];
    const meetMenuItems = [];
    for (var i = 0; i < menuItems.length; i++) {
      if (
        !menuItems[i].hide ||
        typeof menuItems[i].hide === 'function' &&
        !menuItems[i].hide(selectedNode)
      ) {
        meetMenuItems.push(menuItems[i]);
      }
    }
    return meetMenuItems;
  }
  function generateMenuItem(item, jm) {
    var _this = this;
    var li = document.createElement("li");
    if (itemIsDivider(item)) {
      li.className = "divider";
      return li;
    }
    generateBaseItemContent(item, li);
    if (!itemIsInteractive(item)) {
      li.classList.add("heading");
      return li;
    }
    if (isDisabled(item)) {
      li.classList.add("disabled");
      if (itemIsSubMenu(item)) li.classList.add("submenu");
      return li;
    }
    li.classList.add("interactive");
    if (itemIsAction(item)) {
      li.addEventListener("click", function () {
        item.action(jm, item.text);
      });
      return li;
    }
    li.classList.add("submenu");
    return li;
  }
  function generateBaseItemContent(item, li) {
    var html = getProp(item.html);
    var text = "<span>".concat(getProp(item.text), "</span>");
    var elem = getProp(item.element);
    elem ? li.append(elem) : (li.innerHTML = html ? html : text);
    li.title = getProp(item.tooltip) || "";
    if (item.style) li.setAttribute("style", getProp(item.style));
  }
  var hdir = "r";
  var vdir = "d";
  function resetDirections() {
    hdir = "r";
    vdir = "d";
  }
  function setPosition(container, parentOrEvent) {
    var scale = getScale();
    var _a = window.visualViewport,
      width = _a.width,
      height = _a.height;
    Object.assign(container.style, {
      maxHeight: height / scale.y + "px",
      maxWidth: width / scale.x + "px",
    });
    var rect = getUnmountedBoundingRect(container);
    rect.width = Math.trunc(rect.width) + 1;
    rect.height = Math.trunc(rect.height) + 1;
    var pos = {
      x: 0,
      y: 0,
    };
    if (parentOrEvent instanceof Element) {
      var _b = getBoundingRect(parentOrEvent),
        x = _b.x,
        width_1 = _b.width,
        y = _b.y;
      pos = {
        x: hdir === "r" ? x + width_1 : x - rect.width,
        y: y,
      };
      if (parentOrEvent.className.includes("submenu"))
        // 这里会给子菜单一个上下的偏移量
        // pos.y += vdir === "d" ? 4 : -12;
        pos.y += vdir === "d" ? -3 : 3;
      var safePos = getPosition(rect, pos);
      if (pos.x !== safePos.x) {
        hdir = hdir === "r" ? "l" : "r";
        pos.x = hdir === "r" ? x + width_1 : x - rect.width;
      }
      if (pos.y !== safePos.y) {
        vdir = vdir === "u" ? "d" : "u";
        pos.y = safePos.y;
      }
      pos = getPosition(rect, pos);
    } else {
      var hasTransform = document.body.style.transform !== "";
      var body = hasTransform
        ? document.body.getBoundingClientRect()
        : {
          x: 0,
          y: 0,
        };
      pos = getPosition(rect, {
        x: (parentOrEvent.clientX - body.x) / scale.x,
        y: (parentOrEvent.clientY - body.y) / scale.y,
      });
    }
    Object.assign(container.style, {
      left: pos.x + "px",
      top: pos.y + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });
  }
  function getPosition(rect, pos) {
    var _a = window.visualViewport,
      width = _a.width,
      height = _a.height;
    var hasTransform = document.body.style.transform !== "";
    var _b = hasTransform
      ? document.body.getBoundingClientRect()
      : {
        left: 0,
        top: 0,
      },
      left = _b.left,
      top = _b.top;
    var scale = getScale();
    var minX = -left / scale.x;
    var minY = -top / scale.y;
    var maxX = (width - left) / scale.x;
    var maxY = (height - top) / scale.y;
    return {
      x:
        hdir === "r"
          ? pos.x + rect.width > maxX
            ? maxX - rect.width
            : pos.x
          : pos.x < minX
            ? minX
            : pos.x,
      y:
        vdir === "d"
          ? pos.y + rect.height > maxY
            ? maxY - rect.height
            : pos.y
          : pos.y < minY
            ? minY
            : pos.y,
    };
  }
  function getUnmountedBoundingRect(elem) {
    var container = elem.cloneNode(true);
    container.style.visibility = "hidden";
    document.body.appendChild(container);
    var result = getBoundingRect(container);
    document.body.removeChild(container);
    return result;
  }
  function getBoundingRect(elem) {
    var x = elem.offsetLeft,
      y = elem.offsetTop,
      height = elem.offsetHeight,
      width = elem.offsetWidth;
    if (elem.offsetParent instanceof HTMLElement) {
      var parent_1 = getBoundingRect(elem.offsetParent);
      return {
        x: x + parent_1.x,
        y: y + parent_1.y,
        width: width,
        height: height,
      };
    }
    return {
      x: x,
      y: y,
      width: width,
      height: height,
    };
  }
  function getScale() {
    var body = document.body;
    var rect = body.getBoundingClientRect();
    const rectWidth = rect.width || 1;
    const rectHeight = rect.height || 1;
    return {
      x: rectWidth / (body.offsetWidth || rectWidth),
      y: rectHeight / (body.offsetHeight || rectHeight),
    };
  }

  var defaultStyles =
    'html{min-height:100%}.ctxmenu{position:fixed;border:1px solid #999;padding:2px 0;box-shadow:#aaa 3px 3px 3px;background:#fff;margin:0;z-index:9999;overflow-y:auto;font:15px Verdana, sans-serif;box-sizing:border-box}.ctxmenu li{margin:1px 0;display:block;position:relative;user-select:none}.ctxmenu li.heading{font-weight:bold;margin-left:-5px}.ctxmenu li span{display:block;padding:2px 20px;cursor:default}.ctxmenu li a{color:inherit;text-decoration:none}.ctxmenu li.icon{padding-left:15px}.ctxmenu img.icon{position:absolute;width:18px;left:10px;top:2px}.ctxmenu li.disabled{color:#ccc}.ctxmenu li.divider{border-bottom:1px solid #aaa;margin:5px 0}.ctxmenu li.interactive:hover{background:rgba(0, 0, 0, .1)}.ctxmenu li.submenu::after{content:"";position:absolute;display:block;top:0;bottom:0;right:.4em;margin:auto .1rem auto auto;border-right:1px solid #000;border-top:1px solid #000;transform:rotate(45deg);width:.3rem;height:.3rem}.ctxmenu li.submenu.disabled::after{border-color:#ccc}';
  /*! ctxMenu v1.6.1 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/
  var ContextMenu = (function () {
    function ContextMenu(jm) {
      var _this = this;
      this.jm = jm;
      this.preventCloseOnScroll = false;
      window.addEventListener("click", function (ev) {
        var item = ev.target instanceof Element && ev.target.parentElement;
        if (item && item.className === "interactive") return;
        _this.hide();
      });
      window.addEventListener("resize", function () {
        return void _this.hide();
      });
      var timeout = 0;
      window.addEventListener(
        "wheel",
        function () {
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            if (_this.preventCloseOnScroll) {
              _this.preventCloseOnScroll = false;
              return;
            }
            _this.hide();
          });
        },
        {
          passive: true,
        }
      );
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape") _this.hide();
      });
      ContextMenu.addStylesToDom();
    }

    ContextMenu.newInstance = function (jm) {
      var instance = new ContextMenu(jm);
      return {
        hide: instance.hide.bind(instance),
        show: instance.show.bind(instance),
      };
    };

    ContextMenu.prototype.show = function (ctxMenu, eventOrElement) {
      var _this = this;
      if (eventOrElement instanceof MouseEvent)
        eventOrElement.stopImmediatePropagation();
      this.hide();
      this.menu = this.generateDOM(
        __spreadArray([], ctxMenu, true),
        eventOrElement
      );
      document.body.appendChild(this.menu);
      this.menu.addEventListener(
        "wheel",
        function () {
          return void (_this.preventCloseOnScroll = false);
        },
        {
          passive: true,
        }
      );
      if (eventOrElement instanceof MouseEvent) eventOrElement.preventDefault();
    };
    ContextMenu.prototype.hide = function (menu) {
      var _a;
      if (menu === void 0) menu = this.menu;
      resetDirections();
      if (menu) {
        if (menu === this.menu) delete this.menu;
        (_a = menu.parentElement) === null || _a === void 0
          ? void 0
          : _a.removeChild(menu);
      }
    };
    ContextMenu.prototype.generateDOM = function (ctxMenu, parentOrEvent) {
      var _this = this;
      var container = document.createElement("ul");
      if (ctxMenu.length === 0) container.style.display = "none";
      ctxMenu.forEach(function (item) {
        var li = generateMenuItem(item, _this.jm);
        onHoverDebounced(li, function () {
          var _a;
          var subMenu =
            (_a = li.parentElement) === null || _a === void 0
              ? void 0
              : _a.querySelector("ul");
          if (subMenu && subMenu.parentElement !== li) _this.hide(subMenu);
        });
        if (itemIsInteractive(item) && !isDisabled(item))
          if (itemIsSubMenu(item))
            onHoverDebounced(li, function (ev) {
              var subMenu = li.querySelector("ul");
              if (!subMenu) _this.openSubMenu(ev, getProp(item.subMenu), li);
            });
          else
            li.addEventListener("click", function () {
              return void _this.hide();
            });
        container.appendChild(li);
      });
      container.className = "ctxmenu";
      setPosition(container, parentOrEvent);
      container.addEventListener("contextmenu", function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      });
      container.addEventListener("click", function (ev) {
        var item = ev.target instanceof Element && ev.target.parentElement;
        if (item && item.className !== "interactive") ev.stopPropagation();
      });
      return container;
    };
    ContextMenu.prototype.openSubMenu = function (e, ctxMenu, listElement) {
      var _a;
      var subMenu =
        (_a = listElement.parentElement) === null || _a === void 0
          ? void 0
          : _a.querySelector("li > ul");
      if (subMenu && subMenu.parentElement !== listElement) this.hide(subMenu);
      var selectedNode = this.jm.get_selected_node();
      var meetMenuItems = excludeHide(ctxMenu, selectedNode);
      listElement.appendChild(this.generateDOM(meetMenuItems, listElement));
    };
    ContextMenu.addStylesToDom = function () {
      var _this = this;
      var append = function () {
        if (document.readyState === "loading")
          return document.addEventListener("readystatechange", function () {
            return void append();
          });
        var style = document.createElement("style");
        style.innerHTML = defaultStyles;
        document.head.insertBefore(style, document.head.childNodes[0]);
        append = function () { };
      };
      append();
    };
    return ContextMenu;
  })();

  JsMind.CtxMenu = function (jm) {
    this.jm = jm;
    var options = jm.options;
    if (
      !options ||
      !options.ctxMenu ||
      !options.ctxMenu.items ||
      !Array.isArray(options.ctxMenu.items)
    )
      return;
    this.menuItems = options.ctxMenu.items;
    this.ctxmenu = ContextMenu.newInstance(jm);
    this.mountEvents();
  };

  JsMind.CtxMenu.prototype = {
    onContextMenu(e) {
      e.preventDefault();
      this.selectedNode = this.jm.get_selected_node();
      if (!this.selectedNode) {
        this.onClick();
        return;
      }
      var meetMenuItems = excludeHide(this.menuItems, this.selectedNode);
      // this.ctxmenu.show(meetMenuItems, this.selectedNode._data.view.element);
      this.ctxmenu.show(meetMenuItems, e, this.jm);
    },

    onClick() {
      this.ctxmenu.hide();
    },

    mountEvents() {
      var container = document.getElementById(this.jm.options.container);
      if (!container) {
        return;
      }
      container["oncontextmenu"] = this.onContextMenu.bind(this);
      container["onclick"] = this.onClick.bind(this);
    },
  };
  var plugin = new JsMind.plugin("ctxMenu", function (jm) {
    var ctxMenu = new JsMind.CtxMenu(jm);
    jm.ctxMenu = ctxMenu;
  });

  JsMind.register_plugin(plugin);
})(window);
