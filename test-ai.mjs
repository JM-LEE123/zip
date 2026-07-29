import OpenAI from 'openai';

// 1. 학교 LLM (Mindlogic Gateway) 연동 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_API_KEY',
  baseURL: 'https://factchat-cloud.mindlogic.ai/v1/gateway',
});

// 2. AI 질문 테스트 함수
async function askAI() {
  console.log('AI에게 질문을 보내는 중...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.5', // 게이트웨이에 등록된 GPT 5.5 모델 ID
      messages: [{ role: 'user', content: '안녕! 연동이 성공했는지 확인해줘.' }],
    });

    console.log('\n[AI의 답변]:');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('연동 오류 발생:', error.message);
  }
}

askAI();


