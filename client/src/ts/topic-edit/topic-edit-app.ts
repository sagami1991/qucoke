/**
 * @file 記事の作成・編集ページ
 */
import {MonacoWrapper} from "./monaco-editor-wrapper";
import {AceWrapper} from "./ace-editor-wrapper";
import {MyRequest} from "../commons/request";
import {ResPostTopic, TopicEditForm, TopicInfo} from "../../../../server/share/Interfaces";

class TopicEditApp {
	private titleInput: HTMLInputElement;
	private tagsInput: HTMLInputElement;
	private monacoWrapper: AceWrapper;
	private topicId: string;
	public static start() {
		(<any>window).require(['vs/editor/editor.main'], () => {
			new this().init();
		});
	}

	private init() {
		this.monacoWrapper = new AceWrapper();
		this.monacoWrapper.init();
		this.topicId = document.querySelector(`[name=topic-id]`).getAttribute("data-value");
		this.titleInput = <HTMLInputElement> document.querySelector(".input-title");
		this.tagsInput = <HTMLInputElement> document.querySelector(".input-tags");
		const submitButton = <HTMLButtonElement> document.querySelector(".submit-button");
		submitButton.addEventListener("click", () => {
			MyRequest.rest<ResPostTopic>({
				method: this.topicId ? "PUT" : "POST",
				path: this.topicId ? `/api/topic/${this.topicId}` : `/api/topic`,
				reqBody: this.getValues()
			}).then((res) => {
				window.location.href = `/topic/${res.id}`;
			});
		});
		this.registerTagHighLight();
		if	(this.topicId) {
			this.setDataToInput();
		} else {
			this.monacoWrapper.setValue(require("raw!./resource/sample-md.md"));
			MyRequest.toggleLoadingAnime(false);
		}
	}

	/** inputにデータをセットする、編集時のみ実行 */
	private setDataToInput() {
		MyRequest.rest<TopicInfo>({
			method: "GET",
			path: `/api/topic/${this.topicId}`
		}).then(res => {
			this.titleInput.value = res.title,
			this.tagsInput.value = res.tags.join(" ");
			this.monacoWrapper.setValue(res.bodyMd);
			this.tagsInput.dispatchEvent(new Event("keyup"));
		});
	}

	/** タグがハイライト化するようにする */
	private registerTagHighLight() {
		const tagsHighlight = <HTMLElement> document.querySelector(".tags-highlight");
		this.tagsInput.addEventListener("keyup", (e) => {
			tagsHighlight.innerHTML = this.tagsInput.value.split(" ")
				.map(tag => `<span class="tag-highlight">${tag}</span> `).join("");
		});
	}

	private getValues(): TopicEditForm {
		return {
			_id: this.topicId,
			title: this.titleInput.value,
			tags: this.tagsInput.value ? this.tagsInput.value.split(" ") : [],
			bodyMd: this.monacoWrapper.getValue()
		}
	}
}

TopicEditApp.start();