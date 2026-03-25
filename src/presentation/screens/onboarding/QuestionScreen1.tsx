import { QuestionScreen } from './QuestionScreen';
import { ONBOARDING_QUESTIONS } from '@/config';

const config = ONBOARDING_QUESTIONS.question1;

export function QuestionScreen1() {
  return (
    <QuestionScreen
      question={config.question}
      options={config.options}
      nextRoute={config.nextRoute}
      storeKey={config.storeKey}
    />
  );
}
