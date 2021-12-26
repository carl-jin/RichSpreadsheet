import { CellTransformer } from "../../src";

export class HyperlinksTransformer extends CellTransformer{
  formatValueFromData(value: any, cellParams: any): any {
    let formattedValue =
      typeof value === "string"
        ? value.length === 0
          ? { title: "", url: "" }
          : JSON.parse(value)
        : value;
    formattedValue.url = this.getLink(formattedValue.url);
    formattedValue.isImage = this.isImage(formattedValue.url);
    formattedValue.url = this.getGoogleLink(formattedValue.url);

    return formattedValue;
  }

  parseFromClipboard(value: any, cellParams: any): string {
    return JSON.stringify(value);
  }

  parseValueToData(value: any, cellParams: any): string {
    return "";
  }

  private getLink(link: string) {
    if (!link) {
      return "";
    }

    const url = this.extractGoogleImageFuncLink(link);
    const reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;

    if (new RegExp(reg).test(url)) {
      return url;
    }

    return "";
  }

  private getGoogleLink(url) {
    const reg =
      /^(http:\/\/|https:\/\/)(drive)\.google\.com\/file\/d\/(.*?)\/.*?/;
    const regexp = new RegExp(reg);
    if (regexp.test(url)) {
      const res = regexp.exec(url);
      if (res) {
        return `https://lh3.google.com/u/0/d/${res[3]}=w195-h120`;
      }
    }
    return url;
  }

  private extractGoogleImageFuncLink(link: string) {
    const reg = /=IMAGE\("(.*)".*\)/;
    const match = link.match(reg);

    if (match) {
      return match[1];
    } else {
      return link;
    }
  }

  private isImage(link: string) {
    const imageSuffixRules: string[] = [
      ".png",
      ".gif",
      ".jpg",
      "drive.google.com/file/d",
    ];

    return !!imageSuffixRules.find((f) => link.includes(f));
  }
}
