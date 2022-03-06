const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('header integrations tests', ()=> {

    test('should render logo',async () => {
        const text = await page.$eval('a.brand-logo', el => el.innerHTML)
        expect(text).toEqual('Blogster');
    });

    test('clicking login starts oauth flow', async ()=> {
        await page.click('.right a');
        const url = await page.url();

        expect (url).toMatch(/accounts\.google\.com/);
    })

    test('when signed in, shows logout button', async () => {
        // create the cookie sent to the client from passport service.
        await page.login();

        const logoutText = await page.$eval('a[href="/auth/logout"]', el=> el.innerHTML);
        expect(logoutText).toEqual('Logout');
    })
});