/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
declare function dateformat(date: Date, pattern: string): string;

declare module "dateformat" {
    export = dateformat;
}