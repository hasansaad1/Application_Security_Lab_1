const {By, Builder, Browser} = require('selenium-webdriver');
//const assert = require("assert");
const chrome = require('selenium-webdriver/chrome');

test("Trying a successful login via UI", async () => {
  let driver;
  
  try {

  let options = new chrome.Options();

    // 2. Set the acceptInsecureCerts capability to true
    options.setAcceptInsecureCerts(true);

    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    await driver.get('http://localhost');
  
    await driver.sleep(2000);
  
    await driver.manage().setTimeouts({implicit: 500});
  
    let email = await driver.findElement(By.name('email'));
    let password = await driver.findElement(By.name('password'));
  
    await email.sendKeys('francesc.roy@gmail.com');
    await password.sendKeys('Qwerqwer1234!');

    await driver.sleep(2000);

    let submitButton = await driver.findElement(By.xpath('//*[text()="Log in"]'));
    await submitButton.click();
  
    await driver.sleep(2000);

    let feedTitle = await driver.findElement(By.xpath('//*[text()="Available Listings"]'));
    expect(await feedTitle.getText()).toEqual("Available Listings");
    
  } catch (e) {
    console.log(e)
  } finally {
    await driver.quit();
  }
}, 25000);

