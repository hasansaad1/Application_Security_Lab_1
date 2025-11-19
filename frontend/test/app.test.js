const {By, Builder, Browser} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

//Configuration to add if tests executed from a non-graphical environment...
//options.addArguments('--headless=new'); 
//options.addArguments('--no-sandbox');
//options.addArguments('--disable-dev-shm-usage');
//options.addArguments('--window-size=1920,1080');

async function login(driver, userMailParam, passwordParam){

    await driver.get('https://localhost');
  
    await driver.sleep(1000);
  
    await driver.manage().setTimeouts({implicit: 1500});
  
    let email = await driver.findElement(By.name('email'));
    let password = await driver.findElement(By.name('password'));
  
    await email.sendKeys(userMailParam);
    await password.sendKeys(passwordParam);

    await driver.sleep(1000);

    let submitButton = await driver.findElement(By.xpath('//*[text()="Log in"]'));
    await submitButton.click();
  
    await driver.sleep(1000);

}

test("Trying a registration via UI", async () => {
  let driver;
  
  try {

    let options = new chrome.Options();
    options.setAcceptInsecureCerts(true);
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

    await driver.get('https://localhost');
  
    await driver.sleep(1000);
  
    await driver.manage().setTimeouts({implicit: 1500});
    
    let signUpLink = await driver.findElement(By.xpath('//*[text()="Sign up"]'));
    await signUpLink.click();
  
    await driver.sleep(1000);

    let username = await driver.findElement(By.name('username'));
    let email = await driver.findElement(By.name('email'));
    let phone_number = await driver.findElement(By.name('phone_number'));
    let password = await driver.findElement(By.name('password'));
    let confirm_password = await driver.findElement(By.name('confirm_password'));
  
    await username.sendKeys('mark');
    await email.sendKeys('mark.smith@gmail.com');
    await phone_number.sendKeys('664544035');
    await password.sendKeys('Qwerqwer1234!');
    await confirm_password.sendKeys('Qwerqwer1234!');

    let createAccountButton = await driver.findElement(By.xpath('//*[text()="Create account"]'));
    await createAccountButton.click();

    await driver.sleep(1000);
    
  } catch (e) {
    fail();
  } finally {
    await driver.quit();
  }
}, 30000);

test("Trying a successful login via UI", async () => {
  let driver;
  
  try {

    let options = new chrome.Options();
    options.setAcceptInsecureCerts(true);
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    
    await login(driver, "mark.smith@gmail.com", "Qwerqwer1234!");

    let feedTitle = await driver.findElement(By.xpath('//*[text()="Available Listings"]'));
    expect(await feedTitle.getText()).toEqual("Available Listings");
    
  } catch (e) {
    fail();
  } finally {
    await driver.quit();
  }
}, 30000);

