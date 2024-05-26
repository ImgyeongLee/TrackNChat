import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
	console.log(JSON.stringify(event, null, 2));
	console.log('hi there');
	// your function code goes here
	return 'Hello, World!';
};
