// ==========================
// auth.js  —  登录 + 角色授权
// ==========================

// Firebase SDK - 使用 CDN 方式导入（适合 GitHub Pages）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// 🔹 使用你提供的真实配置
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.firebasestorage.app",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec470bee070f1023db80b",
  measurementId: "G-6DY309969K"
};

// 初始化
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const analytics = getAnalytics(app); // 🔹 你配置里有 analytics，直接加上
const provider = new GoogleAuthProvider();

// 登录/登出
window.login = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("[Auth] 登录失败:", e);
    alert("❌ 登录失败，请重试");
  }
};

window.logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("[Auth] 登出失败:", e);
  }
};

// 从 Firestore 获取角色
async function getRolesByEmail(email) {
  if (!email) return {};
  try {
    const ref  = doc(db, "roles", String(email).toLowerCase());
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() || {}) : {};
  } catch (e) {
    console.error("[Auth] 获取角色失败:", e);
    return {};
  }
}

// 状态监听
onAuthStateChanged(auth, async (user) => {
  const link      = document.getElementById("informantsLink");
  const loginBtn  = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const authState = document.getElementById("authState");

  if (!user) {
    if (link)      link.style.display = "none";
    if (loginBtn)  loginBtn.style.display  = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (authState) authState.textContent   = "未登录";
    return;
  }

  if (authState) authState.textContent = `已登录：${user.displayName || user.email}`;
  if (loginBtn)  loginBtn.style.display  = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-flex";

  const roles = await getRolesByEmail(user.email || "");
  const allowed = roles.intel === true;

  if (link) link.style.display = allowed ? "inline-block" : "none";
});

// 受限页面专用函数
window.requireIntel = () => new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.replace("index.html");
      return;
    }
    const roles = await getRolesByEmail(user.email || "");
    if (roles.intel === true) {
      resolve(user);
    } else {
      location.replace("index.html");
    }
  });
});

