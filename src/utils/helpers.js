import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export const validateData = (data, schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    return {
      success: false,
      errors: validate.errors,
    };
  }

  return { success: true };
};

export const extractJson = (text) => {
  if (!text) return null;

  const match = text.match(/\{[\s\S]*\}/);

  return match ? match[0] : null;
};
