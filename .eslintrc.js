module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest": true
    },
    "plugins": ["react", "jest"],
    "extends": ["eslint:recommended","plugin:react-hooks/recommended"],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "rules": {
        "comma-dangle": ["error", "always-multiline"],
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error"
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
  }