const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require("openai");

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_URL || "https://fin-sight-henna.vercel.app",
    "X-OpenRouter-Title": process.env.APP_NAME || "FinSight",
  },
});

function buildPrompt({
  topCategories,
  totalSpent,
  totalIncome,
  savings,
  savingsRate,
  budgetAmount,
  budgetUsagePct,
  topCategoryShare,
  categoryBreakdown,
  lastMonthComparison,
  unusualStr
}) {
  return [
    'You are a premium personal finance advisor inside a modern fintech app.',
    'Analyze the user financial data deeply and provide one high-quality personalized financial advisory note.',
    '',
    'OUTPUT RULES (strict):',
    '- Return a single paragraph (3-5 sentences).',
    '- Do not use numbering, bullets, markdown, or headings.',
    '- Include: (a) the key financial issue, (b) clear improvement actions, (c) a practical forward plan.',
    '- Include numbers naturally (Rs., %, limits, targets).',
    '- Keep total output under 120 words.',
    '',
    'STYLE:',
    '- Sound like a professional financial advisor (calm, polished, human).',
    '- Briefly justify recommendations using the provided data.',
    '- Make suggestions feel practical and realistic, not formula-based.',
    '- Focus on control, planning, and future financial stability.',
    '',
    'FOCUS:',
    '- Identify the most financially impactful issue first and explain why it matters.',
    '- Improve spending control, savings discipline, and emergency preparedness.',
    '- Prefer realistic adjustments (10-30% changes, weekly caps, monthly targets).',
    '',
    'AVOID:',
    '- Generic advice like "cut spending" or "save money more".',
    '- Point-wise output or checklist style.',
    '- Avoid mentioning missing data unless strictly necessary.',
    '',
    'USER DATA:',
    `- Top spending categories: ${topCategories || 'None'}`,
    `- Total spent (30 days): Rs.${totalSpent.toFixed(0)}`,
    `- Total income (30 days): Rs.${totalIncome.toFixed(0)}`,
    `- Net savings (30 days): Rs.${savings.toFixed(0)}`,
    `- Savings rate: ${savingsRate !== null ? `${savingsRate}%` : 'Unknown'}`,
    `- Monthly budget: ${budgetAmount !== null ? `Rs.${budgetAmount.toFixed(0)}` : 'Not set'}`,
    `- Budget usage: ${budgetUsagePct !== null ? `${budgetUsagePct}%` : 'Unknown'}`,
    `- Top category concentration: ${topCategoryShare !== null ? `${topCategoryShare}%` : 'Not available'}`,
    `- Category breakdown: ${JSON.stringify(categoryBreakdown || {})}`,
    `- Monthly comparison: ${JSON.stringify(lastMonthComparison || {})}`,
    `- Unusual expense: ${unusualStr || 'None'}`,
    '',
    'If data is limited, still provide useful improvement advice based on patterns.'
  ].join('\n');
}

async function getGeminiAdvice(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelCandidates = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash'
  ];

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (text) return text;
    } catch (error) {
      console.warn(`Gemini model unavailable: ${modelName} (${error.message})`);
    }
  }

  throw new Error('No Gemini model returned advice');
}

async function getGroqAdvice(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      temperature: 0.4,
      max_tokens: 220,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned empty advice');
  return text;
}

async function getOpenAIAdvice(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    max_tokens: 220,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = completion?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned empty advice');
  return text;
}

async function getAdviceFromProviders(prompt) {
  let advice = "";
  let source = "";

  try {
    advice = await getGeminiAdvice(prompt);
    if (advice) source = "gemini";
  } catch (err) {
    console.error("gemini advice failed:", err.message);
  }

  if (!advice) {
    try {
      advice = await getOpenRouterAdvice(prompt);
      if (advice) source = "openrouter";
    } catch (err) {
      console.error("openrouter advice failed:", err.message);
    }
  }

  if (!advice) {
    try {
      advice = await getGroqAdvice(prompt);
      if (advice) source = "groq";
    } catch (err) {
      console.error("groq advice failed:", err.message);
    }
  }

  if (!advice) {
    try {
      advice = await getOpenAIAdvice(prompt);
      if (advice) source = "openai";
    } catch (err) {
      console.error("openai advice failed:", err.message);
    }
  }

  if (!advice) {
    throw new Error("All AI providers failed");
  }

  return { text: advice, source };
}

