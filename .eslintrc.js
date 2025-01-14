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
	"no-unused-vars" : "off", // Would be good to have this
	"no-control-regex" : 0, // Revisit
	"use-isnan" : "off", // Revisit
    }
};
