import express from "express";
import cors from "cors";
import QRCode from "qrcode";

const app = express();
app.use(cors());
app.use(express.json());

// Tạm lưu đơn hàng trong RAM (MVP)
// Sau này mình sẽ chuyển sang Firebase / Supabase
let orders = [];

// Health check
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Tạo đơn + QR
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const orderId = "ORD-" + Date.now();
    const reference = "WMF-" + Date.now();

    // PayID tạm thời – sau này bạn đổi thành PayID thật của shop
    const payid = "47650716797";

    const qrData = `payid=${payid}&amount=${amount}&reference=${reference}`;
    const qrImage = await QRCode.toDataURL(qrData);

    const order = {
      orderId,
      amount,
      reference,
      status: "pending",
      createdAt: Date.now()
    };

    orders.push(order);

    res.json({
      orderId,
      reference,
      qrImage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Lấy danh sách đơn hàng
app.get("/orders", (req, res) => {
  res.json(orders);
});

// (MVP) Cập nhật trạng thái đơn hàng thủ công – sau này sẽ dùng polling PayID
app.post("/mark-paid", (req, res) => {
  const { orderId } = req.body;
  const order = orders.find(o => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  order.status = "paid";
  order.paidAt = Date.now();
  res.json(order);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend started on port " + PORT));
