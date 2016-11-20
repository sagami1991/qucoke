import * as marked from "marked";
class MyRenderer extends marked.Renderer {
	link(href: string, title: string, text: string) {
		return `<a href="${href}" target="_blank">${text}</a>`;
	}

	// image(href: string, title: string, text: string) {
	// 	return `<img src=/>`
	// }
}
export class AceWrapper {
	private editor: AceAjax.Editor;
	/** 描写スケジュール登録してあったらtrue */
	private isScheduled: boolean;
	private renderTimer: number;
	private previewContent: HTMLElement;
	public init() {
		marked.setOptions({renderer: new MyRenderer()});
		this.previewContent = <HTMLElement> document.querySelector("#preview-content");
		ace.require("ace/ext/language_tools");
		this.editor = ace.edit("edit-container");
		this.editor.setShowInvisibles(true);
		// this.editor.setTheme("ace/theme/solarized_light");
		this.editor.session.setMode("ace/mode/markdown");
		this.editor.session.on("change", () => this.setRenderSchedule());
		this.editor.$blockScrolling = Infinity;

	}

	/** monacoエディタの内容を返す */
	public getValue() {
		return this.editor.getValue();
	}

	public setValue(text: string) {
		this.editor.setValue(text);
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
}