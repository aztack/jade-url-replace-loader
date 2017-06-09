/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
var attrParse = require("./lib/attributesParser");
var loaderUtils = require("loader-utils");
var assign = require("object-assign");
var url = require("url");

function randomIdent() {
  return 'xxxJADELINKxxx' + Math.random() + Math.random() + "xxx";
}

module.exports = function(content) {
  this.cacheable && this.cacheable();
  var config = loaderUtils.getOptions(this) || {};
  var attributes = ["img:src", "script:src", "link:href"];
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
    var uri = url.parse(link.value);
    if (uri.hash !== null && uri.hash !== undefined) {
      link.value = decodeURIComponent(uri.format());
      uri.hash = null;
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
  content = JSON.stringify(content);

  var getEmitedFilePath = config.getEmitedFilePath || function (v) { return v;}

  var res = "module.exports = " + content.replace(/xxxJADELINKxxx[0-9\.]+xxx/g, function(match) {
    if(!data[match]) return '';
    return '" + ' + JSON.stringify(getEmitedFilePath(data[match]), root) + ' + "';
  }) + ";";
  return res
}
