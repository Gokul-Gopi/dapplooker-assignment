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

export const hlInfo = async (body) => {
  const url = "https://api.hyperliquid.xyz/info";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log({ res });

    return res.json();
  } catch (error) {
    throw error;
  }
};
