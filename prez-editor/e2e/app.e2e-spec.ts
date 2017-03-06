import { PrezEditorPage } from './app.po';

describe('prez-editor App', () => {
  let page: PrezEditorPage;

  beforeEach(() => {
    page = new PrezEditorPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
