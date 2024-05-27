'use client';

import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import './../app/app.css';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import './globals.css';
import { Interactions } from '@aws-amplify/interactions';
import { MessageCircleQuestion } from 'lucide-react';
import { ChatBox, SessionBox } from './(components)/boxes';
import { Chat, Session } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { data, type Schema } from '@/amplify/data/resource';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';

const botName = 'TrackNChat';

Amplify.configure(outputs);
Amplify.configure({
    ...Amplify.getConfig(),
    Interactions: {
        LexV2: {
            [botName]: {
                aliasId: '14HDR3YTCK',
                botId: 'L5ALTSPHNH',
                localeId: 'en_US',
                region: 'us-east-1',
            },
        },
    },
});

const client = generateClient<Schema>();

export default function App() {
    const chatSessionId = useRef<string | null>(null);

    useEffect(() => {
        Interactions.onComplete({
            botName,
            callback: async (error?: Error, response?: { [key: string]: any }) => {
                if (error) {
                    alert('bot conversation failed');
                } else if (response) {
                    console.debug(response);
                    setIsLoading(false);
                    let message = '';
                    if (response.messages == null || response.messages.length == 0) {
                        message = "I'm not sure how to help with that.";
                    } else {
                        message = response.messages[0].content;
                        try {
                            const object = JSON.parse(message);
                            message = '';
                            Object.entries(object).forEach(([key, value]) => {
                                message += `${key}: ${value} +-------+ `;
                            });
                        } catch (err) {
                            console.error(err);
                            message = response.messages[0].content;
                        }
                    }

                    setChats((prev) => [...prev, { message: message, isBot: true }]);

                    if (chatSessionId.current != null) {
                        const { errors, data } = await client.models.ChatContent.create({
                            chatSessionId: chatSessionId.current,
                            content: message,
                        });
                        if (errors != null || data == null) {
                            throw new Error('Failed to create chat content from incoming message');
                        }
                    }
                }
            },
        });

        getChatSessions();
    }, []);

    async function getChatSessions() {
        const session = await fetchAuthSession();
        const userId = session.identityId;

        const { errors, data } = await client.models.ChatSession.list({
            filter: {
                userId: {
                    eq: userId,
                },
            },
        });
        if (errors != null || data == null) {
            throw new Error('Failed to list chat sessions');
        }

        const dataArr: Session[] = [];

        for (let i = 0; i < data.length; i++) {
            dataArr.push({ sessionId: data[i].userId, roomName: 'Expired Room', isActive: false });
        }

        setSessions(dataArr);
    }

    async function getChatContentsForSession(chatSessionId: string) {
        const { errors, data } = await client.models.ChatContent.list({
            filter: {
                chatSessionId: {
                    eq: chatSessionId,
                },
            },
        });
        if (errors != null || data == null) {
            throw new Error('Failed to list chat contents');
        }
        return data;
    }

    async function submitMsg(userInput: string) {
        await Interactions.send({
            botName,
            message: userInput,
        });
    }

    async function handleSwitchSession(sessionId: string) {
        await getChatContentsForSession(sessionId).then((data) => console.log('DATA == ', data));
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setInput(event.target.value);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && input == '/') {
            setInput('My tracking number is ');
        } else if (event.key === 'Enter' && input.length > 0) {
            event.preventDefault();
            handleClick();
        }
    }

    function clearChat() {
        setInput('');
    }

    async function handleClick() {
        if (input.length == 0) {
            return;
        }

        const cleanedInput = input.trim();

        setChats((prev) => [...prev, { message: cleanedInput, isBot: false }]);
        clearChat();
        setIsLoading(true);

        if (chats.length == 0) {
            const session = await fetchAuthSession();
            let roomName = '';
            if (input.length < 8) {
                roomName = input;
            } else {
                roomName = input.slice(0, 7) + '...';
            }

            const userId = session.identityId;
            if (userId == null) {
                throw new Error('User ID is null');
            }

            setSessions((prev) => [{ sessionId: userId, roomName: roomName, isActive: true }, ...prev]);

            const { errors, data } = await client.models.ChatSession.create({
                userId,
            });
            if (errors != null || data == null) {
                throw new Error('Failed to create chat session');
            }
            chatSessionId.current = data.id;
        }

        const { errors, data } = await client.models.ChatContent.create({
            chatSessionId: chatSessionId.current!,
            content: cleanedInput,
        });
        if (errors != null || data == null) {
            throw new Error('Failed to create chat content from user input');
        }

        await submitMsg(cleanedInput);
    }

    const [chats, setChats] = useState<Chat[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<string>();
    const chatsEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    return (
        <main className="h-full w-full flex flex-col justify-center items-center">
            <Card className="w-[calc(190px+30vw)]">
                <CardHeader>
                    <CardTitle className="flex flex-row justify-between items-center">
                        <div>Ask your question!</div>
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button>Sessions</Button>
                            </DrawerTrigger>
                            <DrawerContent className="">
                                <div className="mx-auto w-full max-w-sm">
                                    <DrawerHeader>
                                        <DrawerTitle>Select Your Sessions</DrawerTitle>
                                    </DrawerHeader>
                                    <div className="p-2 max-h-[250px] overflow-y-auto">
                                        <div className="flex flex-col gap-1 justify-center">
                                            {sessions.length == 0 && (
                                                <div className="text-center">There is no session.</div>
                                            )}
                                            {sessions.length > 0 &&
                                                sessions.map((session, i) => {
                                                    return (
                                                        <SessionBox
                                                            key={i}
                                                            sessionId={session.sessionId}
                                                            isActive={session.isActive}
                                                            roomName={session.roomName}
                                                            onClick={() => handleSwitchSession(session.sessionId)}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    </div>
                                    <DrawerFooter>
                                        <DrawerClose asChild>
                                            <Button variant="outline">Close</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </CardTitle>
                    <CardDescription>Type / and press the enter to use a template input.</CardDescription>
                </CardHeader>
                <CardContent style={{ overflowWrap: 'anywhere' }}>
                    <div
                        className={cn(
                            'bg-slate-200 w-full min-h-[50vh] max-h-[50vh] overflow-y-auto p-2 flex flex-col items-center overflow-x-hidden gap-2',
                            {
                                'justify-center': chats.length == 0,
                            }
                        )}>
                        {chats.length == 0 && (
                            <>
                                <MessageCircleQuestion size={60} className="text-[#0e1926]" />
                                <div className="text-sm">How's your day?</div>
                            </>
                        )}
                        {chats.length != 0 &&
                            chats.map((chat, i) => {
                                return <ChatBox key={i} message={chat.message} isBot={chat.isBot} />;
                            })}
                        <div ref={chatsEndRef} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between space-x-2">
                    {isLoading && <Input type="text" placeholder="e.g. Type your tracking number..." disabled />}
                    {!isLoading && (
                        <Input
                            type="text"
                            placeholder="e.g. Type your tracking number..."
                            value={input}
                            onChange={handleInputChange}
                            onKeyDownCapture={handleKeyDown}
                        />
                    )}
                    {isLoading && <Button disabled>Pending...</Button>}
                    {!isLoading && <Button onClick={handleClick}>Send</Button>}
                </CardFooter>
            </Card>
        </main>
    );
}
