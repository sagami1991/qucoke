import {MyRequest} from "../commons/request";
import {SmartDialog} from "../commons/smart-dialog";

class TopicApp {
	private static topicId: string;
	static init() {
		const metaTopicId = <HTMLInputElement> document.querySelector("#meta-topic-id");
		this.topicId = metaTopicId.getAttribute("value");
		const form = <HTMLFormElement> document.querySelector(".post-comment-container");
		const commentInput = <HTMLInputElement> form.querySelector(`[name="comment"]`);
		form.onsubmit = (e) => {
			MyRequest.rest({method: "POST", path: `/api/topic/${this.topicId}/comment`, reqBody: {body: commentInput.value}})
				.then(() => {
					location.reload();
				});
			e.preventDefault();
		};
		this.setRemoveEvent();
	}

	static setRemoveEvent() {
		const removeButton = <HTMLElement> document.querySelector(".remove-button");
		removeButton.addEventListener("click", () => {
			SmartDialog.open({dialogType: "CONFIRM", msg: "本当にこの記事を削除してよろしいですか？"})
			.then(() => {
				MyRequest.rest({method: "DELETE", path: `/api/topic/${this.topicId}`})
				.then(() => {
					SmartDialog.open({dialogType: "ALERT", msg: "記事は削除されました。"})
					.then(() => MyRequest.navigatePage("/topics"));
				})
			})
		})
	}
}

TopicApp.init();

