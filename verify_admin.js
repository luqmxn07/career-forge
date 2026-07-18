const http = require("http");

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting program-based Admin & MFA flow tests...");

  // 1. Log in as admin
  console.log("\n🔑 1. Logging in as admin@careerforge.com...");
  const loginRes = await request("http://localhost:5000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, {
    email: "admin@careerforge.com",
    password: "password123"
  });

  if (loginRes.status !== 200) {
    console.error("❌ Login failed:", loginRes.body);
    process.exit(1);
  }

  const initialToken = loginRes.body.data.accessToken;
  console.log("✅ Logged in successfully. Received initial access token.");

  // 2. Query admin endpoint WITHOUT MFA
  console.log("\n🔒 2. Attempting to access admin stats without MFA verification...");
  const statsNoMfa = await request("http://localhost:5000/api/v1/admin/stats", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${initialToken}`,
      "Content-Type": "application/json"
    }
  });

  console.log(`📡 Response Status: ${statsNoMfa.status}`);
  console.log("📡 Response Body:", statsNoMfa.body);

  if (statsNoMfa.status === 401 && statsNoMfa.body.error?.message === "MFA not completed this session") {
    console.log("✅ Correctly rejected access with 401: MFA not completed this session!");
  } else {
    console.error("❌ Failed: Expected 401 MFA rejection.");
    process.exit(1);
  }

  // 3. Complete MFA challenge
  console.log("\n🔑 3. Verifying MFA OTP code '123456'...");
  const verifyRes = await request("http://localhost:5000/api/v1/auth/mfa/verify", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${initialToken}`,
      "Content-Type": "application/json"
    }
  }, {
    code: "123456"
  });

  if (verifyRes.status !== 200) {
    console.error("❌ MFA Verification failed:", verifyRes.body);
    process.exit(1);
  }

  const verifiedToken = verifyRes.body.data.accessToken;
  console.log("✅ MFA verification successful. Received verified access token.");

  // 4. Query admin endpoint WITH MFA
  console.log("\n🔓 4. Querying admin stats with verified access token...");
  const statsWithMfa = await request("http://localhost:5000/api/v1/admin/stats", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${verifiedToken}`,
      "Content-Type": "application/json"
    }
  });

  console.log(`📡 Response Status: ${statsWithMfa.status}`);
  console.log("📡 Response Body:", statsWithMfa.body);

  if (statsWithMfa.status === 200 && statsWithMfa.body.success) {
    console.log("✅ Successfully retrieved platform statistics!");
  } else {
    console.error("❌ Failed: Expected 200 stats retrieval.");
    process.exit(1);
  }

  console.log("\n🎉 All integration checks passed successfully!");
  process.exit(0);
}

// Wait for API server to compile and start listening
runTests().catch((err) => {
  console.error("💥 Test execution error:", err);
  process.exit(1);
});
