import { Handler } from 'aws-lambda';
import { getTracking } from 'ts-tracking-number';

export const handler: Handler = async (event, context) => {
	console.log(JSON.stringify(event, null, 2));

	const sessionState = event.sessionState;
	sessionState.intent.state = 'Fulfilled';
	sessionState.dialogAction = {
		type: 'Close'
	};

	try {
		const trackingNumber =
			event.interpretations[0].intent.slots.TrackingNumber.value
				.interpretedValue;
		const tracking = getTracking(trackingNumber);
		if (tracking == null) {
			throw new Error(
				`No tracking information found for ${trackingNumber}`
			);
		}

		return {
			sessionState,
			messages: [
				{
					contentType: 'PlainText',
					content: JSON.stringify(tracking)
				}
			]
		};
	} catch (e: any) {
		return {
			sessionState,
			messages: [
				{
					contentType: 'PlainText',
					content: `I was unable to process your request: ${e.message}`
				}
			]
		};
	}
};
