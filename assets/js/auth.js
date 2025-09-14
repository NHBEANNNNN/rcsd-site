// 使用 CDN 方式导入 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyHFAhPnDfDK6xaGdnx6tel-vUYfpPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.appspot.com",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec2470be0f81723db8b",
  measurementId: "G-6VD389C96K"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 登录函数
async function login() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    alert("✅ 登录成功");
  } catch (error) {
    console.error(error);
    alert("❌ 登录失败");
  }
}

// 登出函数
async function logout() {
  try {
    await signOut(auth);
    alert("已退出登录");
  } catch (error) {
    console.error(error);
  }
}

// 监听登录状态
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("已登录：", user.email);
    // TODO: 这里控制只有警官能看到的板块
  } else {
    console.log("未登录");
  }
});
// 使用 CDN 方式导入 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// === 你的 Firebase 配置（已从控制台复制） ===
const firebaseConfig = {
  apiKey: "你的apiKey",
  authDomain: "你的项目ID.firebaseapp.com",
  projectId: "你的项目ID",
  storageBucket: "你的项目ID.appspot.com",
  messagingSenderId: "xxxx",
  appId: "xxxx",
  measurementId: "G-xxxxx"
};

// 初始化
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// 登录 / 登出
window.login  = async () => {
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) { console.error(e); alert("登录失败"); }
};
window.logout = async () => { try { await signOut(auth); } catch(e){ console.error(e); } };

// —— 读取角色（用邮箱当文档ID）——
async function getRolesByEmail(email){
  if(!email) return {};
  const snap = await getDoc(doc(db, "roles", email.toLowerCase()));
  return snap.exists() ? (snap.data() || {}) : {};
}

// —— 仅授权显示“线人板块”入口 ——
// 在每个页面导航里放：<a href="informants.html" id="informantsLink" style="display:none;">线人板块</a>
onAuthStateChanged(auth, async (user) => {
  const link = document.getElementById("informantsLink");
  if (!link) return;

  if (!user) { link.style.display = "none"; return; }

  const roles = await getRolesByEmail(user.email || "");
  // 只有 intel: true 才显示
  link.style.display = roles.intel === true ? "inline-block" : "none";
});

// —— 受限页面的“强校验” ——
// 在 informants.html 里调用：await window.requireIntel();
window.requireIntel = () => new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { location.replace("index.html"); return; }
    const roles = await getRolesByEmail(user.email || "");
    if (roles.intel === true) resolve(user);
    else location.replace("index.html");
  });
});


