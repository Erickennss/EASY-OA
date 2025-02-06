const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接配置
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "oa_system",
});

// 注册接口
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (rows.length > 0) {
      if (rows[0].username === username) {
        res.json({ success: false, message: "用户名已存在" });
      } else {
        res.json({ success: false, message: "邮箱已被注册" });
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await pool.execute(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        [username, hashedPassword, email]
      );
      res.json({ success: true, message: "注册成功" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

// 登录接口
app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    let rows;
    if (identifier.includes("@")) {
      [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
        identifier,
      ]);
    } else {
      [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [
        identifier,
      ]);
    }
    if (rows.length > 0) {
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        res.json({ success: true, message: "登录成功" });
      } else {
        res.json({ success: false, message: "用户名、邮箱或密码错误" });
      }
    } else {
      res.json({ success: false, message: "用户名、邮箱或密码错误" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

// 获取任务列表
app.get("/tasks", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM tasks");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

// 添加任务
app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.execute("INSERT INTO tasks (title, description) VALUES (?, ?)", [
      title,
      description,
    ]);
    res.json({ success: true, message: "任务添加成功" });
  } catch (error) {
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
