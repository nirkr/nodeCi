const Page = require("./helpers/page");
const User = require ('../models/User');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When login',()=>{
    beforeEach(async () => {
        await page.login();
        await page.click('.fixed-action-btn a');
    });
    test('When logged in, can see blog create form', async ()=>{
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using valid inputs',()=> {
        const title = 'testBlog';
        const content = 'testContent';

        beforeEach(async ()=>{
            await page.type('.title input', title);
            await page.type('.content input', content);
            await page.click('form button');
        });
        test('should show verification screen', async ()=>{
            const header = await page.getContentsOf('form h5');
            expect(header).toMatch('Please confirm')
        })

        test('should add blog when inserting new blog', async ()=>{
            await page.click('form button');
            // check mongoose
            // const users = await User.find({});
            // console.log({users})
        });
    });

    describe('And using invalid inputs',()=> {
        beforeEach(async () => {
            await page.click('form button');
        })
        test('the form shows error messages', async () => {
            const titleErrorText = await page.getContentsOf('.title .red-text')
            const contentErrorText = await page.getContentsOf('.content .red-text')
            expect(titleErrorText).toEqual('You must provide a value');
            expect(contentErrorText).toEqual('You must provide a value');
        })
    });
})

describe('When not login', ()=> {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            body: {
                title : 'myTitle',
                content: 'myContent',
            }
        }
    ]

    test('execute unauthenticated http requests, and get 401', async ()=> {
        const responseStatuses = await page.execRequests(actions);
        for (let responseStatus of responseStatuses){
            expect(responseStatus).toEqual(401);
        }
    });

    test('cannot create new blog', async ()=>{
        const requestStatus = await page.post('/api/blogs', { title : 'myTitle', content: 'myContent'})
        expect(requestStatus).toEqual(401)
    })
    test('cannot get blogs',async ()=>{
        const requestStatus = await page.get('/api/blogs');
        expect(requestStatus).toEqual(401)
    })
})