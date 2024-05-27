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
import { ChatBox } from './(components)/boxes';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

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
        callback: async (error?: Error, response?: {[key: string]: any}) => {
          if (error) {
                alert('bot conversation failed');
          } else if (response) {
                console.debug(response);
                let message = '';
                if (response.messages == null || response.messages.length == 0) {
                    message = "I'm not sure how to help with that.";
                } else {
                    message = response.messages[0].content;
                }

                console.log(message);

                if (chatSessionId.current != null) {
                    const { errors, data } = await client.models.ChatContent.create({
                        chatSessionId: chatSessionId.current,
                        content: message,
                    })
                    if (errors != null || data == null) {
                        throw new Error("Failed to create chat content from incoming message");
                    }
                }
          }
        }
      });

      getChatSessions();
    }, []);

    async function getChatSessions() {
        const session = await fetchAuthSession();
        const userId = session.identityId

        const { errors, data } = await client.models.ChatSession.list({
            filter: {
                userId: {
                    eq: userId
                }
            }
        })
        if (errors != null || data == null) {
            throw new Error("Failed to list chat sessions");
        }
        console.log(`chat sessions: ${JSON.stringify(data, null, 2)}`);
    }

    async function getChatContentsForSession(chatSessionId: string) {
        const { errors, data } = await client.models.ChatContent.list({
            filter: {
                chatSessionId: {
                    eq: chatSessionId
                }
            }
        })
        if (errors != null || data == null) {
            throw new Error("Failed to list chat contents");
        }
        return data;
    }

    async function submitMsg(userInput: string) {
      await Interactions.send({
        botName,
        message: userInput
      });
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setInput(event.target.value);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && input.length > 0) {
            event.preventDefault();
            console.log('Enter key pressed:', input);
            setChats([...chats, { message: input, isBot: false }]);
            clearChat();
        }
    }

    function clearChat() {
        setInput('');
    }

    async function fakeSubmitMsg() {
        if (input.length == 0) {
            return;
        }

        const cleanedInput = input.trim();

        setChats([...chats, { message: cleanedInput, isBot: false }]);
        clearChat();

        if (chats.length == 0) {
            const session = await fetchAuthSession();
            const userId = session.identityId
            if (userId == null) {
                throw new Error("User ID is null");
            }

            const { errors, data } = await client.models.ChatSession.create({
                userId
            })
            if (errors != null || data == null) {
                throw new Error("Failed to create chat session");
            }
            chatSessionId.current = data.id
        }

        const { errors, data } = await client.models.ChatContent.create({
            chatSessionId: chatSessionId.current!,
            content: cleanedInput,
        })
        if (errors != null || data == null) {
            throw new Error("Failed to create chat content from user input");
        }

        await submitMsg(cleanedInput);
    }

    const [chats, setChats] = useState<Chat[]>([]);
    const [input, setInput] = useState<string>('');
    const chatsEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    return (
        <main className="h-full w-full flex flex-col justify-center items-center">
            <Card className="w-[calc(190px+30vw)]">
                <CardHeader>
                    <CardTitle>Ask your question!</CardTitle>
                    <CardDescription>You can type / to see the other commands.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            'bg-slate-200 w-full min-h-[50vh] max-h-[50vh] overflow-y-auto p-2 flex flex-col items-center gap-2',
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
                    <Input
                        type="text"
                        placeholder="e.g. Type your tracking number..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDownCapture={handleKeyDown}
                    />
                    <Button onClick={fakeSubmitMsg}>Send</Button>
                </CardFooter>
            </Card>
            <footer>Need any guidelines? Scroll Down!</footer>
        </main>
    );
}
