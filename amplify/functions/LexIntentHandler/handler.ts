import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
	console.log(JSON.stringify(event, null, 2));

	const sessionState = event.sessionState;
	sessionState.intent.state = 'Fulfilled';
	sessionState.dialogAction = {
		type: 'Close'
	};

	return {
		sessionState,
		messages: [
			{
				contentType: 'PlainText',
				content: `Hello there! I received this prompt: ${event.inputTranscript}`
			}
		]
	};
};
