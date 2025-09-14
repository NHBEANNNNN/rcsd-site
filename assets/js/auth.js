// ===== Firebase v10 CDN =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === 你的 Firebase 配置（已替换为你给我的）===
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

// ============== 页面工具 ==============
const $ = (sel) => document.querySelector(sel);
const show = (el) => el && (el.classList.remove('hidden'), el.style.removeProperty('display'));
const hide = (el) => el && (el.classList.add('hidden'), el.style.display = 'none');

// 切换通用的 data-auth 显示
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

// 受限页面：给需要登录的页面加上这一行即可：
// <script>window.REQUIRE_AUTH = true;</script>
function guardIfRequired(user){
  if (window.REQUIRE_AUTH && !user) {
    // 记住来源页，登录后可以跳回来
    sessionStorage.setItem('afterLogin', location.href);
    location.href = 'login.html';
  }
}

// 登录页的 UI 切换
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

    // 若从受限页跳来，登录后直接回去
    const back = sessionStorage.getItem('afterLogin');
    if (back) { sessionStorage.removeItem('afterLogin'); location.href = back; }
  } else {
    show(loginCard); hide(welcomeCard);
    if (logoutNav) hide(logoutNav);
    if (loginNav)  show(loginNav);
  }
}

// ============== 对外暴露的操作 ==============
window.loginEmail = async (email, pwd) => {
  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    alert('✅ 登录成功');
    // 在 login.html 里，onAuthStateChanged 会自动切换 UI 或跳回上一页
    // 在其他页面，保持当前页
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
    // 如果在 login.html，就保持当前；其他页面可选择刷新
  } catch (e) {
    console.error('退出失败:', e);
    alert('❌ 退出失败：' + (e?.message || '请稍后再试'));
  }
};

// ============== 登录状态全站监听 ==============
onAuthStateChanged(auth, (user) => {
  toggleAuthVisibility(user);
  guardIfRequired(user);

  // 如果当前是登录页，切换对应卡片
  if (location.pathname.endsWith('login.html')) {
    toggleLoginPage(user);
  } else {
    // 如果从登录页跳回来的，优先使用 afterLogin（login.html 里已处理，这里兜底）
    if (user && sessionStorage.getItem('afterLogin')) {
      const url = sessionStorage.getItem('afterLogin');
      sessionStorage.removeItem('afterLogin');
      location.href = url;
    }
  }
});


