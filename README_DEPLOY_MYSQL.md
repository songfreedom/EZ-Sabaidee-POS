
# ຄູ່ມືການ Deploy ແລະ ເຊື່ອມຕໍ່ MySQL

## 1. ການ Deploy (ນຳຂຶ້ນ Online)

ເນື່ອງຈາກນີ້ແມ່ນ React App (Frontend), ວິທີທີ່ງ່າຍທີ່ສຸດ ແລະ ຟຣີ ແມ່ນການໃຊ້ **Vercel** ຫຼື **Netlify**.

### ຂັ້ນຕອນ:
1.  **Build Project**:
    ເປີດ Terminal ແລ້ວພິມຄຳສັ່ງ:
    ```bash
    npm run build
    ```
    ລະບົບຈະສ້າງໂຟນເດີ `dist` ຫຼື `build` ຂຶ້ນມາ.

2.  **Upload**:
    *   ນຳເອົາໂຟນເດີ `dist` ໄປວາງໃນ Hosting ຂອງທ່ານ.
    *   ຫຼື ຖ້າໃຊ້ GitHub, ໃຫ້ເຊື່ອມຕໍ່ GitHub ກັບ Vercel ແລ້ວມັນຈະ Deploy ໃຫ້ອັດຕະໂນມັດ.

---

## 2. ການເຊື່ອມຕໍ່ MySQL (Backend)

React ເຮັດວຽກຢູ່ Browser ບໍ່ສາມາດຕໍ່ MySQL ໂດຍກົງໄດ້. ທ່ານຕ້ອງສ້າງ **Server (Backend)** ມາຂັ້ນກາງ.

### ໂຄງສ້າງ:
`React (Frontend)` <--> `API (Node.js/PHP)` <--> `MySQL (Database)`

### ຕົວຢ່າງໂຄ້ດ Server (Node.js + Express + MySQL):

ສ້າງໂຟນເດີໃຫມ່ຊື່ `server` ແລະສ້າງໄຟລ໌ `server.js`:

```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. ຕັ້ງຄ່າ MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'sabaidee_pos'
});

db.connect(err => {
  if (err) console.error('MySQL Error:', err);
  else console.log('MySQL Connected!');
});

// 2. API ດຶງຂໍ້ມູນສິນຄ້າ
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 3. API ບັນທຶກການຂາຍ
app.post('/api/transactions', (req, res) => {
  const { total, paymentMethod, items } = req.body;
  // ຕົວຢ່າງການ Insert (ຕ້ອງສ້າງຕາຕະລາງ transactions ກ່ອນ)
  const sql = 'INSERT INTO transactions (total, payment_method, date) VALUES (?, ?, NOW())';
  db.query(sql, [total, paymentMethod], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Sale recorded', id: result.insertId });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### ວິທີເຊື່ອມຕໍ່ໃນ React:
1.  ເປີດໄຟລ໌ `services/api.ts`.
2.  ປ່ຽນ `const USE_REAL_API = true;`.
3.  ແກ້ໄຂ `API_BASE_URL` ໃຫ້ເປັນ URL ຂອງ Server ທ່ານ (ເຊັ່ນ: `http://localhost:3000/api`).
