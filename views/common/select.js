const x = require("hyperaxe");
const fieldDiv = require("./fieldDiv");

const defaultOpts = {
  label: "Field",
  name: "field",
  values: [],
  required: false,
  blankLabel: "", // use null here to skip blank option entirely
  optionValue: (value) => value,
  optionLabel: (value) => value,
  // null means no 'selected' attrs.
  // else should be a function from option value to 'selected' attr value
  optionSelected: null,
};

const makeOption = (opts) => {
  const { optionValue, optionLabel, optionSelected } = opts;
  const { option } = x;
  const optionAttrs = (value) => ({
    value: optionValue(value),
    selected: optionSelected != null && optionSelected(value) ? true : null,
  });
  return (value) => option(optionAttrs(value), optionLabel(value));
};

const select = (options) => {
  const opts = { ...defaultOpts, ...options };
  const { label, name, values, blankLabel } = opts;
  const required = opts.required || null;
  const { select, option } = x;
  const attrs = { class: "form-control", name, required };
  const blankOption = option({ value: "" }, blankLabel || "");
  const blankOptionTag = blankLabel == null ? null : blankOption;
  const optionTags = values.map(makeOption(opts));
  const selectTag = select(attrs, blankOptionTag, optionTags);
  return fieldDiv(label, selectTag);
};

module.exports = select;
