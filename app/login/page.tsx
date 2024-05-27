'use client';

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { useEffect } from 'react';

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
            <Authenticator>
                {({ signOut, user }) => (
                    <main>
                        <h1>Hello {user?.username}</h1>
                        <button onClick={signOut}>Sign out</button>

                    </main>
                )}
            </Authenticator>
            <button onClick={goHome}>Go home</button>
        </div>
    )
}