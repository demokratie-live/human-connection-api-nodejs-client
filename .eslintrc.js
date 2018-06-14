module.exports = {
  extends: [
    "airbnb-base",
    "plugin:you-dont-need-lodash-underscore/compatible"
  ],
  rules: {
    "newline-per-chained-call": [2],
    "no-unused-vars": [
      2,
      {
        "argsIgnorePattern": "^_"
      }
    ]
  }
};
