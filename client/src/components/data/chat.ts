export type Message = {
  id: number;
  sender: "you" | "bot";
  message: string;
};

export const messages: Message[] = [
  {
    id: 1,
    sender: "you",
    message: "Hi, how are you?",
  },
  {
    id: 2,
    sender: "bot",
    message: "I am fine. How about you?",
  },
  {
    id: 3,
    sender: "you",
    message: "I am doing great!",
  },
  {
    id: 4,
    sender: "bot",
    message: "That's wonderful to hear!",
  },
  {
    id: 5,
    sender: "you",
    message: "What can you help me with?",
  },
  {
    id: 6,
    sender: "bot",
    message: "I can help you with programming, learning, and problem-solving.",
  },
  {
    id: 7,
    sender: "you",
    message: "Explain React useState.",
  },
  {
    id: 8,
    sender: "bot",
    message:
      "useState is a React Hook that lets you add state to functional components.",
  },
];
