import Groq from "groq-sdk";

let client = null;

export const aiClient = () => {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    console.log("⚡ Groq client initialized");
  }
  return client;
};

export const askAI = async (prompt) => {
  try {
    const groqClient = aiClient();
    let response = "";

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });

    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || "";
      response += content;
    }

    return response;
  } catch (error) {
    throw error;
  }
};
