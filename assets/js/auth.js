/** ============================
 *  LSPD 网站登录 & 授权（完整版）
 *  - 支持 Google 登录 / 邮箱注册登录
 *  - 简单授权（邮箱白名单 & Firestore 角色）
 *  - 自动切换“线人情报”入口显示、登录/退出按钮
 * ============================ */

// ---- CDN 方式导入 Firebase SDK ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- 你的 Firebase 配置（已替换为你的项目） ----
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.firebasestorage.app",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec470bee070f1023db80b",
  measurementId: "G-6DY309969K",
};

// ---- 初始化 ----
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// =====================================
//  授权策略（两种任选一种或同时使用）
// =====================================

// 方式 A：邮箱白名单（直接写入允许访问的人）
const ALLOWED_EMAILS = [
  // "yourname@example.com",
];

// 方式 B：Firestore 角色白名单（更灵活）
// 在 Firestore 建集合 "roles"，文档ID 用**邮箱小写**，结构：{ roles: ["officer","admin"] }
const ALLOWED_ROLES = ["officer", "admin", "detective"];

// 读取 Firestore 里的角色
async function getRolesByEmail(email) {
  try {
    const ref = doc(db, "roles", String(email).toLowerCase());
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.roles) ? data.roles : [];
    }
  } catch (e) {
    console.warn("[roles] 读取失败：", e);
  }
  return [];
}

// 统一判断是否有权限
async function userHasAccess(user) {
  if (!user) return false;

  // A. 邮箱白名单
  if (ALLOWED_EMAILS.length && ALLOWED_EMAILS.includes(user.email?.toLowerCase())) {
    return true;
  }

  // B. 角色白名单
  if (ALLOWED_ROLES.length) {
    const roles = await getRolesByEmail(user.email || "");
    if (roles.some(r => ALLOWED_ROLES.includes(String(r).toLowerCase()))) {
      return true;
    }
  }

  // 默认：没命中授权规则即无权限
  return false;
}

// 根据登录/权限切换页面元素显示
async function updateUI(user) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const informantsLink = document.getElementById("informantsLink");

  const has = await userHasAccess(user);

  if (loginBtn)  loginBtn.style.display  = user ? "none" : "";
  if (logoutBtn) logoutBtn.style.display = user ? "" : "none";
  if (informantsLink) informantsLink.style.display = user && has ? "" : "none";
}

// 监听登录状态变化，自动更新 UI
onAuthStateChanged(auth, (user) => {
  updateUI(user);
});

// =====================================
//  登录 / 登出 / 邮箱注册
// =====================================

// Google 登录
window.login = async () => {
  try {
    await signInWithPopup(auth, provider);
    alert("✅ 登录成功");
  } catch (e) {
    console.error("[Auth] 登录失败: ", e);
    alert("❌ 登录失败，请重试");
  }
};

// 退出
window.logout = async () => {
  try {
    await signOut(auth);
    alert("✅ 已退出登录");
  } catch (e) {
    console.error("[Auth] 登出失败: ", e);
    alert("❌ 登出失败，请重试");
  }
};

// 邮箱注册
window.register = async (email, password) => {
  if (!email || !password) return alert("请输入邮箱和密码");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ 注册成功");
  } catch (e) {
    console.error("注册失败: ", e);
    alert("❌ 注册失败: " + (e?.message || "未知错误"));
  }
};

// 邮箱登录
window.loginEmail = async (email, password) => {
  if (!email || !password) return alert("请输入邮箱和密码");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ 登录成功");
  } catch (e) {
    console.error("登录失败: ", e);
    alert("❌ 登录失败: " + (e?.message || "未知错误"));
  }
};

