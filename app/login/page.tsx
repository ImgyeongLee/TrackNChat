'use client';

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
                    <main>
                        <h1>Hello {user?.username}</h1>
                        <button onClick={signOut}>Sign out</button>
                    </main>
                )}
            </Authenticator>
            <Button className="rounded-tr-none rounded-tl-none border-1 w-full" variant={'outline'} onClick={goHome}>
                Go home
            </Button>
        </div>
    );
}
