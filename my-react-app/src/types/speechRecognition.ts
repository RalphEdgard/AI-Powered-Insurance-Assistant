// export {};

// declare global {
//   interface Window {
//     SpeechRecognition?: typeof SpeechRecognition;
//     webkitSpeechRecognition?: typeof SpeechRecognition;
//   }

//   interface SpeechRecognition extends EventTarget {
//     continuous: boolean;
//     interimResults: boolean;
//     lang: string;
//     start: () => void;
//     stop: () => void;
//     abort: () => void;
//     onresult: ((event: SpeechRecognitionEvent) => void) | null;
//    .onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
//     onend: (() => void) | null;
//   }

//   interface SpeechRecognitionEvent extends Event {
//     results: SpeechRecognitionResultList;
//   }

//   interface SpeechRecognitionErrorEvent extends Event {
//     error: string;
//   }

//   const SpeechRecognition: {
//     prototype: SpeechRecognition;
//     new (): SpeechRecognition;
//   };
// }