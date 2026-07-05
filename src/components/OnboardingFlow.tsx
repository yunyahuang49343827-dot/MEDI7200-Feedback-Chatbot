import { useEffect, useRef, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import MessageText from './MessageText';

export type OnboardingMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  tone?: 'alert' | 'typing';
};

const welcomeMessages: OnboardingMessage[] = [
  {
    id: 'welcome-year-2-context',
    sender: 'bot',
    text: 'Based on feedback from previous cohorts, changes were made in some of these areas.',
  },
];

const privacyMessages: OnboardingMessage[] = [
  {
    id: 'welcome-privacy-1',
    sender: 'bot',
    text: 'Before we begin, please do not include **names**, **student numbers**, or other **identifiable information** in your responses.',
    tone: 'alert',
  },
  {
    id: 'welcome-privacy-2',
    sender: 'bot',
    text: 'Any **identifiable information** may need to be **removed** before responses are reviewed.',
    tone: 'alert',
  },
];

type OnboardingStage = 'welcomeIntro' | 'welcomeReady' | 'privacyIntro' | 'privacyReady';
type TransitionTarget = 'privacy' | 'survey';

type OnboardingFlowProps = {
  messages: OnboardingMessage[];
  onMessagesChange: (messages: OnboardingMessage[]) => void;
  onContinue: () => void;
};

function createTypingMessage(): OnboardingMessage {
  return {
    id: `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender: 'bot',
    text: '',
    tone: 'typing',
  };
}

function OnboardingFlow({ messages, onMessagesChange, onContinue }: OnboardingFlowProps) {
  const [stage, setStage] = useState<OnboardingStage>('welcomeIntro');
  const [transitionTarget, setTransitionTarget] = useState<TransitionTarget | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { isTextAnimating, displayTextById, isMessageComplete, getMessageText } =
    useTypewriter(messages);

  useEffect(() => {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    const scrollToLatest = (behavior: ScrollBehavior = 'auto') => {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior,
      });

      messagesEndRef.current?.scrollIntoView({
        behavior,
        block: 'end',
      });
    };

    window.requestAnimationFrame(() => scrollToLatest(isTextAnimating ? 'auto' : 'smooth'));
    const scrollTimer = window.setTimeout(() => scrollToLatest('auto'), 80);
    const layoutTimer = window.setTimeout(() => scrollToLatest('auto'), 220);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(layoutTimer);
    };
  }, [messages, stage, isTextAnimating, displayTextById]);

  // Reveal the intro messages of the current stage one by one, then unlock
  // the stage's continue button.
  useEffect(() => {
    if ((stage !== 'welcomeIntro' && stage !== 'privacyIntro') || isTextAnimating) {
      return;
    }

    const activeMessages = stage === 'welcomeIntro' ? welcomeMessages : privacyMessages;
    const nextMessage = activeMessages.find(
      (messageToShow) => !messages.some((message) => message.id === messageToShow.id),
    );

    if (nextMessage) {
      onMessagesChange([...messages, nextMessage]);
      return;
    }

    setStage(stage === 'welcomeIntro' ? 'welcomeReady' : 'privacyReady');
  }, [isTextAnimating, messages, onMessagesChange, stage]);

  // After a short typing indicator, move to the next stage or hand over to
  // the survey.
  useEffect(() => {
    if (!transitionTarget) {
      return;
    }

    const transitionTimer = window.setTimeout(() => {
      const messagesWithoutTyping = messages.filter((message) => message.tone !== 'typing');

      onMessagesChange(messagesWithoutTyping);
      setTransitionTarget(null);

      if (transitionTarget === 'privacy') {
        setStage('privacyIntro');
        return;
      }

      onContinue();
    }, 1000);

    return () => window.clearTimeout(transitionTimer);
  }, [messages, onContinue, onMessagesChange, transitionTarget]);

  const showPrivacyReminder = () => {
    if (stage !== 'welcomeReady' || transitionTarget) {
      return;
    }

    setTransitionTarget('privacy');
    onMessagesChange([...messages, createTypingMessage()]);
  };

  const startSurvey = () => {
    if (stage !== 'privacyReady' || transitionTarget) {
      return;
    }

    setTransitionTarget('survey');
    onMessagesChange([...messages, createTypingMessage()]);
  };

  return (
    <div className="onboarding-chat" aria-label="Course feedback onboarding">
      <div className="onboarding-message-list" ref={messageListRef}>
        {messages.map((message) => (
          <div
            className={`chat-bubble ${message.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}${
              message.tone === 'alert' ? ' alert-bubble' : ''
            }${message.tone === 'typing' ? ' typing-bubble' : ''}`}
            key={message.id}
          >
            <MessageText text={getMessageText(message)} showBold={isMessageComplete(message)} />
          </div>
        ))}

        {stage === 'welcomeReady' && !isTextAnimating && !transitionTarget && (
          <div className="quick-reply-group inline-quick-reply-group">
            <button
              className="quick-reply-button"
              type="button"
              onPointerDown={showPrivacyReminder}
              onClick={showPrivacyReminder}
            >
              Continue
            </button>
          </div>
        )}

        {stage === 'privacyReady' && !isTextAnimating && !transitionTarget && (
          <div className="quick-reply-group inline-quick-reply-group">
            <button
              className="quick-reply-button"
              type="button"
              onPointerDown={startSurvey}
              onClick={startSurvey}
            >
              I understand
            </button>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    </div>
  );
}

export default OnboardingFlow;
