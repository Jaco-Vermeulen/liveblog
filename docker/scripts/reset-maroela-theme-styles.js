// Reset legacy maroela theme styleSettings to theme.json v1.0.2 defaults

db.themes.update(

  { name: "maroela" },

  {

    $set: {

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

  }

);

printjson(db.themes.findOne({ name: "maroela" }, { styleSettings: 1, version: 1 }));

