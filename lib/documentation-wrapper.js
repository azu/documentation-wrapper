// LICENSE : MIT
"use strict";
const documentation = require("documentation");
documentation.formats.md = require("./markdown/markdown");
documentation.formats.remark = require("./markdown/simple-markdown-ast");
module.exports = documentation;