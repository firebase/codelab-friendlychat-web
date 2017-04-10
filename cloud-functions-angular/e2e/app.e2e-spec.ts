import { CloudFunctionsAngularStartPage } from './app.po';

describe('cloud-functions-angular App', () => {
  let page: CloudFunctionsAngularStartPage;

  beforeEach(() => {
    page = new CloudFunctionsAngularStartPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
