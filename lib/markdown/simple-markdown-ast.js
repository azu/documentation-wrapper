var u = require('unist-builder'),
    formatType = require('documentation-theme-utils').formatType,
    hljs = require('highlight.js');
var unescapeHTML = require("unescape-html");
var remark = require("remark");
var isNotUndefined = function (node) {
    return node !== undefined && node !== null && node !== false;
};
/**
 * Given a hierarchy-nested set of comments, generate an remark-compatible
 * Abstract Syntax Tree usable for generating Markdown output
 *
 * @param {Array<Object>} comments nested comment
 * @param {Object} opts currently none accepted
 * @param {Function} callback called with AST
 * @returns {undefined}
 */
function commentsToAST(comments, opts, callback) {
    var hljsOptions = (opts || {}).hljs || {},
        language = !hljsOptions.highlightAuto ? 'javascript' : undefined;

    hljs.configure(hljsOptions);

    /**
     * Generate an AST chunk for a comment at a given depth: this is
     * split from the main function to handle hierarchially nested comments
     *
     * @param {number} depth nesting of the comment, starting at 1
     * @param {Object} comment a single comment
     * @returns {Object} remark-compatible AST
     */
    function generate(depth, comment) {

        function paramList(params) {
            return u('list', {ordered: false}, params.map(function (param) {
                var description = param.description ? [
                    u('text', ' - '),
                    u("text", param.description || "")
                ] : [];
                var defaultParameters = param.default ? [
                    u('paragraph', [
                        u('text', ' (optional, default '),
                        u('inlineCode', param.default),
                        u('text', ')')
                    ])
                ] : [];
                var typeNodes = param.type ? [
                    u('text', ':'),
                    u('strong', formatType(param.type))
                ] : [];
                var inParagraph = [
                    u('inlineCode', param.name)
                ].concat(
                    typeNodes,
                    description,
                    defaultParameters).filter(isNotUndefined);
                var properties = param.properties ? paramList(param.properties) : undefined;
                var listItems = [
                    u('paragraph', inParagraph)
                ].concat(properties).filter(isNotUndefined);
                return u('listItem', listItems);
            }));
        }

        function paramSection(comment) {
            return !!comment.params && [
                    u('strong', [u('text', 'Parameters')]),
                    paramList(comment.params)
                ];
        }

        function propertySection(comment) {
            return !!comment.properties && [
                    u('strong', [u('text', 'Properties')]),
                    propertyList(comment.properties)
                ];
        }

        function propertyList(properties) {
            return u('list', {ordered: false},
                properties.map(function (property) {
                    return u('listItem', [
                        u('paragraph', [
                            u('inlineCode', property.name),
                            u('text', ' '),
                            u('strong', formatType(property.type)),
                            u('text', ' ')
                        ]
                            .concat(property.description ? u("text", property.description || "") : [])
                            .filter(isNotUndefined)),
                        property.properties && propertyList(property.properties)
                    ].filter(isNotUndefined));
                }));
        }

        function examplesSection(comment) {
            return !!comment.examples && [u('strong', [u('text', 'Examples')])]
                    .concat(comment.examples.reduce(function (memo, example) {
                        language = hljsOptions.highlightAuto ?
                                   hljs.highlightAuto(example.description).language : 'javascript';
                        return memo.concat(example.caption ?
                            [u('paragraph', [u('emphasis', example.caption)])] :
                            []).concat([u('code', {lang: language}, example.description)]);
                    }, []));
        }

        function returnsSection(comment) {
            return !!comment.returns && comment.returns.map(function (returns) {
                    var description = returns.description ? [
                        u('text', ' - '),
                        u("text", returns.description || "")
                    ] : [];
                    var returnType = returns.type ? [
                        u('text', ':'),
                        u('strong', formatType(returns.type))
                    ] : [];
                    return u('paragraph', [
                        u('strong', [
                            u('text', 'Returns')
                        ])
                    ].concat(returnType, description).filter(isNotUndefined));
                });
        }

        function throwsSection(comment) {
            return !!comment.throws &&
                u('list', {ordered: false},
                    comment.throws.map(function (returns) {
                        return u('listItem', [
                            u('paragraph', [
                                u('text', 'Throws '),
                                u('strong', formatType(returns.type)),
                                u('text', ' ')
                            ].concat(returns.description ? u("text", returns.description || "") : []))
                        ]);
                    }));
        }

        function augmentsLink(comment) {
            return comment.augments && u('paragraph', [
                    u('strong', [
                        u('text', 'Extends '),
                        u('text', comment.augments.map(function (tag) {
                            return tag.name;
                        }).join(', '))
                    ])
                ]);
        }

        function githubLink(comment) {
            return comment.context.github && u('paragraph', [
                    u('link', {
                        title: 'Source code on GitHub',
                        url: comment.context.github
                    }, [
                        u('text', comment.context.path + ':' +
                            comment.context.loc.start.line + '-' +
                            comment.context.loc.end.line)
                    ])
                ]);
        }

        function metaSection(comment) {
            var meta = ['version', 'since', 'copyright', 'author', 'license']
                .reduce(function (memo, tag) {
                    if (comment[tag]) {
                        memo.push({tag: tag, value: comment[tag]});
                    }
                    return memo;
                }, []);
            return !!meta.length && [u('strong', [u('text', 'Meta')])].concat(
                    u('list', {ordered: false},
                        meta.map(function (item) {
                            return u('listItem', [
                                u('paragraph', [
                                    u('strong', [u('text', item.tag)]),
                                    u('text', ': ' + item.value)
                                ])
                            ]);
                        })));
        }

        function stringifyNodes(children) {
            return children.map(function (node) {
                if (node.children) {
                    return stringifyNodes(node.children);
                } else {
                    return unescapeHTML(node.value);
                }
            }).join("");
        }

        // type node
        function stringifyType(type) {
            var typeNodeList = formatType(type);
            return stringifyNodes(typeNodeList);
        }

        // (param1: Type, param: Type)
        // return TextNode
        function paramPairString(params) {
            if (params == undefined) {
                return "";
            }
            var paramsStrings = params.map(function (param) {
                var name = param.name ? param.name : "";
                if (param.type) {
                    return name + ": " + stringifyType(param.type);
                } else {
                    return name;
                }
            });
            return paramsStrings.join(", ");
        }

        function returnTypeString(returns) {
            if (returns === undefined) {
                return "";
            }
            return returns.map(function (ret) {
                return stringifyType(ret.type);
            }).join(",");
        }

        function heading(comment) {
            var params = comment.params ? paramPairString(comment.params) : "";
            var returnType = returnTypeString(comment.returns);
            var functionName = comment.name || "";
            var headName = functionName;
            if (params.length > 0) {
                headName += "(" + params + ")";
            }
            if (returnType.length > 0) {
                headName += ": " + returnType;
            }
            return u('heading', {depth: depth}, [u('inlineCode', headName)])
        }

        return []
            .concat(heading(comment))
            .concat(githubLink(comment))
            .concat(augmentsLink(comment))
            .concat(comment.description ? [u("text", comment.description || "")] : [])
            .concat(paramSection(comment))
            .concat(propertySection(comment))
            .concat(examplesSection(comment))
            .concat(throwsSection(comment))
            .concat(returnsSection(comment))
            .concat(metaSection(comment))
            .concat(!!comment.members.instance.length &&
                comment.members.instance.reduce(function (memo, child) {
                    return memo.concat(generate(depth + 1, child));
                }, []))
            .concat(!!comment.members.static.length &&
                comment.members.static.reduce(function (memo, child) {
                    return memo.concat(generate(depth + 1, child));
                }, []))
            .filter(isNotUndefined);
    }

    return callback(null, u('root', comments.reduce(function (memo, comment) {
        return memo.concat(generate(1, comment));
    }, [])));
}

module.exports = commentsToAST;
