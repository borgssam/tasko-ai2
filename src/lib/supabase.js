import { createClient } from '@supabase/supabase-js';

// Supabase 연결 하나를 만들어 앱 전체에서 같이 쓴다.
// 값은 .env.local 의 환경변수에서 읽는다. (Vite는 VITE_ 로 시작하는 이름만 읽을 수 있다)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

// 값이 비어 있으면 연결을 만들지 않고 콘솔에 알린다. (빈 값으로 만들면 앱이 멈춘다)
if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    '[Supabase] .env.local 에 VITE_SUPABASE_URL 과 VITE_SUPABASE_PUBLISHABLE_KEY 값을 넣어 주세요. 값을 바꾼 뒤에는 개발 서버를 다시 시작해야 합니다.'
  );
} else {
  supabase = createClient(supabaseUrl, supabasePublishableKey);
}

export { supabase };
