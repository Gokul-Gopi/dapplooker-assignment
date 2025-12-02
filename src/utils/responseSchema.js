export const testResponseSchema = {
  $id: "NestedTestResponse",
  type: "object",
  required: ["status", "user"],
  properties: {
    status: { type: "string", enum: ["success", "error"] },

    user: {
      type: "object",
      required: ["id", "profile"],
      properties: {
        id: { type: "string" },

        profile: {
          type: "object",
          required: ["username", "age"],
          properties: {
            username: { type: "string" },
            age: { type: "number" },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};
