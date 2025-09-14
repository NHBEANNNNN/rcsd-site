// assets/js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// === 用你的同一份 Firebase 配置（和 auth.js 保持一致）===
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.firebasestorage.app",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec2470be0f81230bd8b0",
  measurementId: "G-6DY309969K"
};
// ====================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 简单选择器
const $ = (s) => document.querySelector(s);

// 页面元素
const $userList   = $('#userList');     // 用户列表容器
const $logoutBtn  = $('#logoutBtn');    // 退出按钮
const $saveBtn    = $('#saveBtn');      // 保存资料按钮
const $grantBtn   = $('#grantBtn');     // 授予管理员按钮
const $adminEmail = $('#adminEmail');   // 授权管理员邮箱输入框

// 表单字段
const $f = {
  name:    $('#name'),
  badge:   $('#badge'),
  callsign:$('#callsign'),
  division:$('#division'),
  status:  $('#status'),
  phone:   $('#phone'),
  email:   $('#email'),
};

let currentUid = ""; // 当前选中 users 文档 ID（可用 UID 或 email）

// 加载 users 列表
async function loadUsers() {
  if ($userList) $userList.innerHTML = '加载中...';
  const snap = await getDocs(collection(db, 'users'));
  if (snap.empty) {
    if ($userList) $userList.innerHTML = '<p>暂无用户资料。</p>';
    return;
    }
  const ul = document.createElement('ul');
  ul.style.lineHeight = '1.9';
  for (const d of snap.docs) {
    const li = document.createElement('li');
    const data = d.data();
    li.style.cursor = 'pointer';
    li.textContent = `${data.name || '(未填写)'} — ${data.email || ''} — [id:${d.id}]`;
    li.onclick = () => fillForm(d.id, data);
    ul.appendChild(li);
  }
  if ($userList) {
    $userList.innerHTML = '';
    $userList.appendChild(ul);
  }
}

// 把数据填入表单
function fillForm(uid, data) {
  currentUid = uid;
  $f.name.value     = data.name     || '';
  $f.badge.value    = data.badge    || '';
  $f.callsign.value = data.callsign || '';
  $f.division.value = data.division || '';
  $f.status.value   = data.status   || '';
  $f.phone.value    = data.phone    || '';
  $f.email.value    = data.email    || '';
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// 保存当前表单到 users/{docId}
// 如果没有选择列表中的用户，则用 email 作为 docId 新建
async function saveUser() {
  try {
    let docId = currentUid;
    if (!docId) {
      const email = ($f.email.value || '').trim().toLowerCase();
      if (!email) {
        alert('请先填写邮箱（将作为新建文档 ID）或从上方列表选择一个用户。');
        return;
      }
      docId = email; // 简化：用邮箱作为文档 ID
    }
    const payload = {
      name:     $f.name.value.trim(),
      badge:    $f.badge.value.trim(),
      callsign: $f.callsign.value.trim(),
      division: $f.division.value.trim(),
      status:   $f.status.value.trim(),
      phone:    $f.phone.value.trim(),
      email:    ($f.email.value || '').trim().toLowerCase(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', docId), payload, { merge: true });
    alert('资料已保存');
    await loadUsers();
  } catch (e) {
    console.error(e);
    alert('保存失败：' + e.message);
  }
}

// 授予管理员：roles/{email} = {role:'admin'}
async function grantAdmin() {
  const email = ($adminEmail.value || '').trim().toLowerCase();
  if (!email) return alert('请输入要授权的邮箱');
  try {
    await setDoc(doc(db, 'roles', email), { role: 'admin' }, { merge: true });
    alert('已授予管理员');
  } catch (e) {
    console.error(e);
    alert('授权失败：' + e.message);
  }
}

// 退出
async function doLogout() {
  await signOut(auth);
  window.location.href = 'index.html';
}

// 进入页面的守卫：必须登录且角色为 admin
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  const email = (user.email || '').toLowerCase();
  const r = await getDoc(doc(db, 'roles', email));
  const isAdmin = r.exists() && String(r.data().role).toLowerCase() === 'admin';
  if (!isAdmin) {
    alert('非管理员，无法访问');
    window.location.href = 'index.html';
    return;
  }
  // 管理员：加载列表
  loadUsers();
});

// 事件绑定
if ($logoutBtn) $logoutBtn.onclick = doLogout;
if ($saveBtn)   $saveBtn.onclick   = saveUser;
if ($grantBtn)  $grantBtn.onclick  = grantAdmin;
