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

