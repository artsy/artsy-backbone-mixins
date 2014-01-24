// Support coffeescript requires
var coffee = require("coffee-script");
var File = require("fs");
if (!require.extensions[".coffee"]) {
  require.extensions[".coffee"] = function (module, filename) {
    var source = coffee.compile(File.readFileSync(filename, "utf8"));
    return module._compile(source, filename);
  };
}

// Export into namespaces
module.exports = {

  Markdown: require("./lib/markdown.coffee"),
  Dimensions: require("./lib/dimensions.coffee"),
  Fetch: require("./lib/fetch.coffee")

}