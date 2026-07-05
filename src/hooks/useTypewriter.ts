import { useEffect, useState } from 'react';

type TypewriterMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  tone?: string;
};

const typewriterDelay = 10;

/**
 * Animates bot messages character by character. One message animates at a
 * time; user messages and typing indicators are shown immediately.
 */
export function useTypewriter<Message extends TypewriterMessage>(messages: Message[]) {
  const [displayTextById, setDisplayTextById] = useState<Record<string, string>>({});
  const [completedMessageIds, setCompletedMessageIds] = useState<Set<string>>(() => new Set());

  const animatingMessage = messages.find(
    (message) =>
      message.sender === 'bot' &&
      message.tone !== 'typing' &&
      !completedMessageIds.has(message.id),
  );
  const isTextAnimating = Boolean(animatingMessage);

  useEffect(() => {
    if (!animatingMessage) {
      return;
    }

    let characterIndex = 0;
    const fullText = animatingMessage.text;

    setDisplayTextById((previousText) => ({
      ...previousText,
      [animatingMessage.id]: '',
    }));

    const textTimer = window.setInterval(() => {
      characterIndex += 1;

      setDisplayTextById((previousText) => ({
        ...previousText,
        [animatingMessage.id]: fullText.slice(0, characterIndex),
      }));

      if (characterIndex >= fullText.length) {
        window.clearInterval(textTimer);
        setCompletedMessageIds((previousIds) => {
          const nextIds = new Set(previousIds);
          nextIds.add(animatingMessage.id);
          return nextIds;
        });
      }
    }, typewriterDelay);

    return () => window.clearInterval(textTimer);
  }, [animatingMessage]);

  const isMessageComplete = (message: Message) => completedMessageIds.has(message.id);

  const getMessageText = (message: Message) =>
    animatingMessage?.id === message.id && !isMessageComplete(message)
      ? (displayTextById[message.id] ?? '')
      : message.text;

  return { animatingMessage, isTextAnimating, displayTextById, isMessageComplete, getMessageText };
}
