# 🚀 Token Insights & HyperLiquid PnL API

Backend Assignment – Express JS

A lightweight backend that implements **both assignment problems**:

1. **P1 – Token Insight API (CoinGecko + AI via Groq)**
2. **P2 – HyperLiquid Wallet Daily PnL API**

This project uses CoinGecko (no key required) + Groq AI (free API key) + HyperLiquid APIs.

---

# 🔧 Setup & Running the Project

### 1️⃣ Clone the repo

```bash
git clone git@github.com:Gokul-Gopi/dapplooker-assignment.git
cd dapplooker-assignment
```

### 2️⃣ Install dependencies

```bash
pnpm install
```

### 3️⃣ Add environment variables

Create a `.env` file (there is also `.env.example` for reference):

```
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
```

👉 You can generate a **free Groq API key** here:
[https://console.groq.com/keys](https://console.groq.com/keys)

### 4️⃣ Start the dev server

```bash
pnpm dev
```

Backend will start at:

```
http://localhost:3000
```

---

# 🧪 Postman Collection

### 📥 Import

You'll find the postman collection in the root of the project, which can be imported to your local postman for testing:

### ⚙️ Setup Environment

Add an environment variable:

```
base_url = http://localhost:3000
```

### 📌 Important

* Only APIs containing the name **P1** or **P2** are part of the assignment.
* Rest of the endpoints were used for testing and can be ignored.

---
