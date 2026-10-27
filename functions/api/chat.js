
export async function onRequestPost({ request, env }) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  try {
    const body = await request.json();

    if (typeof body.message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required." }),
        { status: 400, headers }
      );
    }

    const message = body.message.trim();

    if (!message || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be 1–2000 characters." }),
        { status: 400, headers }
      );
    }

    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: "AI binding is missing. Check Cloudflare settings."
        }),
        { status: 500, headers }
      );
    }

    const result = await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      {
        messages: [
          {
            role: "system",
            content:
              "You are JARVIS, a helpful personal AI assistant. " +
              "Reply in the language the user uses, Malayalam or English. " +
              "Be clear, friendly, and honest. You cannot control devices " +
              "or access files unless a tool explicitly enables it."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500
      }
    );

    return new Response(
      JSON.stringify({
        reply: result.response || "I couldn't generate a reply."
      }),
      { headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "AI request failed. Check the model and AI binding."
      }),
      { status: 500, headers }
    );
  }
}
