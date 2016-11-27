import {Express, Request, Response} from 'express';
import {CONF_VAR,
} from "../share/Interfaces";

import {MyUtil} from "../share/serverUtil";
import {TopicRepository} from "../repository/TopicRepository";

export class TopicPageController {
	constructor(private app: Express,
				private topicRepository: TopicRepository) {}

	public init() {
		this.app.get('/topic/:id', (req, res) => this.viewTopicPage(req, res));
		this.app.get('/topics', (req, res) => this.topics(req, res));
		this.app.get('/my-topics', (req, res) => this.myTopics(req, res));
		this.app.get('/topic-edit/:id', (req, res) => this.editTopic(req, res));
		this.app.get('/topic-edit/', (req, res) => this.editTopic(req, res));
	}

	/** 記事ページを返す */
	private viewTopicPage(req: Request, res: Response) {
		this.topicRepository.findOne(req.params["id"]).then((topic) => {
			if (!topic) {
				MyUtil.sendError(res, "存在しない記事です。");
				return;
			}
			if (!req.cookies[CONF_VAR.COOKIE_ACCESSED]) {
				const date = new Date();
				date.setDate(date.getDate() + 1);
				res.cookie(CONF_VAR.COOKIE_ACCESSED, "1", {expires: date, path: req.path});
				this.topicRepository.addViewCount(req.params["id"]);
			}
			res.render("topic", {
				title: `${topic.title} - Qucoke`,
				topic: topic,
				isMyTopic: topic.userId === req.cookies[CONF_VAR.COOKIE_PID],
				homeUrl: "/topics"
			});
		}).catch(() => {
			MyUtil.sendError(res, "存在しない記事です。");
		});
	}

	/** 記事一覧 */
	private topics(req: Request, res: Response) {
		res.render("topics", {
			title: "記事一覧 - Qucoke.com",
			loadingPage: true
		});
	}

	/** 自分の投稿した記事一覧 */
	private myTopics(req: Request, res: Response) {
		res.render("my-page", {
			title: "投稿した記事一覧 - Qucoke.com",
			loadingPage: true,
			myself: true
		});
	}

	/** 投稿ページ */
	private editTopic(req: Request, res: Response) {
		const topicId = req.params["id"];
		res.render("topic-edit", {
			title: (topicId ? "記事を編集" : "記事を作成") + " - Qucoke.com",
			hidePostTopicButton: true,
			topicId: topicId,
			loadingPage: true
		});
	}
}