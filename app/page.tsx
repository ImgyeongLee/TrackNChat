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

export default function App() {
    useEffect(() => {
      Interactions.onComplete({
        botName,
        callback: (error?: Error, response?: {[key: string]: any}) => {
          if (error) {
              alert('bot conversation failed');
          } else if (response) {
              console.debug('response: ' + JSON.stringify(response, null, 2));
              if (response.messages == null || response.messages.length == 0) {
                console.log("I'm not sure how to help with that.");
              } else {
                const message = response.messages[0].content;
                console.log(message);
              }
          }
        }
      });
      Interactions.onComplete({
        botName,
        callback: (error?: Error, response?: {[key: string]: any}) => {
          if (error) {
              alert('bot conversation failed');
          } else if (response) {
              console.debug('response: ' + JSON.stringify(response, null, 2));
              if (response.messages == null || response.messages.length == 0) {
                console.log("I'm not sure how to help with that.");
              } else {
                const message = response.messages[0].content;
                console.log(message);
              }
          }
        }
      });
    }, []);

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

    function fakeSubmitMsg() {
        if (input.length == 0) {
            return;
        }
        setChats([...chats, { message: input, isBot: false }]);
        clearChat();

        submitMsg(input);
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
