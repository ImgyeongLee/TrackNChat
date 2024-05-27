import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TypeAnimation } from 'react-type-animation';

interface ChatBoxProps {
    message: string;
    isBot: boolean;
}

export function ChatBox({ message, isBot }: ChatBoxProps) {
    return (
        <div
            className={cn('rounded py-2 px-3 leading-tight text-sm md:text-base', {
                'bg-white text-[#0e1926] self-end ml-10': !isBot,
                'bg-[#0e1926] text-white self-start mr-10': isBot,
            })}>
            {isBot && <TypeAnimation sequence={[message]} repeat={0} cursor={false} speed={80} />}
            {!isBot && <div>{message}</div>}
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
