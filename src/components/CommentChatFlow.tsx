import { useEffect, useRef, type FormEvent } from 'react';
import {
  commentChatQuestions,
  type CommentChatMessage,
  type CommentChatPhase,
  type CommentChatResponses,
} from '../commentChatConfig';
import { useTypewriter } from '../hooks/useTypewriter';
import MessageText from './MessageText';

type CommentChatFlowProps = {
  messages: CommentChatMessage[];
  currentQuestionIndex: number;
  phase: CommentChatPhase;
  draftText: string;
  responses: CommentChatResponses;
  onDraftTextChange: (text: string) => void;
  onSelectCategory: (category: string) => void;
  onSubmitMultiCategory: () => void;
  onSubmitResponse: (text: string) => void;
  onOpenEditMenu: () => void;
  onEditQuestion: (questionIndex: number) => void;
  onContinueSection: () => void;
  onSubmitFinal: () => void;
};

function CommentChatFlow({
  messages,
  currentQuestionIndex,
  phase,
  draftText,
  responses,
  onDraftTextChange,
  onSelectCategory,
  onSubmitMultiCategory,
  onSubmitResponse,
  onOpenEditMenu,
  onEditQuestion,
  onContinueSection,
  onSubmitFinal,
}: CommentChatFlowProps) {
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { animatingMessage, isTextAnimating, displayTextById, isMessageComplete, getMessageText } =
    useTypewriter(messages);
  const currentQuestion = commentChatQuestions[currentQuestionIndex];
  const isCategoryPhase = phase === 'category' || phase === 'editCategory';
  const isMultiChoiceQuestion = currentQuestion.inputType === 'multiChoice';
  const isResponsePhase = phase === 'response' || phase === 'editResponse';

  // Bot messages appear one at a time: everything after the message that is
  // currently being typed out stays hidden until it finishes.
  const animatingMessageIndex = animatingMessage ? messages.indexOf(animatingMessage) : -1;
  const visibleMessages =
    animatingMessageIndex >= 0 ? messages.slice(0, animatingMessageIndex + 1) : messages;

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
    const layoutTimer = window.setTimeout(() => scrollToLatest('auto'), 240);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(layoutTimer);
    };
  }, [messages, visibleMessages.length, phase, currentQuestionIndex, isTextAnimating, displayTextById]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
  }, [draftText, phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitResponse(draftText.trim());
  };

  return (
    <div className="comment-chat" aria-label="Comment section chat">
      <div className="comment-chat-thread" ref={messageListRef}>
        {visibleMessages.map((message) => (
          <div
            className={`chat-bubble ${message.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}${
              message.tone === 'error' ? ' error-bubble' : ''
            }${message.tone === 'typing' ? ' typing-bubble' : ''}`}
            key={message.id}
          >
            <MessageText text={getMessageText(message)} showBold={isMessageComplete(message)} />
          </div>
        ))}

        {isCategoryPhase && !isTextAnimating && (
          <div className="category-group inline-category-group" aria-label="Select one category">
            {(currentQuestion.options ?? []).map((category) => {
              const selectedValues = String(responses[currentQuestion.responseKey] ?? '')
                .split('; ')
                .filter(Boolean);
              const isSelected = isMultiChoiceQuestion
                ? selectedValues.includes(category)
                : responses[currentQuestion.responseKey] === category;

              return (
                <button
                  className={`category-chip ${isSelected ? 'is-selected' : ''}`}
                  type="button"
                  key={category}
                  onClick={() => onSelectCategory(category)}
                >
                  {category}
                </button>
              );
            })}
            {isMultiChoiceQuestion && (
              <button
                className="primary-action comment-submit-action"
                type="button"
                onClick={onSubmitMultiCategory}
                disabled={!responses[currentQuestion.responseKey]}
              >
                Continue
              </button>
            )}
          </div>
        )}

        {phase === 'editMenu' && !isTextAnimating && (
          <div className="category-group inline-category-group" aria-label="Review responses">
            <button className="category-chip" type="button" onClick={onSubmitFinal}>
              Submit feedback
            </button>
            {commentChatQuestions.map((question, questionIndex) => (
              <button
                className="category-chip"
                type="button"
                key={question.id}
                onClick={() => onEditQuestion(questionIndex)}
              >
                {question.shortLabel}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {isResponsePhase && !isTextAnimating && (
        <form className="comment-chat-input" onSubmit={handleSubmit}>
          {currentQuestion.placeholder && (
            <p className="chat-input-helper">{currentQuestion.placeholder}</p>
          )}
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-text-input comment-auto-textarea"
              value={draftText}
              onChange={(event) => onDraftTextChange(event.target.value)}
              placeholder="Type your response here..."
              aria-label="Comment response"
              rows={1}
            />
            <button className="primary-action chat-send-action" type="submit">
              Send
            </button>
          </div>
        </form>
      )}

      {phase === 'complete' && !isTextAnimating && (
        <div className="comment-final-actions">
          <button className="secondary-action" type="button" onClick={onOpenEditMenu}>
            Review my answers
          </button>
          <button
            className="primary-action comment-submit-action"
            type="button"
            onClick={onSubmitFinal}
          >
            Submit now
          </button>
        </div>
      )}

      {phase === 'sectionContinue' && !isTextAnimating && (
        <div className="comment-final-actions">
          <button
            className="primary-action comment-submit-action"
            type="button"
            onClick={onContinueSection}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default CommentChatFlow;
