import { useEffect, useRef, useState } from 'react';
import CommentChatFlow from './components/CommentChatFlow';
import OnboardingFlow, { type OnboardingMessage } from './components/OnboardingFlow';
import { useCommentChatFlow } from './hooks/useCommentChatFlow';

type ChatStep = 'welcome' | 'comments';

const initialOnboardingMessages: OnboardingMessage[] = [
  {
    id: 'onboarding-intro-1',
    sender: 'bot',
    text: 'The course team would like to check in with you about specific aspects of Year 2.',
  },
];

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ChatStep>('welcome');
  const [onboardingMessages, setOnboardingMessages] = useState<OnboardingMessage[]>([
    ...initialOnboardingMessages,
  ]);
  const chatContentRef = useRef<HTMLDivElement | null>(null);

  const {
    messages: flowMessages,
    currentQuestionIndex: flowQuestionIndex,
    phase: flowPhase,
    draftText: flowDraftText,
    responses: flowResponses,
    setDraftText: setFlowDraftText,
    resetCommentFlow,
    selectCategory,
    submitMultiCategory,
    submitResponse,
    openEditMenu,
    editQuestion,
    continueSection,
    submitFinalResponse,
  } = useCommentChatFlow({
    onSubmitComments: async () => ({ ok: true }),
    onSavePartial: () => undefined,
  });

  useEffect(() => {
    if (currentStep !== 'welcome') {
      return;
    }

    const scrollToLatest = () => {
      if (chatContentRef.current) {
        chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
      }
    };

    window.requestAnimationFrame(scrollToLatest);
    const scrollTimer = window.setTimeout(scrollToLatest, 80);

    return () => window.clearTimeout(scrollTimer);
  }, [currentStep, onboardingMessages]);

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const completeOnboarding = () => {
    setCurrentStep('comments');
    resetCommentFlow();
  };

  return (
    <main className="app-shell">
      <section className="course-profile-page" aria-labelledby="page-title">
        <header className="course-profile-header">
          <div className="course-profile-header-inner">
            <h1 id="page-title">Developing Skills in Medicine (MEDI7200)</h1>
          </div>
        </header>

        <div className="course-profile-content">
          <section className="course-profile-section" aria-labelledby="clinical-training-title">
            <img
              className="course-profile-image"
              src="/images/clinical-learning-feedback.jpg"
              alt="Bedside clinical learning with a patient"
            />
            <div className="course-profile-section-copy">
              <h2 id="clinical-training-title">Help improve Year 2 learning, assessment, and teaching.</h2>
              <p>
                Share your experience to help the course team understand what is working well and
                what could be improved.
              </p>
              <p>
                This feedback check-in includes three sections: LAPD, assessment, and
                face-to-face/online teaching.
              </p>
              <p>Takes only a few minutes.</p>
              <button className="course-feedback-button" type="button" onClick={openChat}>
                Start feedback
              </button>
            </div>
          </section>

          <section className="course-profile-section" aria-labelledby="feedback-matters-title">
            <img
              className="course-profile-image"
              src="/images/feedback-matters.jpg"
              alt="Healthcare students and professionals discussing around a tablet"
            />
            <div className="course-profile-section-copy">
              <h2 id="feedback-matters-title">Why Your Feedback Matters</h2>
              <p>Some changes have already been made based on feedback from previous cohorts.</p>
              <p>
                This check-in helps the course team understand whether those changes are meaningful
                to current students.
              </p>
              <p>Your responses will help identify what should be kept, adjusted, or improved.</p>
            </div>
          </section>

          <section
            className="course-profile-section feedback-section text-only-section"
            aria-labelledby="feedback-title"
          >
            <div className="course-profile-section-copy">
              <h2 id="feedback-title">About this initiative</h2>
              <p>This is a collaborative initiative between MEDI7200 and SECaT.</p>
              <p>
                We are exploring a chatbot-based approach to collect student feedback in a more
                focused and accessible way.
              </p>
              <p>A summary of the feedback will be shared through the weekly Blackboard bulletin.</p>
              <p>Ready to get started?</p>
              <button className="course-feedback-button" type="button" onClick={openChat}>
                Start feedback
              </button>
            </div>
          </section>
        </div>
      </section>

      {isChatOpen && (
        <aside className="chat-panel" aria-label="Chatbot survey">
          <header className="chat-header">
            <div>
              <p className="chat-kicker">MEDI7200</p>
              <h2>Shape Future Clinical Training</h2>
            </div>
            <button className="icon-button" type="button" onClick={closeChat} aria-label="Close chatbot">
              ×
            </button>
          </header>

          <div className="chat-content" ref={chatContentRef}>
            {currentStep === 'welcome' && (
              <OnboardingFlow
                messages={onboardingMessages}
                onMessagesChange={setOnboardingMessages}
                onContinue={completeOnboarding}
              />
            )}

            {currentStep === 'comments' && (
              <CommentChatFlow
                messages={flowMessages}
                currentQuestionIndex={flowQuestionIndex}
                phase={flowPhase}
                draftText={flowDraftText}
                responses={flowResponses}
                onDraftTextChange={setFlowDraftText}
                onSelectCategory={selectCategory}
                onSubmitMultiCategory={submitMultiCategory}
                onSubmitResponse={submitResponse}
                onOpenEditMenu={openEditMenu}
                onEditQuestion={editQuestion}
                onContinueSection={continueSection}
                onSubmitFinal={submitFinalResponse}
              />
            )}
          </div>
        </aside>
      )}

      <button
        className="chat-launcher"
        type="button"
        onClick={openChat}
        aria-label="Open Year 2 feedback chatbot"
        aria-expanded={isChatOpen}
      >
        <span className="launcher-avatar" aria-hidden="true" />
        <span className="launcher-label">Start survey</span>
      </button>
    </main>
  );
}

export default App;
