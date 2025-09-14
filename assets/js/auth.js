// ===== Firebase v10 CDN =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === 你的 Firebase 配置 ===
const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.firebasestorage.app",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec2470be0f8123db80b",
  measurementId: "G-6DY309969K"
};

// 初始化
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ====== DOM 工具 ======
const $ = (sel) => document.querySelector(sel);
const show = (el) => el && (el.classList.remove('hidden'), el.style.removeProperty('display'));
const hide = (el) => el && (el.classList.add('hidden'), el.style.display = 'none');

// 登录/退出可见性
function toggleAuthVisibility(user){
  document.querySelectorAll('[data-auth="guest"]').forEach(el => user ? hide(el) : show(el));
  document.querySelectorAll('[data-auth="user"]').forEach(el => user ? show(el) : hide(el));

  const who = $('#whoami');
  if (who) {
    if (user?.email) {
      who.textContent = `👮 ${user.email}`;
      show(who);
    } else hide(who);
  }
}

// 受限页守卫：在页面里放 <script>window.REQUIRE_AUTH = true;</script>
function guardIfRequired(user){
  if (window.REQUIRE_AUTH && !user) {
    sessionStorage.setItem('afterLogin', location.href);
    location.href = 'login.html';
  }
}

// 登录页的切换
function toggleLoginPage(user){
  const loginCard   = $('#loginCard');
  const welcomeCard = $('#welcomeCard');
  const loginNav = $('#loginNav'), logoutNav = $('#logoutNav');

  if (user){
    hide(loginCard);  show(welcomeCard);
    if (logoutNav) show(logoutNav);
    if (loginNav)  hide(loginNav);
    const who = $('#whoami');
    if (who) { who.textContent = `👮 ${user.email}`; show(who); }

    // 登录页：无 afterLogin 则默认去个人信息页
    const back = sessionStorage.getItem('afterLogin');
    if (back) { sessionStorage.removeItem('afterLogin'); location.href = back; }
    else location.href = 'profile.html';
  } else {
    show(loginCard); hide(welcomeCard);
    if (logoutNav) hide(logoutNav);
    if (loginNav)  show(loginNav);
  }
}

// ====== 提供给页面的操作 ======
window.loginEmail = async (email, pwd) => {
  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    alert('✅ 登录成功');
  } catch (e) {
    console.error('登录失败:', e);
    alert('❌ 登录失败：' + (e?.message || '请检查账号/密码'));
  }
};

window.register = async (email, pwd) => {
  try {
    await createUserWithEmailAndPassword(auth, email, pwd);
    alert('✅ 注册并登录成功');
  } catch (e) {
    console.error('注册失败:', e);
    alert('❌ 注册失败：' + (e?.message || '请检查邮箱格式与密码强度'));
  }
};

window.logout = async () => {
  try {
    await signOut(auth);
    alert('已退出');
  } catch (e) {
    console.error('退出失败:', e);
    alert('❌ 退出失败：' + (e?.message || '请稍后再试'));
  }
};

// ====== 全站状态监听 ======
onAuthStateChanged(auth, (user) => {
  toggleAuthVisibility(user);
  guardIfRequired(user);

  // 登录页专属逻辑
  if (location.pathname.endsWith('login.html')) {
    toggleLoginPage(user);
  } else {
    // 从登录回跳兜底
    if (user && sessionStorage.getItem('afterLogin')) {
      const url = sessionStorage.getItem('afterLogin');
      sessionStorage.removeItem('afterLogin');
      location.href = url;
    }
  }
});


