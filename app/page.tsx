'use client';

import { useState, useEffect } from 'react';
import './../app/app.css';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import './globals.css';
import { Interactions } from '@aws-amplify/interactions';

const botName = "TrackNChat";

Amplify.configure(outputs);
Amplify.configure({
  ...Amplify.getConfig(),
  Interactions: {
    LexV2: {
      [botName]: {
        aliasId: '14HDR3YTCK',
        botId: 'L5ALTSPHNH',
        localeId: 'en_US',
        region: 'us-east-1'
      }
    }
  }
});

export default function App() {
    useEffect(() => {
      Interactions.onComplete({
        botName,
        callback: (error?: Error, completion?: {[key: string]: any}) => {
          if (error) {
              alert('bot conversation failed');
          } else if (completion) {
              console.debug('done: ' + JSON.stringify(completion, null, 2));
          }
        }
      });
    }, []);

    async function submitMsg() {
      const userInput = "Where is my package 1234";
      const response = await Interactions.send({
        botName,
        message: userInput
      });
      console.log(`Response message: ${response.message}`);
    }

    const [chats, setChats] = useState<string[]>([]);
    return (
        <main className="h-full w-full flex flex-col justify-center items-center">
            <Card className="w-[calc(250px+30vw)]">
                <CardHeader>
                    <CardTitle>Ask your question!</CardTitle>
                    <CardDescription>You can type / to see the other commands.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-200 w-full min-h-[50vh] max-h-[50vh] overflow-y-auto p-2 flex flex-col items-center">
                        <div className="rounded bg-white text-[#0e1926] py-2 px-3 self-end">Hello.</div>
                        <div className="rounded bg-[#0e1926] text-white py-2 px-3 self-start">
                            I don't understand what you said
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between space-x-2">
                    <Input type="text" placeholder="Type your tracking number..." />
                    <Button onClick={submitMsg}>Send</Button>
                </CardFooter>
            </Card>
            <footer>Need any guidelines? Scroll Down!</footer>
        </main>
    );
}
