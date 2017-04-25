/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
var attrParse = require("./lib/attributesParser");
var loaderUtils = require("loader-utils");
var assign = require("object-assign");
var url = require("url");


function randomIdent() {
  return "xxxHTMLLINKxxx" + Math.random() + Math.random() + "xxx";
}

function getLoaderConfig(context) {
  var query = loaderUtils.getOptions(context) || {};
  var config = (context.options && context.options.vue && context.options.vue.html) || {};
  delete query.config;
  return assign(query, config);
}

module.exports = function(content) {
  this.cacheable && this.cacheable();
  var config = getLoaderConfig(this);
  var attributes = ["img:src"];
  if(config.attrs !== undefined) {
    if(typeof config.attrs === "string")
      attributes = config.attrs.split(" ");
    else if(Array.isArray(config.attrs))
      attributes = config.attrs;
    else if(config.attrs === false)
      attributes = [];
    else
      throw new Error("Invalid value to config parameter attrs");
  }
  var root = config.root;
  var links = attrParse(content, function(tag, attr) {
    return attributes.indexOf(tag + ":" + attr) >= 0;
  });
  links.reverse();
  var data = {};
  content = [content];
  links.forEach(function(link) {
    if(!loaderUtils.isUrlRequest(link.value, root)) return;

    var uri = url.parse(link.value);
    if (uri.hash !== null && uri.hash !== undefined) {
      uri.hash = null;
      link.value = uri.format();
      link.length = link.value.length;
    }

    do {
      var ident = randomIdent();
    } while(data[ident]);
    data[ident] = link.value;
    var x = content.pop();
    content.push(x.substr(link.start + link.length));
    content.push(ident);
    content.push(x.substr(0, link.start));
  });
  content.reverse();
  content = content.join("");

  if(config.interpolate) {
    content = compile('`' + content + '`').code;
  } else {
    content = JSON.stringify(content);
  }

  return "module.exports = " + content.replace(/xxxHTMLLINKxxx[0-9\.]+xxx/g, function(match) {
    if(!data[match]) return match;
    return '" + require(' + JSON.stringify(loaderUtils.urlToRequest(data[match], root)) + ') + "';
  }) + ";";
}
