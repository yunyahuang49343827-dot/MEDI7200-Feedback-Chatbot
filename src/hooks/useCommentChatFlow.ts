import { useRef, useState } from 'react';
import {
  commentChatQuestions,
  createInitialCommentChatResponses,
  type CommentChatMessage,
  type CommentChatPhase,
  type CommentChatResponses,
  type CommentChatSubmitResult,
  type CommentQuestion,
  typingDelay,
} from '../commentChatConfig';

type UseCommentChatFlowOptions = {
  onSubmitComments: (responses: CommentChatResponses) => Promise<CommentChatSubmitResult>;
  onSavePartial: (responses: CommentChatResponses) => void;
};

function createMessage(
  sender: CommentChatMessage['sender'],
  text: string,
  tone?: CommentChatMessage['tone'],
): CommentChatMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    text,
    tone,
  };
}

function getQuestionPhase(question: CommentQuestion): CommentChatPhase {
  return question.inputType === 'choice' || question.inputType === 'multiChoice'
    ? 'category'
    : 'response';
}

function createQuestionMessages(question: CommentQuestion) {
  const messages: CommentChatMessage[] = [];

  if (question.sectionIntroBefore) {
    question.sectionIntroBefore.split(/\n\s*\n/).forEach((messageText) => {
      messages.push(createMessage('bot', messageText));
    });
  }

  question.question.split(/\n\s*\n/).forEach((messageText) => {
    messages.push(createMessage('bot', messageText));
  });

  return messages;
}

function createInitialMessages() {
  return createQuestionMessages(commentChatQuestions[0]);
}