test("Trying a successful listing creation via UI", async () => {
  let driver;
  
  try {

    let options = new chrome.Options();
    options.setAcceptInsecureCerts(true);
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    
    await login(driver, "mark.smith@gmail.com", "Qwerqwer1234!");

    let createListingButton = await driver.findElement(By.xpath('//*[text()="Create Listing"]'));
    await createListingButton.click();
    
    await driver.sleep(1000);

    let title = await driver.findElement(By.name('title'));
    let description = await driver.findElement(By.id('description'));
    let price = await driver.findElement(By.name('price'));
    let addressCountry = await driver.findElement(By.name('address_country'));
    let addressCity = await driver.findElement(By.name('address_city'));
    let addressProvince = await driver.findElement(By.name('address_province'));
    let addressZipCode = await driver.findElement(By.name('address_zip_code'));
    let addressStreetAddress = await driver.findElement(By.name('address_line1'));
    let addressAppartmentUnit = await driver.findElement(By.name('address_line2'));

    await title.sendKeys('Apartment in Les Corts');
    await description.sendKeys('Modern 4-bedroom apartment near the city center. Very close to the metro L3.');
    await price.sendKeys('1000');
    await addressCountry.sendKeys('Spain');
    await addressCity.sendKeys('Barcelona');
    await addressProvince.sendKeys('Barcelona');
    await addressZipCode.sendKeys('08028');
    await addressStreetAddress.sendKeys('Gran Via Carles III, 24');
    await addressAppartmentUnit.sendKeys('3r 1a');

    await driver.sleep(1000);
    
    let postListingButton = await driver.findElement(By.xpath('//*[text()="Post Listing"]'));
    await postListingButton.click();
    
    await driver.sleep(2000);

    await driver.get('https://localhost/my-listings');
  
    let divWithListings = await driver.findElement(By.xpath('/html/body/div[2]/main/div/div[2]'));
    const directChildren = await divWithListings.findElements(By.css(':scope > div'));
    const count = directChildren.length;
    expect(count).toBe(1);
    
    let listingTitle = await driver.findElement(By.xpath('/html/body/div[2]/main/div/div[2]/div/div[2]/h3'));
    let listingDescription = await driver.findElement(By.xpath('/html/body/div[2]/main/div/div[2]/div/div[2]/p'));
    let listingAddress = await driver.findElement(By.xpath('/html/body/div[2]/main/div/div[2]/div/div[2]/div[1]'));
    let listingPrice = await driver.findElement(By.xpath('/html/body/div[2]/main/div/div[2]/div/div[2]/div[2]'));
    let listingTitleText = await listingTitle.getText();
    let listingDescriptionText = await listingDescription.getText();
    let listingAddressText = await listingAddress.getText();
    let listingPriceText = await listingPrice.getText();
    
    expect(listingTitleText).toEqual("Apartment in Les Corts");
    expect(listingDescriptionText).toEqual("Modern 4-bedroom apartment near the city center. Very close to the metro L3.");
    expect(listingAddressText).toEqual("Barcelona, Barcelona, Spain");
    expect(listingPriceText).toEqual("$1,000/month");
  
    await driver.sleep(2000);

  } catch (e) {
    console.log(e);
    fail();
  } finally {
    await driver.quit();
  }
}, 30000);

test("Trying a successful liking via UI", async () => {
  let driver;
  
  try {

    let options = new chrome.Options();
    options.setAcceptInsecureCerts(true);
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    
    await login(driver, "mark.smith@gmail.com", "Qwerqwer1234!");
    
    const icons = await driver.findElements(By.css('svg.h-5.w-5.text-gray-500'));
    if(icons.length>0){
      await icons[0].click();
    }
    //const linkContainer = await icons[0].findElement(By.xpath('ancestor::a[@class="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-rose-100/40 active:scale-[0.98] hover:border-rose-200/60 hover:shadow-rose-200/20"]'));
    const linkContainer = await icons[0].findElement(By.xpath('ancestor::a[1]'));
    const headerElement = await linkContainer.findElement(By.css('h3'));
    //const headerElement = await linkContainer.findElement(By.css('h3.text-base.font-bold.text-gray-900'));
    const headerText = await headerElement.getText();

    await driver.sleep(1000);
    await driver.get('https://localhost/favorites');
    await driver.sleep(1000);

    let divWithListings = await driver.findElement(By.xpath('/html/body/div[2]/main/div/div[2]'));
    const directChildren = await divWithListings.findElements(By.css(':scope > a'));

    let found= false;
    for (const linkElement of directChildren) {
      const h3Element = await linkElement.findElement(By.xpath('./div[2]/h3'));
      if(await h3Element.getText()===headerText){
        found=true;
        break;
      }
    }
    
    expect(found).toEqual(true);


  } catch (e) {
    console.log(e);
    fail();
  } finally {
    await driver.quit();
  }
}, 30000);

test("Trying a unsuccessful login via UI too many times", async () => {
  let driver;
  
  try {

    let options = new chrome.Options();
    options.setAcceptInsecureCerts(true);
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    
    await login(driver, "mark.smith@gmail.com", "Qwerqwer5678!");
    await login(driver, "mark.smith@gmail.com", "Qwerqwer5678!");
    
    await login(driver, "mark.smith@gmail.com", "Qwerqwer1234!"); // The correct one.
    
    let foundEntranceTitle = true;
    try {
      let feedTitle = await driver.findElement(By.xpath('//*[text()="Available Listings"]'));
    } catch (e){
      foundEntranceTitle = false;
    }
    expect(foundEntranceTitle).toEqual(false);
    
  } catch (e) {
    fail();
  } finally {
    await driver.quit();
  }
}, 30000);

