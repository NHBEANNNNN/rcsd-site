<!-- 放在: assets/js/auth.js（整文件替换） -->
<script type="module">
// ----- Firebase CDN -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ----- 你的项目配置（已替换成你在控制台生成的配置） -----
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.firebasestorage.app",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec470bee070f1023db80b",
  measurementId: "G-6DY309969K"
};

// ----- 初始化 -----
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ----- 工具：查询角色（基于 roles/{emailLower}.role）-----
export async function getRoleByEmail(email) {
  if (!email) return null;
  const key = String(email).toLowerCase();
  const ref = doc(db, "roles", key);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().role : null;
}

// ----- 登录（Email/密码）后按角色跳转 -----
export async function loginEmailPassword(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  const role = await getRoleByEmail(email);
  if (role === "admin") {
    location.href = "admin.html";
  } else {
    location.href = "profile.html";
  }
}

// ----- 登出 -----
export async function doLogout() {
  await signOut(auth);
  location.href = "index.html";
}

// ----- 页面守卫：需要已登录 -----
export function requireLogin(redirect = "login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) location.href = redirect;
  });
}

// ----- 页面守卫：需要管理员 -----
export function requireAdmin(redirect = "login.html") {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.href = redirect;
    const role = await getRoleByEmail(user.email);
    if (role !== "admin") location.href = "profile.html";
  });
}

// ----- Admin：设置某邮箱为管理员 -----
export async function setAdminByEmail(emailLower) {
  const ref = doc(db, "roles", String(emailLower).toLowerCase());
  await setDoc(ref, { role: "admin" }, { merge: true });
}

// ----- Users 集合读写 -----
export async function readUserDoc(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function writeUserDoc(uid, data) {
  // 受 Security Rules 保护：仅 admin 可写
  const ref = doc(db, "users", uid);
  await setDoc(ref, data, { merge: true });
}

// ----- Admin：列出全部 users -----
export async function listAllUsers() {
  const col = collection(db, "users");
  const snaps = await getDocs(col);
  return snaps.docs.map(d => ({ uid: d.id, ...d.data() }));
}

// 兼容现有首页的两个按钮（若你还在 index.html 用到）
window.login = async () => {
  const email = document.getElementById("email")?.value || "";
  const pwd = document.getElementById("password")?.value || "";
  try {
    await loginEmailPassword(email, pwd);
  } catch (e) {
    alert("登录失败：" + (e?.message || e));
  }
};
window.logout = () => doLogout();
// 下面是示意：合并到你自己的 initialize 之后的 onAuthStateChanged 回调中
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  const adminLink = document.getElementById('adminLink');
  if (adminLink) adminLink.style.display = 'none';

  if (!user) {
    // 未登录就不显示
    return;
  }
  // 检查角色
  const email = (user.email || "").toLowerCase();
  const roleSnap = await getDoc(doc(db, "roles", email));
  const isAdmin = roleSnap.exists() && String(roleSnap.data().role).toLowerCase() === "admin";

  if (isAdmin && adminLink) {
    adminLink.style.display = "inline-block";
  }
});

</script>



