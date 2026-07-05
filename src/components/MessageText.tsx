type MessageTextProps = {
  text: string;
  /** Render **bold** markers as <strong>. While a message is still being
   * typed out, markers are stripped instead so half-typed markers never show. */
  showBold: boolean;
};

function renderLine(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function MessageText({ text, showBold }: MessageTextProps) {
  return (
    <>
      {text.split('\n').map((line, lineIndex) => (
        <p key={lineIndex}>{renderLine(showBold ? line : line.replace(/\*\*/g, ''))}</p>
      ))}
    </>
  );
}

export default MessageText;
