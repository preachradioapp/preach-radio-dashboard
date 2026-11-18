/** Reusable antd Form rules. */
export const passwordRules = [
  { required: true, message: "Enter a password" },
  { min: 8, message: "Use at least 8 characters" },
  {
    pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
    message: "Include at least one letter and one number",
  },
];

export const requiredText = (label, { max = 120 } = {}) => [
  { required: true, whitespace: true, message: `${label} is required` },
  { max, message: `${label} must be ${max} characters or fewer` },
];

export const urlRule = { type: "url", message: "Enter a valid URL, including https://" };

/**
 * Validator for ImageUpload fields (value is File | url string | null).
 * `required: true` also makes antd label the field as required (custom validators alone render "(optional)").
 */
export const requiredImage = (label = "An image") => ({
  required: true,
  validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error(`${label} is required`))),
});
