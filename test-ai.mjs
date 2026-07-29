import OpenAI from 'openai';

// 1. OpenAI 연동 설정
// OpenAI 웹사이트(https://platform.openai.com/api-keys)에서 발급받은 API 키를 아래에 넣으세요.
const openai = new OpenAI({
  apiKey: 'sk-proj-여기에_복사한_API_KEY를_붙여넣으세요',
});

// 2. AI에게 질문 보내는 함수
async function askAI() {
  console.log('AI에게 질문을 보내는 중...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: '안녕! 연동이 성공했는지 확인해줘.' }],
    });

    console.log('\n[AI의 답변]:');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('연동 오류 발생:', error.message);
  }
}

askAI();
