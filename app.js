// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC7V0kGz3p11sjF-FMSLW4kJ5WuZzNtLX0",
  authDomain: "cafe-pc-8a386.firebaseapp.com",
  databaseURL: "https://cafe-pc-8a386-default-rtdb.firebaseio.com",
  projectId: "cafe-pc-8a386",
  storageBucket: "cafe-pc-8a386.firebasestorage.app",
  messagingSenderId: "150129569328",
  appId: "1:150129569328:web:34c4980a7b9b3a6d1947f5",
  measurementId: "G-5HJ1Z58WXF"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
let currentUser = "";

// تسجيل الدخول
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (user === "admin" && pass === "1234") {
    currentUser = user;
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadInventory();
    loadLogs();
  } else {
    document.getElementById("loginError").innerText = "خطأ في تسجيل الدخول";
  }
}

// تحميل المخزون
function loadInventory() {
  const tableBody = document.querySelector("#inventoryTable tbody");
  tableBody.innerHTML = "";
  db.ref("inventory").on("value", snapshot => {
    tableBody.innerHTML = "";
    snapshot.forEach(item => {
      const data = item.val();
      const row = `
        <tr>
          <td>${data.name}</td>
          <td>${data.qty}</td>
          <td>
            <button class="add-btn" onclick="changeQty('${item.key}', 'add')">إضافة</button>
            <button class="pull-btn" onclick="changeQty('${item.key}', 'pull')">سحب</button>
            <button class="delete-btn" onclick="deleteProduct('${item.key}')">حذف</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  });
}

// إضافة منتج جديد
function addProduct() {
  const name = document.getElementById("productName").value;
  const qty = document.getElementById("productQty").value;
  if (!name || !qty) return alert("املأ جميع الحقول");
  const newRef = db.ref("inventory").push();
  newRef.set({ name, qty: parseInt(qty) });
  addLog("إضافة منتج", name, qty);
  document.getElementById("productName").value = "";
  document.getElementById("productQty").value = "";
}

// تعديل الكمية (إضافة أو سحب)
function changeQty(id, type) {
  const amount = prompt("أدخل الكمية:");
  if (amount === null || isNaN(amount) || amount <= 0) return;
  db.ref("inventory/" + id).once("value").then(snapshot => {
    const currentQty = snapshot.val().qty;
    const name = snapshot.val().name;
    let newQty = type === "add" ? currentQty + parseInt(amount) : currentQty - parseInt(amount);
    if (newQty < 0) newQty = 0;
    db.ref("inventory/" + id).update({ qty: newQty });
    addLog(type === "add" ? "إضافة" : "سحب", name, amount);
  });
}

// حذف منتج
function deleteProduct(id) {
  const pass = prompt("أدخل كلمة المرور للحذف:");
  if (pass !== "1234") return alert("كلمة المرور غير صحيحة");
  db.ref("inventory/" + id).once("value").then(snapshot => {
    addLog("حذف", snapshot.val().name, 0);
  });
  db.ref("inventory/" + id).remove();
}

// مسح السجل
function clearLogs() {
  const pass = prompt("أدخل كلمة المرور لمسح السجل:");
  if (pass !== "1234") return alert("كلمة المرور غير صحيحة");
  db.ref("logs").remove();
  alert("تم مسح السجل بالكامل");
}

// إضافة للسجل
function addLog(action, product, qty) {
  const now = new Date().toLocaleString();
  db.ref("logs").push({ action, product, qty, user: currentUser, time: now });
}

// تحميل السجل
function loadLogs() {
  const logsBody = document.querySelector("#logsTable tbody");
  db.ref("logs").on("value", snapshot => {
    logsBody.innerHTML = "";
    snapshot.forEach(log => {
      const data = log.val();
      const row = `
        <tr>
          <td>${data.action}</td>
          <td>${data.product}</td>
          <td>${data.qty}</td>
          <td>${data.user}</td>
          <td>${data.time}</td>
        </tr>
      `;
      logsBody.innerHTML += row;
    });
  });
}
