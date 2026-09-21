async function testChatBot() {
  const BASE_URL = "http://localhost:3000";
  const USER_ID = "11111111-1111-1111-1111-111111111111"; // Priya Nair

  console.log("Testing AI Chat Bot at /api/assistant...");
  const res = await fetch(`${BASE_URL}/api/assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `homevault_user_id=${USER_ID}`,
    },
    body: JSON.stringify({
      question: "How much did I spend on my AC so far, and when does my AMC expire?",
      assetId: "dddddddd-0000-0000-0000-000000000001",
    }),
  });

  console.log("Status:", res.status);
  const json = await res.json();
  console.log("AI Chat Bot Response:", json);
}

testChatBot();
