import {MyRequest, MyQuery} from "../commons/request";
import {TopicInfo, CONF_VAR} from "../../../../server/share/Interfaces";
import {timeago} from "../../../../server/share/util";
import * as Handlebars from "handlebars";
import dateFormat = require('dateformat');
class TopicsApp {
	public static start() {
		Handlebars.registerHelper("myDateFormat", (date: Date) => {
			return dateFormat(date, "yyyy/mm/dd HH:MM");
		});
		Handlebars.registerHelper("timeago", (date: Date) => {
			return timeago(date);
		});
		const $ul = <HTMLElement> document.querySelector(".topics-ul");
		const isMyself = Boolean(document.querySelector("meta[name=myself]"));
		const $nextButton = <HTMLElement> document.querySelector(".next-get-button");
		const list = new ListComponent($ul, $nextButton, isMyself);
		list.getAll();
		$nextButton.addEventListener("click", () => {
			list.getAll();
		})
	}
}



class ListComponent {
	private static LIST_TEMPL = Handlebars.compile(`
	{{#each topics}}
		<li class="topics-li">
			<div class="left-parts">
				<div class="post-date">{{timeago postDate}} に投稿</div>
				<a class="title" href="/topic/{{_id}}">{{title}}</a>
				<div class="tags">
					{{#each tags}}
						<div class="tag">{{this}}</div>
					{{/each }}
				</div>
			</div>
			<div class="right-parts">
				<div class="view-count">
					<i class="material-icons">remove_red_eye</i>
					{{viewCount}}
				</div>
				<div class="comment-count">
					<i class="material-icons">chat_bubble_outline</i>
					{{commentCount}}
				</div>
			</div>
		</li>
	{{/each}}
	`);

	private offset = 0;
	constructor(private $ul: HTMLElement,
				private $nextButton: HTMLElement,
				private isMyself: boolean) {}

	public getAll() {
		const querys: MyQuery[] = [{key: "offset", value: this.offset}];
		if (this.isMyself) {
			querys.push({key: "myself", value: true});
		}
		MyRequest.rest<TopicInfo[]>({method: "GET", path: "/api/topics", querys: querys}).then((topics) => {
			const div = document.createElement("div");
			div.innerHTML = ListComponent.LIST_TEMPL({topics: topics});
			this.$ul.appendChild(div);
			this.offset += CONF_VAR.TOPIC_GET_LIMIT;
			if (topics.length < CONF_VAR.TOPIC_GET_LIMIT ) {
				this.$nextButton.style.display = "none";
			}
		});
	}
}
TopicsApp.start();