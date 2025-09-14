// assets/js/auth.js
// Firebase v12.2.1 CDN 版本，适配 GitHub Pages

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 你的 Firebase 配置（修正了 storageBucket）
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.appspot.com",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec470bee070f1023db80b",
  measurementId: "G-6DY309969K"
};

// 初始化
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 强制使用本地持久化
setPersistence(auth, browserLocalPersistence).catch(console.error);

// 防抖：避免短时间内多次跳转
let __redirecting = false;

/**
 * 登录页守卫：如果已登录 -> 跳 profile.html，否则显示表单
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
 * 资料页守卫：如果未登录 -> 跳 login.html，否则执行回调
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
 * 读取 Firestore 用户档案并填充 profile.html
 */
export async function readUserDoc(user) {
  try {
    const ref = doc(db, "user", user.email);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    const mapping = {
      name: data.name || "",
      id: data.badge || "",
      callsign: data.callsign || "",
      rank: data.division || "",
      status: data.status || "",
      phone: data.phone || "",
      email: user.email || "",
    };

    for (const [k, v] of Object.entries(mapping)) {
      const el = document.getElementById(k);
      if (el) el.innerText = v;
    }

    // 管理员链接控制
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
 * 登录函数：邮箱 + 密码
 */
export async function doLogin(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * 登出
 */
export async function doLogout() {
  await signOut(auth);
  location.href = "login.html";
}
