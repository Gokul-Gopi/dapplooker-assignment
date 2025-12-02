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

export const insightResponseSchema = {
  $id: "InsightResponse",
  type: "object",
  required: ["reasoning", "sentiment"],
  properties: {
    reasoning: { type: "string" },
    sentiment: { type: "string", enum: ["Bullish", "Bearish", "Neutral"] },
  },
  additionalProperties: false,
};
