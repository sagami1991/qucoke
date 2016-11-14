/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
import "../commons/dependencies";
import * as marked from "marked";
/**
 * @file 記事の作成・編集ページ
 */


class TopicEditApp {
	private editor: monaco.editor.IStandaloneCodeEditor;
	/** 描写スケジュール登録してあったらtrue */
	private isScheduled: boolean;
	private renderTimer: number;
	private previewContent: HTMLElement;
	public static start() {
		(<any>window).require(['vs/editor/editor.main'], () => {
			new TopicEditApp().init();
		});
	}

	private init() {
		this.previewContent = <HTMLElement> document.querySelector("#preview-content");
		this.setSnipets();
		this.editor = monaco.editor.create(<HTMLElement> document.querySelector(".edit-container"), {
			value: require("raw!./sample-md.md"),
			language: "markdown",
			renderWhitespace: "all",
		});
		this.editor.onDidChangeModelContent(e => this.setRenderSchedule());
		this.render();
	}

		/** renderをn秒後にセットする */
	private setRenderSchedule() {
		if (this.isScheduled) {
			window.clearTimeout(this.renderTimer);
		} else {
			this.isScheduled = true;
		}
		this.renderTimer = window.setTimeout(() => {
			this.render();
			this.isScheduled = false;
		}, 500);
	}

	/** プレビュー領域に描写する */
	private render() {
		this.previewContent.innerHTML = marked(this.editor.getValue());
	}

	private setSnipets() {
		monaco.languages.registerCompletionItemProvider("markdown", {
			provideCompletionItems: (model, position, token) => {
				return [
					{
						label: "image",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "画像",
						insertText: "![alt](http://imagelink)"
					},{
						label: "link",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "リンク",
						insertText: "[text](http://link)"
					},{
						label: "table",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "テーブル",
						insertText: require("raw!./sample-table.md"),
					},{
						label: "2ch",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "2ch引用",
						insertText: require("raw!./sample-2ch.md"),
					},
				]
			}
		});

	}
}

TopicEditApp.start();