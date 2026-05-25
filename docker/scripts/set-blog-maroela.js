db.blogs.update(

  { _id: ObjectId("6a0ffad56f3389ccf6ca537a") },

  {

    $set: {

      "blog_preferences.theme": "maroela",

      "blog_preferences.language": "af",

    },

    $unset: { theme_settings: "" },

  }

);

printjson(

  db.blogs.findOne(

    { _id: ObjectId("6a0ffad56f3389ccf6ca537a") },

    { blog_preferences: 1 }

  )

);

