import { CloudFunctionsAngularStartPage } from './app.po';

describe('cloud-functions-angular-start App', () => {
  let page: CloudFunctionsAngularStartPage;

  beforeEach(() => {
    page = new CloudFunctionsAngularStartPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
