import { shortDate } from "@/lib/format";

type Message = {
  id: string;
  body: string;
  authorName: string;
  fromClient: boolean;
  createdAt: Date;
};

export default function TicketThread({ messages }: { messages: Message[] }) {
  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li
          key={message.id}
          className={`rounded-xl border p-3 text-sm ${
            message.fromClient ? "border-slate-200 bg-slate-50" : "border-sky-200 bg-sky-50"
          }`}
        >
          <p className="text-xs text-slate-500">
            {message.authorName} · {message.fromClient ? "Client" : "Onsective"} · {shortDate(message.createdAt)}
          </p>
          <p className="mt-1 whitespace-pre-line text-slate-700">{message.body}</p>
        </li>
      ))}
    </ul>
  );
}
