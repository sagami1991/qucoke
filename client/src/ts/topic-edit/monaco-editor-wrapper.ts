import * as marked from "marked";
class MyRenderer extends marked.Renderer {
	link(href: string, title: string, text: string) {
		return `<a href="${href}" target="_blank">${text}</a>`;
	}
}
export class MonacoWrapper {
	private editor: monaco.editor.IStandaloneCodeEditor;
	/** 描写スケジュール登録してあったらtrue */
	private isScheduled: boolean;
	private renderTimer: number;
	private previewContent: HTMLElement;
	public init() {
		marked.setOptions({renderer: new MyRenderer()});
		this.previewContent = <HTMLElement> document.querySelector("#preview-content");
		this.setSnipets();
		this.editor = monaco.editor.create(<HTMLElement> document.querySelector(".edit-container"), {
			value: require("raw!./resource/sample-md.md"),
			language: "markdown",
			renderWhitespace: "all",
			automaticLayout: true
		});
		this.render();
		this.editor.onDidChangeModelContent(e => this.setRenderSchedule());
	}

	/** monacoエディタの内容を返す */
	public getValue() {
		return this.editor.getValue();
	}

	/** プレビュー領域に描写する */
	private render() {
		this.previewContent.innerHTML = marked(this.editor.getValue());
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

	private setSnipets() {
		monaco.languages.registerCompletionItemProvider("markdown", {
			provideCompletionItems: (model, position, token) => {
				return [
					{
						label: "image",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "画像",
						insertText: "![alt](http://imagelink)"
					}, {
						label: "link",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "リンク",
						insertText: "[text](http://link)"
					}, {
						label: "table",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "テーブル",
						insertText: require("raw!./resource/sample-table.md"),
					}, {
						label: "2ch",
						kind: monaco.languages.CompletionItemKind.Text,
						documentation: "2ch引用",
						insertText: require("raw!./resource/sample-2ch.md"),
					},
				];
			}
		});

	}
}