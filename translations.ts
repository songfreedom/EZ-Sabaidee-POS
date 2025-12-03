
import { Language } from './types';

export const translations: Record<string, Record<Language, string>> = {
  // Sidebar
  pos: { lo: 'ຂາຍໜ້າຮ້ານ', en: 'POS Terminal' },
  dashboard: { lo: 'ພາບລວມ', en: 'Dashboard' },
  products: { lo: 'ຈັດການສິນຄ້າ', en: 'Products' },
  categories: { lo: 'ໝວດໝູ່', en: 'Categories' },
  users: { lo: 'ຈັດການຜູ້ໃຊ້', en: 'Users' },
  history: { lo: 'ປະຫວັດການຂາຍ', en: 'History' },
  settings: { lo: 'ຕັ້ງຄ່າ', en: 'Settings' },
  storeId: { lo: 'ລະຫັດຮ້ານ', en: 'Store ID' },
  subtitle_pos: { lo: 'ຈຸດຊຳລະເງິນ', en: 'Point of Sale' },
  subtitle_dash: { lo: 'ສະຖິຕິ', en: 'Overview' },
  subtitle_prod: { lo: 'ຄັງສິນຄ້າ', en: 'Inventory' },
  subtitle_cat: { lo: 'ຈັດການກຸ່ມ', en: 'Manage Groups' },
  subtitle_users: { lo: 'ພະນັກງານ', en: 'Team Mgmt' },
  subtitle_hist: { lo: 'ລາຍການຍ້ອນຫຼັງ', en: 'Transactions' },
  subtitle_settings: { lo: 'ຕັ້ງຄ່າລະບົບ', en: 'System Config' },
  
  // Navigation
  backToAdmin: { lo: 'ກັບໄປຫຼັງບ້ານ', en: 'Back to Admin' },

  // POS Main
  menu: { lo: 'ເມນູ', en: 'Menu' },
  chooseItems: { lo: 'ເລືອກລາຍການສິນຄ້າເພື່ອຂາຍ', en: 'Choose items to add to cart' },
  searchPlaceholder: { lo: 'ຄົ້ນຫາອາຫານ, ເຄື່ອງດື່ມ...', en: 'Search for food, drink...' },
  all: { lo: 'ທັງໝົດ', en: 'All' },
  food: { lo: 'ອາຫານ', en: 'Food' },
  drink: { lo: 'ເຄື່ອງດື່ມ', en: 'Drink' },
  side: { lo: 'ຂອງກິນຫຼິ້ນ', en: 'Side' },

  // Cart
  orderTitle: { lo: 'ລາຍການສັ່ງຊື້', en: 'Order Details' },
  emptyCart: { lo: 'ເລືອກສິນຄ້າເພື່ອເລີ່ມຂາຍ', en: 'Select items to start' },
  items: { lo: 'ລາຍການ', en: 'items' },
  subtotal: { lo: 'ລວມເງິນ', en: 'Subtotal' },
  tax: { lo: 'ອາກອນ', en: 'Tax' },
  total: { lo: 'ຍອດລວມ', en: 'Total' },
  payBtn: { lo: 'ຊຳລະເງິນ', en: 'Pay' },
  holdBill: { lo: 'ພັກບີນ', en: 'Hold Bill' },
  recallBill: { lo: 'ເອີ້ນບີນ', en: 'Recall' },
  heldBills: { lo: 'ບີນທີ່ພັກໄວ້', en: 'Held Bills' },
  noHeldBills: { lo: 'ບໍ່ມີບີນທີ່ພັກໄວ້', en: 'No held bills' },
  restore: { lo: 'ດຶງຂໍ້ມູນ', en: 'Restore' },
  discard: { lo: 'ລຶບ', en: 'Discard' },
  savedAt: { lo: 'ບັນທຶກເມື່ອ', en: 'Saved at' },
  
  // Payment Modal
  paymentTitle: { lo: 'ຊຳລະເງິນ', en: 'Payment' },
  selectMethod: { lo: 'ເລືອກວິທີຊຳລະ', en: 'Select Payment Method' },
  cash: { lo: 'ເງິນສົດ', en: 'Cash' },
  cashDesc: { lo: 'ຊຳລະດ້ວຍເງິນສົດ', en: 'Cash Payment' },
  qr: { lo: 'QR Pay', en: 'QR Pay' },
  qrDesc: { lo: 'ສະແກນຈ່າຍ', en: 'Scan to Pay' },
  receivedAmount: { lo: 'ຮັບເງິນມາ', en: 'Received Amount' },
  change: { lo: 'ເງິນທອນ', en: 'Change' },
  confirmPayment: { lo: 'ຢືນຢັນການຊຳລະ', en: 'Confirm Payment' },
  processing: { lo: 'ກຳລັງປະມວນຜົນ...', en: 'Processing...' },
  paymentSuccess: { lo: 'ການຊຳລະເງິນສຳເລັດ', en: 'Payment Successful!' },
  successDesc: { lo: 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ', en: 'Transaction completed' },
  cancel: { lo: 'ຍົກເລີກ', en: 'Cancel' },
  scanPrompt: { lo: 'ສະແກນດ້ວຍ OnePay ຫຼື ແອັບທະນາຄານ', en: 'Scan with OnePay or Mobile Banking' },
  waiting: { lo: 'ກຳລັງລໍຖ້າການຊຳລະ...', en: 'Waiting for payment...' },

  // Admin
  overview: { lo: 'ພາບລວມ (Dashboard)', en: 'Dashboard' },
  dailyOverview: { lo: 'ພາບລວມປະຈຳວັນ', en: 'Daily Overview' },
  totalRevenue: { lo: 'ລາຍຮັບທັງໝົດ', en: 'Total Revenue' },
  totalOrders: { lo: 'ອໍເດີທັງໝົດ', en: 'Total Orders' },
  cashPayments: { lo: 'ຈ່າຍເງິນສົດ', en: 'Cash Payments' },
  qrPayments: { lo: 'ຈ່າຍ QR', en: 'QR Payments' },
  salesOverview: { lo: 'ຍອດຂາຍ', en: 'Sales Overview' },
  
  // Products
  manageProducts: { lo: 'ຈັດການສິນຄ້າ', en: 'Manage Products' },
  manageInv: { lo: 'ເພີ່ມ, ແກ້ໄຂ ແລະ ລຶບ', en: 'Add, Edit and Delete' },
  addProduct: { lo: 'ເພີ່ມສິນຄ້າ', en: 'Add Product' },
  addNewProduct: { lo: 'ເພີ່ມລາຍການໃໝ່', en: 'Add New Product' },
  prodName: { lo: 'ຊື່ສິນຄ້າ', en: 'Product Name' },
  price: { lo: 'ລາຄາ', en: 'Price' },
  cost: { lo: 'ຕົ້ນທຶນ', en: 'Cost' },
  profit: { lo: 'ກຳໄລ', en: 'Profit' },
  category: { lo: 'ໝວດໝູ່', en: 'Category' },
  categoryPlaceholder: { lo: 'ເລືອກໝວດໝູ່', en: 'Select Category' },
  imageUrl: { lo: 'ລິ້ງຮູບພາບ', en: 'Image URL' },
  cancelBtn: { lo: 'ຍົກເລີກ', en: 'Cancel' },
  saveBtn: { lo: 'ບັນທຶກ', en: 'Save' },
  
  // Categories
  manageCategories: { lo: 'ຈັດການໝວດໝູ່', en: 'Manage Categories' },
  manageCatDesc: { lo: 'ຈັດການກຸ່ມສິນຄ້າ', en: 'Organize product groups' },
  addCategory: { lo: 'ເພີ່ມໝວດໝູ່', en: 'Add Category' },
  addNewCategory: { lo: 'ເພີ່ມໝວດໝູ່ໃໝ່', en: 'Add New Category' },
  catName: { lo: 'ຊື່ໝວດໝູ່', en: 'Category Name' },
  
  // History
  transHistory: { lo: 'ປະຫວັດການຂາຍ', en: 'Transaction History' },
  recentSales: { lo: 'ລາຍການຂາຍລ່າສຸດ', en: 'Recent Sales' },
  transId: { lo: 'ລະຫັດ', en: 'Trans ID' },
  dateTime: { lo: 'ວັນທີ/ເວລາ', en: 'Date/Time' },
  payment: { lo: 'ການຊຳລະ', en: 'Payment' },
  noTrans: { lo: 'ຍັງບໍ່ມີລາຍການຂາຍ', en: 'No transactions yet' },

  // Users
  manageUsers: { lo: 'ຈັດການຜູ້ໃຊ້', en: 'Manage Users' },
  manageStaff: { lo: 'ຈັດການພະນັກງານໃນຮ້ານ', en: 'Manage store staff' },
  addUser: { lo: 'ເພີ່ມຜູ້ໃຊ້', en: 'Add User' },
  name: { lo: 'ຊື່', en: 'Name' },
  email: { lo: 'ອີເມວ', en: 'Email' },
  role: { lo: 'ຕຳແໜ່ງ', en: 'Role' },
  admin: { lo: 'ຜູ້ຈັດການ', en: 'Admin' },
  staff: { lo: 'ພະນັກງານ', en: 'Staff' },
  addNewUser: { lo: 'ເພີ່ມຜູ້ໃຊ້ໃໝ່', en: 'Add New User' },
  password: { lo: 'ລະຫັດຜ່ານ', en: 'Password' },
  userRole: { lo: 'ສິດການໃຊ້ງານ', en: 'User Role' },

  // Settings
  systemSettings: { lo: 'ຕັ້ງຄ່າລະບົບ', en: 'System Settings' },
  configDesc: { lo: 'ຈັດການຂໍ້ມູນຮ້ານ ແລະ ການເຊື່ອມຕໍ່', en: 'Manage store info and integrations' },
  generalSettings: { lo: 'ຂໍ້ມູນທົ່ວໄປ', en: 'General Settings' },
  storeName: { lo: 'ຊື່ຮ້ານ', en: 'Store Name' },
  storePhone: { lo: 'ເບີໂທລະສັບ', en: 'Phone Number' },
  storeAddress: { lo: 'ທີ່ຢູ່', en: 'Address' },
  paymentSettings: { lo: 'ຕັ້ງຄ່າການຊຳລະເງິນ', en: 'Payment Settings' },
  phajayIntegration: { lo: 'ເຊື່ອມຕໍ່ລະບົບ PhaJay', en: 'PhaJay Integration' },
  enablePhaJay: { lo: 'ເປີດໃຊ້ງານ PhaJay QR', en: 'Enable PhaJay QR' },
  secretKey: { lo: 'Secret Key', en: 'Secret Key' },
  storeTag: { lo: 'Tag ຮ້ານຄ້າ (Branch ID)', en: 'Store Tag (Branch ID)' },
  settingsSaved: { lo: 'ບັນທຶກການຕັ້ງຄ່າສຳເລັດ', en: 'Settings Saved Successfully' }
};