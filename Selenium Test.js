/* required packeges have a size of ~6 MB and should be loaded by every developer himself, instead of
uploaded on gitHub
*/

var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var assert = require('assert');

var driver = new webdriver.Builder()
	.forBrowser('chrome')
	.build();

// everyone has to use his own file path first
driver.get('file:///D:/Studium/Bachelor%20Praktikum/Call%20Graph%20Exploration/Call-Graph-Exploration/ForceGraph/index.html');
driver.findElement(By.xpath('//*[@id="0"]/h3')).getText().then(textValue => {
        assert.equal('TestNode', textValue);
      });
driver.findElement(By.xpath('//*[@id="0#0"]/div[2]')).click();