export function useCommentChatFlow({ onSubmitComments, onSavePartial }: UseCommentChatFlowOptions) {
  const [messages, setMessages] = useState<CommentChatMessage[]>(createInitialMessages);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<CommentChatPhase>(getQuestionPhase(commentChatQuestions[0]));
  const [draftText, setDraftText] = useState('');
  const [responses, setResponses] = useState<CommentChatResponses>(
    createInitialCommentChatResponses,
  );
  const [isBotReplyPending, setIsBotReplyPending] = useState(false);
  const responsesRef = useRef<CommentChatResponses>(responses);
  const hasSubmittedRef = useRef(false);
  const pendingSectionQuestionIndexRef = useRef<number | null>(null);

  const saveResponses = (updatedResponses: CommentChatResponses) => {
    responsesRef.current = updatedResponses;
    setResponses(updatedResponses);
  };

  const showTypingSequence = (
    baseMessages: CommentChatMessage[],
    botMessages: CommentChatMessage[],
    afterReply?: () => void,
  ) => {
    setIsBotReplyPending(true);
    setPhase('typing');
    setMessages([...baseMessages, createMessage('bot', '', 'typing')]);

    window.setTimeout(() => {
      setMessages([...baseMessages, ...botMessages]);
      setIsBotReplyPending(false);
      afterReply?.();
    }, typingDelay);
  };

  const resetCommentFlow = () => {
    setMessages(createInitialMessages());
    setCurrentQuestionIndex(0);
    setPhase(getQuestionPhase(commentChatQuestions[0]));
    setDraftText('');
    saveResponses(createInitialCommentChatResponses());
    setIsBotReplyPending(false);
    hasSubmittedRef.current = false;
    pendingSectionQuestionIndexRef.current = null;
  };

  const moveToNextQuestion = (
    updatedResponses: CommentChatResponses,
    baseMessages: CommentChatMessage[],
    isEditing = false,
  ) => {
    const currentQuestion = commentChatQuestions[currentQuestionIndex];
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = commentChatQuestions[nextQuestionIndex];

    if (isEditing) {
      showTypingSequence(
        baseMessages,
        [createMessage('bot', 'Updated. Anything else to review?')],
        () => setPhase('complete'),
      );
      return;
    }

    if (nextQuestion) {
      if (currentQuestion.sectionClosingAfter) {
        // The final section closing rolls straight into the last question
        // instead of pausing on a Continue button.
        if (currentQuestion.id === 'teaching-format-decision-factors') {
          showTypingSequence(
            baseMessages,
            [
              createMessage('bot', currentQuestion.sectionClosingAfter),
              ...createQuestionMessages(nextQuestion),
            ],
            () => {
              setCurrentQuestionIndex(nextQuestionIndex);
              setDraftText(String(updatedResponses[nextQuestion.responseKey] ?? ''));
              setPhase(getQuestionPhase(nextQuestion));
            },
          );
          return;
        }

        pendingSectionQuestionIndexRef.current = nextQuestionIndex;
        showTypingSequence(
          baseMessages,
          [createMessage('bot', currentQuestion.sectionClosingAfter)],
          () => setPhase('sectionContinue'),
        );
        return;
      }

      showTypingSequence(baseMessages, createQuestionMessages(nextQuestion), () => {
        setCurrentQuestionIndex(nextQuestionIndex);
        setDraftText(String(updatedResponses[nextQuestion.responseKey] ?? ''));
        setPhase(getQuestionPhase(nextQuestion));
      });
      return;
    }

    showTypingSequence(
      baseMessages,
      [
        createMessage('bot', "You're almost done."),
        createMessage(
          'bot',
          'Before submitting, you can review your responses and remove any identifiable information if needed.',
        ),
      ],
      () => setPhase('complete'),
    );
  };

  const selectCategory = (category: string) => {
    const currentQuestion = commentChatQuestions[currentQuestionIndex];

    if (
      (currentQuestion.inputType !== 'choice' && currentQuestion.inputType !== 'multiChoice') ||
      isBotReplyPending
    ) {
      return;
    }

    if (currentQuestion.inputType === 'multiChoice') {
      const currentSelections = String(responsesRef.current[currentQuestion.responseKey] ?? '')
        .split('; ')
        .filter(Boolean);
      const noClearOption = 'No, all were clear';
      let nextSelections: string[];

      if (category === noClearOption) {
        nextSelections = currentSelections.includes(noClearOption) ? [] : [noClearOption];
      } else {
        const selectionsWithoutNoClear = currentSelections.filter(
          (selection) => selection !== noClearOption,
        );
        nextSelections = selectionsWithoutNoClear.includes(category)
          ? selectionsWithoutNoClear.filter((selection) => selection !== category)
          : [...selectionsWithoutNoClear, category];
      }

      saveResponses({
        ...responsesRef.current,
        [currentQuestion.responseKey]: nextSelections.join('; '),
      });
      return;
    }

    const updatedResponses = {
      ...responsesRef.current,
      [currentQuestion.responseKey]: category,
    };

    saveResponses(updatedResponses);
    onSavePartial(updatedResponses);
    moveToNextQuestion(
      updatedResponses,
      [...messages, createMessage('user', category)],
      phase === 'editCategory',
    );
  };

  const submitMultiCategory = () => {
    const currentQuestion = commentChatQuestions[currentQuestionIndex];

    if (currentQuestion.inputType !== 'multiChoice' || isBotReplyPending) {
      return;
    }

    const selectedResponse = String(responsesRef.current[currentQuestion.responseKey] ?? '');

    if (!selectedResponse) {
      return;
    }

    onSavePartial(responsesRef.current);
    moveToNextQuestion(
      responsesRef.current,
      [...messages, createMessage('user', selectedResponse)],
      phase === 'editCategory',
    );
  };

  const submitResponse = (trimmedResponse: string) => {
    const currentQuestion = commentChatQuestions[currentQuestionIndex];

    if (isBotReplyPending || !trimmedResponse) {
      return;
    }

    const updatedResponses = {
      ...responsesRef.current,
      [currentQuestion.responseKey]: trimmedResponse,
    };

    saveResponses(updatedResponses);
    onSavePartial(updatedResponses);
    setDraftText('');
    moveToNextQuestion(
      updatedResponses,
      [...messages, createMessage('user', trimmedResponse)],
      phase === 'editResponse',
    );
  };

  const openEditMenu = () => {
    if (isBotReplyPending) {
      return;
    }

    showTypingSequence(
      [...messages, createMessage('user', 'Review my answers')],
      [],
      () => setPhase('editMenu'),
    );
  };

  const continueSection = () => {
    if (isBotReplyPending || phase !== 'sectionContinue') {
      return;
    }

    const nextQuestionIndex = pendingSectionQuestionIndexRef.current;
    const nextQuestion =
      typeof nextQuestionIndex === 'number' ? commentChatQuestions[nextQuestionIndex] : undefined;

    if (!nextQuestion || typeof nextQuestionIndex !== 'number') {
      return;
    }

    pendingSectionQuestionIndexRef.current = null;
    setIsBotReplyPending(true);
    setPhase('typing');
    setMessages([createMessage('bot', '', 'typing')]);

    window.setTimeout(() => {
      setCurrentQuestionIndex(nextQuestionIndex);
      setDraftText(String(responsesRef.current[nextQuestion.responseKey] ?? ''));
      setMessages(createQuestionMessages(nextQuestion));
      setPhase(getQuestionPhase(nextQuestion));
      setIsBotReplyPending(false);
    }, typingDelay);
  };

  const editQuestion = (questionIndex: number) => {
    if (isBotReplyPending) {
      return;
    }

    const selectedQuestion = commentChatQuestions[questionIndex];

    setCurrentQuestionIndex(questionIndex);
    showTypingSequence(
      [...messages, createMessage('user', selectedQuestion.shortLabel)],
      [createMessage('bot', selectedQuestion.question)],
      () => {
        setDraftText(String(responsesRef.current[selectedQuestion.responseKey] ?? ''));
        setPhase(
          selectedQuestion.inputType === 'choice' || selectedQuestion.inputType === 'multiChoice'
            ? 'editCategory'
            : 'editResponse',
        );
      },
    );
  };

  const submitFinalResponse = () => {
    if (
      isBotReplyPending ||
      hasSubmittedRef.current ||
      (phase !== 'complete' && phase !== 'editMenu')
    ) {
      return;
    }

    hasSubmittedRef.current = true;
    const baseMessages = [
      ...messages,
      createMessage('user', phase === 'editMenu' ? 'Submit feedback' : 'Submit now'),
    ];

    setMessages(baseMessages);

    void (async () => {
      const result = await onSubmitComments(responsesRef.current);

      if (result.ok) {
        setMessages([
          ...baseMessages,
          createMessage('bot', 'Thank you for sharing your feedback.'),
          createMessage(
            'bot',
            'Your responses will help the Year 2 course team understand what is working well and what could be improved.',
          ),
          createMessage(
            'bot',
            'A summary of the results will be shared through the weekly bulletin on Blackboard.',
          ),
        ]);
        setPhase('submitted');
        return;
      }

      setMessages([
        ...baseMessages,
        createMessage(
          'bot',
          result.error || 'We could not save your responses right now. Please try again.',
          'error',
        ),
      ]);
      hasSubmittedRef.current = false;
      setPhase('complete');
    })();
  };

  return {
    messages,
    currentQuestionIndex,
    phase,
    draftText,
    responses,
    setDraftText,
    resetCommentFlow,
    selectCategory,
    submitMultiCategory,
    submitResponse,
    openEditMenu,
    continueSection,
    editQuestion,
    submitFinalResponse,
  };
}
