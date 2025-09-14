
// assets/js/login.js
// Firebase 登录/注册逻辑

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ===== 你的 Firebase 配置（从控制台复制的） =====
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.appspot.com",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec2470bee070f1023db80b",
  measurementId: "G-6DY309969K",
};
// ===================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM 元素
const emailEl = document.getElementById("email");
const passEl  = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

// 登录
btnLogin?.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  const pwd   = passEl.value.trim();
  if (!email || !pwd) return alert("请输入邮箱和密码");

  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    // 登录成功 → 跳转
    location.href = "profile.html";
  } catch (err) {
    console.error("登录失败：", err);
    alert("登录失败：" + (err?.message || err));
  }
});

// 注册
btnRegister?.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  const pwd   = passEl.value.trim();
  if (!email || !pwd) return alert("请输入邮箱和密码");
  if (pwd.length < 6) return alert("密码至少 6 位");

  try {
    await createUserWithEmailAndPassword(auth, email, pwd);
    // 注册成功 → 跳转
    location.href = "profile.html";
  } catch (err) {
    console.error("注册失败：", err);
    alert("注册失败：" + (err?.message || err));
  }
});

// 已登录用户访问 login.html → 自动跳转
onAuthStateChanged(auth, (user) => {
  if (user) {
    location.replace("profile.html");
  }
});
