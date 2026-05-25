// Reset nuwe-maroela theme styleSettings to theme.json v1.0.0 (web2 tokens)

db.themes.update(

  { name: "nuwe-maroela" },

  {

    $set: {

      styleSettings: {

        general: {

          background: "#f5efe7",

          color: "#c45712",

        },

        "lb-buttons": {

          "background-color": "#c45712",

          color: "#ffffff",

        },

      },

    },

  },

  { upsert: false }

);

printjson(db.themes.findOne({ name: "nuwe-maroela" }, { styleSettings: 1, version: 1 }));

