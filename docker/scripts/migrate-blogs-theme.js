// Reassign all blogs from one theme to another (Mongo).
// Usage on server:
//   docker compose exec -T mongodb mongo liveblog --eval 'var FROM="default",TO="nuwe-maroela"' < docker/scripts/migrate-blogs-theme.js
// Or copy vars:
//   FROM=default TO=nuwe-maroela bash -c 'docker compose exec -T mongodb mongo liveblog /docker/scripts/migrate-blogs-theme.js'

var fromTheme = typeof FROM !== "undefined" ? FROM : "default";
var toTheme = typeof TO !== "undefined" ? TO : "nuwe-maroela";

var result = db.blogs.updateMany(
  { "blog_preferences.theme": fromTheme },
  {
    $set: { "blog_preferences.theme": toTheme },
    $unset: { theme_settings: "" },
  }
);

print("migrate-blogs-theme: " + fromTheme + " -> " + toTheme);
printjson(result);
print("remaining on " + fromTheme + ": " + db.blogs.count({ "blog_preferences.theme": fromTheme }));
