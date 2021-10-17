import * as React from 'react';

/*                 v   Misspell this to cause a TS error. */
export interface HelloProps {
	innerText?: string;
}

export const Hello: React.FC<HelloProps> = (props) => {
	const { innerText } = props;

	return (
		<main>
			<h1>Hello, World!</h1>
			<p>Edit the code and create a TypeScript compilation error.</p>
			<p>InnerText: {innerText || '[none]'}</p>
		</main>
	);
};