const API_URL = "http://localhost:3000";
const TOTAL_REQUESTS = 500;
const CONCURRENCY_LIMIT = 50;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLoadTest() {
  console.log("Initializing Traffic Generator...");

  const testEmail = `loadtester_${Date.now()}@forge.com`;
  const authRes = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "loadtestpassword123" }),
  });

  if (!authRes.ok) {
    console.error("❌ Failed to register test user. Is the server running?");
    process.exit(1);
  }

  const { token } = (await authRes.json()) as { token: string };
  console.log(` Test user registered. JWT acquired.`);
  console.log(
    `Blasting server with ${TOTAL_REQUESTS} requests at concurrency ${CONCURRENCY_LIMIT}...\n`,
  );

  let successCount = 0;
  let errorCount = 0;
  const startTime = performance.now();

  const makeRandomRequest = async () => {
    const rand = Math.random();
    try {
      let res;
      if (rand < 0.5) {
        res = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `Load Test Task ${Math.floor(Math.random() * 1000)}`,
            priority: 3,
          }),
        });
      } else if (rand < 0.9) {
        res = await fetch(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await fetch(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer FAKE_TOKEN_123` },
        });
      }

      if (res.ok) successCount++;
      else errorCount++; // This will catch the intentional 401s
    } catch (e) {
      errorCount++;
    }
  };

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY_LIMIT) {
    const batch = [];
    for (let j = 0; j < CONCURRENCY_LIMIT && i + j < TOTAL_REQUESTS; j++) {
      batch.push(makeRandomRequest());
    }
    await Promise.all(batch); // Wait for this batch of 50 to finish before firing the next 50
    process.stdout.write(`... ${i + batch.length} requests sent\r`);
  }

  const endTime = performance.now();
  const durationStr = ((endTime - startTime) / 1000).toFixed(2);

  // 4. The Report
  console.log(`\n\nLoad Test Complete!`);
  console.log(`-----------------------------------`);
  console.log(` Total Time:   ${durationStr} seconds`);
  console.log(`Successes:    ${successCount} (200/201 responses)`);
  console.log(` Rejections:   ${errorCount} (Expected 401s from bad tokens)`);
  console.log(
    `⚡ Throughput:   ${(TOTAL_REQUESTS / parseFloat(durationStr)).toFixed(2)} req/sec`,
  );
  console.log(`-----------------------------------`);
}

runLoadTest();
