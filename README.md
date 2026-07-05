# MEDI7200 Feedback Chatbot

A chatbot-style survey prototype for collecting structured student feedback on
the MEDI7200 (Developing Skills in Medicine) Year 2 learning experience.
Built with React, TypeScript, and Vite as a collaborative initiative between
MEDI7200 and SECaT.

## Features

- Course profile landing page with a floating chat launcher
- Chat onboarding with a privacy reminder before the survey starts
- Three question sections: LAPD, Assessment, and Face-to-face/Online teaching
- Free-text, single-choice, and multi-choice question types
- Typing indicator and typewriter-style message animation
- Review and edit any answer before the final submission

## Privacy

This repository is configured as a demonstration build:

- responses are kept only in the browser while the page is open
- responses are not sent to Google Sheets or any other external service
- responses are not written to local files
- refreshing or closing the page clears the current response

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Project structure

```text
public/images/                     Page images and the chatbot avatar
src/App.tsx                        Page layout and chatbot wiring
src/commentChatConfig.ts           Survey questions, types, and initial values
src/hooks/useCommentChatFlow.ts    Survey conversation state and transitions
src/hooks/useTypewriter.ts         Shared typewriter animation for bot messages
src/components/OnboardingFlow.tsx  Welcome and privacy-reminder chat steps
src/components/CommentChatFlow.tsx Survey chat interface
src/components/MessageText.tsx     Renders message text with **bold** support
src/styles.css                     Application styles
```

## Customising the survey

All questions live in `src/commentChatConfig.ts`. Each entry defines the
question text, its input type (`text`, `choice`, or `multiChoice`), and the
key its answer is stored under. Optional `sectionIntroBefore` and
`sectionClosingAfter` fields add section transitions around a question.

To connect submissions to a backend, replace the `onSubmitComments` handler
passed to `useCommentChatFlow` in `src/App.tsx`.
