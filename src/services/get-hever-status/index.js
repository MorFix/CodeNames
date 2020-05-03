import HTMLParser from 'fast-html-parser';
import fetchWithCookies from './fetch-with-cookies';
import parseHeaderValues from './parse-header';
import readEncodedContent from './read-response-content';

import {
  heverUrl as baseUrl,
  loginPage,
  homePage,
  entertainmentPageTitle,
  loginSuccessMessage,
  noShowsMessage,
} from '../../config';

const SET_COOKIE_HEADER_NAME = 'set-cookie';
const HOME_PAGE_COOKIE_NAME = 'home_page';

const getInitialCookies = async () => {
  const response = await fetch(`${baseUrl}/${loginPage}`, {
    credentials: 'omit',
  });

  return parseHeaderValues(response.headers.get(SET_COOKIE_HEADER_NAME));
};

const getHomePage = async cookies =>
  await fetchWithCookies(
    `${baseUrl}/${homePage}?page=${cookies[HOME_PAGE_COOKIE_NAME]}`,
    null,
    cookies,
  );

const getNavigationUrl = async cookies => {
  const homePageResponse = await getHomePage(cookies);
  const content = await readEncodedContent(homePageResponse);
  const dom = HTMLParser.parse(content);

  const url = dom.querySelector('#navHeader .nav')?.attributes?.title;
  if (!url) {
    throw new Error('Cannot find navigations pages JSON url');
  }

  return url;
};

const getNavigationJson = async cookies => {
  const url = await getNavigationUrl(cookies);
  const response = await fetchWithCookies(
    `${baseUrl}/ajax/${url}`,
    null,
    cookies,
  );

  return await response.json();
};

const getEntertainmentPageUrl = async cookies => {
  const navJson = await getNavigationJson(cookies);
  const entertainmentPageEntry = navJson.row.find(
    ({text}) => text === entertainmentPageTitle,
  );

  if (!entertainmentPageEntry) {
    throw new Error('Cannot find a menu entry for entertainment page');
  }

  const {url} = entertainmentPageEntry;

  return typeof url !== 'string'
    ? `${homePage}?${new URLSearchParams(url).toString()}`
    : url;
};

const getEntertainmentPage = async cookies => {
  const entertainmentPagePath = await getEntertainmentPageUrl(cookies);

  const response = await fetchWithCookies(
    `${baseUrl}/${entertainmentPagePath}`,
    null,
    cookies,
  );
  const content = await readEncodedContent(response);

  return HTMLParser.parse(content);
};

const getCN = async cookies => {
  const basicPageResponse = await fetchWithCookies(
    `${baseUrl}/${loginPage}`,
    null,
    cookies,
  );

  const basicPageContent = await readEncodedContent(basicPageResponse);
  const basicPageDom = HTMLParser.parse(basicPageContent);

  const cn = basicPageDom
    .querySelectorAll('input')
    .find(x => x.attributes?.name === 'cn')?.attributes.value;

  if (!cn) {
    throw new Error('Cannot find CN in base document');
  }

  return cn;
};

const login = async (tz, password, cookies) => {
  const cn = await getCN(cookies);

  const loginParams = {cn, tz, password, oMode: 'login'};
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: '*/*',
  };
  const options = {
    headers,
    method: 'POST',
    body: new URLSearchParams(loginParams).toString(),
  };

  const loginResponse = await fetchWithCookies(
    `${baseUrl}/${loginPage}`,
    options,
    cookies,
  );
  const content = await readEncodedContent(loginResponse);

  if (content !== loginSuccessMessage) {
    throw new Error(
      `ההתחברות נכשלה: ${HTMLParser.parse(content)?.text.trim()}`,
    );
  }

  return parseHeaderValues(loginResponse.headers.get(SET_COOKIE_HEADER_NAME));
};

const getLogoutUrl = async cookies => {
  const homePageResponse = await getHomePage(cookies);
  const content = await readEncodedContent(homePageResponse);
  const dom = HTMLParser.parse(content);

  const url = dom.querySelector('#topLeft span a')?.attributes?.href;
  if (!url) {
    throw new Error('Cannot find logout url');
  }

  return url;
};

const logout = async cookies => {
  const logoutPage = await getLogoutUrl(cookies);

  return await fetchWithCookies(`${baseUrl}/${logoutPage}`, null, cookies);
};

export const getEntertainmentStatus = async (userId, password) => {
  const initialCookies = await getInitialCookies();
  const loginCookies = await login(userId, password, initialCookies);

  const cookies = {...initialCookies, ...loginCookies};

  const entertainmentPageDom = await getEntertainmentPage(cookies);
  const relevantText = entertainmentPageDom
    .querySelectorAll('.box')[0]
    ?.text.trim();

  try {
    await logout(cookies);
  } catch (e) {
    console.error(e);
  }

  return {
    isAvailable: !relevantText.includes(noShowsMessage),
    content: relevantText,
  };
};
