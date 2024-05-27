'use client';

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

Amplify.configure(outputs);

export default function App() {
    useEffect(() => {
        Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    console.log('user have been signedIn successfully.');
                    goHome();
                    break;
            }
        });
    }, []);

    function goHome() {
        window.location.href = '/';
    }

    return (
        <div>
            <div className="text-white font-semibold text-2xl text-center pb-3">Welcome to TrackNChat!</div>
            <Authenticator>
                {({ signOut, user }) => (
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle>Hello, user: {user?.username}</CardTitle>
                            <CardDescription>See you again!</CardDescription>
                        </CardHeader>
                        <CardContent className="w-full">
                            <Button className="w-full" onClick={signOut}>
                                Sign out
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </Authenticator>
            <Button className="mt-5 border-1 w-full" variant={'outline'} onClick={goHome}>
                Go home
            </Button>
        </div>
    );
}
