const db = require("../db.js");

// same pricing from your frontend/core JS
const pricing = {
  facebook_follow: 0.01,
  facebook_view: 0.007,
  youtube_sub: 0.02,
  youtube_view: 0.007,
  tiktok_follow: 0.01,
  tiktok_view: 0.005,
  instagram_follow: 0.01,
  instagram_view: 0.005,
  app_install: 0.03,
};

const plans = {
  Standard: { discount: 0 },
  Premium: { discount: 10 },
  Diamond: { discount: 20 },
};

exports.createTask = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const {
      platform,
      actionCount,
      socialLink,
      plan = "Standard",
      paymentMethod,
    } = req.body;

    if (!platform || !actionCount || !socialLink || !paymentMethod) {
      return res.status(400).json({
        message: "Platform, action count, social link and payment method are required",
      });
    }

    if (!pricing[platform]) {
      return res.status(400).json({ message: "Invalid platform selected" });
    }

    if (!["card", "crypto", "bank"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const count = Number(actionCount);
    const perAction = pricing[platform];
    const discount = plans[plan]?.discount || 0;

    let budget = perAction * count;
    budget = budget * (1 - discount / 100);

    const [users] = await db.query(
      "SELECT id, name, balance FROM users WHERE id = ? AND role = 'creator'",
      [creatorId]
    );

    if (!users.length) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const creator = users[0];

    if (Number(creator.balance) < budget) {
      return res.status(400).json({
        message: "Insufficient balance",
        currentBalance: creator.balance,
        requiredAmount: budget,
      });
    }

    const [taskResult] = await db.query(
      `INSERT INTO tasks 
      (title, link, budget, count, remaining, posted_by, posted_by_name, type, plan, creator_payment_method, earner_share_percent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${platform} • ${socialLink}`,
        socialLink,
        budget,
        count,
        count,
        creator.id,
        creator.name,
        "creator",
        plan,
        paymentMethod,
        0.4,
        "active",
      ]
    );

    await db.query(
      "INSERT INTO transactions (user_id, amount, note, method, type) VALUES (?, ?, ?, ?, ?)",
      [
        creator.id,
        budget,
        `Creator post task #${taskResult.insertId}`,
        paymentMethod,
        "debit",
      ]
    );

    await db.query(
      "UPDATE users SET balance = balance - ? WHERE id = ?",
      [budget, creator.id]
    );

    return res.status(201).json({
      message: "Task posted successfully",
      taskId: taskResult.insertId,
      budget,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCreatorTasks = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE posted_by = ? ORDER BY created_at DESC",
      [creatorId]
    );

    return res.json(tasks);
  } catch (error) {
    console.error("Get creator tasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCreatorPayments = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const [payments] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
      [creatorId]
    );

    return res.json(payments);
  } catch (error) {
    console.error("Get creator payments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};