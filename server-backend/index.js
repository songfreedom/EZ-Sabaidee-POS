const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 1. ຕັ້ງຄ່າການເຊື່ອມຕໍ່ MySQL
// * ຢ່າລືມປ່ຽນ password ໃຫ້ກົງກັບເຄື່ອງຂອງທ່ານ *
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // ຊື່ຜູ້ໃຊ້ MySQL (XAMPP ປົກກະຕິແມ່ນ root)
    password: '',      // ລະຫັດຜ່ານ MySQL (XAMPP ປົກກະຕິແມ່ນວ່າງ)
    database: 'sabaidee_pos'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('✅ MySQL Connected!');
});

// ================= API ROUTES =================

// 1. ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products WHERE active = 1';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // ແປງ format ໃຫ້ກົງກັບ React Type
        const formatted = results.map(p => ({
            id: p.id.toString(),
            name: p.name,
            price: p.price,
            cost: p.cost,
            category: p.category,
            image: p.image,
            active: p.active === 1
        }));
        res.json(formatted);
    });
});

// 2. ເພີ່ມສິນຄ້າໃໝ່
app.post('/api/products', (req, res) => {
    const { name, price, cost, category, image } = req.body;
    const sql = 'INSERT INTO products (name, price, cost, category, image, active) VALUES (?, ?, ?, ?, ?, 1)';
    db.query(sql, [name, price, cost, category, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product added', id: result.insertId });
    });
});

// 3. ບັນທຶກການຂາຍ (Transaction)
app.post('/api/transactions', (req, res) => {
    const { id, total, paymentMethod, items } = req.body; // id from React (Date.now)

    // A. ບັນທຶກຫົວບິນ
    const sqlTrans = 'INSERT INTO transactions (transaction_uuid, total, payment_method, date) VALUES (?, ?, ?, NOW())';
    db.query(sqlTrans, [id, total, paymentMethod], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const transId = result.insertId;

        // B. ບັນທຶກລາຍການສິນຄ້າ (Loop insert)
        const sqlItems = 'INSERT INTO transaction_items (transaction_id, product_name, price, quantity) VALUES ?';
        const itemValues = items.map(item => [transId, item.name, item.price, item.quantity]);

        db.query(sqlItems, [itemValues], (errItems) => {
            if (errItems) return res.status(500).json({ error: errItems.message });
            res.json({ message: 'Transaction saved successfully' });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
