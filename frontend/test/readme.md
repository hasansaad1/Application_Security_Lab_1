To execute this tests, you must do it from your local machine, not a docker container.

You must have npm and node installed. I have tried it with version (11.6.2) and (v25.2.1) respectively. If you want to update your node version use "nvm install node", then check the versions you have "nvm list" and finally select the one you want "nvm use <version>".

Also you must have Chrome browser, and the corresponding webdriver (check your Chrome version and download the webdriver from https://developer.chrome.com/docs/chromedriver)

To execute them:
- npm install
- npm test
