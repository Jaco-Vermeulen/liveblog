db.blogs.update(

  { _id: ObjectId("6a0ffad56f3389ccf6ca537a") },

  {

    $set: {

      "blog_preferences.theme": "nuwe-maroela",

      "blog_preferences.language": "af",

    },

    $unset: { theme_settings: "" },

  }

);

db.themes.update(

  { name: "nuwe-maroela" },

  {

    $set: {

      styleSettings: {

        general: { background: "#f5efe7", color: "#c45712" },

        "lb-buttons": { "background-color": "#c45712", color: "#ffffff" },

      },

    },

  }

);

printjson(

  db.blogs.findOne(

    { _id: ObjectId("6a0ffad56f3389ccf6ca537a") },

    { blog_preferences: 1 }

  )

);

