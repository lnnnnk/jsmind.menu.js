```
var options = {
    // ...
    ctxMenuItems: [
      {
        text: "menu1",
        subMenu: [
          {
            text: "submenu11",
            subMenu: [
              {
                text: "Action Item",
                action: () => alert("Hello World!"),
              },
            ],
          },
        ],
      },
      { isDivider: true },
      {
        text: "menu2",
        subMenu: [
          {
            text: "submenu21",
            action: () => alert("Hello World!"),
          },
        ],
      },
    ],
  };
```