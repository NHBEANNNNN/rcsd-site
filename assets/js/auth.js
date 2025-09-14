// assets/js/auth.js
// Firebase v10 模块化 + 登录/资料页双守卫（解决来回跳的问题）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: 替换为你的实际配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ---- Init ----
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 强制使用本地持久化，防止状态在页面切换时瞬间丢失
setPersistence(auth, browserLocalPersistence).catch(console.error);

// 防抖：避免短时间内多次跳转造成循环
let __redirecting = false;

/**
 * 登录页守卫：
 *  - 若已登录 -> 直接去 profile.html
 *  - 若未登录 -> 调用 showForm() 显示登录表单
 */
export function guardLogin(showForm) {
  onAuthStateChanged(auth, (user) => {
    if (__redirecting) return;
    if (user) {
      __redirecting = true;
      location.href = "profile.html";
    } else {
      showForm && showForm();
    }
  });
}

/**
 * 资料页守卫：
 *  - 若未登录 -> 回到 login.html
 *  - 若已登录 -> 执行 onReady(user)
 */
export function requireLogin(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (__redirecting) return;
    if (!user) {
      __redirecting = true;
      location.href = "login.html";
      return;
    }
    onReady && onReady(user);
  });
}

/**
 * 读取 Firestore 用户档案并填充到 profile.html
 * 你的库结构：集合名 "user"（单数），文档 ID 是邮箱；
 * 将 badge → #id，division → #rank，email 用当前登录邮箱。
 */
export async function readUserDoc(user) {
  try {
    const ref = doc(db, "user", user.email); // 集合名与之前截图一致
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    const mapping = {
      name: data.name || "",
      id: data.badge || "",        // badge → id
      callsign: data.callsign || "",
      rank: data.division || "",   // division → rank
      status: data.status || "",
      phone: data.phone || "",
      email: user.email || "",
    };

    for (const [k, v] of Object.entries(mapping)) {
      const el = document.getElementById(k);
      if (el) el.innerText = v;
    }

    // 管理员链接（roles/{email}.admin === true 则显示）
    try {
      const roleSnap = await getDoc(doc(db, "roles", user.email));
      const isAdmin = roleSnap.exists() && roleSnap.data().admin === true;
      const adminLink = document.getElementById("adminLink");
      if (adminLink) adminLink.style.display = isAdmin ? "inline" : "none";
    } catch (_) {}
  } catch (err) {
    console.error("读取用户资料失败:", err);
  }
}

/**
 * 邮箱密码登录（供 login.html 调用）
 */
export async function doLogin(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  // 登录成功后 onAuthStateChanged 会把你送去 profile.html
}

/**
 * 退出登录
 */
export async function doLogout() {
  await signOut(auth);
  location.href = "login.html";
}
