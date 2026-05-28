// Default styleSettings for the Tribute theme (matches theme.json styleOptions)

db.themes.update(
  { name: "tribute" },
  {
    $set: {
      extends: "default",
      styleSettings: {
        general: {
          background: "#f6f2ea",
          color: "#9a7224",
        },
        "lb-buttons": {
          "background-color": "#12141a",
          color: "#f6f2ea",
        },
      },
    },
  },
  { upsert: false }
);

printjson(
  db.themes.findOne(
    { name: "tribute" },
    { name: 1, extends: 1, styleSettings: 1, version: 1 }
  )
);
