// Revert maroela theme in Mongo to original (extends default, legacy styleSettings)

db.themes.update(
  { name: "maroela" },
  {
    $set: {
      extends: "default",
      styleSettings: {
        general: {
          background: "#ffffff",
          color: "#c45c26",
        },
        "lb-buttons": {
          "background-color": "#c45c26",
          color: "#ffffff",
        },
      },
    },
  },
  { upsert: false }
);

printjson(
  db.themes.findOne(
    { name: "maroela" },
    { name: 1, extends: 1, styleSettings: 1, version: 1 }
  )
);
