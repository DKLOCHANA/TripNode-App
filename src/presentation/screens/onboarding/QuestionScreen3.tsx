import { QuestionScreen } from './QuestionScreen';
import { ONBOARDING_QUESTIONS } from '@/config';

const config = ONBOARDING_QUESTIONS.question3;

export function QuestionScreen3() {
  return (
    <QuestionScreen
      question={config.question}
      options={config.options}
      nextRoute={config.nextRoute}
      storeKey={config.storeKey}
    />
  );
}
