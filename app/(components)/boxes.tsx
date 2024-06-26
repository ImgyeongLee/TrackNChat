import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import parse from 'html-react-parser';
import DomPurify from 'dompurify';

interface ChatBoxProps {
    message: string;
    isBot: boolean;
}

export function ChatBox({ message, isBot }: ChatBoxProps) {
    const cleanHTMLString = DomPurify.sanitize(message);
    return (
        <div
            className={cn('rounded py-2 px-3 leading-tight text-sm md:text-base', {
                'bg-white text-[#0e1926] self-end ml-10': !isBot,
                'bg-[#0e1926] text-white self-start mr-10': isBot,
            })}>
            {isBot && parse(cleanHTMLString)}
            {!isBot && message}
        </div>
    );
}

interface SessionBoxProps {
    sessionId: string;
    isActive: boolean;
    roomName: string;
    onClick?: () => void;
}

export function SessionBox({ roomName, isActive, onClick }: SessionBoxProps) {
    return (
        <Button
            variant="outline"
            className={cn('rounded py-2 px-3 leading-tight text-sm md:text-base w-full', {
                'bg-white text-[#0e1926] self-end ml-10': !isActive,
                'bg-[#0e1926] text-white self-start mr-10': isActive,
            })}
            onClick={onClick}>
            {roomName}
        </Button>
    );
}