async function getOpenRouterAdvice(prompt) {
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  return completion.choices?.[0]?.message?.content?.trim() || "";
}

function normalizeAdviceParagraph(aiText) {
  if (!aiText || typeof aiText !== 'string') {
    throw new Error('AI response is empty');
  }

  const cleaned = aiText
    .replace(/\r/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\d+[\.\)]\s*/g, '')
    .trim();

  if (!cleaned) {
    throw new Error('AI response could not be normalized to paragraph');
  }

  return cleaned;
}

exports.getAIAdvice = async (req, res) => {
  try {
    const userId = req.user.id;
    const [expenses] = await db.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY category ORDER BY total DESC`,
      [userId]
    );

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const [[budget]] = await db.query(
      `SELECT amount FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category IS NULL`,
      [userId, month, year]
    );
    const [[income30d]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM income
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [userId]
    );
    const [monthlyCategoryComparison] = await db.query(
      `SELECT category,
              SUM(CASE WHEN YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE()) THEN amount ELSE 0 END) AS this_month,
              SUM(CASE WHEN YEAR(date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                        AND MONTH(date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN amount ELSE 0 END) AS last_month
       FROM expenses
       WHERE user_id = ?
         AND date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
       GROUP BY category`,
      [userId]
    );

    let unusualStr = 'None';
    const [recentExpenses] = await db.query(
      `SELECT category, amount FROM expenses WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, [userId]
    );
    if (recentExpenses.length > 0 && expenses.length > 0) {
      const avgMap = {};
      expenses.forEach((e) => { avgMap[e.category] = parseFloat(e.total) / e.count; });
      const unusual = recentExpenses.find((e) => parseFloat(e.amount) > 2 * (avgMap[e.category] || 0));
      if (unusual) {
        unusualStr = `Unusual expense detected: Rs.${parseFloat(unusual.amount).toFixed(0)} in ${unusual.category}.`;
      }
    }

    const budgetAmount = budget ? parseFloat(budget.amount) : null;
    const topCategories = expenses
      .slice(0, 5)
      .map((e) => `${e.category}: Rs.${parseFloat(e.total).toFixed(0)}`)
      .join(', ');
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.total || 0), 0);
    const totalIncome = parseFloat(income30d?.total || 0);
    const savings = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : null;
    const budgetUsagePct = budgetAmount && budgetAmount > 0
      ? ((totalSpent / budgetAmount) * 100).toFixed(1)
      : null;
    const topCategoryShare = expenses.length > 0 && totalSpent > 0
      ? ((parseFloat(expenses[0].total) / totalSpent) * 100).toFixed(1)
      : null;
    const categoryBreakdown = expenses.reduce((acc, e) => {
      acc[e.category] = {
        total: parseFloat(e.total).toFixed(0),
        transactions: Number(e.count),
        averageTicket: (parseFloat(e.total) / Number(e.count || 1)).toFixed(0)
      };
      return acc;
    }, {});
    const thisMonthTotal = monthlyCategoryComparison
      .reduce((sum, row) => sum + parseFloat(row.this_month || 0), 0);
    const lastMonthTotal = monthlyCategoryComparison
      .reduce((sum, row) => sum + parseFloat(row.last_month || 0), 0);
    const monthlyChangePct = lastMonthTotal > 0
      ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
      : null;
    const lastMonthComparison = {
      thisMonthTotal: Number(thisMonthTotal.toFixed(0)),
      lastMonthTotal: Number(lastMonthTotal.toFixed(0)),
      monthlyChangePct: monthlyChangePct !== null ? Number(monthlyChangePct) : null
    };

    const prompt = buildPrompt({
      topCategories,
      totalSpent,
      totalIncome,
      savings,
      savingsRate,
      budgetAmount,
      budgetUsagePct,
      topCategoryShare,
      categoryBreakdown,
      lastMonthComparison,
      unusualStr
    });

    const { text, source } = await getAdviceFromProviders(prompt);
    const advice = normalizeAdviceParagraph(text);

    return res.json({
      advice,
      source
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate financial advice from Gemini.'
    });
  }
};
