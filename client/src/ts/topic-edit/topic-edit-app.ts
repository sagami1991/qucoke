/**
 * @file 記事の作成・編集ページ
 */
import "../commons/dependencies";
import {MonacoWrapper} from "./monaco-editor-wrapper";
import {MyRequest} from "../commons/request";
import {ResPostTopic} from "../../../../server/share/Interfaces";
interface TopicEditForm {
	title: string;
	tags: string[];
	bodyMd: string;
}

class TopicEditApp {
	private titleInput: HTMLInputElement;
	private tagsInput: HTMLInputElement;
	private monacoWrapper: MonacoWrapper;

	public static start() {
		(<any>window).require(['vs/editor/editor.main'], () => {
			new this().init();
		});
	}

	private init() {
		this.monacoWrapper = new MonacoWrapper();
		this.monacoWrapper.init();
		this.titleInput = <HTMLInputElement> document.querySelector(".input-title");
		this.tagsInput = <HTMLInputElement> document.querySelector(".input-tags");
		const submitButton = <HTMLButtonElement> document.querySelector(".submit-button");
		submitButton.addEventListener("click", () => {
			MyRequest.rest<ResPostTopic>({
				method: "POST",
				path: "/api/topic",
				reqBody: this.getValues()
			}).then((res) => {
				window.location.href = `/topic/${res.id}`;
			});
		});
		this.registerTagHighLight();
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
			title: this.titleInput.value,
			tags: this.tagsInput.value.split(" "),
			bodyMd: this.monacoWrapper.getValue()
		}
	}
}

TopicEditApp.start();