/**
 * Access Amazon website,
 * Just only take a screenshot.
 *
 */
const puppeteer = require('puppeteer');
const makeDir = require("make-dir");
const XLSX = require("xlsx");

const config = {
  dataFile: './data/amazonList.xlsx',
  dataSheetName: 'TestSheet'
}

function getWorkSheetJson() {
  const workbook = XLSX.readFile(config.dataFile);
  const worksheet = workbook.Sheets[config.dataSheetName];
  // console.log(worksheet);

  return XLSX.utils.sheet_to_json(worksheet);
}

function makeDateString() {
  return new Date().toLocaleString().replace(/\s|\//g, '-').replace(/:/g, '');
}

async function screenshotPage() {
  const jsonData = getWorkSheetJson();
  const dateString = makeDateString();
  const outdir = `./ss/${dateString}/`;
  // スクリーンショットを格納するディレクトリを作成
  makeDir(outdir);

  for (let i in jsonData) {
    const siteData = jsonData[i];

    await (async () => {
      if (siteData.URL) {
        const siteURL = siteData.URL;

        const browser = await puppeteer.launch({
          defaultViewport: {
            width: 1200,
            height: 6000,
          }
        });
        const page = await browser.newPage();
        const region = siteData.region.replace(' ', '_');

        try {
          await page.goto(siteURL, {
            timeout: 20000
          });

          console.log(`page loaded: ${siteURL}`);
          await page.waitFor(5000);
          await page.screenshot({
            path: `${outdir}/${region}.png`,
          });
        } catch (error) {
          console.log(error);
          browser.close();
        }

        await browser.close();
      }
    })()
  }
}

screenshotPage();