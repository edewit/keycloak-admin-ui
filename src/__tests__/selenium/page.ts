import { Builder, By, until } from 'selenium-webdriver';
import 'chromedriver';

export class Page {
  private driver = new Builder()
    .forBrowser('chrome')
    .build();

  // visit a webpage
  async visit(theUrl: string) {
    return await this.driver.get(theUrl);
  }

  // quit current session
  async quit() {
    return await this.driver.quit();
  }

  // wait and find a specific element with it's id
  async findById(id: string) {
    await this.driver.wait(until.elementLocated(By.id(id)), 15000, 'Looking for element');
    return await this.driver.findElement(By.id(id));
  }

  // wait and find a specific element with it's name
  async findByName(name: string) {
    await this.driver.wait(until.elementLocated(By.name(name)), 15000, 'Looking for element');
    return await this.driver.findElement(By.name(name));
  }

  // fill input web elements
  async write(el: any, txt: string) {
    return await el.sendKeys(txt);
  }
}
