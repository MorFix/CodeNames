import HTMLParser from 'fast-html-parser';
import fetchWithCookies from './fetch-with-cookies';
import parseHeaderValues from './parse-header';
import readEncodedContent from './read-response-content';

const baseUrl = 'https://www.hvr.co.il';

const getInitialCookies = async () => {
    const response = await fetch(`${baseUrl}/signin.aspx`, {credentials: 'omit'});

    return parseHeaderValues(response.headers.get('set-cookie'));
};

const getEntertainmentPage = async cookies => {
    const response = await fetchWithCookies(`${baseUrl}/home_page.aspx?page=mcc_item,266006`, null, cookies);
    const content = await readEncodedContent(response);

    return HTMLParser.parse(content);
};

const hasNoShowsMessage = pageText => {
    const NO_SHOWS_MESSAGE = 'לא תתקיימנה פעילויות';

    return pageText.includes(NO_SHOWS_MESSAGE);
};

const getCN = async cookies => {
    const basicPageResponse = await fetchWithCookies(`${baseUrl}/signin.aspx`, null, cookies);
    const basicPageContent = await readEncodedContent(basicPageResponse);

    const basicPageDom = HTMLParser.parse(basicPageContent);

    const cn =  basicPageDom.querySelectorAll('input')
        .find(x => x.attributes?.name === 'cn')
        ?.attributes
        .value;

    if (!cn) {
        throw new Error('Cannot find CN in base document');
    }

    return cn;
};

// TODO: Config the credentials
const buildLoginParams = cn => ({
    cn,
    tz: '',
    password: '',
    oMode: 'login',
});

const login = async cookies => {
    const SUCCESS_TEXT = 'Ok...';

    const url = `${baseUrl}/signin.aspx`;
    const cn = await getCN(cookies);

    const loginParams = buildLoginParams(cn);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
    };

    const options = {
        method: 'POST',
        body: new URLSearchParams(loginParams).toString(),
        headers
    };

    const loginResponse = await fetchWithCookies(url, options, cookies);
    const content = await readEncodedContent(loginResponse);

    if (content !== SUCCESS_TEXT) {
        throw new Error(`Login failed: ${content}`)
    }

    return parseHeaderValues(loginResponse.headers.get('set-cookie'));
};

export const getEntertainmentStatus = async () => {
    const cookies = await getInitialCookies();
    const newCookies = await login(cookies);

    Object.assign(cookies, newCookies);

    const pageDom = await getEntertainmentPage(cookies);
    const relevantText = pageDom.querySelectorAll('.box')[0]?.text.trim();

    const isAvailable = !hasNoShowsMessage(relevantText);

    // Log out
    await fetchWithCookies(`${baseUrl}/logout.aspx`, null, cookies);

    return {isAvailable, content: relevantText};
};
