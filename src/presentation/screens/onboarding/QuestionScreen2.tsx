import { QuestionScreen } from './QuestionScreen';
import { ONBOARDING_QUESTIONS } from '@/config';

const config = ONBOARDING_QUESTIONS.question2;

export function QuestionScreen2() {
  return (
    <QuestionScreen
      question={config.question}
      options={config.options}
      nextRoute={config.nextRoute}
      storeKey={config.storeKey}
    />
  );
}
