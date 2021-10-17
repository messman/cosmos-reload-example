# React Cosmos Reload Issue Example

A problem occurs when relying on TypeScript compilation error checking while using React Cosmos. 

In simple terms: when webpack compilation fails due to a TypeScript compilation error (for updates, not initial build), the hot module replacement code will infinitely refresh the test frame.

This is problematic, as it can cause the user's browser to hog CPU until the compilation error is fixed.

## Reproduce

1. Run `npm install`, of course.

2. Run `npm run cosmos` to start up cosmos. Startup should not have any issues.

3. Navigate to localhost:5000 and verify that the test is working.

4. While still running cosmos, in `src/hello.tsx` modify the code in a way that would cause a *compilation* error for TypeScript, such as misspelling `HelloProps` in either location in the file. Save.

5. The terminal should update to reflect that the build failed due to the change made. 

6. **(The issue):** Return to your browser at localhost:5000. The test frame should be rapidly and repeatedly refreshing. Open the browser console to see that the frame is constantly searching for a HMR update and, when not finding it, is refreshing the frame.

7. Return to `src/hello.tsx` and fix the error. Once the build finishes, localhost:5000 will return to its correct state.

## Workaround / Proof Of Resolution

1. Search for the following code. It should exist in the bottom of `node_modules/react-cosmos/dist/plugins/webpack/webpackConfig/devServer.js`:

```js
function getHotMiddlewareEntry() {
  var clientPath = require.resolve('@skidding/webpack-hot-middleware/client');

  return "".concat(clientPath, "?reload=true&overlay=false");
}
```

2. In this section, change `?reload=true` to `?reload=false` (or you can just remove `reload=true`, since the default is `false`). (You can also change overlay=false if you choose.)

3. Stop cosmos if it is running. Make sure there are no TypeScript compilation errors in the example. Then, restart cosmos with `npm run cosmos`.

4. Repeat the "Reproduce" section from the point where cosmos has been started. Note that when the compilation error occurs, localhost:5000 does not repeatedly refresh any longer. This is the expected behavior.

## Proposed Solution

I would advocate for options to be placed in `cosmos.config.json` that allow for control of the reload behavior (and possibly overlay behavior?) of `@skidding/webpack-hot-middleware`. 

## References And Research

I was stuck for a long time trying to track down more information. Eventually, by searching in the codebase for `[HMR] Checking for updates on the server...`, I found `@skidding/webpack-hot-middleware/process-update.js`.
A comment at the top of `@skidding/webpack-hot-middleware/process-update.js` says:

```js
/**
 * Based heavily on https://github.com/webpack/webpack/blob/
 *  c0afdf9c6abc1dd70707c594e473802a566f7b6e/hot/only-dev-server.js
 * Original copyright Tobias Koppers @sokra (MIT license)
 */
```

Which brought me to https://github.com/webpack/webpack/blob/main/hot/only-dev-server.js and then to https://github.com/webpack/webpack/blob/main/hot/dev-server.js and then to [What's the difference between webpack/hot/dev-server and webpack/hot/only-dev-server? #658](https://github.com/webpack/webpack-dev-server/issues/658).

According to these sources, `only-dev-server` does not reload the webpage, while `dev-server` does. The developer can customize their HMR by selecting either of these modules to use.

Additionally, I found this at https://github.com/webpack-contrib/webpack-hot-middleware:

	As of version 2.0.0, all client functionality has been rolled into this module. This means that you should remove any reference to webpack/hot/dev-server or webpack/hot/only-dev-server from your webpack config. Instead, use the reload config option to control this behaviour.

	...

	reload - Set to true to auto-reload the page when webpack gets stuck.

Thus, the `reload` option controls the behavior I want changed. Unfortunately, `react-cosmos` does not (yet) forward this option.