import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// 로그인 상태와 로그인·가입·로그아웃 함수를 앱 전체에서 같이 쓰기 위한 보관함
const AuthContext = createContext(null);

// Supabase 가 주는 영어 오류를 화면에 보여 줄 한국어 문구로 바꾼다
function getKoreanError(error, action) {
  const code = String(error.code || '');
  const message = String(error.message || '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 맞지 않습니다.';
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return '이미 가입된 이메일입니다.';
  }
  if (code === 'weak_password' || message.includes('at least')) {
    return '비밀번호는 6자 이상으로 입력해 주세요.';
  }
  if (code === 'email_address_invalid' || message.includes('invalid email')) {
    return '이메일 형식이 올바르지 않습니다.';
  }
  if (code === 'email_not_confirmed') {
    return '이메일 확인이 아직 끝나지 않았습니다. 메일함을 확인해 주세요.';
  }
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (message.includes('fetch') || message.includes('network')) {
    return '연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (action === 'signup') {
    return '회원가입에 실패했습니다. 다시 시도해 주세요.';
  }
  return '로그인에 실패했습니다. 다시 시도해 주세요.';
}

// Supabase 연결이 없을 때(.env.local 값이 비어 있을 때) 쓰는 안내
const NOT_READY_MESSAGE = '서버 설정이 되어 있지 않습니다. .env.local 값을 확인해 주세요.';

/**
 * 로그인 상태 제공자
 * - user: 로그인한 사용자 (없으면 null)
 * - loading: 앱을 처음 열었을 때 로그인 여부를 확인하는 중인지
 * - signIn / signUp / signOut: 로그인·회원가입·로그아웃 함수
 *   signIn, signUp 은 { ok, message, needsConfirm } 를 돌려준다.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 연결이 있을 때만 "확인 중" 상태로 시작한다
  const [loading, setLoading] = useState(supabase !== null);

  // 앱이 열릴 때 저장된 로그인 정보를 확인하고, 이후 로그인·로그아웃 변화를 따라간다
  useEffect(function watchSession() {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(function onSession(result) {
      const session = result.data.session;
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const listener = supabase.auth.onAuthStateChange(function onChange(event, session) {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return function stopWatching() {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  // 로그인
  async function signIn(email, password) {
    if (!supabase) {
      return { ok: false, message: NOT_READY_MESSAGE, needsConfirm: false };
    }
    const result = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (result.error) {
      return { ok: false, message: getKoreanError(result.error, 'login'), needsConfirm: false };
    }
    setUser(result.data.user);
    return { ok: true, message: '', needsConfirm: false };
  }

  // 회원가입
  async function signUp(email, password) {
    if (!supabase) {
      return { ok: false, message: NOT_READY_MESSAGE, needsConfirm: false };
    }
    const result = await supabase.auth.signUp({ email: email, password: password });
    if (result.error) {
      return { ok: false, message: getKoreanError(result.error, 'signup'), needsConfirm: false };
    }

    const newUser = result.data.user;
    // 이미 가입된 이메일이면 Supabase 는 오류 대신 identities 가 빈 사용자를 돌려준다
    if (newUser && newUser.identities && newUser.identities.length === 0) {
      return { ok: false, message: '이미 가입된 이메일입니다.', needsConfirm: false };
    }

    // 가입 직후 로그인 상태(session)가 있으면 바로 사용 가능
    if (result.data.session) {
      setUser(result.data.session.user);
      return { ok: true, message: '', needsConfirm: false };
    }
    // session 이 없으면 이메일 확인이 필요한 설정이다
    return { ok: true, message: '', needsConfirm: true };
  }

  // 로그아웃
  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }

  const value = { user, loading, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 다른 화면에서 로그인 정보를 꺼내 쓰는 함수
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있습니다.');
  }
  return value;
}
