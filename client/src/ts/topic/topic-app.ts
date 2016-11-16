import {MyRequest} from "../commons/request";


class TopicApp {
	static init() {
		const form = <HTMLFormElement> document.querySelector(".post-comment-container");
		const commentInput = <HTMLInputElement> form.querySelector(`[name="comment"]`);
		const topicIdInput = <HTMLInputElement> form.querySelector(`[name="topic-id"]`);
		form.onsubmit = (e) => {
			MyRequest.rest({method: "POST", path: `/api/topic/${topicIdInput.value}/comment`, reqBody: {body: commentInput.value}})
				.then(() => {
					location.reload();
				});
			e.preventDefault();
		};
	}
}

TopicApp.init();

