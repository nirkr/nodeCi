const puppeteer = require('puppeteer');
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/session.factory");

class CustomPage {
    static async build(){
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property){
                return customPage[property] || browser[property] || page[property]
            }
        });
    };

    constructor(page) {
        this.page=page;
    };
    async login() {
        const user = await userFactory();
        const {session, signedKey} = sessionFactory(user);

        await this.page.setCookie({name:'session.sig', value:signedKey})
        await this.page.setCookie({name:'session', value:session})
        await this.page.goto('http://localhost:3000/blogs');
        // NEED TO POLL HERE
        await this.page.waitFor('a[href="/auth/logout"]');
    }
    async getContentsOf(selector){
        return this.page.$eval(selector, el=>el.innerHTML);
    }

    post(path, data){
        return this.page.evaluate(
            (_path, _data) => fetch(_path,{
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data) // body data type must match "Content-Type" header
            })
                .then(res=> res.status)
        , path, data)
    }

    get(path){
        return this.page.evaluate(
            (_path)=> fetch(_path,{
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(res=> res.status)
        , path)
    }

    execRequests(actions){
        return Promise.all(
            actions.map(({ method, path, data }) => this[method](path, data))
        )
    }
}

module.exports = CustomPage;
