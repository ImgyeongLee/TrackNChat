import { cn } from '@/lib/utils';

interface ChatBoxProps {
    message: string;
    isBot: boolean;
}

export function ChatBox({ message, isBot }: ChatBoxProps) {
    return (
        <div
            className={cn('rounded py-2 px-3', {
                'bg-white text-[#0e1926] self-end': !isBot,
                'bg-[#0e1926] text-white self-start': isBot,
            })}>
            {message}
        </div>
    );
}
