import { GSClipboardHandler } from "../../../src";

type HyperlinkData = {
  title: string;
  url: string;
};

export class Hyperlink implements GSClipboardHandler {
  public type = "hyperlink";

  public toText(value: HyperlinkData,payload): string {
    return value.title;
  }

  public toHtml(value: HyperlinkData): string {
    return `<a href="${value.url}" target="_blank" rel="nofollow">${value.title}</a>`;
  }

  public parse(value: HyperlinkData): HyperlinkData {
    return value;
  }
}
