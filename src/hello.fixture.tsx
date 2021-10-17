import * as React from 'react';
import { Hello } from './hello';
import * as Cosmos from 'react-cosmos/fixture';

export default () => {
	const [text] = Cosmos.useValue('Text', { defaultValue: 'This is inner text.' });
	return (
		<Hello innerText={text} />
	);
};