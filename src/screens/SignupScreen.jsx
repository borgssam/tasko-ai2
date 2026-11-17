import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Tasko 모바일 회원가입 화면
 * - 입력을 확인한 뒤 Supabase 이메일·비밀번호로 가입합니다.
 * - 가입되어 로그인 상태가 되면 대시보드(/dashboard)로 이동합니다.
 * - 실패하면 한국어 오류 문구를 화면에 보여 줍니다.
 */
export default function SignupScreen() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 회원가입 버튼을 눌렀을 때: 입력 확인 → 가입 요청 → 성공이면 대시보드
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setErrorMessage('');
    setNoticeMessage('');

    // 1) 입력 확인
    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상으로 입력해 주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호와 비밀번호 확인이 서로 다릅니다.');
      return;
    }

    // 2) 가입 요청
    setIsSubmitting(true);
    const result = await signUp(email.trim(), password);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    // 이메일 확인이 필요한 설정이면 안내만 보여 준다
    if (result.needsConfirm) {
      setNoticeMessage('확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.');
      return;
    }
    navigate('/dashboard');
  }

  // 요청 중에는 버튼 글자를 바꾼다
  let buttonLabel = '회원가입';
  if (isSubmitting) {
    buttonLabel = '가입 중...';
  }

  return (
    <div className="w-full h-full bg-tasko-bg flex flex-col justify-between select-none">
      {/* 상단 헤더 */}
      <header className="pt-4 px-7 flex items-center justify-between z-10 shrink-0">
        <span className="text-[13px] font-medium text-tasko-secondary tracking-tight">Tasko Mobile</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-tasko-primary inline-block"></span>
          <span className="text-[13px] font-medium text-tasko-secondary">Online</span>
        </div>
      </header>

      {/* 중앙 메인 컨텐츠: 브랜드 및 회원가입 입력 필드 */}
      <section className="px-7 w-full flex flex-col items-center">
        {/* 브랜드 로고 & 타이틀 */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-tasko-primary flex items-center justify-center text-white shadow-sm">
              <svg aria-hidden="true" className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-tasko-text">Tasko</h1>
          </div>
          <p className="text-[14px] text-tasko-secondary font-medium tracking-tight">이메일로 간단하게 시작하세요</p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          {/* 항목 1: 이메일 */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-tasko-secondary pl-0.5" htmlFor="signupEmail">
              이메일
            </label>
            <input
              className="w-full h-[50px] px-4 rounded-xl border border-tasko-border bg-tasko-surface text-[14.5px] text-tasko-text placeholder-tasko-muted focus:outline-none focus:border-tasko-primary focus:ring-1 focus:ring-tasko-primary transition-colors"
              id="signupEmail"
              placeholder="example@tasko.app"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 항목 2: 비밀번호 */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-tasko-secondary pl-0.5" htmlFor="signupPassword">
              비밀번호
            </label>
            <input
              className="w-full h-[50px] px-4 rounded-xl border border-tasko-border bg-tasko-surface text-[14.5px] text-tasko-text placeholder-tasko-muted focus:outline-none focus:border-tasko-primary focus:ring-1 focus:ring-tasko-primary transition-colors"
              id="signupPassword"
              placeholder="비밀번호를 입력하세요"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 항목 3: 비밀번호 확인 */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-tasko-secondary pl-0.5" htmlFor="passwordConfirm">
              비밀번호 확인
            </label>
            <input
              className="w-full h-[50px] px-4 rounded-xl border border-tasko-border bg-tasko-surface text-[14.5px] text-tasko-text placeholder-tasko-muted focus:outline-none focus:border-tasko-primary focus:ring-1 focus:ring-tasko-primary transition-colors"
              id="passwordConfirm"
              placeholder="비밀번호를 한 번 더 입력하세요"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {/* 오류·안내 문구 (해당할 때만 보인다) */}
          {errorMessage && (
            <p role="alert" className="text-xs font-medium text-tasko-destructive">
              {errorMessage}
            </p>
          )}
          {noticeMessage && (
            <p role="status" className="text-xs font-medium text-tasko-primary">
              {noticeMessage}
            </p>
          )}

          {/* 회원가입 버튼 */}
          <div className="pt-2">
            <button
              className="w-full h-[50px] bg-tasko-primary hover:bg-tasko-primary-hover active:scale-[0.99] text-white font-medium text-[15px] rounded-xl shadow-[0_4px_14px_rgba(30,166,92,0.25)] transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {buttonLabel}
            </button>
          </div>
        </form>
      </section>

      {/* 하단 로그인 전환 링크 */}
      <footer className="pb-8 flex flex-col items-center shrink-0">
        <p className="text-[13px] text-tasko-secondary font-normal tracking-tight">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-tasko-primary font-semibold hover:underline ml-1">
            로그인
          </Link>
        </p>
      </footer>
    </div>
  );
}
