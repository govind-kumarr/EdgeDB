var _ = require("lodash");

let payload = {
  name: "anything",
  asset: {
    type: "link",
    Modal: "Asset",
    filter: {
      field: "id",
      operator: "=",
      value: "094r589034ureroiajoifje04ir039",
    },
  },
};

export function isLink(key: any, value: any) {
  if (!value || value === null || Array.isArray(value)) {
    return false;
  }

  if (typeof value == "object") {
    let isValidLink = validateLinkProperties(value);
    if (isValidLink) {
      return `Select ${value.Modal} 
      filter .${value.filter.field} ${value.filter.operator} ${
        value.filter.field === "id"
          ? `<uuid>"${value.filter.value}"`
          : value.filter.value
      }`;
    }
  }

  return false;
}

export function validateLinkProperties(payload: any) {
  if (
    _.has(payload, "Modal") &&
    _.has(payload, "filter") &&
    _.has(payload, "type") &&
    _.has(payload, "filter.field") &&
    _.has(payload, "filter.operator") &&
    _.has(payload, "filter.value")
  )
    return true;
  return false;
}

// for (let [key, value] of Object.entries(payload)) {
//   console.log(isLink(key, value));
// }
