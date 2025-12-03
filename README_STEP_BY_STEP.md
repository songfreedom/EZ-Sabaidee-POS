# ຄູ່ມືການ Deploy ແລະ ເຊື່ອມຕໍ່ MySQL (Step-by-Step)

ເນື່ອງຈາກລະບົບນີ້ແຍກເປັນ 2 ສ່ວນຄື: **Frontend (React ໜ້າເວັບ)** ແລະ **Backend (API + Database)**.
ທ່ານຕ້ອງເຮັດຕາມຂັ້ນຕອນດັ່ງນີ້:

---

## ພາກທີ 1: ການກະກຽມຖານຂໍ້ມູນ (MySQL)

1.  **ຕິດຕັ້ງ MySQL**:
    *   ຖ້າໃຊ້ Windows: ແນະນຳໃຫ້ລົງ **XAMPP** ແລະກົດ Start **Apache** ແລະ **MySQL**.
    *   ເຂົ້າໄປທີ່ `http://localhost/phpmyadmin`.

2.  **ສ້າງ Database**:
    *   ກົດ **New** -> ຕັ້ງຊື່ວ່າ `sabaidee_pos` -> ກົດ **Create**.

3.  **ສ້າງຕາຕະລາງ (Import SQL)**:
    *   ກົດເຂົ້າ Database `sabaidee_pos`.
    *   ໄປທີ່ເມນູ **SQL**.
    *   ກອບປີ້ໂຄ້ດຈາກໄຟລ໌ `server-backend/database.sql` (ຢູ່ໃນໂປຣເຈັກນີ້) ໄປວາງໃສ່.
    *   ກົດ **Go**.

---

## ພາກທີ 2: ການສ້າງ ແລະ Run Server (Backend)

ທ່ານຕ້ອງ Run Server ນີ້ໄວ້ ເພື່ອໃຫ້ React ຕິດຕໍ່ຂໍຂໍ້ມູນໄດ້.

1.  **ຕິດຕັ້ງ Node.js**: ດາວໂຫລດຈາກ [nodejs.org](https://nodejs.org).
2.  **ສ້າງໂຟນເດີ Server**:
    *   ສ້າງໂຟນເດີໃໝ່ຊື່ `my-pos-server` (ຢູ່ນອກໂຟນເດີ React).
    *   ກອບປີ້ໄຟລ໌ `server-backend/index.js` ໄປໃສ່ໃນໂຟນເດີນັ້ນ.
3.  **ຕິດຕັ້ງ Library**:
    *   ເປີດ Terminal (CMD) ໃນໂຟນເດີ `my-pos-server`.
    *   ພິມຄຳສັ່ງ:
        ```bash
        npm init -y
        npm install express mysql2 cors body-parser
        ```
4.  **Run Server**:
    *   ພິມຄຳສັ່ງ: `node index.js`
    *   ຖ້າສຳເລັດຈະຂຶ້ນວ່າ: `Server running on port 3001` ແລະ `MySQL Connected...`

---

## ພາກທີ 3: ເຊື່ອມຕໍ່ React (Frontend) ຫາ Server

1.  ກັບມາທີ່ໂປຣເຈັກ React ນີ້.
2.  ເປີດໄຟລ໌ `services/api.ts`.
3.  ແກ້ໄຂຄ່າດັ່ງນີ້:
    ```typescript
    const USE_REAL_API = true; // ປ່ຽນເປັນ true
    const API_BASE_URL = 'http://localhost:3001/api'; // Port 3001 ຕາມທີ່ຕັ້ງໄວ້
    ```
4.  ທົດລອງ Run React (`npm start` ຫຼື `npm run dev`). ຕອນນີ້ຂໍ້ມູນສິນຄ້າຈະດຶງມາຈາກ MySQL ແລ້ວ!

---

## ພາກທີ 4: ການ Deploy ຂຶ້ນ Online (Vercel)

ວິທີທີ່ງ່າຍທີ່ສຸດສຳລັບ React:

1.  **Build Project**:
    *   ພິມຄຳສັ່ງ: `npm run build`
    *   ລະບົບຈະສ້າງໂຟນເດີ `dist` ຂຶ້ນມາ.

2.  **Upload ຂຶ້ນ Vercel**:
    *   ໄປທີ່ [vercel.com](https://vercel.com) -> ສະໝັກສະມາຊິກ.
    *   ຕິດຕັ້ງ Vercel CLI: `npm i -g vercel`
    *   ພິມຄຳສັ່ງ: `vercel`
    *   ກົດ Enter ໄປເລື້ອຍໆ.

**ໝາຍເຫດສຳຄັນ**:
*   Vercel ຮອງຮັບແຕ່ Frontend.
*   ຖ້າຈະໃຫ້ Database Online ນຳ ທ່ານຕ້ອງເຊົ່າ VPS ຫຼື Cloud Database (ເຊັ່ນ: Railway, DigitalOcean, ຫຼື Hosting ລາວ) ເພື່ອ Run ໄຟລ໌ `index.js` ແລະ MySQL.
*   ຫຼັງຈາກໄດ້ IP ຂອງ Server ແລ້ວ ຢ່າລືມມາປ່ຽນ `API_BASE_URL` ໃນ React ແລ້ວ Build ໃໝ່.
