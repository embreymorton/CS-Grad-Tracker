module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
	"keyword-spacing": [
	    "error",
	    {"after": true}
	],
	"arrow-parens": [
	    "error",
	    "as-needed"
	],
	"brace-style": [
	    "error",
	    "1tbs",
	    { "allowSingleLine": true}
	],
	"space-before-blocks": "error",
	"no-unused-vars" : "off", // Would be good to have this
	"no-control-regex" : 0, // Revisit
	"use-isnan" : "off", // Revisit
    }
};
